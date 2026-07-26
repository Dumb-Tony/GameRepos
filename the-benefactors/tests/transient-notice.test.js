import assert from "node:assert/strict";
import test from "node:test";

import { TransientNotice } from "../src/ui/transient-notice.js";

test("notice expires and reports the visual update", () => {
  let scheduled;
  let expired = 0;
  const notice = new TransientNotice({
    setTimer(callback, delay) {
      scheduled = { callback, delay };
      return 17;
    },
    clearTimer() {},
    onExpire() {
      expired += 1;
    },
  });

  notice.show("New evidence added to the case file.");

  assert.equal(notice.value, "New evidence added to the case file.");
  assert.equal(scheduled.delay, 2400);

  scheduled.callback();

  assert.equal(notice.value, "");
  assert.equal(expired, 1);
});

test("clearing a notice cancels it before dialogue opens", () => {
  const cancelled = [];
  const notice = new TransientNotice({
    setTimer() {
      return 29;
    },
    clearTimer(timerId) {
      cancelled.push(timerId);
    },
  });

  notice.show("New evidence added to the case file.");
  notice.clear();

  assert.equal(notice.value, "");
  assert.deepEqual(cancelled, [29]);
});

test("a newer notice replaces the previous timer", () => {
  const cancelled = [];
  let nextTimer = 40;
  const notice = new TransientNotice({
    setTimer() {
      nextTimer += 1;
      return nextTimer;
    },
    clearTimer(timerId) {
      cancelled.push(timerId);
    },
  });

  notice.show("Evidence connected.");
  notice.show("Deduction complete.");

  assert.equal(notice.value, "Deduction complete.");
  assert.deepEqual(cancelled, [41]);
});
