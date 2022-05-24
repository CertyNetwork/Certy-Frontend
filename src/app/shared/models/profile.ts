export interface Profile {
  user_type: 'individual' | 'institution';
  avatar_url?: string;
  display_name: string;
  email: string;
  location: string;
  bio: string;
  kyc_status: string;
  kyc_data?: { [key: string]: string | number | boolean };
  created_at: number;
  last_updated_at?: boolean;
}