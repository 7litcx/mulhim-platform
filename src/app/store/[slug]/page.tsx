import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getProductBySlug, getProducts } from "@/sanity/lib/requests";
import { urlFor } from "@/sanity/lib/image";
import ProductClient from "./ProductClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({
    slug: p.slug.current,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "المنتج غير موجود | متجر ملهم",
    };
  }

  const ogImage = product.images?.[0]
    ? urlFor(product.images[0]).width(1200).height(630).url()
    : "/og-default.jpg";

  const cleanDescription = product.description 
    ? (product.description.length > 155 ? `${product.description.substring(0, 152)}...` : product.description)
    : `تسوق لشراء ${product.name} من متجر ملهم الإلكتروني واستكشف منتجاتنا المميزة.`;

  return {
    title: `${product.name} | متجر ملهم`,
    description: cleanDescription,
    keywords: ["ملهم", "متجر ملهم", product.name, product.category?.title || ""],
    openGraph: {
      title: product.name,
      description: cleanDescription,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  };
}


export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="text-right mb-8">
          <Link
            href="/store"
            className="inline-flex items-center gap-1 text-xs text-accent-yellow hover:underline"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            العودة إلى المتجر الإلكتروني
          </Link>
        </div>

        {/* Client Product Interactive Section */}
        <ProductClient product={product as any} />

      </div>
    </div>
  );
}
