// Added: 2026-03-30 - Minimal @supabase/supabase-js mock to keep tests deterministic.
type QueryResult<T = unknown> = Promise<{ data: T; error: null }>;

interface QueryBuilder {
  select: () => QueryBuilder;
  order: () => QueryBuilder;
  eq: () => QueryBuilder;
  contains: () => QueryBuilder;
  or: () => QueryBuilder;
  limit: () => QueryBuilder;
  maybeSingle: () => QueryResult<null>;
  then: PromiseLike<{ data: []; error: null }>["then"];
}

function createQueryBuilder(): QueryBuilder {
  const builder: QueryBuilder = {
    select: () => builder,
    order: () => builder,
    eq: () => builder,
    contains: () => builder,
    or: () => builder,
    limit: () => builder,
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (onFulfilled, onRejected) =>
      Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected),
  };
  return builder;
}

export function createClient() {
  return {
    from: () => createQueryBuilder(),
    auth: {
      getUser: async () => ({ data: { user: null } }),
      exchangeCodeForSession: async () => ({ data: { user: null }, error: null }),
    },
    rpc: async () => ({ data: [], error: null }),
  };
}
