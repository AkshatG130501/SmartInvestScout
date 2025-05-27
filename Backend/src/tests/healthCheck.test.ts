import request from 'supertest';
import express from 'express';
import { healthCheckRouter } from '../routes/healthCheck';

describe('Health Check Endpoint', () => {
  const app = express();
  app.use('/health', healthCheckRouter);

  it('should return 200 and success message', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Service is healthy',
      timestamp: expect.any(String),
    });
  });
});
