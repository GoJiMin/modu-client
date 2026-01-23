describe('src/shared/lib/utils/env.ts', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = originalEnv;
  });

  describe('isDevelopment', () => {
    it('NODE_ENV가 development일 때 true를 반환한다', async () => {
      process.env.NODE_ENV = 'development';
      const {isDevelopment} = await import('../env');

      expect(isDevelopment).toBe(true);
    });

    it('NODE_ENV가 production일 때 false를 반환한다', async () => {
      process.env.NODE_ENV = 'production';
      const {isDevelopment} = await import('../env');

      expect(isDevelopment).toBe(false);
    });

    it('NODE_ENV가 test일 때 false를 반환한다', async () => {
      process.env.NODE_ENV = 'test';
      const {isDevelopment} = await import('../env');

      expect(isDevelopment).toBe(false);
    });
  });

  describe('isProduction', () => {
    it('NODE_ENV가 production일 때 true를 반환한다', async () => {
      process.env.NODE_ENV = 'production';
      const {isProduction} = await import('../env');

      expect(isProduction).toBe(true);
    });

    it('NODE_ENV가 development일 때 false를 반환한다', async () => {
      process.env.NODE_ENV = 'development';
      const {isProduction} = await import('../env');

      expect(isProduction).toBe(false);
    });

    it('NODE_ENV가 test일 때 false를 반환한다', async () => {
      process.env.NODE_ENV = 'test';
      const {isProduction} = await import('../env');

      expect(isProduction).toBe(false);
    });
  });
});
