import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return userId and email from payload', () => {
      const payload = {
        sub: 1,
        email: 'test@example.com',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: payload.sub,
        email: payload.email,
      });
    });

    it('should handle different user IDs', () => {
      const payload = {
        sub: 999,
        email: 'another@example.com',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 999,
        email: 'another@example.com',
      });
    });
  });
});
