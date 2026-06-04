import { NextRequest } from "next/server";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");
  const type = searchParams.get("type");

  // Check the secret to prevent unauthorized preview access
  const previewSecret = process.env.SANITY_PREVIEW_SECRET || "mulhim_preview_secret";
  if (secret !== previewSecret) {
    return new Response("Invalid secret token", { status: 401 });
  }

  // Enable draft mode in Next.js
  const draft = await draftMode();
  draft.enable();

  // Redirect to the path for the document being previewed
  if (slug) {
    // Determine the route based on the document type
    switch (type) {
      case "program":
        redirect(`/programs/${slug}`);
      case "trip":
        redirect(`/trips/${slug}`);
      case "academy":
        redirect(`/academies/${slug}`);
      case "product":
        redirect(`/store/${slug}`);
      default:
        redirect("/");
    }
  }

  // Fallback to home page if no slug provided
  redirect("/");
}
