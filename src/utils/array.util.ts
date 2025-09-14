import _ from 'lodash';

export class ArrayUtil {
  /**
   * Remove duplicates from array using lodash
   * @param array - Array to remove duplicates from
   * @returns Array with unique values
   */
  static unique<T>(array: T[]): T[] {
    if (!Array.isArray(array)) {
      return [];
    }
    return _.uniq(array);
  }

  /**
   * Remove duplicates by specific property using lodash
   * @param array - Array of objects
   * @param property - Property to check for uniqueness
   * @returns Array with unique objects by property
   */
  static uniqueBy<T>(array: T[], property: keyof T): T[] {
    if (!Array.isArray(array)) {
      return [];
    }
    return _.uniqBy(array, property);
  }

  /**
   * Group array by specific property using lodash
   * @param array - Array to group
   * @param property - Property to group by
   * @returns Grouped object
   */
  static groupBy<T>(array: T[], property: keyof T): Record<string, T[]> {
    if (!Array.isArray(array)) {
      return {};
    }
    return _.groupBy(array, property);
  }

  /**
   * Sort array by specific property using lodash
   * @param array - Array to sort
   * @param property - Property to sort by
   * @param order - Sort order ('asc' or 'desc')
   * @returns Sorted array
   */
  static sortBy<T>(array: T[], property: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    if (!Array.isArray(array)) {
      return [];
    }
    const sorted = _.sortBy(array, property);
    return order === 'desc' ? _.reverse(sorted) : sorted;
  }

  /**
   * Chunk array into smaller arrays using lodash
   * @param array - Array to chunk
   * @param size - Size of each chunk
   * @returns Array of chunks
   */
  static chunk<T>(array: T[], size: number): T[][] {
    if (!Array.isArray(array) || size <= 0) {
      return [];
    }
    return _.chunk(array, size);
  }

  /**
   * Flatten nested arrays using lodash
   * @param array - Array to flatten
   * @param deep - Whether to flatten deeply
   * @returns Flattened array
   */
  static flatten<T>(array: T[], deep = false): T[] {
    if (!Array.isArray(array)) {
      return [];
    }
    return deep ? _.flattenDeep(array) : _.flatten(array);
  }

  /**
   * Get random items from array using lodash
   * @param array - Array to sample from
   * @param count - Number of items to sample
   * @returns Random items array
   */
  static sample<T>(array: T[], count = 1): T[] {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    return _.sampleSize(array, Math.min(count, array.length));
  }

  /**
   * Shuffle array using lodash
   * @param array - Array to shuffle
   * @returns Shuffled array
   */
  static shuffle<T>(array: T[]): T[] {
    if (!Array.isArray(array)) {
      return [];
    }
    return _.shuffle(array);
  }

  /**
   * Find intersection of two arrays using lodash
   * @param array1 - First array
   * @param array2 - Second array
   * @returns Intersection array
   */
  static intersection<T>(array1: T[], array2: T[]): T[] {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
      return [];
    }
    return _.intersection(array1, array2);
  }

  /**
   * Find difference between two arrays using lodash
   * @param array1 - First array
   * @param array2 - Second array
   * @returns Difference array
   */
  static difference<T>(array1: T[], array2: T[]): T[] {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
      return [];
    }
    return _.difference(array1, array2);
  }

  /**
   * Union of two arrays using lodash
   * @param array1 - First array
   * @param array2 - Second array
   * @returns Union array
   */
  static union<T>(array1: T[], array2: T[]): T[] {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
      return [];
    }
    return _.union(array1, array2);
  }

  /**
   * Check if array is empty
   * @param array - Array to check
   * @returns True if array is empty
   */
  static isEmpty(array: any[]): boolean {
    return !Array.isArray(array) || array.length === 0;
  }

  /**
   * Get first element of array safely
   * @param array - Array to get first element from
   * @returns First element or undefined
   */
  static first<T>(array: T[]): T | undefined {
    if (!Array.isArray(array) || array.length === 0) {
      return undefined;
    }
    return array[0];
  }

  /**
   * Get last element of array safely
   * @param array - Array to get last element from
   * @returns Last element or undefined
   */
  static last<T>(array: T[]): T | undefined {
    if (!Array.isArray(array) || array.length === 0) {
      return undefined;
    }
    return array[array.length - 1];
  }

  /**
   * Remove element from array by value
   * @param array - Array to remove from
   * @param value - Value to remove
   * @returns New array without the value
   */
  static remove<T>(array: T[], value: T): T[] {
    if (!Array.isArray(array)) {
      return [];
    }
    return array.filter(item => item !== value);
  }

  /**
   * Remove element from array by index
   * @param array - Array to remove from
   * @param index - Index to remove
   * @returns New array without the element at index
   */
  static removeAt<T>(array: T[], index: number): T[] {
    if (!Array.isArray(array) || index < 0 || index >= array.length) {
      return array || [];
    }
    return array.filter((_, i) => i !== index);
  }

  /**
   * Insert element at specific index
   * @param array - Array to insert into
   * @param index - Index to insert at
   * @param element - Element to insert
   * @returns New array with element inserted
   */
  static insertAt<T>(array: T[], index: number, element: T): T[] {
    if (!Array.isArray(array)) {
      return [element];
    }
    const result = [...array];
    result.splice(index, 0, element);
    return result;
  }

  /**
   * Get array pagination info
   * @param array - Array to paginate
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Pagination info and items
   */
  static paginate<T>(
    array: T[],
    page: number,
    limit: number,
  ): {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } {
    if (!Array.isArray(array)) {
      return {
        hasNext: false,
        hasPrev: false,
        items: [],
        limit: 10,
        page: 1,
        total: 0,
        totalPages: 0,
      };
    }

    const total = array.length;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const items = array.slice(startIndex, endIndex);

    return {
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      items,
      limit,
      page: currentPage,
      total,
      totalPages,
    };
  }

  /**
   * Find all indices of a value in array
   * @param array - Array to search in
   * @param value - Value to find
   * @returns Array of indices
   */
  static findAllIndices<T>(array: T[], value: T): number[] {
    if (!Array.isArray(array)) {
      return [];
    }
    const indices: number[] = [];
    array.forEach((item, index) => {
      if (item === value) {
        indices.push(index);
      }
    });
    return indices;
  }

  /**
   * Count occurrences of a value in array
   * @param array - Array to count in
   * @param value - Value to count
   * @returns Number of occurrences
   */
  static countOccurrences<T>(array: T[], value: T): number {
    if (!Array.isArray(array)) {
      return 0;
    }
    return array.filter(item => item === value).length;
  }

  /**
   * Create array of numbers in range
   * @param start - Start number
   * @param end - End number
   * @param step - Step size (default: 1)
   * @returns Array of numbers
   */
  static range(start: number, end: number, step = 1): number[] {
    if (step === 0) {
      throw new Error('Step cannot be zero');
    }
    return _.range(start, end + 1, step);
  }

  /**
   * Zip two arrays together
   * @param array1 - First array
   * @param array2 - Second array
   * @returns Array of pairs
   */
  static zip<T, U>(array1: T[], array2: U[]): [T, U][] {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
      return [];
    }
    return _.zip(array1, array2) as [T, U][];
  }
}
