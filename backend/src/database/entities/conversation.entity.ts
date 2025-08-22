/**
 * Entité Conversation mockée - TICKET-BACKEND-007
 * Entité temporaire pour résoudre les imports
 */

export class Conversation {
  id: string;
  title: string;
  tenantId: string;
  userId: string;
  status: 'active' | 'archived' | 'deleted';
  messageCount: number;
  totalCost?: number;
  avgCostPerMessage?: number;
  primaryProvider?: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}