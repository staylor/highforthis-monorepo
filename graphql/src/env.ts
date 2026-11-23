import { z } from 'zod';

// `pnpm dev` sets NODE_ENV=development, so a fresh clone can run without these secrets.
// Everywhere else (production, tests, tools) they're required.
const development = process.env.NODE_ENV === 'development';
const REQUIRED_OUTSIDE_DEVELOPMENT = [
  'TOKEN_SECRET',
  'GCS_CLIENT_EMAIL',
  'GCS_PRIVATE_KEY',
  'GCS_BUCKET',
  'YOUTUBE_API_KEY',
] as const;

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1),
    TOKEN_SECRET: z.string().min(1).optional(),
    GRAPHQL_PORT: z.coerce.number().int().positive().optional().default(8081),

    // Authentication
    PASSWORD_LOGIN_ENABLED: z
      .enum(['true', 'false'])
      .optional()
      .default('true')
      .transform((value) => value === 'true'),
    WEBAUTHN_ORIGIN: z.url().optional().default('http://localhost:3000'),
    WEBAUTHN_RP_ID: z.string().min(1).optional().default('localhost'),
    WEBAUTHN_RP_NAME: z.string().min(1).optional().default('High For This Admin'),

    // Google Cloud Storage, for uploads
    GCS_CLIENT_EMAIL: z.string().min(1).optional(),
    GCS_PRIVATE_KEY: z.string().min(1).optional(),
    GCS_BUCKET: z.string().min(1).optional(),

    // YouTube, for the job that imports videos
    YOUTUBE_API_KEY: z.string().min(1).optional(),

    // Optional API keys. The geolocation key stays on the server; the browser key is public, in
    // every venue page's map, so restrict it to the Maps Static API and this site's referrers.
    GOOGLE_MAPS_GEOLOCATION_API_KEY: z.string().optional(),
    GOOGLE_MAPS_BROWSER_API_KEY: z.string().optional(),
    TICKETMASTER_API_KEY: z.string().optional(),

    // Apple Music, for album covers and artists' data: a MusicKit key and the team it belongs to
    APPLE_MUSIC_KEY_ID: z.string().optional(),
    APPLE_MUSIC_TEAM_ID: z.string().optional(),
    APPLE_MUSIC_PRIVATE_KEY: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (development) return;
    for (const key of REQUIRED_OUTSIDE_DEVELOPMENT) {
      if (!values[key]) {
        context.addIssue({ code: 'custom', path: [key], message: `${key} is required` });
      }
    }
  })
  .transform((values) => ({
    ...values,
    // Only reachable in development: the check above requires it everywhere else
    TOKEN_SECRET: values.TOKEN_SECRET ?? 'development-token-secret',
  }));

const env = envSchema.parse(process.env);

export default env;
