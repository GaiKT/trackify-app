import { buildTest } from "./helper";

describe('Main Application', () => {
    const app = buildTest();

    it('should return hello world', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/',
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('Hello world');
    });
    
});
