import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Core Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRATION_TIME: Joi.string().default('1h'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  
  // ===== IA PROVIDERS API KEYS =====
  OPENAI_API_KEY: Joi.string().pattern(/^sk-/).optional(),
  ANTHROPIC_API_KEY: Joi.string().pattern(/^sk-ant-/).optional(),
  GOOGLE_AI_API_KEY: Joi.string().pattern(/^AI/).optional(),
  MISTRAL_API_KEY: Joi.string().optional(),
  
  // ===== IA MODELS CONFIGURATION =====
  OPENAI_MODEL: Joi.string().default('gpt-4-turbo-preview'),
  OPENAI_MAX_TOKENS: Joi.number().min(1).max(8192).default(4000),
  OPENAI_TEMPERATURE: Joi.number().min(0).max(2).default(0.7),
  
  ANTHROPIC_MODEL: Joi.string().default('claude-3-sonnet-20240229'),
  ANTHROPIC_MAX_TOKENS: Joi.number().min(1).max(8192).default(4000),
  ANTHROPIC_TEMPERATURE: Joi.number().min(0).max(2).default(0.7),
  
  GEMINI_MODEL: Joi.string().default('gemini-pro'),
  GEMINI_MAX_TOKENS: Joi.number().min(1).max(8192).default(4000),
  GEMINI_TEMPERATURE: Joi.number().min(0).max(2).default(0.7),
  
  MISTRAL_MODEL: Joi.string().default('mistral-large-latest'),
  MISTRAL_MAX_TOKENS: Joi.number().min(1).max(8192).default(4000),
  MISTRAL_TEMPERATURE: Joi.number().min(0).max(2).default(0.7),
  
  // ===== AI GATEWAY SETTINGS =====
  AI_MODE: Joi.string().valid('development', 'production', 'test').default('development'),
  AI_DEFAULT_PROVIDER: Joi.string().valid('openai', 'anthropic', 'gemini').default('openai'),
  AI_FALLBACK_ENABLED: Joi.boolean().default(true),
  AI_TIMEOUT_GLOBAL: Joi.number().min(1000).max(60000).default(15000),
  AI_RETRY_MAX: Joi.number().min(0).max(10).default(3),
  AI_RETRY_DELAY: Joi.number().min(100).max(10000).default(1000),
  
  // ===== QUOTAS & LIMITS =====
  AI_TENANT_MONTHLY_LIMIT: Joi.number().min(0).default(50.00),
  AI_GLOBAL_DAILY_LIMIT: Joi.number().min(0).default(500.00),
  AI_ALERT_THRESHOLD_1: Joi.number().min(0).max(100).default(80),
  AI_ALERT_THRESHOLD_2: Joi.number().min(0).max(100).default(95),
  
  // ===== HEALTH CHECK CONFIGURATION =====
  AI_HEALTH_CHECK_INTERVAL: Joi.number().min(60000).default(300000), // 5 minutes
  AI_HEALTH_CHECK_TIMEOUT: Joi.number().min(1000).max(10000).default(5000), // 5 seconds
  AI_HEALTH_CHECK_ENABLED: Joi.boolean().default(true),
  
  // ===== LOGGING & MONITORING =====
  AI_LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  AI_METRICS_ENABLED: Joi.boolean().default(true),
  AI_DEBUG_MODE: Joi.boolean().default(false),
});
