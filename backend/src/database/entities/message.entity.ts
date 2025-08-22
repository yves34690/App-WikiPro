/**
 * Entité Message mockée - TICKET-BACKEND-007
 * Entité temporaire pour résoudre les imports
 */

export class Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  tenantId: string;
  userId?: string;
  provider?: string;
  model?: string;
  tokens?: number;
  cost?: number;
  responseTime?: number;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}