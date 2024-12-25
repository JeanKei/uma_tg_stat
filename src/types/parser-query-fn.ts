export type ParserQueryFn = <T = unknown>(
	cb: (...args: unknown[]) => T,
	...args: unknown[]
) => Promise<T>;
