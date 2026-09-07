import assert from "node:assert/strict";
import test from "node:test";

test("moveFlowIndex cycles in both directions", async () => {
  let flowModule;
  try {
    flowModule = await import("../app/landing/flow-state.mjs");
  } catch {
    assert.fail("flow-state module is missing");
  }

  assert.equal(flowModule.moveFlowIndex(0, 1, 5), 1);
  assert.equal(flowModule.moveFlowIndex(4, 1, 5), 0);
  assert.equal(flowModule.moveFlowIndex(0, -1, 5), 4);
  assert.equal(flowModule.moveFlowIndex(3, -1, 5), 2);
});
