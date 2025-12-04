# FuelEU Maritime Compliance Platform

A full-stack web application for managing ship GHG emissions compliance under the FuelEU Maritime Regulation (EU 2023/1805). Built with React, TypeScript, Node.js, and PostgreSQL following hexagonal architecture principles.

## 🌊 Overview

The FuelEU Maritime Regulation requires ships operating in the EU to reduce their greenhouse gas (GHG) intensity. This platform helps shipping companies:

- Track route emissions and fuel consumption
- Compare actual vs target GHG intensity
- Calculate compliance balance
- Bank surplus compliance (Article 20)
- Pool ships for collective compliance (Article 21)

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters), ensuring:

- **Separation of concerns** - Business logic is isolated from infrastructure
- **Testability** - Core domain can be tested without external dependencies
- **Flexibility** - Easy to swap adapters (databases, APIs, UI frameworks)

```
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── domain/entities/     # Business entities & value objects
│   │   │   ├── application/use-cases/ # Business logic
│   │   │   └── ports/               # Interfaces (inbound & outbound)
│   │   ├── adapters/
│   │   │   ├── inbound/http/        # Express controllers & routes
│   │   │   └── outbound/postgres/   # Prisma repositories
│   │   └── infrastructure/          # Server setup
│   └── prisma/                      # Database schema & seeds
│
└── frontend/
    └── src/
        ├── core/
        │   ├── domain/entities/     # Domain types & value objects
        │   └── ports/               # API interfaces
        └── adapters/
            ├── infrastructure/api/  # HTTP API client (Axios)
            └── ui/                  # React components & hooks
```

## 📊 Key Features

### 1. Routes Tab
- View all ship routes with emissions data
- Filter by vessel type, fuel type, and year
- Set baseline route for comparison
- Real-time compliance status indicators

### 2. Compare Tab
- Visual bar chart comparing actual vs target GHG intensity
- Detailed comparison table with compliance balance
- Summary statistics (total energy, weighted intensity)
- Compliant (✅) / Non-Compliant (❌) indicators

### 3. Banking Tab (Article 20)
- Bank surplus compliance balance for future use
- View banking records with amounts
- **Validation**: Only positive CB can be banked
- **Validation**: Each ship can only bank once per year
- Supports 2-year banking period per FuelEU regulations

### 4. Pooling Tab (Article 21)
- Create compliance pools with multiple ships
- Select minimum 2 vessels for pooling
- Aggregate compliance balance across pool
- Ships with surplus offset those with deficits

## 🔢 FuelEU Maritime Formulas

### Target GHG Intensity (2025)
```
Target = 91.16 gCO₂e/MJ × (1 - 0.02) = 89.3368 gCO₂e/MJ
```

### Compliance Balance
```
CB = (Target GHG Intensity - Actual GHG Intensity) × Energy Used
Energy Used = Fuel Consumption × 41,000 MJ/ton
```

### Compliance Status
- **Compliant (Surplus)**: CB ≥ 0 (Actual ≤ Target)
- **Non-Compliant (Deficit)**: CB < 0 (Actual > Target)

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v18+
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL 18
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- PostgreSQL v14 or higher
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb fueleu_maritime
```

2. Set up environment variables:
```bash
# backend/.env
DATABASE_URL="postgresql://postgres:root@localhost:5432/fueleu_maritime"
PORT=4000
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 📡 API Endpoints

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes` | Get all routes (with optional filters) |
| POST | `/api/routes/:id/baseline` | Set route as baseline |
| GET | `/api/routes/comparison` | Get baseline vs other routes comparison |

### Compliance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/compliance/cb` | Get compliance balance for ship/year |
| GET | `/api/compliance/adjusted-cb` | Get adjusted CB after banking |

### Banking (Article 20)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/banking/records` | Get banking records for ship/year |
| POST | `/api/banking/bank` | Bank positive surplus |
| POST | `/api/banking/apply` | Apply banked amount to deficit |

### Pooling (Article 21)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pools` | Create new pool with members |

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Frontend Tests
```bash
cd frontend
npm test              # Run all tests
npm run test:coverage # With coverage
```

## 📁 Seed Data

The database is seeded with 5 routes from the assignment:

| Route ID | Vessel Type | Fuel Type | Year | GHG Intensity | Fuel Consumption |
|----------|-------------|-----------|------|---------------|------------------|
| R001 | Container | HFO | 2024 | 91.0 | 5000t |
| R002 | BulkCarrier | LNG | 2024 | 88.0 | 4800t |
| R003 | Tanker | MGO | 2024 | 93.5 | 5100t |
| R004 | RoRo | HFO | 2025 | 89.2 | 4900t |
| R005 | Container | LNG | 2025 | 90.5 | 4950t |

## 🔒 Validation Rules

### Banking
- Only positive surplus (CB > 0) can be banked
- **Each ship can only bank once per year** (duplicate prevention)
- Banked amounts valid for 2 years
- Cannot apply more than available banked amount

### Pooling
- Minimum 2 ships required per pool
- Pool names must be unique per year

## ⚠️ Known Limitations

1. **Route Coverage**: Seed data only covers 2024-2025. Selecting other years will show "No routes found"
2. **Year Range**: Dropdowns support 2024-2030 for future-proofing
3. **Vessel/Year Combinations**: Not all vessel types have routes for all years

## 🐛 Troubleshooting

### Error: "No routes found for vessel type X in year Y"
This means the selected combination doesn't exist in the database. Use vessel types from the seed data (Container, BulkCarrier, Tanker, RoRo) with years 2024 or 2025.

### Error: "Surplus already banked for X in year Y"
Each ship can only bank once per year. This error indicates banking was already performed.

### Error: "Cannot bank: No compliance surplus available"
The selected vessel has a deficit (CB < 0), not a surplus. Only ships with positive CB can bank.

## 📚 References

- [EU Regulation 2023/1805 (FuelEU Maritime)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1805)
- [DNV FuelEU Maritime Overview](https://www.dnv.com/maritime/fueleu-maritime/)

## 📝 License

This project is for educational and assessment purposes.

---

Built with ❤️ for FuelEU Maritime Compliance
