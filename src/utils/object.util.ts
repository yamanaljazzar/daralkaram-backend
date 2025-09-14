import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export class ObjectUtil {
  /**
   * Deep clone object using lodash
   * @param obj - Object to clone
   * @returns Cloned object
   */
  static deepClone<T>(obj: T): T {
    return _.cloneDeep(obj);
  }

  /**
   * Deep merge objects using lodash
   * @param target - Target object
   * @param sources - Source objects to merge
   * @returns Merged object
   */
  static deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
    return _.merge(target, ...sources) as T;
  }

  /**
   * Pick specific properties from object using lodash
   * @param obj - Object to pick from
   * @param keys - Keys to pick
   * @returns Object with picked properties
   */
  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    return _.pick(obj, keys);
  }

  /**
   * Omit specific properties from object using lodash
   * @param obj - Object to omit from
   * @param keys - Keys to omit
   * @returns Object without omitted properties
   */
  static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    return _.omit(obj, keys) as Omit<T, K>;
  }

  /**
   * Check if object is empty using lodash
   * @param obj - Object to check
   * @returns True if object is empty
   */
  static isEmpty(obj: any): boolean {
    return _.isEmpty(obj);
  }

  /**
   * Check if object has specific property using lodash
   * @param obj - Object to check
   * @param path - Property path
   * @returns True if property exists
   */
  static has(obj: any, path: string | string[]): boolean {
    return _.has(obj, path);
  }

  /**
   * Get nested property value safely using lodash
   * @param obj - Object to get value from
   * @param path - Property path
   * @param defaultValue - Default value if property doesn't exist
   * @returns Property value or default
   */
  static get<T>(obj: any, path: string | string[], defaultValue?: T): T {
    return _.get(obj, path, defaultValue) as T;
  }

  /**
   * Set nested property value using lodash
   * @param obj - Object to set value in
   * @param path - Property path
   * @param value - Value to set
   * @returns Modified object
   */
  static set<T>(obj: any, path: string | string[], value: any): T {
    return _.set(obj, path, value) as T;
  }

  /**
   * Unset nested property using lodash
   * @param obj - Object to unset property from
   * @param path - Property path
   * @returns True if property was unset
   */
  static unset(obj: any, path: string | string[]): boolean {
    return _.unset(obj, path);
  }

  /**
   * Transform object keys using lodash
   * @param obj - Object to transform
   * @param iteratee - Function to transform keys
   * @returns Object with transformed keys
   */
  static mapKeys<T>(
    obj: Record<string, T>,
    iteratee: (value: T, key: string) => string,
  ): Record<string, T> {
    return _.mapKeys(obj, iteratee);
  }

  /**
   * Transform object values using lodash
   * @param obj - Object to transform
   * @param iteratee - Function to transform values
   * @returns Object with transformed values
   */
  static mapValues<T, U>(
    obj: Record<string, T>,
    iteratee: (value: T, key: string) => U,
  ): Record<string, U> {
    return _.mapValues(obj, iteratee);
  }

  /**
   * Invert object keys and values using lodash
   * @param obj - Object to invert
   * @returns Inverted object
   */
  static invert<T extends string | number | symbol>(obj: Record<string, T>): Record<T, string> {
    return _.invert(obj) as Record<T, string>;
  }

  /**
   * Get object keys as array
   * @param obj - Object to get keys from
   * @returns Array of keys
   */
  static keys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
  }

  /**
   * Get object values as array
   * @param obj - Object to get values from
   * @returns Array of values
   */
  static values<T extends object>(obj: T): T[keyof T][] {
    return Object.values(obj) as T[keyof T][];
  }

  /**
   * Get object entries as array of key-value pairs
   * @param obj - Object to get entries from
   * @returns Array of [key, value] pairs
   */
  static entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
  }

  /**
   * Create object from array of key-value pairs
   * @param entries - Array of [key, value] pairs
   * @returns Object created from entries
   */
  static fromEntries<T>(entries: [string, T][]): Record<string, T> {
    return Object.fromEntries(entries);
  }

  /**
   * Check if two objects are deeply equal using lodash
   * @param obj1 - First object
   * @param obj2 - Second object
   * @returns True if objects are equal
   */
  static isEqual(obj1: any, obj2: any): boolean {
    return _.isEqual(obj1, obj2);
  }

  /**
   * Create object with default values using lodash
   * @param obj - Object to assign defaults to
   * @param defaults - Default values
   * @returns Object with defaults applied
   */
  static defaults<T>(obj: T, defaults: Partial<T>): T {
    return _.defaults(obj, defaults) as T;
  }

  /**
   * Create object with deep default values using lodash
   * @param obj - Object to assign defaults to
   * @param defaults - Default values
   * @returns Object with deep defaults applied
   */
  static defaultsDeep<T>(obj: T, defaults: Partial<T>): T {
    return _.defaultsDeep(obj, defaults) as T;
  }

  /**
   * Generate UUID v4
   * @returns UUID string
   */
  static generateId(): string {
    return uuidv4();
  }

  /**
   * Create object with specific structure and default values
   * @param structure - Object structure with default values
   * @param overrides - Values to override defaults
   * @returns Object with structure and values
   */
  static createWithDefaults<T>(structure: T, overrides: Partial<T> = {}): T {
    return this.deepMerge(structure, overrides);
  }

  /**
   * Flatten nested object using lodash
   * @param obj - Object to flatten
   * @param separator - Separator for nested keys (default: '.')
   * @returns Flattened object
   */
  static flatten(obj: Record<string, unknown>, separator = '.'): Record<string, unknown> {
    return _.transform(
      obj,
      (result: Record<string, unknown>, value: unknown, key: string) => {
        if (_.isObject(value) && !_.isArray(value)) {
          _.forEach(value as Record<string, unknown>, (nestedValue: unknown, nestedKey: string) => {
            result[`${key}${separator}${nestedKey}`] = nestedValue;
          });
        } else {
          result[key] = value;
        }
      },
      {} as Record<string, unknown>,
    );
  }

  /**
   * Unflatten object using lodash
   * @param obj - Flattened object
   * @param separator - Separator used in keys (default: '.')
   * @returns Unflattened object
   */
  static unflatten(obj: Record<string, unknown>, separator = '.'): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    _.forEach(obj, (value: unknown, key: string) => {
      _.set(result, key.split(separator), value);
    });
    return result;
  }

  /**
   * Remove undefined values from object
   * @param obj - Object to clean
   * @returns Object without undefined values
   */
  static removeUndefined<T extends object>(obj: T): Partial<T> {
    return _.pickBy(obj, value => value !== undefined);
  }

  /**
   * Remove null values from object
   * @param obj - Object to clean
   * @returns Object without null values
   */
  static removeNull<T extends object>(obj: T): Partial<T> {
    return _.pickBy(obj, value => value !== null);
  }

  /**
   * Remove falsy values from object
   * @param obj - Object to clean
   * @returns Object without falsy values
   */
  static removeFalsy<T extends object>(obj: T): Partial<T> {
    return _.pickBy(obj, value => Boolean(value));
  }

  /**
   * Convert object to query string
   * @param obj - Object to convert
   * @returns Query string
   */
  static toQueryString(obj: Record<string, any>): string {
    const params = new URLSearchParams();
    _.forEach(obj, (value, key) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    return params.toString();
  }

  /**
   * Convert query string to object
   * @param queryString - Query string to convert
   * @returns Object with query parameters
   */
  static fromQueryString(queryString: string): Record<string, string> {
    const params = new URLSearchParams(queryString);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Get nested property and return default if not found
   * @param obj - Object to get property from
   * @param path - Property path
   * @param defaultValue - Default value
   * @returns Property value or default
   */
  static getNested<T>(obj: Record<string, unknown>, path: string, defaultValue: T): T {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(current as Record<string, unknown>)[key]) {
        return defaultValue;
      }

      current = (current as Record<string, unknown>)[key];
    }

    return current as T;
  }

  /**
   * Check if object has all required properties
   * @param obj - Object to check
   * @param requiredKeys - Array of required keys
   * @returns True if all required keys exist
   */
  static hasAllKeys<T extends object>(obj: T, requiredKeys: (keyof T)[]): boolean {
    return requiredKeys.every(key => key in obj);
  }

  /**
   * Check if object has any of the specified properties
   * @param obj - Object to check
   * @param keys - Array of keys to check
   * @returns True if any key exists
   */
  static hasAnyKey<T extends object>(obj: T, keys: (keyof T)[]): boolean {
    return keys.some(key => key in obj);
  }
}
