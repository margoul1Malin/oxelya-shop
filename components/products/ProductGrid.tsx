'use client';

import { MotionDiv } from '../../components/ui/MotionDiv';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isNew: boolean;
  isCreated?: boolean;
  rating: number | null;
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product, index) => (
        <MotionDiv
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="h-full"
        >
          <ProductCard product={product} />
        </MotionDiv>
      ))}
    </div>
  );
} 