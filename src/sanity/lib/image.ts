import { createImageUrlBuilder } from "@sanity/image-url";
import { client } from "./client";

const builder = createImageUrlBuilder(client);

/**
 * Helper to generate optimized URLs for Sanity images.
 * Usage: urlFor(imageReference).width(800).url()
 */
export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
