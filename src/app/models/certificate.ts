export interface Certificate {
  id: number;
  title: string;
  name: string;
  type: string;
  level: number;
  imageUrl: string;
}

export interface HeroFilter {
  name?: string;
  type?: string;
  level?: number;
}
