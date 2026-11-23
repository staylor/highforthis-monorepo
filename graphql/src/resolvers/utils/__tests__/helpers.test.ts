import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseInput } from '../helpers';

const showSchema = z.object({
  artists: z.array(z.string()),
  date: z.number(),
  title: z.string().min(1).nullish(),
});

describe('parseInput', () => {
  it('answers the input as its schema reads it, without fields the schema leaves out', () => {
    const input = { artists: ['Phish'], date: 1, title: null, unknown: true };

    expect(parseInput(showSchema, input)).toEqual({ artists: ['Phish'], date: 1, title: null });
  });

  it("says what's wrong with each field, as the request's mistake", () => {
    let error: unknown;
    try {
      parseInput(showSchema, { artists: ['Phish', 5], title: '' });
    } catch (thrown) {
      error = thrown;
    }

    expect(error).toBeInstanceOf(GraphQLError);
    expect(error).toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    expect((error as GraphQLError).message).toMatch(
      /^Invalid input \(artists\.1: .+; date: .+; title: .+\)$/
    );
  });
});
