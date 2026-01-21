/**
 * Security and validation utilities for PDF Diff
 */

/**
 * Maximum file size allowed (500MB)
 */
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

/**
 * PDF magic bytes - PDF files must start with %PDF
 */
export const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46] as const; // %PDF

/**
 * Validates if data contains PDF magic bytes.
 * This can be used in both browser and Node.js environments.
 * 
 * @param data - Byte array to check
 * @returns true if data starts with %PDF header
 */
export function isPDFMagicBytes(data: Uint8Array): boolean {
  if (data.length < 4) {
    return false;
  }
  
  // Use array comparison for concise and readable validation
  return data.slice(0, 4).every((byte, i) => byte === PDF_MAGIC_BYTES[i]);
}

/**
 * Validates a file is a PDF and within size limits
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validatePDFFile(file: File): Promise<ValidationResult> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / 1024 / 1024);
    return {
      valid: false,
      error: `File size (${sizeMB}MB) exceeds the maximum allowed size of 500MB. Please use a smaller file.`,
    };
  }

  // Check MIME type (first line of defense)
  if (file.type !== 'application/pdf') {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a PDF file.',
    };
  }

  // Read first few bytes to verify PDF magic bytes
  try {
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    if (!isPDFMagicBytes(bytes)) {
      return {
        valid: false,
        error: 'File does not appear to be a valid PDF. The file header is incorrect.',
      };
    }
  } catch {
    return {
      valid: false,
      error: 'Failed to read file for validation.',
    };
  }

  return { valid: true };
}

/**
 * Format file size in human-readable format
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string with appropriate unit (Bytes, KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  // Handle edge cases
  if (bytes < 0) return '0 Bytes';
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
