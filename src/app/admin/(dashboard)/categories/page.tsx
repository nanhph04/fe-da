import { CategoryManagementFeature } from "@/features/admin-content/components/CategoryManagementFeature";

export const metadata = {
  title: "Categories - Admin Console",
  description: "Manage content categories for Velvet Gallery",
};

export default function CategoriesPage() {
  return <CategoryManagementFeature />;
}
