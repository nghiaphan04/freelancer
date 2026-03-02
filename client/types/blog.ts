export interface BlogArticle {
  id: number;
  slug?: string;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
}
