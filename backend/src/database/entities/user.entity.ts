/**
 * Entité User mockée - TICKET-BACKEND-007
 * Entité temporaire pour résoudre les imports
 */

export class User {
  id: string;
  username: string;
  email: string;
  tenantId: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences: any;
}