# Eventopia

Eventopia is a simple event discovery and management platform for college events (IITs, NITs, IIITs and others). It provides a React + Vite frontend and an Express + MongoDB backend. Users can sign up, submit events, register for events, and admins can approve or reject submitted events.

<!-- NOTE: Upload screenshots to the `images/` folder and replace the placeholders below -->

## Screenshots



![Homepage ](images/home.png)
![Event details ](images/allEvent.png)

## Features

- User authentication (register / login)
![User login](images/loginU.png)
![Admin login](images/loginA.png)

- Submit and manage events (create, update, delete)
![Submit Event](images/submitE.png)

- Browse events by college or institution type (IIT / NIT / IIIT)
- Admin approval workflow for submitted events
- Register / unregister for events
- Unified User Profile (Manage personal info, submitted events, and registrations)
![User Profile](images/Profile.png)
- **Following & Alerts System:** Follow specific institutes or categories to receive real-time in-app notifications and email alerts when new events are approved.

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
	- `services/` - Business services (`emailService`, `notificationService`, `cacheService`, `cronService`, `socketService`)
	- `middleware/` - Express middleware (`cacheMiddleware`, `rateLimiter`, `auth`)
	- `kafka/` - Kafka producer/consumer infrastructure
		- `producers/` - Event and registration topic producers
		- `consumers/` - Email, notification, and analytics consumer workers
	- `config/` - Database and Redis configuration
- `frontend/` - React + Vite application
	- `src/` - React sources (components, pages, services)
- `nginx/` - Nginx reverse proxy gateway configuration
- `images/` - Add screenshots and other assets here
- `.ai/` - AI Knowledge Base (decision log, progress, changelog)

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

# Email Configuration (for Nodemailer alerts)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret used to sign JWTs
- `JWT_EXPIRE`: Token expiration (e.g. `30d`)
- `CLIENT_URL` or `CORS_ORIGIN`: Frontend origin(s) for CORS (comma-separated)
- `PORT`: Backend port (defaults to `5000`)
- `EMAIL_*`: Credentials for Nodemailer (use an App Password for Gmail)

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

## Running with Docker Compose

The entire application runs behind an **Nginx reverse proxy** as a single entry point.

```
Browser (http://localhost)
        │
     Nginx Gateway (:80)
        │
 ┌──────┴──────┐
 │             │
Frontend    Backend (:5000)
               │
           MongoDB (:27017)
```

### Prerequisites

- **Docker Desktop** installed and running on your system.
- **Docker Compose v2** (included with Docker Desktop).

### Environment Setup

1. Copy the root `.env.example` to a new root file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Adjust environment parameters if required (defaults work out-of-the-box).

### Running the Application

Start all services with a single command:

```bash
docker compose up --build -d
```

- `--build`: Re-builds images (first run or when code changes).
- `-d`: Runs containers in detached background mode.

### Accessing the Application

Once running, access everything through the Nginx gateway:

| URL | What it serves |
|---|---|
| `http://localhost` | React frontend (via Nginx → Frontend container) |
| `http://localhost/api` | Express backend (via Nginx → Backend container) |
| `localhost:27017` | MongoDB (direct — for dev tools like Compass) |

> **Note:** Frontend and backend ports are NOT directly exposed to the host. All traffic flows through Nginx on port 80.

### Nginx Features

- **Reverse Proxy**: Routes `/api/*` to Express, everything else to React
- **Gzip Compression**: Enabled for HTML, CSS, JS, JSON, SVG, fonts
- **Security Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`
- **React Router Support**: Client-side routing works correctly on page refresh
- **Upload Limit**: `client_max_body_size 10m` for future file uploads
- **WebSocket Ready**: Commented Socket.IO proxy block ready for activation

### Checking Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f nginx
docker compose logs -f backend
```

### Stopping Services

```bash
# Stop and preserve database volumes
docker compose down

# Stop and completely reset local volumes
docker compose down -v
```

### Troubleshooting

| Issue | Fix |
|---|---|
| `502 Bad Gateway` | Backend container may not be ready yet. Check: `docker compose logs backend` |
| Frontend shows blank page | Rebuild frontend: `docker compose build frontend` |
| API returns CORS errors | Verify `CLIENT_URL` in `.env` matches the origin (default: `http://localhost`) |
| Port 80 already in use | Stop any local web servers, or change the nginx port mapping in `docker-compose.yml` |

---

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

- Subscriptions & Notifications
	- `GET /api/subscriptions` - Get user's following preferences
	- `POST /api/subscriptions/update` - Update following preferences
	- `GET /api/notifications` - Get user's in-app notifications
	- `PUT /api/notifications/:id/read` - Mark a notification as read
	- `PUT /api/notifications/read-all` - Mark all as read

## Redis Caching & API Rate Limiting

Eventopia utilizes **Redis** as a high-performance in-memory cache and API rate limiting store to minimize database load and ensure application security.

### Caching Architecture

- **Primary Database**: MongoDB (Atlas/Local) handles persistent storage.
- **Cache Layer**: Redis caches expensive, high-frequency read operations.
- **Fault Tolerance**: If Redis becomes offline or fails, the application automatically falls back to direct MongoDB queries, keeping all endpoints functional.

### Caching Strategy & Expirations

Different TTL (Time-To-Live) values are applied to endpoints to balance performance and freshness:

