import CryptoJS from 'crypto-js';
import validator from 'validator';
import { CountryCode, isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';

export class StringUtil {
  /**
   * Capitalize the first letter of a string
   * @param str - String to capitalize
   * @returns Capitalized string
   */
  static capitalize(str: string): string {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert string to URL-friendly slug
   * @param str - String to slugify
   * @returns Slugified string
   */
  static slugify(str: string): string {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate a cryptographically secure random string
   * @param length - Length of the random string
   * @returns Random string
   */
  static generateRandomString(length: number): string {
    if (length <= 0) {
      throw new Error('Length must be greater than 0');
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    // Use crypto-js for better randomness
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(CryptoJS.lib.WordArray.random(1).words[0] % chars.length);
      result += chars[randomIndex];
    }

    return result;
  }

  /**
   * Generate a secure random token using crypto-js
   * @param length - Length of the token in bytes (default: 32)
   * @returns Hex encoded random token
   */
  static generateSecureToken(length = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
  }

  /**
   * Validate email using validator library
   * @param email - Email to validate
   * @returns True if email is valid
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    return validator.isEmail(email);
  }

  /**
   * Mask email address for privacy
   * @param email - Email to mask
   * @returns Masked email
   */
  static maskEmail(email: string): string {
    if (!email || typeof email !== 'string' || !this.isValidEmail(email)) {
      return '';
    }

    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}*@${domain}`;
    }

    const maskedLocal = localPart.substring(0, 2) + '*'.repeat(localPart.length - 2);
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Validate phone number using validator library
   * @param phone - Phone number to validate
   * @returns True if phone is valid
   */
  static isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    return validator.isMobilePhone(phone);
  }

  /**
   * Validate URL using validator library
   * @param url - URL to validate
   * @returns True if URL is valid
   */
  static isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }
    return validator.isURL(url);
  }

  /**
   * Sanitize HTML string to prevent XSS
   * @param html - HTML string to sanitize
   * @returns Sanitized HTML string
   */
  static sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }
    return validator.escape(html);
  }

  /**
   * Normalize string by removing extra whitespace
   * @param str - String to normalize
   * @returns Normalized string
   */
  static normalize(str: string): string {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Truncate string to specified length with ellipsis
   * @param str - String to truncate
   * @param length - Maximum length
   * @param suffix - Suffix to add (default: '...')
   * @returns Truncated string
   */
  static truncate(str: string, length: number, suffix = '...'): string {
    if (!str || typeof str !== 'string' || length <= 0) {
      return '';
    }

    if (str.length <= length) {
      return str;
    }

    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Hash string using SHA256
   * @param str - String to hash
   * @returns SHA256 hash
   */
  static hashString(str: string): string {
    if (!str || typeof str !== 'string') {
      return '';
    }
    return CryptoJS.SHA256(str).toString();
  }

  /**
   * Generate UUID v4 using crypto-js
   * @returns UUID v4 string
   */
  static generateUUID(): string {
    return CryptoJS.lib.WordArray.random(16)
      .toString(CryptoJS.enc.Hex)
      .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
  }

  /**
   * Normalize phone number to E.164 format using libphonenumber-js
   * @param phone - Phone number to normalize
   * @param defaultCountry - Default country code (default: 'SY' for Syria)
   * @returns Normalized phone number in E.164 format or null if invalid
   */
  static normalizePhoneNumber(phone: string, defaultCountry: CountryCode = 'SY'): string | null {
    if (!phone || typeof phone !== 'string') {
      return null;
    }

    try {
      // Parse the phone number
      const phoneNumber = parsePhoneNumberFromString(phone, defaultCountry);

      if (!phoneNumber || !phoneNumber.isValid()) {
        return null;
      }

      // Return in E.164 format (e.g., +963987654321)
      return phoneNumber.format('E.164');
    } catch {
      // If parsing fails, return null
      return null;
    }
  }

  /**
   * Validate phone number using libphonenumber-js
   * @param phone - Phone number to validate
   * @param defaultCountry - Default country code (default: 'SY' for Syria)
   * @returns True if phone number is valid
   */
  static isValidPhoneNumber(phone: string, defaultCountry: CountryCode = 'SY'): boolean {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    try {
      return isValidPhoneNumber(phone, defaultCountry);
    } catch {
      return false;
    }
  }

  /**
   * Get phone number information (country, type, etc.)
   * @param phone - Phone number to analyze
   * @param defaultCountry - Default country code (default: 'SY' for Syria)
   * @returns Phone number information or null if invalid
   */
  static getPhoneNumberInfo(phone: string, defaultCountry: CountryCode = 'SY') {
    if (!phone || typeof phone !== 'string') {
      return null;
    }

    try {
      const phoneNumber = parsePhoneNumberFromString(phone, defaultCountry);

      if (!phoneNumber || !phoneNumber.isValid()) {
        return null;
      }

      return {
        country: phoneNumber.country,
        countryCallingCode: phoneNumber.countryCallingCode,
        format: {
          e164: phoneNumber.format('E.164'),
          international: phoneNumber.formatInternational(),
          national: phoneNumber.formatNational(),
        },
        nationalNumber: phoneNumber.nationalNumber,
        type: phoneNumber.getType(),
      };
    } catch {
      return null;
    }
  }
}
