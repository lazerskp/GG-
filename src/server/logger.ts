/**
 * Structured Server-Side Logger
 * Sanitizes sensitive headers, secrets, and auth tokens.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMetadata {
  requestId?: string;
  endpoint?: string;
  provider?: string;
  cacheStatus?: 'HIT' | 'MISS' | 'BYPASS';
  durationMs?: number;
  errorCategory?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEY_PATTERNS = [
  'key', 'secret', 'token', 'auth', 'cookie', 'password', 'credential',
  'private', 'session', 'signature', 'jwt'
];

const SENSITIVE_VALUE_REGEX = /(?:uak_|ik_|anon_|sk_|Bearer\s+|ghp_|ey[A-Za-z0-9-_]{20,})[A-Za-z0-9_\-\.]*/gi;

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(SENSITIVE_VALUE_REGEX, '[REDACTED]');
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEY_PATTERNS.some((pattern) => lowerKey.includes(pattern))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeValue(val);
    }
  }
  return sanitized;
}

function log(level: LogLevel, message: string, meta?: LogMetadata) {
  const timestamp = new Date().toISOString();
  const sanitizedMsg = typeof message === 'string' ? message.replace(SENSITIVE_VALUE_REGEX, '[REDACTED]') : message;
  const sanitizedMeta = meta ? sanitizeValue(meta) : undefined;
  const payload = {
    timestamp,
    level: level.toUpperCase(),
    message: sanitizedMsg,
    ...(sanitizedMeta as object),
  };

  const formatted = JSON.stringify(payload);
  if (level === 'error') {
    console.error(formatted);
  } else if (level === 'warn') {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
}

export const serverLogger = {
  info: (msg: string, meta?: LogMetadata) => log('info', msg, meta),
  warn: (msg: string, meta?: LogMetadata) => log('warn', msg, meta),
  error: (msg: string, meta?: LogMetadata) => log('error', msg, meta),
  debug: (msg: string, meta?: LogMetadata) => log('debug', msg, meta),
};
