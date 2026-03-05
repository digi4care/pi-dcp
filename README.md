# Pi-DCP: Dynamic Context Pruning Extension

> **Node.js compatible fork with zod typesafety** - Works with Bun and Node.js

Fork of https://github.com/zenobi-us/pi-dcp

## What is this?

Intelligently prunes conversation context to optimize token usage while preserving conversation coherence.

## Features

- **Deduplication**: Removes duplicate tool outputs based on content hash
- **Superseded Writes**: Removes older file writes when newer versions exist
- **Error Purging**: Removes resolved errors from context
- **Tool Pairing**: Preserves tool_use/tool_result pairing (CRITICAL)
- **Recency Protection**: Always preserves recent messages

## Installation

### Option 1: Via pi install

```bash
pi install /path/to/pi-dcp
```

### Option 2: Manual

```bash
git clone https://github.com/digi4care/pi-dcp.git ~/.pi/agent/extensions/pi-dcp
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DCP_ENABLED` | true | Enable/disable DCP |
| `DCP_DEBUG` | false | Debug logging |
| `DCP_KEEP_RECENT` | 10 | Number of recent messages |
| `DCP_RULES` | all | JSON array of rules |

### CLI Flags

```bash
pi --dcp-enabled=false
pi --dcp-debug=true
pi --dcp-keep-recent=15
```

### Zod Typesafety

Configuration is validated with zod:

```typescript
const DcpConfigSchema = z.object({
  enabled: z.boolean().default(true),
  debug: z.boolean().default(false),
  rules: z.array(z.string()).default([...]),
  keepRecentCount: z.number().int().positive().default(10),
});
```

## Usage

The extension runs automatically on every LLM call. No manual intervention needed.

### Commands

- `/dcp-debug` - Toggle debug logging
- `/dcp-stats` - Show pruning statistics for current session
- `/dcp-toggle` - Enable/disable the extension
- `/dcp-recent <number>` - Set how many recent messages to always keep (default: 10)

## Difference from Original Version

This version was forked because the original depends on `bunfig` (Bun-only).

**Changes:**
- ❌ Removed: `bunfig` dependency
- ✅ Added: Environment variable support
- ✅ Added: zod for typesafe config validation
- ✅ Works with Node.js and Bun

## Quick Start

```bash
# Start pi - DCP works automatically
pi

# Or with custom config
DCP_DEBUG=true pi
```

## Token Savings

See how many tokens you save:

```
[pi-dcp] Pruned 12 / 45 messages (27% reduction)
[pi-dcp]   - deduplication: 5
[pi-dcp]   - superseded-writes: 3
[pi-dcp]   - error-purging: 2
[pi-dcp]   - recency: 2
```

## License

MIT
