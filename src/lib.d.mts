export function Limiter(n: number, options?: { limit?: number, timeout?: number, threshold?: number }): {
  flush(): Promise<Array<any>>,
  add(fn: () => Promise<any>): void,
};