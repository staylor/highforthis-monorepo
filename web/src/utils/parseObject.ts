function isObject(val: any) {
  return val.constructor === Object;
}

function isNumber(val: any) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

function isBoolean(val: string) {
  return val === 'false' || val === 'true';
}

function isArray(val: any) {
  return Array.isArray(val);
}

function parseValue(val: any) {
  if (typeof val == 'undefined' || val == '') {
    return null;
  } else if (isBoolean(val)) {
    return parseBoolean(val);
  } else if (isArray(val)) {
    return parseArray(val);
  } else if (isObject(val)) {
    return parseObject(val);
  } else if (isNumber(val)) {
    return parseNumber(val);
  } else {
    return val;
  }
}

function parseArray(arr: any[]) {
  var result: any[] = [];
  for (var i = 0; i < arr.length; i++) {
    result[i] = parseValue(arr[i]);
  }
  return result;
}

function parseNumber(val: any) {
  return Number(val);
}

function parseBoolean(val: any) {
  return val === 'true';
}

export default function parseObject(obj: Record<string, any>, skipKeys?: string[]) {
  var result: Record<string, any> = {};
  for (const key in obj) {
    if (skipKeys?.includes(key)) {
      result[key] = obj[key];
      continue;
    }

    const val = parseValue(obj[key]);
    if (val !== null) result[key] = val; // ignore null values
  }
  return result;
}
