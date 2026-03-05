# @digi4care/pi-dcp

> **Fork van @zenobius/pi-dcp - Node.js compatible versie**

## Overzicht

**Dynamic Context Pruning extension voor pi** - intelligent verwijdert overbodige berichten om token usage te optimaliseren.

Originele versie: https://github.com/zenobi-us/pi-dcp

### Wijzigingen t.o.v. originele versie

- ✅ Verwijderd: `bunfig` dependency (Bun-only)
- ✅ Toevoegd: Environment variable support
- ✅ Werkt met Node.js én Bun

---

## Features

- **Deduplication**: Verwijder dubbele tool outputs op basis van content hash
- **Superseded Writes**: Verwijder oudere file writes als nieuwere versies bestaan
- **Error Purging**: Verwijder opgeloste errors uit context
- **Tool Pairing**: Bewaar tool_use/tool_result pairing
- **Recency Protection**: Bewaar altijd recente berichten

---

## Installatie

```bash
# Clone naar pi extensions directory
git clone https://github.com/digi4care/pi-dcp.git ~/.pi/agent/extensions/pi-dcp

# Of installeer via pi
pi install /path/naar/pi-dcp
```

---

## Configuratie

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DCP_ENABLED` | Enable/disable DCP | true |
| `DCP_DEBUG` | Enable debug logging | false |
| `DCP_KEEP_RECENT` | Aantal recente berichten om te behouden | 10 |
| `DCP_RULES` | JSON array van regels | alle |

### CLI Flags

| Flag | Description |
|------|-------------|
| `--dcp-enabled=true/false` | Enable/disable at startup |
| `--dcp-debug=true/false` | Debug logging at startup |
| `--dcp-keep-recent=N` | Keep N recent messages |

---

## Commands

- `/dcp-debug` - Toggle debug logging
- `/dcp-stats` - Show pruning statistics
- `/dcp-toggle` - Enable/disable extension
- `/dcp-recent <number>` - Set recent messages to keep

---

## Quick Start

```bash
# Start pi met DCP
export $(cat .env | grep -v '^#' | xargs) && pi

# Of met debug logging
DCP_DEBUG=true pi
```
