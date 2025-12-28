import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ApiGatewayModule } from './../src/api-gateway.module';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let _accessToken: string;
  let cookies: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user', () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        fullName: 'Test User',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user).toHaveProperty('email', registerDto.email);
          expect(res.body.data.user).toHaveProperty('username', registerDto.username);
          expect(res.body.data.user).not.toHaveProperty('password');

          // Check cookies
          cookies = res.headers['set-cookie'];
          expect(cookies).toBeDefined();
          expect(cookies.length).toBeGreaterThan(0);
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          username: 'testuser2',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          username: 'testuser2',
          password: 'weak',
        })
        .expect(400);
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser3',
          password: 'Password123!',
        })
        .expect(409);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login with email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          emailOrUsername: 'test@example.com',
          password: 'Password123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.data).toHaveProperty('user');

          cookies = res.headers['set-cookie'];
          expect(cookies).toBeDefined();
        });
    });

    it('should login with username', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          emailOrUsername: 'testuser',
          password: 'Password123!',
        })
        .expect(200);
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          emailOrUsername: 'test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          emailOrUsername: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('/api/auth/me (GET)', () => {
    beforeAll(async () => {
      // Login first to get cookies
      const response = await request(app.getHttpServer()).post('/api/auth/login').send({
        emailOrUsername: 'test@example.com',
        password: 'Password123!',
      });

      cookies = response.headers['set-cookie'];
    });

    it('should get current user', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', 'test@example.com');
          expect(res.body).toHaveProperty('username', 'testuser');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });
  });

  describe('/api/auth/logout (POST)', () => {
    it('should logout user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', cookies)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);

          // Check if cookies are cleared
          const setCookies = res.headers['set-cookie'];
          if (setCookies) {
            setCookies.forEach((cookie: string) => {
              expect(cookie).toContain('Max-Age=0');
            });
          }
        });
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    let refreshCookie: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer()).post('/api/auth/login').send({
        emailOrUsername: 'test@example.com',
        password: 'Password123!',
      });

      refreshCookie = response.headers['set-cookie'].find((c: string) =>
        c.startsWith('refresh_token'),
      );
    });

    it('should refresh access token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', [refreshCookie])
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.headers['set-cookie']).toBeDefined();
        });
    });

    it('should fail without refresh token', () => {
      return request(app.getHttpServer()).post('/api/auth/refresh').expect(401);
    });
  });
});
