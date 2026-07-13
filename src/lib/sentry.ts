import * as Sentry from "@sentry/react";

export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({ message, category, data });
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}
