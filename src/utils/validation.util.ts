import validator from 'validator';
import { CountryCode } from 'libphonenumber-js';

import { BadRequestException } from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { StringUtil } from './string.util';

export class ValidationUtil {
  /**
   * Validates user credentials based on their role
   * @param email - User email (optional)
   * @param phone - User phone (optional)
   * @param role - User role (optional)
   * @throws BadRequestException if validation fails
   */
  static validateCredentialsForRole(email?: string, phone?: string, role?: UserRole): void {
    if (role === UserRole.GUARDIAN) {
      if (!phone) {
        throw new BadRequestException('Phone number is required for guardian accounts');
      }
      if (email) {
        throw new BadRequestException('Email should not be provided for guardian accounts');
      }
      // Validate phone format for guardian
      this.validatePhoneNumber(phone);
    } else {
      if (!email) {
        throw new BadRequestException(
          'Email is required for admin, supervisor, and teacher accounts',
        );
      }
      if (phone) {
        throw new BadRequestException(
          'Phone number should not be provided for admin, supervisor, and teacher accounts',
        );
      }
      // Validate email format for other roles
      this.validateEmailFormat(email);
    }
  }

  /**
   * Validates that either email or phone is provided for login
   * @param email - User email (optional)
   * @param phone - User phone (optional)
   * @throws BadRequestException if neither is provided
   */
  static validateLoginCredentials(email?: string, phone?: string): void {
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    // Validate format if provided
    if (email) {
      this.validateEmailFormat(email);
    }
    if (phone) {
      this.validatePhoneNumber(phone);
    }
  }

  /**
   * Validates password strength using validator library
   * @param password - User password
   * @param minLength - Minimum password length (default: 8)
   * @param maxLength - Maximum password length (default: 128)
   * @throws BadRequestException if password is weak
   */
  static validatePasswordStrength(password: string, minLength = 8, maxLength = 128): void {
    if (!password || typeof password !== 'string') {
      throw new BadRequestException('Password is required');
    }

    if (password.length < minLength) {
      throw new BadRequestException(`Password must be at least ${minLength} characters long`);
    }

    if (password.length > maxLength) {
      throw new BadRequestException(`Password must not exceed ${maxLength} characters`);
    }

    // Use validator library for password strength validation
    if (
      !validator.isStrongPassword(password, {
        minLength,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
    ) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }
  }

  /**
   * Validates phone number format using libphonenumber-js
   * @param phone - Phone number to validate
   * @param countryCode - Default country code (default: 'SY' for Syria)
   * @throws BadRequestException if phone format is invalid
   */
  static validatePhoneNumber(phone: string, countryCode: CountryCode = 'SY'): void {
    if (!phone || typeof phone !== 'string') {
      throw new BadRequestException('Phone number is required');
    }

    if (!StringUtil.isValidPhoneNumber(phone, countryCode)) {
      throw new BadRequestException('Please provide a valid phone number');
    }
  }

  /**
   * Validates and normalizes phone number format
   * @param phone - Phone number to validate and normalize
   * @param countryCode - Default country code (default: 'SY' for Syria)
   * @returns Normalized phone number in E.164 format
   * @throws BadRequestException if phone format is invalid
   */
  static validateAndNormalizePhoneNumber(phone: string, countryCode: CountryCode = 'SY'): string {
    if (!phone || typeof phone !== 'string') {
      throw new BadRequestException('Phone number is required');
    }

    const normalizedPhone = StringUtil.normalizePhoneNumber(phone, countryCode);

    if (!normalizedPhone) {
      throw new BadRequestException('Please provide a valid phone number');
    }

    return normalizedPhone;
  }

  /**
   * Validates email format using validator library
   * @param email - Email to validate
   * @param options - Email validation options
   * @throws BadRequestException if email format is invalid
   */
  static validateEmailFormat(email: string, options?: validator.IsEmailOptions): void {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('Email is required');
    }

    if (!validator.isEmail(email, options)) {
      throw new BadRequestException('Please provide a valid email address');
    }
  }

