import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { logger } from '../config/logger';

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    credits: number;
  };
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const { email, password, name } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name || null,
    },
  });

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      credits: user.credits,
    },
  };
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const { email, password } = data;

  logger.debug('Login attempt', { email });

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    logger.warn('Login failed: User not found', { email });
    throw new Error('Invalid credentials');
  }

  logger.debug('User found, verifying password', { userId: user.id, email });

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  logger.debug('Password verification result', { userId: user.id, isPasswordValid });

  if (!isPasswordValid) {
    logger.warn('Login failed: Invalid password', { email, userId: user.id });
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  logger.info('Login successful', { userId: user.id, email, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      credits: user.credits,
    },
  };
};

export const me = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    credits: user.credits,
    createdAt: user.createdAt,
  };
};