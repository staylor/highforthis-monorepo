import { cn } from '#/utils/cn';

describe('cn', () => {
  it('joins class names and skips falsy values', () => {
    const active = false;
    expect(cn('flex', active && 'text-pink', undefined, null, '', 'gap-2')).toBe('flex gap-2');
  });

  it('includes object keys whose value is true', () => {
    expect(cn('block', { hidden: true, 'text-pink': false })).toBe('block hidden');
  });
});
