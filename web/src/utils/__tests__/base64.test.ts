import { base64Encode, base64Decode } from '@/utils/base64';

describe('base64', () => {
  test('serialization', () => {
    const value = 'lshjgjh34t0934t(*^&*^*^*^*&^KHJHHKJ)';

    const encoded = base64Encode(value);

    expect(encoded).toMatchSnapshot();

    const decoded = base64Decode(encoded);

    expect(decoded).toEqual(value);
  });

  test('unicode', () => {
    const value = 'kj🎷hkj🚀whe80980🙏98235😴#$%^&*()🚂';

    const encoded = base64Encode(value);

    expect(encoded).toMatchSnapshot();

    const decoded = base64Decode(encoded);

    expect(decoded).toEqual(value);
  });
});
