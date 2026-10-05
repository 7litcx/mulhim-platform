import { createImageUrlBuilder } from "@sanity/image-url";
import { client } from "./client";

const builder = createImageUrlBuilder(client);

type ImageBuilder = ReturnType<typeof builder.image>;

/**
 * Checks if the source is a valid Sanity image reference or asset.
 */
export function isValidSanityImage(source: any): boolean {
  if (!source) return false;
  if (typeof source === "string") return source.trim().length > 0;
  if (typeof source === "object") {
    if (source.asset && (source.asset._ref || source.asset._id || source.asset.url)) {
      return true;
    }
    if (source._ref || source._id) {
      return true;
    }
  }
  return false;
}

const createFallbackBuilder = (fallbackUrl = "/placeholder.jpg"): ImageBuilder => {
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === "url" || prop === "toString") {
        return () => fallbackUrl;
      }
      return () => new Proxy({}, handler);
    },
  };
  return new Proxy({}, handler) as unknown as ImageBuilder;
};

/**
 * Helper to generate optimized URLs for Sanity images.
 * Safe against missing assets, incomplete drafts, or invalid references.
 * Usage: urlFor(imageReference).width(800).url()
 */
export function urlFor(source: any, fallbackUrl = "/placeholder.jpg"): ImageBuilder {
  if (!isValidSanityImage(source)) {
    return createFallbackBuilder(fallbackUrl);
  }

  try {
    const imgBuilder = builder.image(source);
    const originalUrl = imgBuilder.url.bind(imgBuilder);
    imgBuilder.url = () => {
      try {
        return originalUrl();
      } catch {
        return fallbackUrl;
      }
    };
    return imgBuilder;
  } catch {
    return createFallbackBuilder(fallbackUrl);
  }
}
