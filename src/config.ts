/**
 * Configuration management - Node.js compatible with zod typesafety
 */

import { z } from "zod";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { DcpConfigWithPruneRuleObjects, DcpConfigWithRuleRefs, PruneRule, isPruneRuleObject, type DcpConfig } from "./types";
import { getRule, getRuleNames } from "./registry";

// Zod schema for config validation
const DcpConfigSchema = z.object({
	enabled: z.boolean().default(true),
	debug: z.boolean().default(false),
	rules: z.array(z.string()).default([
		"deduplication",
		"superseded-writes",
		"error-purging",
		"tool-pairing",
		"recency"
	]),
	keepRecentCount: z.number().int().positive().default(10),
});

type DcpConfigZod = z.infer<typeof DcpConfigSchema>;

/**
 * Default configuration
 */
const DEFAULT_CONFIG: DcpConfigWithRuleRefs = {
	enabled: true,
	debug: false,
	rules: ["deduplication", "superseded-writes", "error-purging", "tool-pairing", "recency"],
	keepRecentCount: 10,
};

/**
 * Load configuration from environment variables or defaults
 * Priority (highest to lowest):
 * 1. CLI flags (--dcp-enabled, --dcp-debug)
 * 2. Environment variables (DCP_ENABLED, DCP_DEBUG, DCP_RULES, DCP_KEEP_RECENT)
 * 3. Default configuration
 */
export async function loadConfig(pi: ExtensionAPI): Promise<DcpConfigWithPruneRuleObjects> {
	// Build config from environment variables
	const envConfig: Partial<DcpConfigZod> = {};

	if (process.env.DCP_ENABLED !== undefined) {
		envConfig.enabled = process.env.DCP_ENABLED === 'true';
	}
	if (process.env.DCP_DEBUG !== undefined) {
		envConfig.debug = process.env.DCP_DEBUG === 'true';
	}
	if (process.env.DCP_KEEP_RECENT !== undefined) {
		const parsed = parseInt(process.env.DCP_KEEP_RECENT, 10);
		if (!isNaN(parsed) && parsed > 0) {
			envConfig.keepRecentCount = parsed;
		}
	}
	if (process.env.DCP_RULES !== undefined) {
		try {
			const parsed = JSON.parse(process.env.DCP_RULES);
			if (Array.isArray(parsed)) {
				envConfig.rules = parsed;
			}
		} catch {
			console.warn('[pi-dcp] Warning: Invalid DCP_RULES JSON, using defaults');
		}
	}

	// Apply zod validation and merge with defaults
	const validated = DcpConfigSchema.parse({
		...DEFAULT_CONFIG,
		...envConfig,
	});

	// Apply flag overrides (highest priority)
	const enabled = pi.getFlag("--dcp-enabled");
	const debug = pi.getFlag("--dcp-debug");
	const keepRecent = pi.getFlag("--dcp-keep-recent");

	if (enabled !== undefined) {
		validated.enabled = enabled as boolean;
	}
	if (debug !== undefined) {
		validated.debug = debug as boolean;
	}
	if (keepRecent !== undefined) {
		validated.keepRecentCount = parseInt(keepRecent as string, 10);
	}

	// Filter out invalid rules
	const availableRuleNames = getRuleNames();
	const invalidRuleNames: string[] = [];

	const rules: PruneRule[] = validated.rules
		.filter((rule): rule is string => {
			if (availableRuleNames.includes(rule)) {
				return true;
			}
			invalidRuleNames.push(rule);
			return false;
		})
		.map((rule) => getRule(rule)!);

	// Log invalid rules if debug is enabled
	if (validated.debug && invalidRuleNames.length > 0) {
		console.warn(`[pi-dcp] Warning: Invalid rules ignored: ${invalidRuleNames.join(", ")}`);
	}

	return {
		enabled: validated.enabled,
		debug: validated.debug,
		keepRecentCount: validated.keepRecentCount,
		rules,
	};
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): DcpConfig {
	return { ...DEFAULT_CONFIG };
}

/**
 * Generate sample configuration file content
 */
export function generateConfigFileContent(): string {
	return `/**
 * DCP (Dynamic Context Pruning) Configuration
 * 
 * Environment variables:
 * - DCP_ENABLED=true/false
 * - DCP_DEBUG=true/false  
 * - DCP_KEEP_RECENT=10
 * - DCP_RULES='["deduplication", "recency"]'
 */

export default {
	enabled: true,
	debug: false,
	rules: ["deduplication", "superseded-writes", "error-purging", "tool-pairing", "recency"],
	keepRecentCount: 10,
} satisfies DcpConfig;
`;
}

/**
 * Write configuration file to the specified path
 */
export async function writeConfigFile(
	path: string,
	options?: { force?: boolean }
): Promise<void> {
	const fs = await import("fs/promises");
	const force = options?.force ?? false;

	if (!force) {
		try {
			await fs.access(path);
			throw new Error("Config file already exists. Use force option to overwrite.");
		} catch (error: any) {
			if (error.code !== "ENOENT") {
				throw error;
			}
		}
	}

	const content = generateConfigFileContent();
	await fs.writeFile(path, content, "utf-8");
}
