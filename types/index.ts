import { Prisma } from '@prisma/client';

// Types de base pour les interfaces
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface BaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  isNew: boolean;
  isCreated: boolean;
  rating: number | null;
  createdAt: string;
  category?: {
    name: string;
  };
}

export interface BaseMessage {
  id: string;
  subject: string;
  content: string;
  userId: string;
  status: 'READ' | 'UNREAD' | 'REPLIED';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export interface BaseOrder {
  id: string;
  userId: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product?: {
      name: string;
      image: string;
    };
  }>;
  user?: {
    name: string;
    email: string;
  };
}

// Types Prisma étendus
export type PrismaProduct = Prisma.ProductGetPayload<{
  include: { category: true }
}>;

export type PrismaCategory = Prisma.CategoryGetPayload<{}>;

export type PrismaOrder = Prisma.OrderGetPayload<{
  include: { 
    user: true;
    items: { include: { product: true } }
  }
}>;

export type PrismaUser = Prisma.UserGetPayload<{
  include: { orders: true }
}>;

// Types exportés pour l'utilisation dans l'application
export type User = BaseUser;
export type Product = BaseProduct;
export type Message = BaseMessage;
export type Order = BaseOrder; 