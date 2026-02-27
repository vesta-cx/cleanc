/** @format */

import { describe, expect, it } from "vitest";
import { BUILT_IN_COMMANDS } from "../src/built-ins.js";

describe("BUILT_IN_COMMANDS", () => {
  it("defines install command with node_modules cleanup", () => {
    expect(BUILT_IN_COMMANDS.install?.include).toEqual(["node_modules"]);
  });

  it("has only string include entries", () => {
    for (const command of Object.values(BUILT_IN_COMMANDS)) {
      for (const dir of command.include) {
        expect(typeof dir).toBe("string");
      }
    }
  });
});
