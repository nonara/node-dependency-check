/* ****************************************************************************************************************** */
// region: Types
/* ****************************************************************************************************************** */

/**
 * Make certain properties partial
 */
export type PartialSome<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>;

// endregion


/* ****************************************************************************************************************** */
// region: Utils
/* ****************************************************************************************************************** */

export function createRegExpFromString(regExpString: string) {
  // Remove the leading and trailing slashes and extract the pattern and flags
  const match = regExpString.match(/^\/(.+)\/(.*)/);
  if (!match) {
    throw new Error('Invalid RegExp string format');
  }

  const [, pattern, flags] = match;
  return new RegExp(pattern, flags);
}

// endregion
