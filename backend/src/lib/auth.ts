import bcrypt from 'bcryptjs';
import { FastifyJWT } from '@fastify/jwt';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UserPayload;
    user: UserPayload;
  }
}




