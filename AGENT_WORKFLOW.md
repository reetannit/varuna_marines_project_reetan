# AI Agent Workflow Log

This document describes the AI agent usage, development workflow, decision-making process, and implementation approach used to build the FuelEU Maritime Compliance Platform.

## Agents Used

| Agent | Version | Primary Use |
|-------|---------|-------------|
| GitHub Copilot (Claude Opus 4.5 Preview) | VS Code Extension | Architecture design, code generation, debugging, refactoring |

## Prompts & Outputs

### Example 1: Initial Research and Architecture Planning

**Prompt:**
> "research about it and also research about best practices... create a architecture plan after researching extensively then implement it in best possible manner"

**Agent Output:**
The agent fetched FuelEU Maritime regulations from EUR-Lex and DNV websites, extracted:
- Target GHG Intensity formula: 89.3368 gCO₂e/MJ (2% reduction from 91.16)
- Compliance Balance formula: CB = (Target - Actual) × Energy
- Energy calculation: Energy = FuelConsumption × 41,000 MJ/ton
- Article 20 banking rules (2-year carry forward)
- Article 21 pooling mechanism

### Example 2: Fixing Banking Duplicate Entry Bug

**Prompt:**
> "Also while banking, there should be validation that in once year same ship should be banked once"

**Agent Output:**
```typescript
// Check if already banked for this ship/year
const existingEntries = await this.bankEntryRepository.findByShipAndYear(shipId, year);
if (existingEntries.length > 0) {
  throw new Error(`Surplus already banked for ${shipId} in year ${year}. Each ship can only bank once per year.`);
}
```

### Example 3: Error Handler Improvement

**Prompt:**
> "error 500 coming at many places"

**Agent Output:**
The agent identified that business logic errors were returning 500 instead of 400 and updated the error handler:
```typescript
const BUSINESS_ERROR_PATTERNS = [
  'No routes found',
  'Cannot bank',
  'Surplus already banked',
  'No compliance surplus',
  'not found'
];

function isBusinessError(message: string): boolean {
  return BUSINESS_ERROR_PATTERNS.some(pattern => 
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}
```

## Validation / Corrections

### Correction 1: API Response Field Mapping
**Issue:** Frontend expected `bankedAmount` but backend returned `amount`
**Agent Fix:** Updated `HttpApiClient.ts` to map backend response fields correctly:
```typescript
bankedAmount: (record as any).amount || record.bankedAmount,
usedAmount: (record as any).appliedAmount || record.usedAmount,
```

### Correction 2: Import Path Issues
**Issue:** Backend adapters had incorrect relative import paths causing module not found errors
**Agent Fix:** Corrected all import paths from `../../../../core/` pattern to proper relative paths matching the hexagonal structure

### Correction 3: Year Dropdown Limited Range
**Issue:** User pointed out "why only 3 years in dropdown"
**Agent Fix:** Expanded year options from [2024, 2025, 2026] to [2024, 2025, 2026, 2027, 2028, 2029, 2030]

### Correction 4: Database Reset During Active Server
**Issue:** First database reset attempt failed because backend server was still running
**Agent Fix:** Properly killed the server process, then ran `npx prisma migrate reset --force`

## Observations

### Where Agent Saved Time
1. **Research & Documentation** - Fetched and synthesized FuelEU Maritime regulations automatically from EUR-Lex and DNV sources
2. **Boilerplate Generation** - Created hexagonal architecture folder structure and interfaces in one pass
3. **Database Schema** - Generated Prisma schema with proper relations and seed data
4. **UI Components** - Generated TailwindCSS-styled React components rapidly with proper styling
5. **Bug Fixing** - Quickly identified issues in import paths and field mappings by reading multiple files

### Where Agent Failed or Hallucinated
1. **Initial API Client Mapping** - Assumed backend field names matched frontend interfaces (required manual correction after testing)
2. **Terminal Commands** - Sometimes ran commands in wrong directory when multiple terminals were open
3. **Database Reset Timing** - First attempt failed because it didn't check if server was running
4. **Seed Data Coverage** - Initial seed only covered year 2024-2025, causing "No routes found" errors for other years

### How Tools Were Combined Effectively
1. **Read → Understand → Fix Pattern** - Agent read existing files, understood the structure, then made targeted fixes
2. **Multi-file Edits** - Used `multi_replace_string_in_file` to update multiple files atomically (e.g., year dropdowns)
3. **Terminal + Code** - Combined terminal commands (migrations, server restart) with code changes seamlessly
4. **Web Fetch + Implementation** - Fetched regulation documents, extracted formulas, then implemented them correctly

