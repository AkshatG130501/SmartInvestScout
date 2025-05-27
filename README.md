# SmartInvestScout

SmartInvestScout is an intelligent investment assistant platform designed to help users make informed investment decisions through personalized insights, real-time market data, and AI-powered analysis.

![SmartInvestScout](https://example.com/smartinvestscout-logo.png)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview

SmartInvestScout is a comprehensive investment platform that combines real-time market data, AI-powered analysis, and personalized recommendations to help users make better investment decisions. The platform provides a user-friendly interface for exploring market insights, tracking companies, setting up alerts, and getting personalized investment advice through an AI chat assistant.

## Features

### Dashboard

- Real-time market overview with trending topics
- Search functionality with intelligent suggestions
- Quick access to personalized insights and watchlist

### Search & Insights

- Company search with auto-suggestions
- Detailed company insights including market summary, risk factors, and latest news
- "Ask about this" feature to get AI-powered analysis of specific companies

### Ask Scout (AI Chat Assistant)

- Personalized investment advice based on user profiles
- Context-aware conversations about specific companies
- Conversation history with search functionality
- Support for complex investment queries

### Personalization System

- User profile setup with risk appetite, investment goals, watchlist, and holdings
- Tailored responses based on user's financial persona
- Prompt augmentation middleware for enhanced context

### Alerts & Notifications

- Customizable alert preferences for companies and sectors
- Multiple notification channels (app, email, push)
- Frequency settings (hourly, daily, weekly)
- Impact level filtering

### User Profile & Settings

- Comprehensive user profile management
- Security settings
- Notification preferences
- Account management

## Architecture

SmartInvestScout follows a modern web application architecture:

### Frontend

- React-based single-page application
- TypeScript for type safety
- Tailwind CSS for styling
- Context API for state management

### Backend

- Node.js with Express
- TypeScript
- RESTful API design
- Supabase for database and authentication

### Data Flow

1. User interacts with the React frontend
2. Frontend makes API calls to the backend
3. Backend processes requests, interacts with external APIs and database
4. Responses are returned to the frontend for display

## Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account
- Financial data API keys (e.g., Financial Modeling Prep)

### Frontend Setup

```bash
# Navigate to Frontend directory
cd SmartInvestScout/Frontend

# Install dependencies
npm install

# Create .env file with required variables
cp .env.example .env

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to Backend directory
cd SmartInvestScout/Backend

# Install dependencies
npm install

# Create .env file with required variables
cp .env.example .env

# Start development server
npm run dev
```

## Usage

### User Registration and Login

1. Create an account or log in with existing credentials
2. Set up your investment profile with risk appetite, goals, and holdings

### Dashboard Navigation

- Use the search bar to find companies
- Explore trending topics
- View suggested investment ideas
- Access your watchlist

### Using the AI Assistant

- Click "Ask Anything" to start a new conversation
- Type your investment questions
- View personalized responses based on your profile
- Use "Ask about this" on company pages for context-specific questions

### Setting Up Alerts

- Navigate to Alerts section
- Add companies and sectors to track
- Choose notification channels and frequency
- Set minimum impact level for notifications

## Technologies

### Frontend

- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI
- Axios
- React Router

### Backend

- Node.js
- Express
- TypeScript
- Supabase
- OpenAI API
- Financial data APIs
- JWT authentication

### DevOps & Tools

- Vite
- ESLint
- Jest
- Vercel deployment

## Project Structure

### Frontend

```
Frontend/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── contexts/     # React contexts (Auth, Profile)
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities and API clients
│   ├── pages/        # Page components
│   └── types/        # TypeScript type definitions
```

### Backend

```
Backend/
├── src/
│   ├── controllers/  # Request handlers
│   ├── middlewares/  # Express middlewares
│   ├── routes/       # API route definitions
│   ├── services/     # Business logic
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
```

## API Documentation

The SmartInvestScout API provides endpoints for:

- User authentication and profile management
- Company search and insights
- Chat functionality with personalization
- Alert preferences and notifications
- Market data and analysis

For detailed API documentation, refer to the `/docs` directory.

## Key Features Implementation

### Search Suggestions

- Implemented with debounced API calls to Financial Modeling Prep
- Fallback mechanism using local stock data when API is unavailable
- Reusable SearchSuggestions component and custom hook

### Chat Interface

- Modular components in ChatComponents.tsx
- Conversation management with Supabase
- Context-aware responses with personalization
- Chat history with search functionality

### Personalization System

- User profile schema with risk appetite, goals, watchlist, and holdings
- Prompt augmentation middleware for enhanced context
- Profile context caching for performance optimization

---

© 2025 SmartInvestScout. All rights reserved.
