export default () => ({
  port: parseInt(process.env.BACKEND_PORT ?? '3001', 10),
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()) ?? [
      'http://localhost:3000',
    ],
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  otel: {
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  },
});
