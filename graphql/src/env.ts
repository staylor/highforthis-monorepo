import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  TOKEN_SECRET: z.string().min(1),
  GRAPHQL_PORT: z.coerce.number().int().positive().optional().default(8080),

  // Authentication
  PASSWORD_LOGIN_ENABLED: z
    .enum(['true', 'false'])
    .optional()
    .default('true')
    .transform((value) => value === 'true'),
  WEBAUTHN_ORIGIN: z.url().optional().default('http://localhost:3000'),
  WEBAUTHN_RP_ID: z.string().min(1).optional().default('localhost'),
  WEBAUTHN_RP_NAME: z.string().min(1).optional().default('High For This Admin'),

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
