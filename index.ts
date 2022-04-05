export type Options = {
  breadth: number;
  depth: number;
};

const toString = Object.prototype.toString;

/**
 * format value to human readable
 *
 * @param value - target value
 * @param options - options
 * @returns text
 */
export function format(
  value: unknown,
  options: Options = { breadth: 5, depth: 3 }
): string {
  if (Object.is(value, -0)) {
    return '-0';
  }

  // NOTE: TypeScript is can't type inference to `switch (typeof value) {}`

  if (typeof value === 'string') {
    return value.includes('"') ? `'${value}'` : `"${value}"`;
  }
  if (typeof value === 'bigint') {
    return `${value}n`;
  }
  if (typeof value === 'function') {
    return `function ${value.name}()`;
  }
  if (value !== null && typeof value === 'object') {
    const name = (toString.call(value) as ReturnType<typeof toString>).slice(
      8,
      -1
    );

    switch (name) {
      case 'Date':
        return `Date ${(value as Date).toISOString()}`;
      case 'RegExp':
        return `/${(value as RegExp).source}/${(value as RegExp).flags}`;
      default:
    }

    const { breadth, depth } = options;

    const keys = Object.keys(value);
    const slicedKeys = keys.slice(0, breadth);

    const printValues = [];

    const isArrayType =
      Array.isArray(value) ||
      /^(?:Int8Array|Int16Array|Int32Array|Uint8Array|Uint16Array|Uint32Array|Uint8ClampedArray|Float32Array|Float64Array|BigInt64Array|BigUint64Array)$/.test(
        name
      );

    for (let i = 0, len = slicedKeys.length; i < len; i += 1) {
      const k = slicedKeys[i];
      const v =
        depth > 0
          ? format(value[slicedKeys[i]], { ...options, depth: depth - 1 })
          : '*snip*';

      printValues.push(isArrayType ? `${v}` : `${k}: ${v}`);
    }

    const l = isArrayType ? '[' : '{';
    const r = isArrayType ? ']' : '}';

    const tail = keys.length > slicedKeys.length ? ', ...' : '';

    return `${name} ${l}${printValues.join(', ')}${tail}${r}`;
  }

  return String(value);
}
