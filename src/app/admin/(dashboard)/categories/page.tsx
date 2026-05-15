import { CategoryManagementFeature } from "@/features/admin-content/components/CategoryManagementFeature";

export const metadata = {
  title: "Taxonomy - Admin Console",
  description: "Manage content categories and tags for Velvet Gallery",
};

export default function CategoriesPage() {
  return <CategoryManagementFeature />;
}
