export const flatten = <T>(k: T[], j: T | T[]): T[] =>
  k.concat(Array.isArray(j) ? j.reduce(flatten, [] as T[]) : j);
