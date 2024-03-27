import fs from 'fs';
import path from 'path';

import jwt from 'jsonwebtoken';

const kid = process.env.APPLE_MUSIC_KEY_ID as string;
if (!kid) {
  throw new Error('APPLE_MUSIC_KEY_ID must be set');
}
const issuer = process.env.APPLE_MUSIC_TEAM_ID as string;
if (!issuer) {
  throw new Error('APPLE_MUSIC_TEAM_ID must be set');
}
const keyName = process.env.APPLE_MUSIC_AUTH_KEY_PATH as string;
if (!keyName) {
  throw new Error('APPLE_MUSIC_AUTH_KEY must be set to the relative path of the AuthKey.p8 file');
}

const keyFile = path.resolve(process.cwd(), keyName);
const privateKey = fs.readFileSync(keyFile, 'utf8');

const jwtToken = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d',
  issuer,
  header: {
    alg: 'ES256',
    kid,
  },
});

export default jwtToken;
