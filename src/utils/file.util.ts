import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as mime from 'mime-types';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);

export class FileUtil {
  /**
   * Get file extension from filename
   * @param filename - Filename to get extension from
   * @returns File extension (without dot)
   */
  static getExtension(filename: string): string {
    return path.extname(filename).slice(1).toLowerCase();
  }

  /**
   * Get filename without extension
   * @param filename - Filename to process
   * @returns Filename without extension
   */
  static getBasename(filename: string): string {
    return path.basename(filename, path.extname(filename));
  }

  /**
   * Get directory name from file path
   * @param filepath - File path
   * @returns Directory name
   */
  static getDirname(filepath: string): string {
    return path.dirname(filepath);
  }

  /**
   * Get MIME type from filename or extension
   * @param filename - Filename or extension
   * @returns MIME type or 'application/octet-stream' if unknown
   */
  static getMimeType(filename: string): string {
    return mime.lookup(filename) || 'application/octet-stream';
  }

  /**
   * Get file extension from MIME type
   * @param mimeType - MIME type
   * @returns File extension (without dot) or null if not found
   */
  static getExtensionFromMimeType(mimeType: string): string | null {
    return mime.extension(mimeType) || null;
  }

  /**
   * Check if file extension is allowed
   * @param filename - Filename to check
   * @param allowedExtensions - Array of allowed extensions
   * @returns True if extension is allowed
   */
  static isAllowedExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = this.getExtension(filename);
    return allowedExtensions.includes(extension);
  }

  /**
   * Check if MIME type is allowed
   * @param filename - Filename to check
   * @param allowedMimeTypes - Array of allowed MIME types
   * @returns True if MIME type is allowed
   */
  static isAllowedMimeType(filename: string, allowedMimeTypes: string[]): boolean {
    const mimeType = this.getMimeType(filename);
    return allowedMimeTypes.includes(mimeType);
  }

  /**
   * Generate unique filename with timestamp
   * @param originalFilename - Original filename
   * @param prefix - Optional prefix
   * @returns Unique filename
   */
  static generateUniqueFilename(originalFilename: string, prefix = ''): string {
    const extension = this.getExtension(originalFilename);
    const basename = this.getBasename(originalFilename);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    const filename = `${prefix}${basename}_${timestamp}_${random}`;
    return extension ? `${filename}.${extension}` : filename;
  }

  /**
   * Sanitize filename by removing invalid characters
   * @param filename - Filename to sanitize
   * @returns Sanitized filename
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Get file size in bytes
   * @param filepath - File path
   * @returns File size in bytes
   */
  static async getFileSize(filepath: string): Promise<number> {
    try {
      const stats = await stat(filepath);
      return stats.size;
    } catch (error) {
      throw new Error(
        `Failed to get file size: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Check if file exists
   * @param filepath - File path
   * @returns True if file exists
   */
  static async fileExists(filepath: string): Promise<boolean> {
    try {
      await stat(filepath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if directory exists
   * @param dirpath - Directory path
   * @returns True if directory exists
   */
  static async directoryExists(dirpath: string): Promise<boolean> {
    try {
      const stats = await stat(dirpath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Create directory recursively
   * @param dirpath - Directory path to create
   * @returns True if directory was created or already exists
   */
  static async createDirectory(dirpath: string): Promise<boolean> {
    try {
      await mkdir(dirpath, { recursive: true });
      return true;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
        return true;
      }
      throw new Error(
        `Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Read file content
   * @param filepath - File path
   * @param encoding - File encoding (default: 'utf8')
   * @returns File content
   */
  static async readFile(filepath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    try {
      return await readFile(filepath, encoding);
    } catch (error) {
      throw new Error(
        `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Write content to file
   * @param filepath - File path
   * @param content - Content to write
   * @param encoding - File encoding (default: 'utf8')
   * @returns True if file was written successfully
   */
  static async writeFile(
    filepath: string,
    content: string,
    encoding: BufferEncoding = 'utf8',
  ): Promise<boolean> {
    try {
      // Ensure directory exists
      const dir = this.getDirname(filepath);
      await this.createDirectory(dir);

      await writeFile(filepath, content, encoding);
      return true;
    } catch (error) {
      throw new Error(
        `Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Delete file
   * @param filepath - File path
   * @returns True if file was deleted successfully
   */
  static async deleteFile(filepath: string): Promise<boolean> {
    try {
      await unlink(filepath);
      return true;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return true; // File doesn't exist, consider it deleted
      }
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get file stats
   * @param filepath - File path
   * @returns File stats
   */
  static async getFileStats(filepath: string): Promise<fs.Stats> {
    try {
      return await stat(filepath);
    } catch (error) {
      throw new Error(
        `Failed to get file stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * List files in directory
   * @param dirpath - Directory path
   * @param includeSubdirs - Whether to include subdirectories (default: false)
   * @returns Array of file paths
   */
  static async listFiles(dirpath: string, includeSubdirs = false): Promise<string[]> {
    try {
      const items = await readdir(dirpath);
      const files: string[] = [];

      for (const item of items) {
        const fullPath = path.join(dirpath, item);
        const stats = await stat(fullPath);

        if (stats.isFile()) {
          files.push(fullPath);
        } else if (stats.isDirectory() && includeSubdirs) {
          const subFiles = await this.listFiles(fullPath, true);
          files.push(...subFiles);
        }
      }

      return files;
    } catch (error) {
      throw new Error(
        `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get file size in human readable format
   * @param bytes - File size in bytes
   * @returns Human readable file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Check if file is image based on extension
   * @param filename - Filename to check
   * @returns True if file is image
   */
  static isImage(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];
    return this.isAllowedExtension(filename, imageExtensions);
  }

  /**
   * Check if file is video based on extension
   * @param filename - Filename to check
   * @returns True if file is video
   */
  static isVideo(filename: string): boolean {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
    return this.isAllowedExtension(filename, videoExtensions);
  }

  /**
   * Check if file is audio based on extension
   * @param filename - Filename to check
   * @returns True if file is audio
   */
  static isAudio(filename: string): boolean {
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'];
    return this.isAllowedExtension(filename, audioExtensions);
  }

  /**
   * Check if file is document based on extension
   * @param filename - Filename to check
   * @returns True if file is document
   */
  static isDocument(filename: string): boolean {
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'];
    return this.isAllowedExtension(filename, documentExtensions);
  }

  /**
   * Get file category based on extension
   * @param filename - Filename to categorize
   * @returns File category
   */
  static getFileCategory(filename: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
    if (this.isImage(filename)) return 'image';
    if (this.isVideo(filename)) return 'video';
    if (this.isAudio(filename)) return 'audio';
    if (this.isDocument(filename)) return 'document';
    return 'other';
  }

  /**
   * Validate file size
   * @param fileSize - File size in bytes
   * @param maxSize - Maximum allowed size in bytes
   * @returns True if file size is valid
   */
  static validateFileSize(fileSize: number, maxSize: number): boolean {
    return fileSize <= maxSize;
  }

  /**
   * Get relative path from base directory
   * @param filepath - Full file path
   * @param baseDir - Base directory
   * @returns Relative path
   */
  static getRelativePath(filepath: string, baseDir: string): string {
    return path.relative(baseDir, filepath);
  }

  /**
   * Join path segments safely
   * @param segments - Path segments
   * @returns Joined path
   */
  static joinPath(...segments: string[]): string {
    return path.join(...segments);
  }

  /**
   * Normalize path (resolve .. and .)
   * @param filepath - Path to normalize
   * @returns Normalized path
   */
  static normalizePath(filepath: string): string {
    return path.normalize(filepath);
  }

  /**
   * Check if path is absolute
   * @param filepath - Path to check
   * @returns True if path is absolute
   */
  static isAbsolutePath(filepath: string): boolean {
    return path.isAbsolute(filepath);
  }
}
