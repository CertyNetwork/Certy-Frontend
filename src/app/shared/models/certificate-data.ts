export interface CertificateData {
  title: string;
  description: string;
  media: string;
  issued_at: number;
  transferred: boolean;
  properties?: {
    certification_authority_name: string;
    major: string;
    degree_title?: string;
    degree_classification: string;
    degree_conferral_date?: number;
    hash?: string;
  };
}