  /**
   * Validates URL format using validator library
   * @param url - URL to validate
   * @param options - URL validation options
   * @throws BadRequestException if URL format is invalid
   */
  static validateUrl(url: string, options?: validator.IsURLOptions): void {
    if (!url || typeof url !== 'string') {
      throw new BadRequestException('URL is required');
    }

    if (!validator.isURL(url, options)) {
      throw new BadRequestException('Please provide a valid URL');
    }
  }

  /**
   * Validates that a string is not empty and within length limits
   * @param str - String to validate
   * @param fieldName - Name of the field for error messages
   * @param minLength - Minimum length (default: 1)
   * @param maxLength - Maximum length (default: 255)
   * @throws BadRequestException if validation fails
   */
  static validateStringLength(
    str: string,
    fieldName: string,
    minLength = 1,
    maxLength = 255,
  ): void {
    if (!str || typeof str !== 'string') {
      throw new BadRequestException(`${fieldName} is required`);
    }

    if (str.length < minLength) {
      throw new BadRequestException(`${fieldName} must be at least ${minLength} characters long`);
    }

    if (str.length > maxLength) {
      throw new BadRequestException(`${fieldName} must not exceed ${maxLength} characters`);
    }
  }

  /**
   * Validates that a number is within specified range
   * @param num - Number to validate
   * @param fieldName - Name of the field for error messages
   * @param min - Minimum value
   * @param max - Maximum value
   * @throws BadRequestException if validation fails
   */
  static validateNumberRange(num: number, fieldName: string, min?: number, max?: number): void {
    if (typeof num !== 'number' || isNaN(num)) {
      throw new BadRequestException(`${fieldName} must be a valid number`);
    }

    if (min !== undefined && num < min) {
      throw new BadRequestException(`${fieldName} must be at least ${min}`);
    }

    if (max !== undefined && num > max) {
      throw new BadRequestException(`${fieldName} must not exceed ${max}`);
    }
  }

  /**
   * Validates that a value is one of the allowed values
   * @param value - Value to validate
   * @param allowedValues - Array of allowed values
   * @param fieldName - Name of the field for error messages
   * @throws BadRequestException if validation fails
   */
  static validateEnumValue<T>(value: T, allowedValues: T[], fieldName: string): void {
    if (!allowedValues.includes(value)) {
      throw new BadRequestException(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
  }

  /**
   * Validates that a date is valid and not in the past (for future dates)
   * @param date - Date to validate
   * @param fieldName - Name of the field for error messages
   * @param allowPast - Whether to allow past dates (default: true)
   * @throws BadRequestException if validation fails
   */
  static validateDate(date: Date, fieldName: string, allowPast = true): void {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid date`);
    }

    if (!allowPast && date < new Date()) {
      throw new BadRequestException(`${fieldName} must be a future date`);
    }
  }

  /**
   * Validates that a string contains only alphanumeric characters
   * @param str - String to validate
   * @param fieldName - Name of the field for error messages
   * @throws BadRequestException if validation fails
   */
  static validateAlphanumeric(str: string, fieldName: string): void {
    if (!str || typeof str !== 'string') {
      throw new BadRequestException(`${fieldName} is required`);
    }

    if (!validator.isAlphanumeric(str)) {
      throw new BadRequestException(`${fieldName} must contain only letters and numbers`);
    }
  }

  /**
   * Validates that a string is a valid UUID
   * @param uuid - UUID string to validate
   * @param fieldName - Name of the field for error messages
   * @throws BadRequestException if validation fails
   */
  static validateUUID(uuid: string, fieldName: string): void {
    if (!uuid || typeof uuid !== 'string') {
      throw new BadRequestException(`${fieldName} is required`);
    }

    if (!validator.isUUID(uuid)) {
      throw new BadRequestException(`${fieldName} must be a valid UUID`);
    }
  }
}
