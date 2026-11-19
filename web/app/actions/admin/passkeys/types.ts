// What GraphQL's /auth/passkeys answers with, from the admin app's types/passkeys.ts

export interface PasskeyRecord {
  id: string;
  name: string | null;
  backedUp: boolean;
  deviceType: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface PasskeyListResponse {
  passkeys: PasskeyRecord[];
}
