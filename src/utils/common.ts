type VersionType = 'major' | 'minor' | 'patch' | 'snapshot';

export function base64Encode(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64');
}

export function base64Decode(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf8");
}

function excludeProps<T extends object, K extends keyof T>(
  obj: T,
  propsToExclude: K[] = []
): Omit<T, K> {
  const result = { ...obj };
  for (const key of propsToExclude) {
    delete result[key];
  }
  return result;
}

export function areJsonObjectsEqual(
  obj1: any,
  obj2: any,
  propsToExclude: string[] = []
): boolean {
  if (obj1 === obj2) return true;

  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object'
  ) {
    return false;
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    return false;
  }

  // Exclude props if both are objects and exclusion list is provided
  if (!Array.isArray(obj1) && !Array.isArray(obj2)) {
    obj1 = excludeProps(obj1, propsToExclude);
    obj2 = excludeProps(obj2, propsToExclude);
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  const keys2Set = new Set(keys2);
  for (const key of keys1) {
    if (!keys2Set.has(key)) return false;
    if (!areJsonObjectsEqual(obj1[key], obj2[key], [])) return false; // Nested call with no exclusions
  }

  return true;
}

export function incrementVersion(version: string, type: VersionType): string {
  const SNAPSHOT_REGEX = /(^v?\d+\.\d+\.\d+)(-snapshot\.(\d+))?$/;
  const match = version.match(SNAPSHOT_REGEX);

  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }

  let [majorStr, minorStr, patchStr] = version.split(/[-.]/).filter(s => !isNaN(Number(s)) && s !== '');
  
  if (majorStr.startsWith('v')) {
    majorStr = majorStr.substring(1);
  }

  let [major, minor, patch] = [majorStr, minorStr, patchStr].map(Number);
  let snapshotNum: number | undefined = undefined;

  // Check if there's a snapshot part
  const snapshotMatch = version.match(/-snapshot\.(\d+)$/);
  if (snapshotMatch) {
    snapshotNum = Number(snapshotMatch[1]);
  }

  if ([major, minor, patch].some(Number.isNaN)) {
    throw new Error(`Invalid version format: ${version}`);
  }

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'snapshot':
      if (snapshotNum !== undefined) {
        return `${major}.${minor}.${patch}-snapshot.${snapshotNum + 1}`;
      }
      return `${major}.${minor}.${patch}-snapshot.1`;
    default:
      throw new Error(`Unknown increment type: ${type}`);
  }
}

export function escapeJson(json: any): string {
  try {
    if (typeof json !== 'object')
      throw new Error('Invalid input: JSON object expected');

    return JSON.stringify(json).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  } catch (error) {
    console.error('Error escaping JSON:', error);
    return ''; // Return empty string or handle appropriately
  }
}

export function unescapeJson(escapedJson: unknown): any {
  try {
    // Already a parsed object, return as-is
    if (typeof escapedJson === 'object' && escapedJson !== null) {
      return escapedJson;
    }

    if (typeof escapedJson !== 'string' || !escapedJson) return null;

    // Try direct parse first (data stored as plain JSON string)
    try {
      return JSON.parse(escapedJson);
    } catch {
      // Fall through to unescape and retry
    }

    // Reverse the escape process and retry
    const jsonString = escapedJson.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error unescaping JSON:', error);
    return null;
  }
}