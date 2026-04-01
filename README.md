# @quad/invariant

[![JSR Version](https://img.shields.io/jsr/v/%40quad/invariant)](https://jsr.io/@quad/invariant)

TypeScript assertion functions.

- Statement form (`invariant`) and expression form (`nonnull`)
- Narrows types
- Throws a typed error class (`InvariantError`)
- Supports lazy messages — only evaluated on failure
- Clean stack traces
- Works in browser and on the server
- Zero dependencies

## Install

```sh
deno add jsr:@quad/invariant
```

For [other runtimes](https://jsr.io/docs/with/node):

```sh
bunx jsr add @quad/invariant   # bun
npx jsr add @quad/invariant    # npm
pnpm add jsr:@quad/invariant   # pnpm
yarn add jsr:@quad/invariant   # yarn
```

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

Copyright 2026 Substrate AI, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[asserts]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#assertion-functions
