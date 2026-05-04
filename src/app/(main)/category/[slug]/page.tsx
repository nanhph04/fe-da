import { CategoryFeature } from "@/features/discovery";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryFeature slug={slug} />;
}