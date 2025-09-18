export function deepSearch(value, predicate, results = [], visited = new WeakSet()) {
  if (!value || typeof value !== 'object') return results;
  if (visited.has(value)) return results;
  visited.add(value);

  if (predicate(value)) {
    results.push(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      deepSearch(item, predicate, results, visited);
    }
  } else {
    for (const key of Object.keys(value)) {
      deepSearch(value[key], predicate, results, visited);
    }
  }

  return results;
}

export function uniqueBy(array, keyFn) {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function truncate(value, limit = 6000) {
  if (!value) return null;
  return value.length > limit ? `${value.slice(0, limit)}…` : value;
}
