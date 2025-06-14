import { z } from 'zod';
import { 
  AuthZodSchemas,
  KYCZodSchemas,
  PaymentZodSchemas,
  MLMZodSchemas,
  TransactionZodSchemas,
  UserZodSchemas
} from '@/types';

export class ValidationManager {
  // Validate with better error formatting
  static validate<T>(schema: z.ZodSchema<T>, data: any): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
    try {
      const validData = schema.parse(data);
      return { success: true, data: validData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });
        return { success: false, errors };
      }
      throw error;
    }
  }

  // Safe validation (returns null on error)
  static safeParse<T>(schema: z.ZodSchema<T>, data: any): T | null {
    try {
      return schema.parse(data);
    } catch {
      return null;
    }
  }

  // Partial validation for partial updates
  static validatePartial<T>(schema: z.ZodSchema<T>, data: any): { success: true; data: Partial<T> } | { success: false; errors: Record<string, string[]> } {
    return this.validate(schema.partial(), data);
  }

  // Common validation functions
  static validateEmail(email: string): boolean {
    return z.string().email().safeParse(email).success;
  }

  static validatePhone(phone: string): boolean {
    return z.string().regex(/^\+?[1-9]\d{1,14}$/).safeParse(phone).success;
  }

  static validatePassword(password: string): boolean {
    return z.string().min(8).safeParse(password).success;
  }

  static validateObjectId(id: string): boolean {
    return z.string().regex(/^[0-9a-fA-F]{24}$/).safeParse(id).success;
  }

  static validateAmount(amount: number): boolean {
    return z.number().positive().finite().safeParse(amount).success;
  }

  // File validation
  static validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  static validateDocumentFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }
}

export const validator = ValidationManager;

// Export all validation schemas for easy access
export const schemas = {
  auth: AuthZodSchemas,
  kyc: KYCZodSchemas,
  payment: PaymentZodSchemas,
  mlm: MLMZodSchemas,
  transaction: TransactionZodSchemas,
  user: UserZodSchemas,
};
