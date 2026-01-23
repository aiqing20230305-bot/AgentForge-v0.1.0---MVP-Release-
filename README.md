# Agent Builder

A visual "agents.md builder" with WoW-style equipment UI. Drag and drop markdown files into equipment slots to build a combined agent configuration.

## Features

- **Visual Equipment UI**: WoW-inspired character equipment interface
- **Drag & Drop**: Drag items from inventory to equipment slots
- **Token Budget**: Track token usage with budget limits
- **Category System**: Items categorized as roles, skills, behaviors, etc.
- **Rarity System**: Items colored by token count (common → legendary)
- **Loadouts**: Save and load different equipment configurations
- **Export**: Save to file, clipboard, or directly to ~/.claude/agents.md

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Slot Configuration

| Slot | Category | Description |
|------|----------|-------------|
| HEAD | roles | Primary role/persona |
| CHEST | behaviors | Behavioral patterns |
| HANDS | skills | Abilities and skills |
| LEGS | constraints | Rules and limitations |
| FEET | formats | Output formatting |
| RING 1 | personalities | Communication style |
| RING 2 | contexts | Situational context |
| WEAPON | any | Wildcard slot |
| OFFHAND | tools | Tool integrations |

## Rarity Thresholds

| Tokens | Rarity | Color |
|--------|--------|-------|
| 0-50 | Common | Gray |
| 51-100 | Uncommon | Green |
| 101-200 | Rare | Blue |
| 201-400 | Epic | Purple |
| 401+ | Legendary | Orange |

## Sample Components

Check the `sample-components/` folder for example agent component files.

## Tech Stack

- Electron
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- react-dnd (drag and drop)
- gpt-tokenizer (token counting)
- electron-store (persistence)
