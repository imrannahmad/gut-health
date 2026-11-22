import React from 'react';
import ProductEditor from '@/components/admin/ProductEditor';

export const metadata = {
  title: 'Edit Product | GutGlow Admin',
};

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return <ProductEditor productId={id} />;
}
