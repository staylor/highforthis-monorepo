import { base64Decode, base64Encode } from 'src/utils/base64';

const PREFIX = 'arrayconnection:';

export function cursorToOffset(cursor: string) {
  return parseInt(base64Decode(cursor).substring(PREFIX.length), 10);
}

export function offsetToCursor(offset: number) {
  return base64Encode(PREFIX + offset);
}
