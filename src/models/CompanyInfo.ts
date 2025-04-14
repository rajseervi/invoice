export interface CompanyInfo {
  id?: string;
  name: string;
  shortName?: string;
  logo?: string;
  tagline?: string;
  description?: string;
  plan: {
    name: string;
    expiryDate: string | Date;
    maxUsers: number;
    currentUsers: number;
    isActive: boolean;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}