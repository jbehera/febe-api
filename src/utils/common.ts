export function base64Encode(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64');
}

export function base64Decode(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf8");
}

