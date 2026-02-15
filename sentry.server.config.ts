import {isDevelopment, isProduction} from '@/shared/lib/utils/env';
import * as Sentry from '@sentry/nextjs';

const getEnvironmentConfig = () => {
  if (isProduction) {
    return {
      tracesSampleRate: 0.1,
      sampleRate: 1.0,
      enableLogs: false,
    };
  }

  if (isDevelopment) {
    return {
      tracesSampleRate: 1.0,
      sampleRate: 1.0,
      enableLogs: false,
      debug: false,
    };
  }
};

const config = getEnvironmentConfig();

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,

  ...config,
});
