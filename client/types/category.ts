export interface SubCategoryTag {
  id: number;
  name: string;
  isPopular: boolean;
  displayOrder: number;
}

export interface SubCategory {
  id: number;
  name: string;
  displayOrder: number;
  tags: SubCategoryTag[];
}

export interface Category {
  id: number;
  name: string;
  displayOrder: number;
  icon?: string;
  popularTags?: string[];  // Derived from isPopular tags
  subCategories?: SubCategory[];
}
