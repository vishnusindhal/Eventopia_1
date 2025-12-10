# Eventopia

Eventopia is a simple event discovery and management platform for college events (IITs, NITs, IIITs and others). It provides a React + Vite frontend and an Express + MongoDB backend. Users can sign up, submit events, register for events, and admins can approve or reject submitted events.

<!-- NOTE: Upload screenshots to the `images/` folder and replace the placeholders below -->

## Screenshots

Add screenshots to `images/` and reference them here, for example:

![Homepage placeholder](images/homepage.png)
![Event details placeholder](images/event-details.png)

## Features

- User authentication (register / login)
- Submit and manage events (create, update, delete)
- Browse events by college or institution type (IIT / NIT / IIIT)
- Admin approval workflow for submitted events
- Register / unregister for events
- User profile and basic stats

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Authentication: JSON Web Tokens (JWT)

## Repo Structure (important files)

- `backend/` - Express API
	- `server.js` - App entrypoint
	- `routes/` - Express route modules (`auth`, `events`, `users`)
	- `controllers/` - Route handlers and business logic
	- `models/` - Mongoose models (`User`, `Event`)
- `frontend/` - React + Vite application
	- `src/` - React sources (components, pages, services)
- `images/` - Add screenshots and other assets here

## Prerequisites

- Node.js (v16+ recommended)
- npm (comes with Node.js)
- MongoDB instance (local or hosted e.g., MongoDB Atlas)

## Environment Variables

Create a `.env` file inside `backend/` with these variables (example):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventopia
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret used to sign JWTs
- `JWT_EXPIRE`: Token expiration (e.g. `30d`)
- `CLIENT_URL` or `CORS_ORIGIN`: Frontend origin(s) for CORS (comma-separated)
- `PORT`: Backend port (defaults to `5000`)

## Running Locally (Windows PowerShell)

1) Start the backend

```powershell
cd backend
npm install
# create .env with values shown above
npm run dev
```

The backend will listen on the port defined in `.env` (default `5000`).

2) Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend development server uses Vite (default `http://localhost:5173`). Ensure `CLIENT_URL` or `CORS_ORIGIN` includes that origin for development.

## API Endpoints (overview)

Base: `/api`

- Auth
	- `POST /api/auth/register` - Register a new user
	- `POST /api/auth/login` - Login and receive JWT
	- `GET /api/auth/me` - Get current user (requires auth)
	- `PUT /api/auth/updateprofile` - Update profile (requires auth)
	- `PUT /api/auth/updatepassword` - Update password (requires auth)

- Events
	- `GET /api/events` - Get all events (supports query filters)
	- `GET /api/events/:id` - Get event by ID
	- `GET /api/events/college/:collegeName` - Events by college
	- `GET /api/events/institution/:institutionType` - Events by institution (IIT/NIT/IIIT)
	- `POST /api/events` - Create event (requires auth)
	- `PUT /api/events/:id` - Update event (requires auth, owner or admin)
	- `DELETE /api/events/:id` - Delete event (requires auth, owner or admin)
	- `POST /api/events/:id/register` - Register for event (requires auth)
	- `POST /api/events/:id/unregister` - Unregister from event (requires auth)
	- `PUT /api/events/:id/approve` - Approve event (admin only)
	- `PUT /api/events/:id/reject` - Reject event (admin only)

- Users
	- `GET /api/users/events` - Get events submitted by the user (requires auth)
	- `GET /api/users/registered-events` - Get user's registered events (requires auth)
	- `GET /api/users/stats` - Get user statistics (requires auth)

## Contributing

Contributions are welcome. A suggested workflow:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes and open a pull request

Please open issues for bugs or feature requests.

## License

This project does not include a license file. Add a `LICENSE` file if you want to set a license (e.g., MIT).

## Notes / Next steps

- Upload screenshots to the `images/` directory; reference them in this README where the placeholders are.
- Consider adding a `.env.example` file in `backend/` with the environment variables shown above.
- Add CI, tests, and deployment instructions when ready.

---

If you want, I can also:
- add a `backend/.env.example` file,
- add example requests (curl / Postman collection), or
- create a short CONTRIBUTING.md — tell me which and I'll add them.
