export function createCacheKey(key: string, signature: string = "quote") {
  return `${signature}:${key}`;
}
