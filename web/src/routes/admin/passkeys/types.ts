import type {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/browser';

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

export interface RegistrationOptionsResponse {
  challengeId: string;
  options: PublicKeyCredentialCreationOptionsJSON;
}

export interface RegistrationVerificationRequest {
  challengeId: string;
  name?: string;
  response: RegistrationResponseJSON;
}
