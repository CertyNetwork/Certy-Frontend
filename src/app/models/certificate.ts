export interface Certificate {
  id: number;
  title: string;
  description: string;
  name?: string;
  type?: string;
  level?: number;
  imageUrl: string;
  issued_at: number;
}

export interface HeroFilter {
  name?: string;
  type?: string;
  level?: number;
}
