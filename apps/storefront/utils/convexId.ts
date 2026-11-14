/**
 * Convex document ids are 32 lowercase alphanumeric characters. Passing anything else
 * (e.g. a mistyped URL segment) to a query makes Convex throw during render, so route
 * params must be checked before they are used as ids.
 */
export const isConvexId = (value: string | undefined): value is string =>
  !!value && /^[a-z0-9]{32}$/.test(value);
