## Install

`bun add @evan/concurrency`

`npm install @evan/concurrency`

## Limiter
controlled concurrent execution of asynchronous tasks.

```js
import { Limiter } from '@evan/concurrency';

const queue = Limiter(5);

queue.add(() => new Promise(...));
queue.add(() => new Promise(...));

// wait for all promises to finish
await queue.flush();
```

### API Reference

#### Limiter(n, options)

Creates a new limiter instance.

Parameters:
- `n` (number): size of ring buffer
- `options` (object): optional configuration
	- `limit` (number, default: n): maximum number of (ring + escaped) tasks
	- `timeout` (null | number, default: null): timeout in ms, after timeout task is escaped to free up ring slot
	- `threshold` (number, default: 0.75): threshold ratio for switching to escape strategy for slow/timed-out tasks

#### Methods

##### flush()
Waits for all ring tasks to complete.

##### add(fn)
Adds a task to the ring for execution.
- `fn`: function that returns a promise

*(note: fn must be async and handle its own errors)*

### Tiny version
A simplified ring-buffer only implementation is available. This lightweight version is optimized for size (~120 bytes minified) while maintaining great performance for tasks that don't have huge variance in their completion time.

```js
import { Limiterr } from '@evan/concurrency';

const c = new Limiterr(5);

c(async () => {});
```

### Performance

Limiter(n) uses ring buffer and atomics for efficient task scheduling. The threshold option automatically optimizes performance by switching between different strategies based on load.

```js
clk: ~3.37 GHz
cpu: Apple M2 Pro
runtime: node 23.4.0 (arm64-darwin)

benchmark                   avg (min … max) p75   p99    (min … top 1%)
------------------------------------------- -------------------------------
Limiter(1)                   169.36 µs/iter 166.38 µs █▃                   
                    (155.75 µs … 571.08 µs) 289.17 µs ██▆▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂▁▁
                  5.37 ipc (  2.43% stalls)  99.52% L1 data cache
        592.77k cycles   3.19M instructions  45.58% retired LD/ST (  1.45M)

Limiter(8)                   167.56 µs/iter 164.92 µs █▃                   
                    (154.83 µs … 385.50 µs) 286.46 µs ██▆▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂▂▁
                  5.43 ipc (  3.56% stalls)  99.08% L1 data cache
        584.58k cycles   3.17M instructions  45.63% retired LD/ST (  1.45M)

Limiter(12)                  164.93 µs/iter 162.50 µs █▂                   
                    (152.38 µs … 353.04 µs) 279.67 µs ██▇▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▂▂▁
                  5.51 ipc (  3.54% stalls)  99.09% L1 data cache
        575.28k cycles   3.17M instructions  45.63% retired LD/ST (  1.45M)

p-limit(1)                   430.61 µs/iter 420.13 µs  █▂                  
                    (387.38 µs … 770.88 µs) 602.21 µs ▃██▄▂▁▁▁▁▁▁▁▁▁▃▃▂▁▁▁▁
                  4.83 ipc (  4.20% stalls)  97.39% L1 data cache
          1.49M cycles   7.21M instructions  45.45% retired LD/ST (  3.28M)

p-limit(8)                   417.55 µs/iter 405.21 µs  █▃                  
                    (379.13 µs … 713.92 µs) 563.21 µs ███▅▂▁▁▁▁▁▁▁▁▁▁▁▂▄▃▂▁
                  4.95 ipc (  4.58% stalls)  97.24% L1 data cache
          1.45M cycles   7.18M instructions  45.47% retired LD/ST (  3.27M)

p-limit(12)                  422.99 µs/iter 403.50 µs  █                   
                    (377.42 µs … 722.46 µs) 611.46 µs ██▇▃▁▁▁▁▁▁▁▁▁▁▁▁▂▃▂▂▁
                  4.98 ipc (  4.57% stalls)  97.26% L1 data cache
          1.44M cycles   7.15M instructions  45.31% retired LD/ST (  3.24M)

                             ┌                                            ┐
                             ┌┬           ╷
                 Limiter($c) ││───────────┤
                             └┴           ╵
                                                   ╷┌───┬                 ╷
                 p-limit($c)                       ├┤   │─────────────────┤
                                                   ╵└───┴                 ╵
                             └                                            ┘
                             152.38 µs         381.92 µs          611.46 µs

summary
  Limiter($c)
   +2.54…+2.53x faster than p-limit($c)
```

## License

MIT © [evanwashere](https://github.com/evanwashere)