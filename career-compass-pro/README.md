# Career Compass Pro

Career Compass Pro is a React-based placement readiness platform that helps students analyze resumes, discover skill gaps, match with relevant jobs, track applications, and monitor placement readiness from one dashboard.

## Features

- Resume upload and parsing for PDF/DOCX resume files
- Resume analysis with score, skill extraction, and improvement suggestions
- Smart job matching through JSearch/RapidAPI
- Application tracker for saved job applications and statuses
- Placement readiness dashboard using resume, application, and ranking data
- Resume ranking workflow for comparing resumes against role requirements
- Authentication screens for login, registration, and user profile management

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui and Radix UI
- React Router
- TanStack Query
- Vitest

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A backend API running locally if you want authentication, resumes, rankings, and application tracking to work
- Optional: RapidAPI JSearch key for live job search results

### Installation

```sh
npm install
```

### Environment Variables

Create a `.env` file in the project root when you need to override runtime configuration:

```env
VITE_API_URL=http://localhost:5000
VITE_RAPIDAPI_KEY=your_rapidapi_jsearch_key
```

Notes:

- In development, Vite proxies `/api/*` requests to `http://127.0.0.1:5000`.
- For production builds, set `VITE_API_URL` to the deployed backend URL.
- `VITE_RAPIDAPI_KEY` is used by the job search integration.

### Run Locally

```sh
npm run dev
```

The Vite dev server is configured to run on:

```txt
http://localhost:8080
```

## Available Scripts

```sh
npm run dev        # Start the local development server
npm run build      # Create a production build
npm run build:dev  # Create a development-mode build
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
npm run test       # Run Vitest once
npm run test:watch # Run Vitest in watch mode
```

## Project Structure

```txt
src/
  assets/        Static assets used by the UI
  components/    Shared layout and UI components
  contexts/      Auth and resume analysis state providers
  hooks/         Reusable React hooks
  lib/           API helpers, resume analysis, job search, and scoring logic
  pages/         Route-level screens
  test/          Vitest setup and example tests
```

## Main Routes

- `/` - Landing page
- `/login` - Login
- `/register` - Register
- `/dashboard` - User dashboard
- `/resume-upload` - Resume upload flow
- `/resume-analysis` - Resume analysis results
- `/job-matching` - Job search and matching
- `/application-tracker` - Application tracking
- `/placement-readiness` - Placement readiness metrics
- `/resume-ranking` - Resume ranking
- `/profile` - User profile

## Backend Expectations

The frontend calls the backend through `/api/*` endpoints, including:

- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/profile`
- `/api/resumes`
- `/api/rankings`
- `/api/applications`

Authenticated requests send the token through the `x-auth-token` header.

## Build

```sh
npm run build
```

The production output is generated in `dist/`.
