# AI Resume Knowledge Base

A modern web application for managing and analyzing job descriptions and resumes using AI.

## Features

- Upload and parse resumes
- Extract job descriptions from URLs
- AI-powered analysis and matching
- Clean, modern UI

## Tech Stack

- Frontend: React.js
- Backend: Node.js/Express
- Database: PostgreSQL
- AI Integration: OpenAI

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=your_database_url
PORT=3003
OPENAI_API_KEY=your_openai_api_key
```

## Deployment

The application is deployed using:

- Frontend: Vercel
- Backend: Railway.app
- Database: Railway.app PostgreSQL

## License

MIT
