# MovieBuddy Backend API

RESTful API for the **MovieBuddy** application built with Node.js, Express (ES6 Modules), and Mongoose (with automatic in-memory mock data fallback).

## Features
- **Titles / Movies**: Browse, search by keyword, filter by category/genre, view details, and manage user favorites.
- **Reviews**: Create, read, update, and delete movie/series reviews with ratings (1-10) and comments (max 80 chars).
- **Users**: Full CRUD for user profiles, login/logout, password & email updates, swiping/matching support, and visibility toggle.
- **Texts / Chat**: Send, read, and delete chat messages between matched users.
- **Dual Mode**: Connects to MongoDB if `MONGODB_URI` is configured in `.env`, otherwise seamlessly falls back to pre-populated mock data.

## Setup & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm start
   ```
The API will be available at `http://localhost:3000` (and mounted under `/api` as well as root `/` for full Swagger compatibility).
