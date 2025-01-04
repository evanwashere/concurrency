import plimit from 'p-limit';
import { Limiter } from '../src/lib.mjs';
import { run, bench, summary, boxplot } from 'mitata';

boxplot(() => {
  summary(() => {
    bench('Limiter($c)', function* (ctx) {
      const c = ctx.get('c');
    
      yield {
        [0]() {
          return Limiter(c);
        },
    
        async bench(limiter) {
          for (let o = 0; o < 1000; o++) {
            limiter.add(() => new Promise(queueMicrotask));
          }
    
          await limiter.flush();
        },
      };
    }).range('c', 1, 12);

    bench('p-limit($c)', function* (ctx) {
      const c = ctx.get('c');

      yield {
        [0]() {
          return plimit(c);
        },

        async bench(limiter) {
          let last;
          for (let o = 0; o < 1000; o++) {
            const p = limiter(() => new Promise(queueMicrotask));
            if (o === 999) last = p;
          }

          await last;
        },
      };
    }).range('c', 1, 12);
  });
});

await run();