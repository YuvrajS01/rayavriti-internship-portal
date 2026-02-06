import { describe, it, expect } from 'vitest';
import { errorResponse, successResponse, ApiErrors } from '@/lib/api';

describe('API Response Helpers', () => {
    describe('errorResponse', () => {
        it('should create error response with correct structure', async () => {
            const response = errorResponse('Test error', 400);
            const body = await response.json();

            expect(body).toEqual({
                success: false,
                error: 'Test error',
            });
            expect(response.status).toBe(400);
        });

        it('should include details when provided', async () => {
            const response = errorResponse('Validation failed', 400, { field: 'email' });
            const body = await response.json();

            expect(body).toEqual({
                success: false,
                error: 'Validation failed',
                details: { field: 'email' },
            });
        });
    });

    describe('successResponse', () => {
        it('should create success response with data', async () => {
            const response = successResponse({ id: '123', name: 'Test' });
            const body = await response.json();

            expect(body).toEqual({
                success: true,
                data: { id: '123', name: 'Test' },
            });
            expect(response.status).toBe(200);
        });

        it('should use custom status code', async () => {
            const response = successResponse({ created: true }, 201);

            expect(response.status).toBe(201);
        });
    });

    describe('ApiErrors', () => {
        it('should return 401 for unauthorized', async () => {
            const response = ApiErrors.unauthorized();
            const body = await response.json();

            expect(body.error).toBe('Unauthorized');
            expect(response.status).toBe(401);
        });

        it('should return 404 for notFound with custom resource', async () => {
            const response = ApiErrors.notFound('User');
            const body = await response.json();

            expect(body.error).toBe('User not found');
            expect(response.status).toBe(404);
        });

        it('should return 400 for badRequest', async () => {
            const response = ApiErrors.badRequest('Invalid input');
            const body = await response.json();

            expect(body.error).toBe('Invalid input');
            expect(response.status).toBe(400);
        });

        it('should return 400 for invalidId', async () => {
            const response = ApiErrors.invalidId();
            const body = await response.json();

            expect(body.error).toBe('Invalid ID format');
            expect(response.status).toBe(400);
        });

        it('should return 500 for serverError', async () => {
            const response = ApiErrors.serverError();
            const body = await response.json();

            expect(body.error).toBe('Internal server error');
            expect(response.status).toBe(500);
        });
    });
});
