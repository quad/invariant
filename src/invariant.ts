/** Thrown by {@link invariant} and {@link nonnull}. */
export class InvariantError extends Error {
  /** @internal */
  constructor(
    callerFn: (...args: never) => unknown,
    message?: string | (() => string),
  ) {
    const provided = typeof message === "function" ? message() : message;
    super(provided);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, callerFn);
  }
}

/**
 * Assert `condition` is truthy, narrow via [`asserts condition`](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#assertion-functions).
 * @param condition must be truthy
 * @param message lazy form only evaluates on failure
 * @throws {InvariantError} if the condition is not truthy
 * @example
 * ```typescript
 * const value: string | number = parse(input);
 * invariant(typeof value === "string", "expected a string");
 * value.toUpperCase(); // `value` narrowed to `string`
 * ```
 */
export function invariant(
  condition: unknown,
  message?: string | (() => string),
): asserts condition {
  if (condition) return;
  throw new InvariantError(invariant, message);
}

/**
 * Assert `value` is non-null, narrow and return it.
 * @param value must be non-null
 * @param message lazy form only evaluates on failure
 * @returns `value` narrowed to {@link NonNullable<T>}
 * @throws {InvariantError} if the value is null or undefined
 * @example
 * ```typescript
 * const name: string = nonnull(user?.name, "expected a name");
 * ```
 */
export function nonnull<T>(
  value: T,
  message?: string | (() => string),
): NonNullable<T> {
  if (value !== null && value !== undefined) return value;
  throw new InvariantError(nonnull, message);
}
