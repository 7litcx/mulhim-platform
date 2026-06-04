import { client, previewClient } from "./client";
import * as queries from "./queries";
import * as types from "../types";

// Helper to get fetch options based on environment
// In development, force 'no-store' to completely bypass Next.js caching.
// In production, use ISR (revalidate every 60s) with cache tags.
const getFetchOptions = (tags: string[]) => {
  if (process.env.NODE_ENV === "development") {
    return { cache: "no-store" as const };
  }
  return {
    next: { revalidate: 60, tags }
  };
};

/**
 * Returns the appropriate Sanity client depending on draft mode status.
 * Safe to call in both Server Components and static page rendering contexts.
 */
export async function getSanityClient(forcePreview?: boolean) {
  if (forcePreview) return previewClient;
  
  try {
    // Dynamically import draftMode to avoid static compilation errors in older next structures
    const { draftMode } = await import("next/headers");
    const isDraft = (await draftMode()).isEnabled;
    return isDraft ? previewClient : client;
  } catch {
    // Fallback to regular client if headers aren't available (e.g. client side or static builds)
    return client;
  }
}

// --- HERO BANNERS ---
export async function getHeroBanners(preview?: boolean): Promise<types.HeroBanner[]> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.heroBannersQuery, {}, getFetchOptions(["heroBanners"]));
}

// --- CATEGORIES ---
export async function getCategories(preview?: boolean): Promise<types.Category[]> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.categoriesQuery, {}, getFetchOptions(["categories"]));
}

export async function getCategoryBySlug(slug: string, preview?: boolean): Promise<types.Category | null> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.categoryBySlugQuery, { slug }, getFetchOptions([`category:${slug}`]));
}

// --- PROGRAMS ---
export async function getPrograms(preview?: boolean): Promise<types.Program[]> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.allProgramsQuery, {}, getFetchOptions(["programs"]));
}



export async function getProgramBySlug(slug: string, preview?: boolean): Promise<types.Program | null> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.programBySlugQuery, { slug }, getFetchOptions([`program:${slug}`]));
}



// --- TRIPS ---
export async function getTrips(preview?: boolean): Promise<types.Trip[]> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.allTripsQuery, {}, getFetchOptions(["trips"]));
}



export async function getTripBySlug(slug: string, preview?: boolean): Promise<types.Trip | null> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.tripBySlugQuery, { slug }, getFetchOptions([`trip:${slug}`]));
}

// --- ACADEMIES ---
export async function getAcademies(preview?: boolean): Promise<types.Academy[]> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.allAcademiesQuery, {}, getFetchOptions(["academies"]));
}

export async function getAcademyBySlug(slug: string, preview?: boolean): Promise<types.Academy | null> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.academyBySlugQuery, { slug }, getFetchOptions([`academy:${slug}`]));
}

// --- PRODUCTS ---
export async function getProducts(preview?: boolean): Promise<types.Product[]> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.allProductsQuery, {}, getFetchOptions(["products"]));
}



export async function getProductBySlug(slug: string, preview?: boolean): Promise<types.Product | null> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.productBySlugQuery, { slug }, getFetchOptions([`product:${slug}`]));
}

// --- TESTIMONIALS ---
export async function getFeaturedTestimonials(preview?: boolean): Promise<types.Testimonial[]> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.featuredTestimonialsQuery, {}, getFetchOptions(["testimonials"]));
}

// --- FAQS ---
export async function getFAQs(preview?: boolean): Promise<types.FAQ[]> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.allFAQsQuery, {}, getFetchOptions(["faqs"]));
}

export async function getFeaturedFAQs(preview?: boolean): Promise<types.FAQ[]> {
  const activeClient = await getSanityClient(preview);
  return activeClient.fetch(queries.featuredFAQsQuery, {}, getFetchOptions(["faqs", "featuredFAQs"]));
}
