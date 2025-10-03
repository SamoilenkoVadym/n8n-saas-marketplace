import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  logger.debug('Generating JWT token', { userId: payload.id, email: payload.email, role: payload.role });
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
  logger.debug('JWT token generated successfully', { tokenLength: token.length });
  return token;
};

export const verifyToken = (token: string): JwtPayload => {
  logger.debug('Verifying JWT token', { tokenLength: token.length });
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  logger.debug('JWT token verified successfully', { userId: decoded.id, email: decoded.email });
  return decoded;
};