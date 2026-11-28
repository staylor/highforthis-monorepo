import { setTimeout as sleep } from 'node:timers/promises';

import { graphqlFetch } from './graphql.ts';

/**
 * What this build asks GraphQL for that the GraphQL release before it doesn't answer. Every field
 * is skipped, so GraphQL checks that it knows them and runs nothing. A change that has web ask
 * for something new names it here, and web's deploy then waits for the GraphQL release that has
 * it (`await-api.ts`): live before that release, each page that asks would fail.
 */
export const newFields = `{
  __typename
  showTotals @skip(if: true) { firstLocalDate }
  showStats(entity: ARTIST) @skip(if: true) { firstLocalDate lastLocalDate }
}`;

interface Answer {
  data?: unknown;
  errors?: { message: string }[];
}

/** Why GraphQL can't serve this build yet, or null when it can. */
export async function apiGap(): Promise<string | null> {
  try {
    const response = await graphqlFetch('/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: newFields }),
    });
    const answer: Answer | null = await response.json().catch(() => null);
    if (answer?.errors?.length) {
      return answer.errors.map(({ message }) => message).join(' ');
    }
    return response.ok && answer?.data ? null : `GraphQL answered ${response.status}`;
  } catch (error) {
    // GraphQL can't be reached, or took too long. fetch says why in the error's cause: in its
    // message, or only in its code when every address it tried refused the connection.
    const { message, cause } = error as Error & { cause?: NodeJS.ErrnoException };
    const why = cause?.message || cause?.code;
    return why ? `${message}: ${why}` : message;
  }
}

interface Waiting {
  /** How long to keep asking, in milliseconds */
  timeout?: number;
  /** How long to leave between one asking and the next, in milliseconds */
  interval?: number;
  /** Told why, each time GraphQL isn't ready */
  onWait?: (reason: string) => void;
  /** The wait between askings and the clock, which tests replace */
  pause?: (milliseconds: number) => Promise<unknown>;
  now?: () => number;
}

/**
 * Resolves once GraphQL answers what this build asks for, asking again until it does. Rejects
 * with the last reason it didn't, once `timeout` wouldn't leave time to ask again.
 */
export async function apiReady({
  timeout = 4 * 60_000,
  interval = 5_000,
  onWait,
  pause = sleep,
  now = Date.now,
}: Waiting = {}): Promise<void> {
  const deadline = now() + timeout;
  for (;;) {
    const reason = await apiGap();
    if (reason === null) {
      return;
    }
    if (now() + interval > deadline) {
      throw new Error(`GraphQL doesn't answer what this build asks for: ${reason}`);
    }
    onWait?.(reason);
    await pause(interval);
  }
}
