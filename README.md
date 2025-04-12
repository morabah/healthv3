This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Health Appointment System

A comprehensive healthcare appointment management system built with Next.js, TypeScript, and Firebase.

## Features

- User authentication (patients and doctors)
- Doctor verification system
- Appointment scheduling and management
- Real-time notifications
- Medical records management
- Admin dashboard

## Tech Stack

- **Frontend**: Next.js (React) with TypeScript
- **Backend**: Firebase Cloud Functions (Node.js/TypeScript)
- **Database**: Cloud Firestore (NoSQL Document Model)
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Cloud Storage
- **UI Styling**: Tailwind CSS
- **UI Component Logic**: Headless UI / Radix UI primitives
- **Icons**: Font Awesome

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

The project uses Jest and React Testing Library for testing, along with Firebase Emulator Suite for backend testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with Firebase emulators
npm run test:emulators
```

### Firebase Emulator Setup

Before running tests with Firebase emulators, make sure you have the Firebase CLI installed:

```bash
npm install -g firebase-tools
```

To start the emulators manually:

```bash
firebase emulators:start --only auth,firestore,functions,storage
```

The Emulator UI will be available at [http://localhost:4000](http://localhost:4000).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
