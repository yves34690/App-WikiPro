import * as Joi from 'joi';

export const validationSchema = Joi.object({
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.string().required(),
  
  // IA Providers API Keys
  GEMINI_API_KEY: Joi.string().optional(),
  OPENAI_API_KEY: Joi.string().optional(),
  ANTHROPIC_API_KEY: Joi.string().optional(),
  MISTRAL_API_KEY: Joi.string().optional(),

  // IA Configuration
  OPENAI_MODEL: Joi.string().default('gpt-4o'),
  GEMINI_MODEL: Joi.string().default('gemini-2.5-flash-002'),
  ANTHROPIC_MODEL: Joi.string().default('claude-3-5-sonnet-20241022'),
  MISTRAL_MODEL: Joi.string().default('mistral-large-latest'),

  // IA Parameters
  MAX_TOKENS: Joi.number().default(2048),
  TEMPERATURE: Joi.number().min(0).max(2).default(0.7),
});
