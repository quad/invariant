# Prior art

As of March 2026, I evaluated the ecosystem of existing libraries. None of them
covered all of these criteria:

- **Statement form** — a void assertion: `invariant(x)` then use `x`. Like
  Kotlin's [`require`][kotlin-require] or Guava's
  [`checkArgument`][guava-checkArgument].
- **Narrows** — the compiler narrows types after the call, via
  [assertion functions][asserts] or a typed return value.
- **Expression form** — returns the value: `const x = nonnull(a?.x)`. Like
  Kotlin's [`requireNotNull`][kotlin-requireNotNull] or Guava's
  [`checkNotNull`][guava-checkNotNull].
- **Typed errors** — throws an `Error` subclass or lets callers specify one, so
  errors are catchable by type.
- **Lazy `message`** — `(() => string)` messages, only evaluated on failure.
  Avoids paying for string formatting on the happy path.
- **Clean stack** — library internals removed from the stack trace. ✅ means
  [`Error.captureStackTrace`][captureStackTrace] (truncates at the caller). ⚠️
  means [`framesToPop`][framesToPop], an informal convention from Facebook's
  [invariant] package respected by some
  [observability tools][sentry-framesToPop] — error handlers skip N frames by
  count.
- **Browser + server** — works in both environments without Node-only APIs. ⚠️
  means it references `process.env.NODE_ENV` (needs a bundler for the browser).
  ❌ means it uses Node-only APIs like `require('util')`.
- **Zero dependencies** — no runtime dependencies.

|                          | Statement form | Narrows | Expression form | Typed errors | Lazy `message` | Clean stack | Browser + server | Zero dependencies |
| ------------------------ | -------------- | ------- | --------------- | ------------ | -------------- | ----------- | ---------------- | ----------------- |
| **@quad/invariant**      | ✅             | ✅      | ✅              | ✅           | ✅             | ✅          | ✅               | ✅                |
| [assert-ts]              | ✅             | ✅      | ✅              | ✅           | ❌             | ❌          | ✅               | ✅                |
| [narrowland]             | ✅             | ✅      | ✅              | ❌           | ✅             | ❌          | ✅               | ✅                |
| [outvariant]             | ✅             | ✅      | ❌              | ✅           | ❌             | ⚠️          | ✅               | ✅                |
| [ok-computer]            | ✅             | ✅      | ❌              | ✅           | ❌             | ❌          | ✅               | ✅                |
| [small-invariant]        | ✅             | ✅      | ❌              | ❌           | ✅             | ❌          | ✅               | ✅                |
| [@dts-stn/invariant]     | ✅             | ✅      | ❌              | ❌           | ✅             | ❌          | ✅               | ✅                |
| [precond]                | ✅             | ❌      | ✅              | ✅           | ❌             | ✅          | ❌               | ✅                |
| [obligations]            | ✅             | ❌      | ❌              | ✅           | ❌             | ✅          | ✅               | ✅                |
| [ts-invariant]           | ✅             | ✅      | ❌              | ✅           | ❌             | ⚠️          | ✅               | ❌                |
| [tiny-invariant]         | ✅             | ✅      | ❌              | ❌           | ✅             | ❌          | ⚠️               | ✅                |
| [nullthrows]             | ❌             | ✅      | ✅              | ❌           | ❌             | ⚠️          | ✅               | ✅                |
| [@dozerg/condition]      | ✅             | ✅      | ❌              | ❌           | ❌             | ❌          | ✅               | ✅                |
| [yaassertion]            | ✅             | ❌      | ❌              | ✅           | ❌             | ❌          | ✅               | ✅                |
| [@infra-blocks/checks]   | ❌             | ✅      | ✅              | ✅           | ✅             | ❌          | ❌               | ❌                |
| [its]                    | ❌             | ❌      | ✅              | ✅           | ❌             | ❌          | ✅               | ✅                |
| [offensive.js]           | ✅             | ❌      | ✅              | ❌           | ❌             | ❌          | ⚠️               | ✅                |
| [simple-invariant]       | ✅             | ❌      | ❌              | ❌           | ❌             | ✅          | ⚠️               | ✅                |
| [guardflow]              | ❌             | ❌      | ✅              | ⚠️           | ❌             | ❌          | ✅               | ✅                |
| [@octetstream/invariant] | ✅             | ❌      | ❌              | ✅           | ❌             | ❌          | ⚠️               | ❌                |
| [ts-tiny-invariant]      | ✅             | ❌      | ❌              | ❌           | ❌             | ❌          | ⚠️               | ✅                |
| [hey-listen]             | ✅             | ❌      | ❌              | ❌           | ❌             | ❌          | ⚠️               | ✅                |
| [invariant]              | ✅             | ❌      | ❌              | ❌           | ❌             | ⚠️          | ⚠️               | ❌                |

## What I chose not to implement

