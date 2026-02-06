import { describe, it, expect } from 'vitest';
import { validateUUID, uuidSchema } from '@/lib/validations';
import { generateCertificateId } from '@/lib/utils';

describe('validateUUID', () => {
    it('should return valid for a proper UUID', () => {
        const result = validateUUID('550e8400-e29b-41d4-a716-446655440000');
        expect(result.valid).toBe(true);
    });

    it('should return invalid for a non-UUID string', () => {
        const result = validateUUID('not-a-uuid');
        expect(result.valid).toBe(false);
        if (!result.valid) {
            expect(result.error).toBe('Invalid ID format');
        }
    });

    it('should return invalid for empty string', () => {
        const result = validateUUID('');
        expect(result.valid).toBe(false);
    });
});

describe('uuidSchema', () => {
    it('should parse valid UUID', () => {
        const result = uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
        expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
        const result = uuidSchema.safeParse('invalid');
        expect(result.success).toBe(false);
    });
});

describe('generateCertificateId', () => {
    it('should generate ID in correct format', () => {
        const id = generateCertificateId();
        expect(id).toMatch(/^RAY-\d{4}-[A-Z0-9]{6}$/);
    });

    it('should include current year', () => {
        const id = generateCertificateId();
        const currentYear = new Date().getFullYear().toString();
        expect(id).toContain(currentYear);
    });

    it('should generate unique IDs', () => {
        const ids = new Set<string>();
        for (let i = 0; i < 100; i++) {
            ids.add(generateCertificateId());
        }
        // Should have some unique IDs (may have rare collisions)
        expect(ids.size).toBeGreaterThan(90);
    });
});
