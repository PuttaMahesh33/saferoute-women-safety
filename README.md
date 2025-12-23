# SafeRoute - AI-Powered Safety Navigation

SafeRoute is an innovative safety navigation application that uses AI-powered crime prediction to help users find the safest routes to their destinations. With real-time safety scores, panic button for emergencies, live tracking, and community ratings, SafeRoute prioritizes user safety above all else.

## Features

- **Smart Route Finding**: Get multiple route options with safety scores based on real-time data and AI predictions
- **AI Crime Prediction**: Machine learning analyzes historical crime data, time, and location to predict risk levels
- **Panic Button**: One-tap emergency alert sends your live location to contacts and authorities instantly
- **Live Tracking**: Share your real-time location with trusted contacts during your journey
- **Community Ratings**: User-submitted safety ratings help improve route recommendations for everyone
- **Safety Factors**: Analyzes street lighting, traffic density, time of day, and user ratings
- **Emergency Contacts**: Manage and quickly alert trusted contacts in case of emergency
- **Admin Dashboard**: Administrative tools for managing the platform

## Tech Stack

This project is built with:

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: shadcn-ui, Tailwind CSS
- **Backend/Database**: Supabase
- **Maps**: Google Maps API
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
```

2. Navigate to the project directory:
```sh
cd safepath-ai
```

3. Install dependencies:
```sh
npm install
```

4. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:5173` (or similar port).

### Building for Production

```sh
npm run build
```

### Linting

```sh
npm run lint
```

## Deployment

SafeRoute can be deployed to various platforms including Vercel, Netlify, or any static hosting service. The built files will be in the `dist` directory after running `npm run build`.

If using Lovable for development, you can deploy directly through their platform by clicking Share -> Publish.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.
