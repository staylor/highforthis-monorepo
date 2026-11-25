import type { ApolloServerOptions, ApolloServerPlugin } from '@apollo/server';
import { unwrapResolverError } from '@apollo/server/errors';
import {
  GraphQLError,
  Kind,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type ValueNode,
  valueFromASTUntyped,
} from 'graphql';
import { DataTableError } from 'remix/data-table';

import type { createLogger } from '@highforthis/shared/logger';

import type { AppContext } from './models';

type Logger = ReturnType<typeof createLogger>;

// Anyone can query, so an operation's size is capped. The site's and the app's largest
// operations have 4 root fields, 79 fields, 3 paged fields and a depth of 9; the shows list asks
// for 1000 at a time.
export const QUERY_LIMITS = {
  pageSize: 1000,
  rootFields: 10,
  pagedFields: 10,
  fields: 500,
  depth: 15,
};

class TooLarge extends Error {}

interface Measure {
  fields: number;
  paged: number;
}

/** An operation's variables by name, as it will run with them */
type Variables = ReadonlyMap<string, unknown>;

function pageSize(value: ValueNode, variables: Variables): unknown {
  if (value.kind === Kind.INT) {
    return Number(value.value);
  }
  if (value.kind === Kind.VARIABLE) {
    return variables.get(value.name.value);
  }
  return undefined;
}

function walk(
  selectionSet: SelectionSetNode,
  depth: number,
  fragments: Map<string, FragmentDefinitionNode>,
  variables: Variables,
  measure: Measure
) {
  if (depth > QUERY_LIMITS.depth) {
    throw new TooLarge(`Queries can nest at most ${QUERY_LIMITS.depth} fields deep`);
  }
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      // Counted as fragments are spread, so spreading one fragment many times counts each time
      if (++measure.fields > QUERY_LIMITS.fields) {
        throw new TooLarge(`Queries can ask for at most ${QUERY_LIMITS.fields} fields`);
      }
      for (const argument of selection.arguments ?? []) {
        if (argument.name.value !== 'first' && argument.name.value !== 'last') {
          continue;
        }
        const size = pageSize(argument.value, variables);
        if (typeof size === 'number' && (size < 0 || size > QUERY_LIMITS.pageSize)) {
          throw new TooLarge(
            `\`${argument.name.value}\` must be between 0 and ${QUERY_LIMITS.pageSize}`
          );
        }
        if (++measure.paged > QUERY_LIMITS.pagedFields) {
          throw new TooLarge(`Queries can page through at most ${QUERY_LIMITS.pagedFields} lists`);
        }
      }
      if (selection.selectionSet) {
        walk(selection.selectionSet, depth + 1, fragments, variables, measure);
      }
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      walk(selection.selectionSet, depth, fragments, variables, measure);
    } else {
      const fragment = fragments.get(selection.name.value);
      if (fragment) {
        walk(fragment.selectionSet, depth, fragments, variables, measure);
      }
    }
  }
}

/** How many fields an operation asks for at its root, counting those in fragments. */
function rootFields(
  selectionSet: SelectionSetNode,
  fragments: Map<string, FragmentDefinitionNode>
): number {
  let count = 0;
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      count += 1;
    } else {
      const set =
        selection.kind === Kind.INLINE_FRAGMENT
          ? selection.selectionSet
          : fragments.get(selection.name.value)?.selectionSet;
      count += set ? rootFields(set, fragments) : 0;
    }
  }
  return count;
}

/**
 * The operation's variables as it will run with them: those the request sent, and the defaults
 * the operation gives the rest. A default like `$first: Int = 100000` is as much a page size as a
 * variable sent with that value. They're kept in a Map because a variable can be named for
 * something every object has, such as `$toString`, which read from an object would stand in for
 * a value that wasn't sent and hide its default.
 */
function withDefaults(
  operation: OperationDefinitionNode,
  sent?: Record<string, unknown> | null
): Variables {
  const variables = new Map(Object.entries(sent ?? {}));
  for (const { variable, defaultValue } of operation.variableDefinitions ?? []) {
    const name = variable.name.value;
    if (variables.get(name) === undefined && defaultValue) {
      variables.set(name, valueFromASTUntyped(defaultValue));
    }
  }
  return variables;
}

/** Why an operation is too large to run, or null when it's within the limits. */
function tooLarge(
  operation: OperationDefinitionNode,
  fragments: Map<string, FragmentDefinitionNode>,
  variables: Variables
): string | null {
  try {
    if (rootFields(operation.selectionSet, fragments) > QUERY_LIMITS.rootFields) {
      return `Queries can ask for at most ${QUERY_LIMITS.rootFields} root fields`;
    }
    walk(operation.selectionSet, 1, fragments, variables, { fields: 0, paged: 0 });
    return null;
  } catch (error) {
    if (error instanceof TooLarge) {
      return error.message;
    }
    throw error;
  }
}

/** Turns away operations over `QUERY_LIMITS` with a 400, before they run. */
export function queryLimits(): ApolloServerPlugin<AppContext> {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ document, operation, request }) {
          // Apollo has already turned away a document without the operation asked for
          if (!operation) {
            return;
          }
          const fragments = new Map<string, FragmentDefinitionNode>();
          for (const definition of document.definitions) {
            if (definition.kind === Kind.FRAGMENT_DEFINITION) {
              fragments.set(definition.name.value, definition);
            }
          }
          const reason = tooLarge(operation, fragments, withDefaults(operation, request.variables));
          if (reason) {
            throw new GraphQLError(reason, {
              extensions: { code: 'QUERY_TOO_LARGE', http: { status: 400 } },
            });
          }
        },
      };
    },
  };
}

/**
 * Keeps server internals out of answers: stack traces only in development, and database errors,
 * whose messages and causes quote the query, the tables and the source, logged and answered with a
 * plain message.
 */
export function errorOptions(
  logger: Logger
): Pick<ApolloServerOptions<AppContext>, 'formatError' | 'includeStacktraceInErrorResponses'> {
  return {
    includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development',
    formatError(formatted, error) {
      const original = unwrapResolverError(error);
      if (original instanceof DataTableError) {
        logger.error({ err: original, path: formatted.path }, 'Database error in a resolver');
        return {
          message: 'Internal server error',
          locations: formatted.locations,
          path: formatted.path,
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        };
      }
      return formatted;
    },
  };
}