| Cache Key Pattern | Cached Endpoint | TTL (Seconds) | Expiration Class |
|---|---|---|---|
| `events:list:<queries>` | `GET /api/events` (Homepage lists) | 300 (5m) | Short |
| `events:search:<query>` | `GET /api/events?search=...` | 900 (15m) | Medium |
| `events:id:<id>` | `GET /api/events/:id` (Details) | 900 (15m) | Medium |
| `college:events:<slug>` | `GET /api/events/college/:name` | 900 (15m) | Medium |
| `institution:<type>` | `GET /api/events/institution/:type` | 900 (15m) | Medium |
| `user:stats:<userId>` | `GET /api/users/stats` (Dashboard) | 600 (10m) | Medium |
| `notifications:unread:<userId>` | `GET /api/notifications/unread-count` | 60 (1m) | Short |

### Selective Cache Invalidation

To guarantee cache consistency, we avoid bulk flushes and selectively invalidate keys when data updates:

- **Create Event**: Invalidates cached query lists, searches, college, institution, and creator stats.
- **Update / Approve / Delete Event**: Deletes specific event details cache (`events:id:<id>`), and invalidates all query lists, searches, college, institution, and creator stats.
- **Register / Unregister**: Invaldates event details cache, query lists, and statistics for both the registrant and the creator.
- **Notification read/delete/inserted**: Deletes the specific user's count cache (`notifications:unread:<userId>`).
- **Profile Update**: Invalidates user stats cache and general event lists.

### API Rate Limiting

To prevent abuse, Redis rate-limits high-risk endpoints per IP address. If rate limits are exceeded, a `429 Too Many Requests` status is returned.

| Target Route | Method | Max Requests | Window (Seconds) |
|---|---|---|---|
| `/api/auth/login` | `POST` | 10 | 60 |
| `/api/auth/register` | `POST` | 10 | 60 |
| `/api/events` | `POST` | 5 | 60 |

### Performance Benchmark Results

Average response time measurements show significant improvement when caching is active:

| Endpoint | Pre-Redis Latency (MongoDB) | Post-Redis Latency (Redis HIT) | Performance Improvement |
|---|---|---|---|
| **Homepage** (`/api/events`) | 132.5 ms | 4.8 ms | **~96% faster** |
| **Search** (`?search=Hackathon`) | 114.5 ms | 5.2 ms | **~95% faster** |
| **Event Details** (`/:id`) | 165.3 ms | 3.5 ms | **~98% faster** |
| **User Stats** (`/stats`) | 95.0 ms | 2.1 ms | **~97% faster** |

*Note: Database queries are reduced to zero on Redis cache hits.*

---

## Apache Kafka — Asynchronous Message Processing

Eventopia uses **Apache Kafka** to decouple long-running background tasks (emails, notifications, analytics) from synchronous API responses. Controllers publish lightweight messages to Kafka topics after completing MongoDB writes, and dedicated consumer workers process them asynchronously.

### Architecture

```
Student/Admin  →  Express API  →  MongoDB (write)
                       │
                       ↓
                  Kafka Producer (fire-and-forget)
                       │
            ┌──────────┼──────────┐
            ↓          ↓          ↓
     Email Consumer  Notif Consumer  Analytics Consumer
     (group: email)  (group: notif)  (group: analytics)
```

### Kafka Topics

| Topic | Published When | Consumers |
|---|---|---|
| `event.created` | New event submitted | — |
| `event.updated` | Event details edited | — |
| `event.approved` | Admin approves event | Email, Notification, Analytics |
| `event.rejected` | Admin rejects event | Email |
| `registration.created` | Student registers for event | Email, Notification, Analytics |
| `registration.cancelled` | Student unregisters | Notification, Analytics |
| `notification.send` | Generic notification (future) | — |
| `email.send` | Generic email (future) | — |

### Consumer Responsibilities

| Consumer | Group ID | Handles |
|---|---|---|
| **Email** | `eventopia-email-consumer` | Subscriber notification emails, rejection emails, registration confirmations |
| **Notification** | `eventopia-notification-consumer` | Bulk in-app notifications, Socket.IO real-time events, Redis cache invalidation |
| **Analytics** | `eventopia-analytics-consumer` | Subscriber count updates, structured registration/cancellation logs |

### Retry & Error Handling

- **Producer**: 5 retries with 1-second initial delay (KafkaJS built-in).
- **Consumer**: 3 retries per message with exponential backoff (100ms → 400ms → 1600ms).
- **Dead Letters**: After exhausting retries, failed messages are logged with structured JSON for debugging.
- **Graceful Fallback**: If Kafka is unavailable, the API continues working normally — background tasks simply don't execute until Kafka recovers.

### Kafka Troubleshooting

| Issue | Fix |
|---|---|
| `[Kafka Producer] Initial connection failed` | Kafka may not be ready yet (15-30s startup). The producer will retry automatically. |
| `[Kafka Consumer:*] Failed to start` | Check Kafka container: `docker compose logs kafka` |
| Consumers not receiving messages | Verify topics exist: `docker exec eventopia-kafka kafka-topics --bootstrap-server localhost:9092 --list` |
| Kafka container keeps restarting | Check Zookeeper: `docker compose logs zookeeper` |

---

## Contributing

Contributions are welcome. A suggested workflow:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes and open a pull request

Please open issues for bugs or feature requests.

## License



## Notes / Next steps

- Upload screenshots to the `images/` directory; reference them in this README where the placeholders are.
- Consider adding a `.env.example` file in `backend/` with the environment variables shown above.
- Add CI, tests, and deployment instructions when ready.

---


