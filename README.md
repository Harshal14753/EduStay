# EduStay - Student Accommodation & Food Services Portal

## Overview
A full-stack web application to help students find PGs, hostels, flats, and food services near their university.

## Features
- Student accommodation search (by location, university, price, amenities)
- Food service discovery (mess, tiffin, canteen, cafe, restaurant)
- Property owner listing & management
- AI-powered chatbot for location-based search
- Student reviews and ratings
- Responsive UI with Tailwind CSS

## Tech Stack
- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL 17
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **AI**: Llama 3 (via Ollama) - optional
- **UI Components**: Radix UI, shadcn/ui

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 17
- npm or yarn

### Installation
\\\ash
npm install --legacy-peer-deps
\\\

### Environment Setup
Create a \.env\ file:
\\\env
DATABASE_URL=\
postgresql://postgres:YOUR_PASSWORD@localhost:5432/edustay\
NEXTAUTH_URL=\http://localhost:3000\
NEXTAUTH_SECRET=\your-secret-here\
\\\

### Database Setup
\\\ash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
\\\

### Run Development Server
\\\ash
npm run dev
\\\

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
- \pp/\ - Next.js app directory
- \pp/api/\ - API routes (auth, listings, chatbot)
- \components/\ - React components
- \prisma/\ - Database schema & migrations
- \public/\ - Static assets
- \scripts/\ - Database seed script

## Chatbot Features
- Location-aware accommodation search
- University name matching
- Food service discovery by area
- Natural language input processing
- Real-time database results

## API Endpoints
- \POST /api/chatbot\ - Smart location search
- \GET /api/listings/accommodation\ - Search accommodations
- \GET /api/listings/food\ - Search food services
- \POST /api/auth/[...nextauth]\ - Authentication

## Database Models
- User (students ;& property owners)
- AccommodationListing
- FoodServiceListing
- Inquiry
- Review
- University

## License
MIT

## Author
Harshal - EduStay Team
