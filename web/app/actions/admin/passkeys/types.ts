// What GraphQL's /auth/passkeys answers with

interface PasskeyRecord {
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
