import { groq } from "next-sanity";

export const heroBannersQuery = groq`
  *[_type == "heroBanner" && featured == true] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    images,
    "videoUrl": video.asset->url,
    price,
    startDate,
    endDate,
    btnText,
    page,
    featured
  }
`;

// --- CATEGORIES ---
export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    images,
    price,
    featured,
    target
  }
`;

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    images,
    price,
    featured
  }
`;

// --- PROGRAMS ---
export const allProgramsQuery = groq`
  *[_type == "program"] | order(startDate desc) {
    _id,
    title,
    slug,
    target,
    category->{
      title,
      slug
    },
    description,
    images,
    price,
    startDate,
    endDate,
    location,
    featured
  }
`;

export const featuredProgramsQuery = groq`
  *[_type == "program" && featured == true] | order(startDate desc) {
    _id,
    title,
    slug,
    target,
    category->{
      title,
      slug
    },
    description,
    images,
    price,
    startDate,
    endDate,
    location,
    featured
  }
`;

export const programsByTargetQuery = groq`
  *[_type == "program" && target == $target] | order(startDate desc) {
    _id,
    title,
    slug,
    target,
    category->{
      title,
      slug
    },
    description,
    images,
    price,
    startDate,
    endDate,
    location,
    featured
  }
`;

export const programBySlugQuery = groq`
  *[_type == "program" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    target,
    category->{
      title,
      slug
    },
    description,
    content,
    images,
    price,
    startDate,
    endDate,
    registrationDeadline,
    location,
    featured
  }
`;

// --- EVENTS ---
export const allEventsQuery = groq`
  *[_type == "event"] | order(startDate desc) {
    _id,
    title,
    slug,
    category->{
      title,
      slug
    },
    description,
    images,
    price,
    startDate,
    endDate,
    location,
    featured
  }
`;

export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    category->{
      title,
      slug
    },
    description,
    content,
    images,
    price,
    startDate,
    endDate,
    location,
    featured
  }
`;

// --- TRIPS ---
export const allTripsQuery = groq`
  *[_type == "trip"] | order(startDate desc) {
    _id,
    title,
    slug,
    typeName,
    category->{
      title,
      slug
    },
    location,
    description,
    images,
    price,
    startDate,
    endDate,
    featured,
    registrationOpen
  }
`;

export const featuredTripsQuery = groq`
  *[_type == "trip" && featured == true] | order(startDate desc) {
    _id,
    title,
    slug,
    typeName,
    category->{
      title,
      slug
    },
    location,
    description,
    images,
    price,
    startDate,
    endDate,
    featured,
    registrationOpen
  }
`;

export const tripBySlugQuery = groq`
  *[_type == "trip" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    typeName,
    category->{
      title,
      slug
    },
    location,
    description,
    content,
    images,
    price,
    startDate,
    endDate,
    maxParticipants,
    featured,
    registrationOpen
  }
`;

// --- ACADEMIES ---
export const allAcademiesQuery = groq`
  *[_type == "academy"] | order(startDate desc) {
    _id,
    title,
    slug,
    category->{
      title,
      slug
    },
    description,
    images,
    price,
    startDate,
    endDate,
    tutors[] {
      name,
      role,
      avatar
    },
    featured,
    registrationOpen
  }
`;

export const academyBySlugQuery = groq`
  *[_type == "academy" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    category->{
      title,
      slug
    },
    description,
    content,
    images,
    price,
    startDate,
    endDate,
    tutors[] {
      name,
      role,
      avatar
    },
    featured,
    registrationOpen
  }
`;

// --- PRODUCTS ---
export const allProductsQuery = groq`
  *[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    slug,
    category->{
      title,
      slug
    },
    description,
    images,
    price,
    compareAtPrice,
    isNew,
    isAvailable,
    stock,
    sizes,
    colors,
    featured
  }
`;

export const featuredProductsQuery = groq`
  *[_type == "product" && featured == true] | order(_createdAt desc) {
    _id,
    name,
    slug,
    category->{
      title,
      slug
    },
    description,
    images,
    price,
    compareAtPrice,
    isNew,
    isAvailable,
    stock,
    sizes,
    colors,
    featured
  }
`;

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    category->{
      title,
      slug
    },
    description,
    content,
    images,
    price,
    compareAtPrice,
    isNew,
    isAvailable,
    stock,
    sizes,
    colors,
    featured
  }
`;

// --- TESTIMONIALS ---
export const featuredTestimonialsQuery = groq`
  *[_type == "testimonial" && featured != false] | order(_createdAt desc) {
    _id,
    title,
    slug,
    role,
    description,
    rating,
    featured
  }
`;

// --- FAQS ---
export const allFAQsQuery = groq`
  *[_type == "faq"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    images,
    price,
    featured
  }
`;

export const featuredFAQsQuery = groq`
  *[_type == "faq" && featured != false] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    images,
    price,
    featured
  }
`;
