// TypeScript types for hierarchical category system

export interface MainCategory {
  id: number;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface SubCategory {
  id: number;
  main_category_id: number;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
}

// Project interface with hierarchical categories
export interface Project {
  id: number;
  title: string;
  category?: string; // Old flat category field, kept for migration reference
  main_category_id: number | null;
  sub_category_id: number | null;
  description: string;
  link: string;
  image_url: string;
  color: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

// Project with joined category data (from Supabase select with foreign key joins)
export interface ProjectWithCategories extends Project {
  main_categories?: MainCategory | null;
  sub_categories?: SubCategory | null;
}

// For displaying categories with their relationships
export interface CategoryHierarchy {
  mainCategory: MainCategory;
  subCategories: SubCategory[];
}

// For category selection in forms
export interface CategorySelection {
  mainCategoryId: number | null;
  subCategoryId: number | null;
}

// Validation result for category operations
export interface CategoryValidation {
  isValid: boolean;
  error?: string;
}

// For checking if a category can be deleted
export interface CategoryDependencyCheck {
  canDelete: boolean;
  reason?: string;
  dependentCount?: number;
  dependentType?: 'projects' | 'subcategories';
}
