const DOMAIN = process.env.APP_HOST || 'febe.kbs';
const DEFAULT_REGION = 'us-east-2';

function randomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Sanitize prefix (app name → DNS-safe)
function sanitizePrefix(appName: string): string {
  return appName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace spaces & invalid chars
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}

// Validate full domain against RFC 1035 / 1123 rules
function isValidDomain(domain: string): boolean {
  const regex = /^(?=.{1,253}$)(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,}$/;
  return regex.test(domain);
}

// Sanitize and adjust domain if invalid
function sanitizeDomain(
  appName: string,
  domain: string,
  region: string
): string {
  if (isValidDomain(domain)) {
    return domain;
  }

  // Adjust appName by truncating or replacing
  let prefix = sanitizePrefix(appName);
  if (prefix.length > 30) {
    prefix = prefix.slice(0, 30); // cap prefix length
  }
  if (!prefix) {
    prefix = 'app'; // fallback
  }

  // Rebuild domain with shorter/valid prefix
  const random1 = randomString(6);
  const random2 = randomString(6);

  let adjusted = `${prefix}-${random1}.${random2}.${region}.${DOMAIN}`;

  // If still invalid, fallback to safe form
  if (!isValidDomain(adjusted)) {
    adjusted = `app-${randomString(6)}.${randomString(6)}.${region}.${DOMAIN}`;
  }

  return adjusted;
}

/**
 * Generate a unique domain like:
 *   local-sf7kin.5sc6y6.usa-e2.example.com
 */
export function createFQDN(
  appName: string,
  region: string
): string {
  const prefix = sanitizePrefix(appName) || 'app';
  const random1 = randomString(6);
  const random2 = randomString(6);
  const validRegion = sanitizePrefix(region || DEFAULT_REGION);

  const subdomain = `${prefix}-${random1}.${random2}.${validRegion}.${DOMAIN}`;

  return sanitizeDomain(appName, subdomain, validRegion);
}
