# Configuration Guide

> **Node.js compatible with zod typesafety!**

## Configuration Priority

Configuration is loaded in the following priority order (highest to lowest):

1. **CLI Flags** - Override any config value
2. **Environment Variables** - Set in shell or .env
3. **Default Config** - Built-in defaults (validated with zod)

## Environment Variables

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `DCP_ENABLED` | boolean | Enable/disable DCP | true |
| `DCP_DEBUG` | boolean | Enable debug logging | false |
| `DCP_KEEP_RECENT` | number | Number of recent messages to keep | 10 |
| `DCP_RULES` | JSON array | Rules to apply | all |

### Zod Validation

All env vars are validated with zod:

```typescript
const DcpConfigSchema = z.object({
  enabled: z.boolean().default(true),
  debug: z.boolean().default(false),
  rules: z.array(z.string()).default([...]),
  keepRecentCount: z.number().int().positive().default(10),
});
```

If a value is invalid, the default is used.

### Example

```bash
# .env file
DCP_ENABLED=true
DCP_DEBUG=false
DCP_KEEP_RECENT=10

# Or in shell
export DCP_ENABLED=true
export DCP_DEBUG=false
export DCP_KEEP_RECENT=15
```

### Rules as Environment Variable

```bash
export DCP_RULES='["deduplication", "recency"]'
```

## CLI Flags

Override configuration with CLI flags:

```bash
# Disable DCP for this session
pi --dcp-enabled=false

# Enable debug logging
pi --dcp-debug=true

# Set recent messages
pi --dcp-keep-recent=15

# Combine flags
pi --dcp-enabled=true --dcp-debug=true --dcp-keep-recent=20
```

## Configuration Options

```typescript
// Zod schema
const DcpConfigSchema = z.object({
  enabled: z.boolean().default(true),
  debug: z.boolean().default(false),
  rules: z.array(z.string()).default([...]),
  keepRecentCount: z.number().int().positive().default(10),
});

// TypeScript type (inferred from zod)
type DcpConfig = z.infer<typeof DcpConfigSchema>;
```

## Available Rules

Built-in pruning rules:

1. **deduplication** - Remove duplicate tool outputs
2. **superseded-writes** - Remove older file versions
3. **error-purging** - Remove resolved errors
4. **tool-pairing** - Preserve tool_use/tool_result pairing (CRITICAL)
5. **recency** - Always keep recent messages

## Runtime Commands

DCP provides commands to adjust configuration during a session:

- `/dcp-toggle` - Enable/disable DCP
- `/dcp-debug` - Toggle debug logging
- `/dcp-recent <number>` - Set number of recent messages to keep
- `/dcp-stats` - Show pruning statistics

## Quick Start

```bash
# Start pi with defaults
pi

# Or with custom settings via .env
export DCP_DEBUG=true
export DCP_KEEP_RECENT=15
pi
```

## Debug Mode

Enable debug logging to see what's being pruned:

```bash
DCP_DEBUG=true pi
```

Example output:
```
[pi-dcp] Pruned 12 / 45 messages
[pi-dcp]   - deduplication: 3
[pi-dcp]   - superseded-writes: 5
[pi-dcp]   - error-purging: 2
[pi-dcp]   - recency: 2
```

## Troubleshooting

### Extension not loading

1. Check if pi-dcp is correctly installed: `pi list`
2. Check startup output for errors
3. Try with debug: `DCP_DEBUG=true pi`

### Invalid env var value

Zod logs a warning if a value is invalid:
```
[pi-dcp] Warning: Invalid DCP_RULES JSON, using defaults
```

The default is then used.

### No pruning effect

1. Check if DCP is active: `/dcp-stats`
2. Make sure you have enough messages (> keepRecentCount)
3. Check debug output for details