- **Printf formatting** — [outvariant] supports `%s`, `%d`, `%j`, `%o`
  positionals. [precond] and [invariant] support `%s`. This predates template
  literals, which are both more readable (`` `expected ${x}` `` vs
  `"expected %s", x`) and typechecked.

- **Production message stripping** — [tiny-invariant], [invariant],
  [ts-invariant], and [ts-tiny-invariant] replace error messages with a generic
  string when `NODE_ENV === "production"` to reduce bundle size. I prefer
  keeping messages intact — production is when we need them most. If bundle size
  is a concern, [deassert] and [unassert] can strip entire assertion call sites
  at build time.

- **Development-only no-ops** — [hey-listen] makes both `warning()` and
  `invariant()` no-ops in production. If an invariant is worth checking, it
  should be checked in every environment.

- **Soft assertions** — [assert-ts] has `assert.soft()` which returns a type
  guard instead of throwing. [hey-listen] and [warning] provide a `warning()`
  function that logs to `console.warn` on failure. These are useful when a
  violated assumption is recoverable. I treat invariants as non-recoverable — if
  the condition doesn't hold, the program state is wrong and should
  [fail fast][gray85].

- **Console method namespaces** — [ts-invariant] attaches `invariant.warn`,
  `invariant.log`, etc. with verbosity control. I see this as a separate concern
  from assertions — use `console` directly.

- **Configurable error construction** — [outvariant] has
  `invariant.as(CustomError, ...)` to throw a caller-specified error type.
  [assert-ts] has `configureAssert({ errorCreator })`. [@octetstream/invariant]
  accepts an error constructor as the second argument. I prefer a fixed,
  predictable error type — `InvariantError` is always what gets thrown.

- **Broad API surface** — [narrowland], [@dozerg/condition], and
  [@infra-blocks/checks] export many functions across assertion, type guard, and
  value-extraction namespaces. I prefer a minimal API — two functions cover the
  two forms (statement and expression).

Also evaluated but solving different problems: [decorator-contracts],
[@toryt/contracts], and [SpecJS] (Design-by-Contract).

[asserts]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#assertion-functions
[captureStackTrace]: https://v8.dev/docs/stack-trace-api
[tiny-invariant]: https://github.com/alexreardon/tiny-invariant
[small-invariant]: https://github.com/jeremiahblanch/small-invariant
[invariant]: https://github.com/zertosh/invariant
[ts-invariant]: https://github.com/apollographql/invariant-packages
[outvariant]: https://github.com/open-draft/outvariant
[nullthrows]: https://github.com/zertosh/nullthrows
[narrowland]: https://github.com/marekh19/narrowland
[assert-ts]: https://github.com/fram-x/assert-ts
[@dozerg/condition]: https://github.com/daidodo/condition
[@infra-blocks/checks]: https://github.com/infra-blocks/ts-checks
[simple-invariant]: https://github.com/overlookmotel/simple-invariant
[precond]: https://github.com/MathieuTurcotte/node-precond
[obligations]: https://github.com/codemix/obligations
[ts-tiny-invariant]: https://github.com/iyegoroff/ts-tiny-invariant
[@dts-stn/invariant]: https://github.com/DTS-STN/reusable-components
[@octetstream/invariant]: https://github.com/octet-stream/invariant
[hey-listen]: https://github.com/mattgperry/hey-listen
[warning]: https://github.com/BerkeleyTrue/warning
[its]: https://github.com/turn/its
[yaassertion]: https://github.com/rxaviers/yaassertion
[guardflow]: https://github.com/visaruruqi/guardjs
[ok-computer]: https://github.com/richardscarrott/ok-computer
[offensive.js]: https://github.com/mchalapuk/offensive.js
[decorator-contracts]: https://github.com/final-hill/decorator-contracts
[@toryt/contracts]: https://github.com/Toryt/contracts
[SpecJS]: https://github.com/AlfonsoFilho/specjs
[deassert]: https://github.com/RebeccaStevens/deassert
[unassert]: https://github.com/unassert-js/unassert
[kotlin-require]: https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/require.html
[kotlin-requireNotNull]: https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/requireNotNull.html
[guava-checkArgument]: https://guava.dev/releases/snapshot-jre/api/docs/com/google/common/base/Preconditions.html#checkArgument(boolean,java.lang.Object)
[guava-checkNotNull]: https://guava.dev/releases/snapshot-jre/api/docs/com/google/common/base/Preconditions.html#checkNotNull(T,java.lang.Object)
[framesToPop]: https://github.com/zertosh/invariant/blob/master/invariant.js#L46
[sentry-framesToPop]: https://github.com/getsentry/sentry-javascript/blob/develop/packages/browser/src/eventbuilder.ts
[gray85]: https://www.bitsavers.org/pdf/tandem/technical_reports/TR85-07_Why_Do_Computers_Stop_and_What_Can_Be_Done_About_IT_Jun85.pdf
