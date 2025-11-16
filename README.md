# RPG Character Management + Battle Engine

A production-ready NestJS API that lets you create RPG characters, inspect their stats, and run deterministic turn-based battles using an in-memory state store. The project was built with SOLID-friendly modules, NestJS dependency injection, and thorough unit test coverage of the critical battle rules.

## Requirements
- Node.js 18+
- npm 9+

## Installation & Running
```bash
npm install
npm run start
```
The API listens on port `3000` by default. For local development without building, run `npm run start:dev`.

## Testing
```bash
npm test
```
Unit tests cover character creation flows, modifier calculations, battle engine randomness (speed rolls, damage, death), and full battle simulations.

## API Overview

### Create Character
`POST /characters`
```json
{
  "name": "Artemis",
  "job": "Warrior"
}
```
Response includes the generated id, stats, HP values, attack and speed modifiers, and alive flag.

### List Characters
`GET /characters`

Returns an array of summaries with `id`, `name`, `job`, and `status` (alive or dead).

### Character Details
`GET /characters/{id}`

Returns the full character sheet: name, job, HP values, stats (HP, STR, DEX, INT), attack modifier, speed modifier, and alive flag.

### List Jobs
`GET /jobs`

Returns the static catalog of playable jobs:
```json
{
  "success": true,
  "jobs": [
    {
      "name": "Warrior",
      "lifePoints": 20,
      "strength": 10,
      "dexterity": 5,
      "intelligence": 5,
      "attackFormula": "80% of Strength + 20% Dexterity",
      "speedFormula": "60% Dexterity + 20% Intelligence"
    },
    {
      "name": "Thief",
      "lifePoints": 15,
      "strength": 4,
      "dexterity": 10,
      "intelligence": 4,
      "attackFormula": "25% of Strength + 100% Dexterity + 25% Intelligence",
      "speedFormula": "80% Dexterity"
    },
    {
      "name": "Mage",
      "lifePoints": 12,
      "strength": 5,
      "dexterity": 6,
      "intelligence": 10,
      "attackFormula": "20% of Strength + 20% Dexterity + 120% Intelligence",
      "speedFormula": "40% Dexterity + 10% Strength"
    }
  ]
}
```

### Start Battle
`POST /battle`
```json
{
  "characterA": "<id-1>",
  "characterB": "<id-2>"
}
```
Response:
```json
{
  "winner": { "id": "...", "name": "...", "job": "Warrior", "currentHp": 8 },
  "loser": { "id": "...", "name": "...", "job": "Mage", "currentHp": 0, "alive": false },
  "log": [
    "Battle between ...",
    "... speed was faster ...",
    "... attacks ...",
    "... wins the battle! ..."
  ]
}
```
Battles obey the specified initiative rolls, damage calculations, and log format. Winners keep their remaining HP, losers are marked dead.

## Architecture
- **AppModule** wires MemoryStorage, Character, and Battle modules.
- **storage/** provides `MemoryStorageService`, a singleton in-memory repository for characters.
- **character/** encapsulates DTO validation, job definitions, name validation, entity interfaces, service logic, and the REST controller.
- **battle/** contains the controller, service, deterministic `BattleEngine`, and `RandomService` abstraction so randomness can be mocked in tests.
- **tests/** includes Jest unit tests for character creation, modifier calculations, initiative rerolls, damage application, death detection, and an end-to-end style battle log test.

All services are framework-friendly singletons injected via NestJS DI, fulfilling the clean architecture and in-memory state requirements.
