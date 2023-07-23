import * as Sentry from "@sentry/node";

export const hasSDKKeys = () => {
  return !!process.env.SENTRY_DSN;
};

export const initTrackingSDK = (app) => {
  if (!hasSDKKeys) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({
        tracing: true,
      }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({
        app,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!,
  });

  return Sentry;
};

export const registerRequestsHandler = (app) => {
  if (!hasSDKKeys) return;
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
};

export const registerErrorHandler = (app) => {
  if (!hasSDKKeys) return;
  app.use(Sentry.Handlers.errorHandler());
};
