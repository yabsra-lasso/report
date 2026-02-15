# FixMyRoad - Backend Setup

## Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Update the `.env` file with your MongoDB password:
   - Replace `<db_password>` with your actual MongoDB password

## Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login existing user
- `GET /api/health` - Server health check

## Database

The application uses MongoDB Atlas with the following connection string:
```
mongodb+srv://zameriyo1st:<db_password>@readnest.0praj.mongodb.net/fixmyroad
```

Database name: `fixmyroad`
Collection: `users`

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- Tokens expire after 7 days
- **Important**: Change the JWT_SECRET in production!
