export interface Hero {
  id: number;
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
