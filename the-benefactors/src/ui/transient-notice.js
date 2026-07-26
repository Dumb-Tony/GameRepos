export class TransientNotice {
  constructor({
    onExpire = () => {},
    setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
    clearTimer = (timerId) => globalThis.clearTimeout(timerId),
  } = {}) {
    this.message = "";
    this.timerId = null;
    this.onExpire = onExpire;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
  }

  get value() {
    return this.message;
  }

  show(message, { duration = 2400 } = {}) {
    this.clear();
    this.message = String(message || "");

    if (!this.message || duration <= 0) return;

    this.timerId = this.setTimer(() => {
      this.timerId = null;
      this.message = "";
      this.onExpire();
    }, duration);
  }

  clear() {
    if (this.timerId !== null) {
      this.clearTimer(this.timerId);
      this.timerId = null;
    }
    this.message = "";
  }
}
