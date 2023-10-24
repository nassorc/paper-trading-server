export function Omit(obj: { [key: string]: any }, keys: string[]) {
  let temp: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!keys.includes(key)) {
      temp[key] = value;
    }
  }
  return temp;
}
