export function Limiter(n: number, options?: { limit?: number, timeout?: number, threshold?: number }): {
  add(): Promise<any>,
  flush(): Promise<Array<any>>,
};