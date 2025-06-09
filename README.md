# Sports Booking System

A comprehensive sports court management and booking system for web and mobile platforms.

## Description

The Sports Booking System is a full-stack application that enables users to search, book, and manage sports court reservations. The system supports multiple sports types and provides features for both court owners and users.

## Prerequisites

- Node.js v16+
- MongoDB
- Redis
- Git

## Project Structure

```
/sports-booking-system
  ├── /backend         # Express.js backend
  ├── /frontend        # React.js web application
  ├── /mobile          # React Native mobile app
  ├── README.md
  └── .gitignore
```

## Getting Started

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Mobile Setup
```bash
cd mobile
npm install
npm run android  # for Android
npm run ios      # for iOS
```

## Features

- User authentication and authorization
- Court search and filtering
- Real-time booking system
- Payment integration (VNPay, Momo)
- Review and rating system
- Admin dashboard
- Owner management interface

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Redis
- **Frontend**: React.js, Redux Toolkit
- **Mobile**: React Native
- **Authentication**: JWT
- **Payment**: VNPay, Momo
- **Monitoring**: Sentry
- **Caching**: Redis

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 