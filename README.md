# Office Seat Capacity Planning

This project contains a Spring Boot backend and a React frontend for an office seat capacity planning demo using PostgreSQL.

## Features
- User authentication with JWT
- Seat management (create, list, delete)
- Seat booking system
- Dashboard metrics
- Demo data initializer

## Backend Setup
1. Install Java 17 and Maven
2. Start PostgreSQL using Docker Compose:
   ```bash
   docker compose up -d
   ```
3. Create the database:
   ```bash
   docker exec -it capacity-postgres psql -U demo_user -c "CREATE DATABASE seat_capacity_demo;"
   ```
4. Run backend:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

## Frontend Setup
1. Install Node.js 20+
2. Install packages:
   ```bash
   cd frontend
   npm install
   ```
3. Start frontend:
   ```bash
   npm run dev
   ```

## Demo Login
- `admin` / `admin123`
- `user` / `user123`

## Notes
- Backend runs at `http://localhost:8080`
- Frontend runs at `http://localhost:5173`
- PostgreSQL is configured in `backend/src/main/resources/application.properties`
