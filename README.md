# @quad/invariant

![JSR Version](https://img.shields.io/jsr/v/%40quad/invariant)

TypeScript assertion functions.

- Statement form (`invariant`) and expression form (`nonnull`)
- Narrows types
- Throws a typed error class (`InvariantError`)
- Supports lazy messages — only evaluated on failure
- Clean stack traces
- Works in browser and on the server
- Zero dependencies

## Examples

### In the browser

```typescript
import { invariant, nonnull } from "@quad/invariant";

const node: Node = getNode();
invariant(node instanceof HTMLElement, "expected an element"); // `node` narrowed to `HTMLElement`
const parent: HTMLElement = nonnull(node.parentElement, "expected a parent");
```

### On the server

```typescript
import { invariant, nonnull } from "@quad/invariant";

const result: Success | Failure = await rpc.call(req);
invariant(result.ok, "rpc failed"); // `result` narrowed to `Success`
const token: string = nonnull(
  result.session?.token,
  "expected a session token",
);
```

## API

**`invariant(condition, message?)`** — assert `condition` is truthy, narrow via
[`asserts condition`][asserts].

```typescript
const value: string | number = parse(input);
invariant(typeof value === "string", "expected a string");
value.toUpperCase(); // `value` narrowed to `string`
```

**`nonnull<T>(value, message?)`** — assert `value` is non-null, narrow and
return it.

```typescript
const name: string = nonnull(user?.name, "expected a name");
```

**`message: string | (() => string)`** — lazy form only evaluates on failure.

```typescript
invariant(condition, () => `expected ${expensive()}`);
```

**`InvariantError`** — an exported `Error` subclass, thrown by both. Stack trace
points at the call site, not the library internals.

```typescript
try {
  invariant(condition);
} catch (e) {
  if (e instanceof InvariantError) reportBug(e);
  throw e;
}
```

## Prior art

See [PRIOR_ART.md](PRIOR_ART.md) for a comparison of 20+ existing libraries and
the design decisions behind this one.

## License

Apache-2.0

[asserts]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#assertion-functions
