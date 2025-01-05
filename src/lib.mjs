export function Limiterr(n) {
  let o = 0;
  const ring = new Array(n).fill((async _ => _)());

  return $fn => {
    const offset = o = ++o % ring.length;
    ring[offset] = ring[offset].then($fn);
  };
}

export function Limiter(n, { limit = n, timeout = null, threshold = 3 / 4 } = {}) {
  let o = 0;
  let tasks = 0;
  const token = {};
  const unchecked = (limit * threshold) | 0;
  const ring = new Array(n).fill(Promise.resolve());
  const i32 = new Int32Array(new SharedArrayBuffer(4));

  return {
    flush() {
      return Promise.all(ring);
    },

    add($fn) {
      const offset = o = ++o % ring.length;

      ring[offset] = ring[offset].then(
        tasks < unchecked
          ? () => (tasks += 1, $fn().then(() => Atomics.notify(i32, 0, limit - --tasks)))

          : async () => {
            if (limit === tasks) await Atomics.waitAsync(i32, 0, 0).value;

            tasks += 1;
            const $task = $fn();

            if (!timeout) {
              await $task;
              Atomics.notify(i32, 0, limit - --tasks);
            }

            else {
              let esc;
              const $escape = new Promise(r => esc = r);
              const $timeout = setTimeout(esc, timeout, token);
              if (token === await Promise.race([$task, $escape]))
                $task.then(() => Atomics.notify(i32, 0, limit - --tasks));
                else (clearTimeout($timeout), Atomics.notify(i32, 0, limit - --tasks));
            }
          }
      );
    },
  };
}