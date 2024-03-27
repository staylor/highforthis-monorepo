// Client notes:
// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
// The "Unicode Problem"

function base64EncodeUnicode(str: string) {
  // Server uses Buffer API
  if (typeof document === 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  // In most browsers, calling btoa() on a Unicode string will cause a Character Out Of Range exception.
  // First we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which can be fed into btoa.
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(`0x${p1}` as any)
    )
  );
}

function base64DecodeUnicode(str: string) {
  // Server uses Buffer API
  if (typeof document === 'undefined') {
    return Buffer.from(str, 'base64').toString();
  }
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );
}

export { base64EncodeUnicode as base64Encode, base64DecodeUnicode as base64Decode };
