# EduStay - Student Accommodation and Food Services Portal

## Overview
EduStay is a full-stack web application that helps students find PGs, hostels, flats, and food services near their university.

## Features
- Student accommodation search (location, university, price, amenities)
- Food service discovery (mess, tiffin, canteen, cafe, restaurant)
- Property owner listing and management
- AI-powered chatbot for location-based search (optional)
- Student reviews and ratings
- Responsive UI with Tailwind CSS

## Tech Stack
- Frontend: Next.js 13, React, TypeScript, Tailwind CSS
- Backend: Next.js API routes, Node.js
- Database: PostgreSQL
- ORM: Prisma
- Authentication: NextAuth.js
- AI: Llama 3 via Ollama (optional)
- UI Components: Radix UI, shadcn/ui

## Prerequisites
- Node.js 18+
- PostgreSQL
- npm

## Quick Start

### 1) Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2) Environment Setup
Create a .env file in the project root:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5433/student_accommodation_portal"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

Note: Use the actual DB host/port/name from your PostgreSQL setup.

### 3) Database Setup
```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

### 4) Run the App
```bash
npm run dev
```

Open http://localhost:3000

## Clone on Another Laptop (Important)
If someone copies/clones this repo on another laptop, follow these steps exactly:

1. Install Node.js and PostgreSQL.
2. Clone the repository.
3. Run dependency install:

```bash
npm install --legacy-peer-deps
```

4. Create/update .env with that laptop's PostgreSQL credentials.
5. Create the database if it does not exist.
6. Apply migrations and generate Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

7. Optional seed data:

```bash
npx prisma db seed
```

8. Start app:

```bash
npm run dev
```

### Do We Need to Change Any Files?
- Usually no code file changes are needed.
- Only .env values usually change per laptop (DB URL, secrets, app URL).
- Do not edit migration files after they are pushed.

## Inquiry Error Troubleshooting
If you see an error like: relation/table inquiry_messages does not exist

Run:
```bash
npx prisma migrate deploy
npx prisma generate
```

Then restart the app server.

If prisma generate fails on Windows with a locked query engine file:
1. Stop all running node/next dev processes.
2. Run npx prisma generate again.
3. Restart npm run dev.

## Project Structure
- app/: Next.js app directory
- app/api/: API routes (auth, listings, chatbot, inquiries)
- components/: React components
- prisma/: Prisma schema and migrations
- public/: Static assets
- scripts/: Seed scripts

## Core API Endpoints
- POST /api/chatbot
- GET /api/listings/accommodation
- GET /api/listings/food
- POST /api/auth/[...nextauth]

## Main Database Models
- User
- AccommodationListing
- FoodServiceListing
- Inquiry
- InquiryMessage
- Review
- University

## License
MIT

## Author
Harshal = Backend developer

Yash = Frontennd developer
