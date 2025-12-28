# Eventopia Backend API

Backend API for Eventopia - Event Management Platform for IITs, NITs, and IIITs

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd eventopia-backend
```

2. Install dependencies
```bash
npm install
```

3. Create .env file in root directory
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventopia
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

4. Start MongoDB (if running locally)
```bash
mongod
```

5. Run the application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (Protected)
- `PUT /updateprofile` - Update user profile (Protected)
- `PUT /updatepassword` - Update password (Protected)

### Event Routes (`/api/events`)
- `GET /` - Get all events (with filters)
- `GET /:id` - Get single event
- `GET /college/:collegeName` - Get events by college
- `GET /institution/:institutionType` - Get events by institution type
- `POST /` - Create event (Protected)
- `PUT /:id` - Update event (Protected)
- `DELETE /:id` - Delete event (Protected)
- `POST /:id/register` - Register for event (Protected)
- `POST /:id/unregister` - Unregister from event (Protected)
- `PUT /:id/approve` - Approve event (Admin only)
- `PUT /:id/reject` - Reject event (Admin only)

### User Routes (`/api/users`)
- `GET /events` - Get user's submitted events (Protected)
- `GET /registered-events` - Get user's registered events (Protected)
- `GET /stats` - Get user statistics (Protected)

## Database Models

### User Model
- name, email, password, college, institutionType, role, registeredEvents

### Event Model
- title, description, type, college, institutionType, date, endDate, venue, organizer, contact, registrationLink, image, highlights, schedule, status, createdBy, registeredUsers

## Authentication

API uses JWT (JSON Web Tokens) for authentication. Include token in request headers:
```
Authorization: Bearer <your_token>
```

## Error Handling

API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## License

ISC