## Best Practices Followed

1. **Hexagonal Architecture** - Maintained strict separation between core domain and adapters
2. **TypeScript Strict Mode** - All code follows strict type checking
3. **Domain-Driven Design** - Entities reflect real FuelEU Maritime concepts (Route, BankEntry, Pool)
4. **Error Handling** - Proper error propagation from use cases through controllers with meaningful messages
5. **Incremental Development** - Built layer by layer (domain → ports → use cases → adapters)
6. **Research Before Code** - Fetched and understood FuelEU Maritime regulations before implementation

---

## Detailed Implementation Process

### Requirements Analysis

The project required building a FuelEU Maritime compliance platform with:
- Frontend: React + TypeScript + TailwindCSS
- Backend: Node.js + TypeScript + PostgreSQL
- Clean/Hexagonal Architecture
- Four main features: Routes, Compare, Banking (Article 20), Pooling (Article 21)

### Research Phase

Before implementation, extensive research was conducted on:

1. **FuelEU Maritime Regulation (EU 2023/1805)**
   - Reviewed EUR-Lex official documentation
   - Studied DNV maritime compliance guides
   - Understood GHG intensity targets and reduction schedules

2. **Key Formulas Identified**
   - Target GHG Intensity 2025: 89.3368 gCO₂e/MJ (2% reduction from 91.16 baseline)
   - Compliance Balance: CB = (Target - Actual) × Energy
   - Energy Calculation: Energy = FuelConsumption × 41,000 MJ/ton

3. **Regulatory Articles**
   - Article 20: Banking mechanism allowing surplus to be carried forward 2 years
   - Article 21: Pooling mechanism allowing ships to share compliance balance

### Architecture Design

Hexagonal Architecture (Ports & Adapters) was chosen for:

1. **Separation of Concerns** - Core domain logic independent of frameworks
2. **Flexibility** - Can swap databases, APIs, or UI frameworks
3. **Maintainability** - Clear boundaries between layers

```
┌─────────────────────────────────────────────────────────┐
│                     Adapters (Outside)                   │
│  ┌─────────────────┐         ┌─────────────────────┐   │
│  │  HTTP/Express   │         │   PostgreSQL/Prisma │   │
│  │  Controllers    │         │   Repositories      │   │
│  └────────┬────────┘         └──────────┬──────────┘   │
│           │                             │               │
│           ▼                             ▼               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Ports (Interfaces)                  │   │
│  │   Inbound (Use Cases)    Outbound (Repositories)│   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Core Domain (Inside)                │   │
│  │   Entities, Value Objects, Business Rules       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Challenges & Solutions

### Challenge 1: API Field Name Mismatch
**Problem**: Backend returned `amount` but frontend expected `bankedAmount`
**Solution**: Updated API client to map response fields correctly

### Challenge 2: Duplicate Banking Entries
**Problem**: Users could bank the same ship multiple times for the same year
**Solution**: Added validation in BankSurplusUseCase to check for existing entries before allowing banking

### Challenge 3: Error 500 for Business Logic Errors
**Problem**: All errors returned 500, making it hard for users to understand what went wrong
**Solution**: Updated errorHandler middleware to detect business errors (using pattern matching) and return 400 with clear messages

### Challenge 4: Limited Year Options in Dropdown
**Problem**: Banking/Pooling tabs only showed 3 years (2024-2026)
**Solution**: Expanded range to 2024-2030 for better future coverage

### Challenge 5: No Routes for Certain Vessel/Year Combinations
**Problem**: Selecting arbitrary vessel type with a year that has no routes caused errors
**Solution**: Error messages now clearly indicate "No routes found for vessel type X in year Y"

### Challenge 6: Database with Stale Data
**Problem**: After fixing duplicate banking bug, old duplicate entries still existed in database
**Solution**: Database reset with `npx prisma migrate reset --force` and fresh seed

## Lessons Learned

1. **Research First**: Understanding FuelEU Maritime regulations before coding prevented major refactoring
2. **Architecture Pays Off**: Hexagonal architecture made testing and bug fixing straightforward
3. **Type Safety**: TypeScript strict mode caught many bugs at compile time
4. **Test with Real Data**: Seed data helped identify edge cases early
5. **Error Messages Matter**: Clear 400 vs 500 distinction helps users understand issues
6. **Check Terminal State**: Always verify server status before running database commands

---

*This document serves as a record of the AI agent usage and development process.*
