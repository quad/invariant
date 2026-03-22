import { assertEquals, assertIsError, assertThrows } from "@std/assert";
import { invariant, InvariantError, nonnull } from "./invariant.ts";

const truthyValues = [1n, true, () => {}, 1, {}, "foo", Symbol()];
const falsyNonNullValues = [0n, false, 0, Number.NaN, ""];
const nonNullValues = [...truthyValues, ...falsyNonNullValues];
const nullishValues = [null, undefined];
const falsyValues = [...falsyNonNullValues, ...nullishValues];

Deno.test("nonnull", async (t) => {
  await t.step("returns the value when value is not nullish", () => {
    for (const value of nonNullValues) {
      assertEquals(nonnull(value), value);
    }
  });

  await t.step("throws InvariantFailure when value is nullish", () => {
    for (const value of nullishValues) {
      assertThrows(() => nonnull(value));
    }
  });

  await t.step("narrows the type", () => {
    const value = "" as string | null | undefined;
    const _: string = nonnull(value); // compiler error if value weren't narrowed
  });

  await t.step("throws with empty message when no message is provided", () => {
    const e = assertThrows(() => nonnull(null), Error);
    assertEquals(e.message, "");
  });

  await t.step("throws with a custom message", () => {
    const e1 = assertThrows(() => nonnull(null, "message"), Error);
    assertEquals(e1.message, "message");
    const e2 = assertThrows(() => nonnull(null, () => "message"), Error);
    assertEquals(e2.message, "message");
  });

  await t.step("throws with the correct type", () => {
    assertThrows(() => nonnull(null), Error);
    assertIsError(assertThrows(() => nonnull(null)), InvariantError);
  });

  await t.step("throws with .name set to 'InvariantError'", () => {
    const e = assertThrows(() => nonnull(null), Error);
    assertEquals(e.name, "InvariantError");
  });

  await t.step("does not evaluate lazy message on success", () => {
    let called = false;
    nonnull("ok", () => {
      called = true;
      return "msg";
    });
    assertEquals(called, false);
  });

  await t.step("produces a stack trace pointing to the call site", () => {
    const e = assertThrows(() => nonnull(null, "msg"), Error);
    const topFrame = e.stack!.split("\n").find((l: string) =>
      l.trimStart().startsWith("at ")
    );
    assertEquals(topFrame?.includes("invariant.test.ts") ?? false, true);
  });
});

Deno.test("invariant", async (t) => {
  await t.step("does not throw when condition is truthy", () => {
    for (const value of truthyValues) {
      invariant(value);
    }
  });

  await t.step("throws InvariantFailure when condition is falsey", () => {
    for (const value of falsyValues) {
      assertThrows(() => invariant(value));
    }
  });

  await t.step("narrows the type when condition is a typeof type guard", () => {
    const value: unknown = "";
    invariant(typeof value === "string");
    assertEquals(value.localeCompare(value), 0);
  });

  await t.step(
    "narrows the type when condition is an instanceof type guard",
    () => {
      const value: unknown = new Date(0);
      invariant(value instanceof Date);
      assertEquals(value.getTime(), 0);
    },
  );

  await t.step("throws with empty message when no message is provided", () => {
    const e = assertThrows(() => invariant(false), Error);
    assertEquals(e.message, "");
  });

  await t.step("throws with a custom message", () => {
    const e1 = assertThrows(() => invariant(false, "message"), Error);
    assertEquals(e1.message, "message");
    const e2 = assertThrows(() => invariant(false, () => "message"), Error);
    assertEquals(e2.message, "message");
  });

  await t.step("throws with the correct type", () => {
    assertThrows(() => invariant(false), Error);
    assertIsError(assertThrows(() => invariant(false)), InvariantError);
  });

  await t.step("throws with .name set to 'InvariantError'", () => {
    const e = assertThrows(() => invariant(false), Error);
    assertEquals(e.name, "InvariantError");
  });

  await t.step("does not evaluate lazy message on success", () => {
    let called = false;
    invariant(true, () => {
      called = true;
      return "msg";
    });
    assertEquals(called, false);
  });

  await t.step("produces a stack trace pointing to the call site", () => {
    const e = assertThrows(() => invariant(false, "msg"), Error);
    const topFrame = e.stack!.split("\n").find((l: string) =>
      l.trimStart().startsWith("at ")
    );
    assertEquals(topFrame?.includes("invariant.test.ts") ?? false, true);
  });
});
