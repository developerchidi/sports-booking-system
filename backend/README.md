# Sports Booking System Backend

This is the backend service for the Sports Booking System, built with Node.js, Express.js, and MongoDB.

## Features

- User authentication and authorization
- Court management
- Booking system
- Review and rating system
- Redis caching
- Error tracking with Sentry
- Logging with Winston

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sports-booking-system.git
cd sports-booking-system/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:
```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sports-booking

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Sentry Configuration
SENTRY_DSN=your_sentry_dsn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change user password

### Courts

- `POST /api/courts` - Create a new court (Owner only)
- `GET /api/courts` - Get all courts
- `GET /api/courts/search` - Search courts by location
- `GET /api/courts/:id` - Get court by ID
- `PUT /api/courts/:id` - Update court (Owner only)
- `DELETE /api/courts/:id` - Delete court (Owner only)

### Bookings

- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Reviews

- `POST /api/reviews` - Create a new review
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Testing

Run tests:
```bash
npm test
```

## Error Handling

The API uses a centralized error handling mechanism. All errors are logged using Winston and sent to Sentry in production.

## Caching

Redis is used for caching frequently accessed data, such as court details and user profiles.

## Security

- Helmet for security headers
- CORS enabled
- Rate limiting
- JWT authentication
- Password hashing with bcrypt

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 