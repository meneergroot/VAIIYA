# VAIIYA - A Reddit Clone

VAIIYA is a modern Reddit clone built with Next.js, TypeScript, and PostgreSQL. It features communities, user accounts, anonymous posting, and more.

## Features

- User authentication and authorization
- Community creation and management
- Post creation and voting
- Comments and discussions
- Anonymous posting option
- Modern UI with Tailwind CSS

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma (ORM)
- PostgreSQL
- NextAuth.js
- Tailwind CSS
- Headless UI
- React Hook Form
- Zod

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   Then fill in your environment variables in `.env`

4. Set up the database:
   ```bash
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vaiiya"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
