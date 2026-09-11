import type { Blog, BlogFormData } from "@/lib/types/blog";
import type {
  CategoryDependencyCheck,
  MainCategory,
  Project,
  ProjectWithCategories,
  SubCategory,
} from "@/lib/types/categories";
import type { FaqItem, SiteSettings, Testimonial } from "@/lib/site-settings";
import type { SitePage } from "@/lib/site-pages";

export type {
  Blog,
  BlogFormData,
  CategoryDependencyCheck,
  FaqItem,
  MainCategory,
  Project,
  ProjectWithCategories,
  SitePage,
  SiteSettings,
  SubCategory,
  Testimonial,
};

export type AdminEntity =
  | Blog
  | Project
  | MainCategory
  | SubCategory
  | FaqItem
  | Testimonial
  | SiteSettings
  | SitePage;

export type AdminMutationState = {
  isPending: boolean;
  error: Error | null;
};

export type AdminResult<T> = {
  data: T | null;
  error: Error | null;
};

export type CategoryCollections = {
  mainCategories: MainCategory[];
  subCategories: SubCategory[];
};

export type AdminQueryKey =
  | ["admin", "blogs"]
  | ["admin", "projects"]
  | ["admin", "categories"]
  | ["admin", "site-settings"]
  | ["admin", "testimonials"]
  | ["admin", "faqs"]
  | ["admin", "privacy"];
