export interface Category {
  id?: string,
  title: string;
  description: string;
  raw_image?: File,
  cover_image?: string;
  created_at: number;
  last_updated_at?: boolean;
  fields?: Array<{
    name: string;
    label: string;
    data_type: 'string' | 'html' | 'number' | 'boolean' | 'array' | 'media';
    mandatory?: boolean,
    predefined_value?: any;
    options?: string[];
  }>;
}