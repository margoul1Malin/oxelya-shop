import { notFound } from 'next/navigation';
import prisma from '../../../lib/prisma';
import ProductGrid from '../../../components/products/ProductGrid';
import { MotionDiv } from '../../../components/ui/MotionDiv';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

async function getCategoryWithProducts(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  return category;
}

export default async function CategoryPage({
  params: { category: categorySlug }
}: {
  params: { category: string }
}) {
  const category = await getCategoryWithProducts(categorySlug);

  if (!category) {
    notFound();
  }

  const IconComponent = Icons[category.icon as keyof typeof Icons] as LucideIcon;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            {IconComponent && (
              <IconComponent className="w-16 h-16 text-white" />
            )}
          </div>
          <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`}>
            {category.name}
          </h1>
          <p className="text-gray-400">{category.description}</p>
        </MotionDiv>

        <ProductGrid products={category.products} />
      </div>
    </div>
  );
} 