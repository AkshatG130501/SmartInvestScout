# SmartInvestScout Backend

A modern TypeScript-based backend for the SmartInvestScout application.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration values.

## Development

Start the development server:

```bash
npm run dev
```

The server will start on http://localhost:3000 (or the port specified in your .env file).

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── __tests__/        # Test files
├── middleware/       # Express middleware
├── routes/          # API routes
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

## API Documentation

### Health Check

- `GET /api/health` - Check API health status

### Investments

- `GET /api/investments` - Get all investments
- `GET /api/investments/:id` - Get investment by ID
- `POST /api/investments` - Create new investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment

## Testing

Run tests with:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

ISC
