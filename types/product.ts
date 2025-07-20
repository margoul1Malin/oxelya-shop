import { ReactElement } from 'react';
import { LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  rating: number | null;
  isNew?: boolean;
  isCreated?: boolean;
  isService?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: ReactElement<LucideIcon>;
} 