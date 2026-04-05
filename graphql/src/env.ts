import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  TOKEN_SECRET: z.string().min(1),
  GRAPHQL_PORT: z.coerce.number().int().positive().optional().default(8080),

  // Google Cloud Storage
  GCS_CLIENT_EMAIL: z.string().min(1),
  GCS_PRIVATE_KEY: z.string().min(1),
  GCS_BUCKET: z.string().min(1),

  // YouTube
  YOUTUBE_API_KEY: z.string().min(1),

  // Optional API keys
  GOOGLE_MAPS_GEOLOCATION_API_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

export default env;
