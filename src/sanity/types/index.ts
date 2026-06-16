

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface Slug {
  _type: "slug";
  current: string;
}

export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  shareImage?: SanityImage;
}

export interface Category {
  _id: string;
  _createdAt: string;
  title: string;
  slug: Slug;
  description?: string;
  images?: SanityImage[];
  price?: number;
  startDate?: string;
  endDate?: string;
  featured?: boolean;
  seo?: SeoFields;
}

export interface Program {
  _id: string;
  _type: "program";
  _createdAt: string;
  title: string;
  slug: Slug;
  target: "girls" | "boys" | "general";
  category: {
    _ref: string;
    title?: string;
    slug?: Slug;
  };
  description: string;
  content?: any[]; // Portable Text blocks
  images: SanityImage[];
  price?: number;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  location?: string;
  featured: boolean;
  seo?: SeoFields;
}

export interface Trip {
  _id: string;
  _type: "trip";
  _createdAt: string;
  title: string;
  slug: Slug;
  typeName: string;
  location: string;
  description: string;
  content?: any[];
  images: SanityImage[];
  price: number;
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  featured: boolean;
  registrationOpen?: boolean;
  seo?: SeoFields;
}

export interface Academy {
  _id: string;
  _type: "academy";
  _createdAt: string;
  title: string;
  slug: Slug;
  category: {
    _ref: string;
    title?: string;
    slug?: Slug;
  };
  description: string;
  content?: any[];
  images: SanityImage[];
  price: number;
  startDate: string;
  endDate: string;
  tutors?: Array<{
    name: string;
    role: string;
    avatar?: SanityImage;
  }>;
  featured: boolean;
  registrationOpen?: boolean;
  seo?: SeoFields;
}

export interface Product {
  _id: string;
  _type: "product";
  _createdAt: string;
  name: string;
  slug: Slug;
  category: {
    _ref: string;
    title?: string;
    slug?: Slug;
  };
  description: string;
  content?: any[];
  images: SanityImage[];
  price?: number;
  compareAtPrice?: number;
  isAvailable?: boolean;
  isNew: boolean;
  stock: number;
  sizes?: string[];
  colors?: string[];
  featured: boolean;
  seo?: SeoFields;
}

export interface HeroBanner {
  _id: string;
  _type: "heroBanner";
  _createdAt: string;
  title: string;
  slug: Slug;
  description: string;
  images: SanityImage[];
  videoUrl?: string;
  price?: number;
  startDate?: string;
  endDate?: string;
  link?: string;
  btnText: string;
  page?: string;
  order?: number;
  featured: boolean;
  seo?: SeoFields;
}

export interface FAQ {
  _id: string;
  _type: "faq";
  _createdAt: string;
  title: string; // Question
  slug: Slug;
  description: string; // Answer
  images?: SanityImage[];
  price?: number;
  startDate?: string;
  endDate?: string;
  featured: boolean;
  seo?: SeoFields;
}
