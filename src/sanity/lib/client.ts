import { createClient } from "next-sanity";
import { sanityConfig } from "../config";

// Read-only client using CDN in production for optimized, cached queries
export const client = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: sanityConfig.useCdn,
});

// Preview client with authentication token to bypass CDN and fetch drafts
export const previewClient = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: false, // Must be false to get fresh/draft content
  token: sanityConfig.token,
  perspective: "previewDrafts", // Fetch draft version if available
});

// Write client with write token to perform backend actions (e.g., automated registrations or feedback)
export const writeClient = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
