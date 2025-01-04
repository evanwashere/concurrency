export function Limiter(n, { limit = 10, timeout = null, threshold = 3 / 4 } = {}) {
  let o = 0;
  let tasks = 0;
  const token = {};
  const unchecked = (limit * threshold) | 0;
  const ring = new Array(n).fill(Promise.resolve());
  const i32 = new Int32Array(new SharedArrayBuffer(4));

  return {
    flush() {
      return Promise.allSettled(ring);
    },

    add($fn) {
      const offset = o = ++o % ring.length;
      ring[offset] = ring[offset].then(
        tasks < unchecked
          ? () => (++tasks, $fn().then(() => Atomics.notify(i32, 0, limit - --tasks)))
          : async () => {
            if (limit === tasks) await Atomics.waitAsync(i32, 0, 0).value;

            ++tasks;
            const $task = $fn();

            if (!timeout) {
              await $task;
              Atomics.notify(i32, 0, limit - --tasks);
            } else {
              let esc;
              const $escape = new Promise(r => (esc = r));
              const $timeout = setTimeout(esc, timeout, token);
              if (token === await Promise.race([$task, $escape])) $task.then(() => (Atomics.notify(i32, 0, limit - --tasks)));
              else (
                clearTimeout($timeout), 
                Atomics.notify(i32, 0, limit - --tasks)
              );
            }
          }
      );
    },
  };
}
