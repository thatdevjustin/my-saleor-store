"use client";

import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!, $channel: String!) {
    product(slug: $slug, channel: $channel) {
      id
      name
      description
      thumbnail {
        url
      }
      pricing {
        priceRange {
          start {
            gross {
              amount
              currency
            }
          }
        }
      }
    }
  }
`;

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug: string };

  // Query a single product by slug
  const { loading, error, data } = useQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug, channel: "default-channel" },
  });

  if (loading) {
    return <p className="text-gray-500">Loading product...</p>;
  }
  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  const product = data?.product;
  if (!product) {
    return <p className="text-gray-700">No product found for slug: {slug}</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader className="p-0">
          {product.thumbnail?.url ? (
            <img
              src={product.thumbnail.url}
              alt={product.name}
              className="w-full h-64 object-cover rounded-t"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-t">
              No image
            </div>
          )}
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold mb-4">{product.name}</CardTitle>
          <p className="text-gray-700 mb-4">{product.description || "No description."}</p>
          <p className="text-gray-700 mb-4">
            Price:{" "}
            {product.pricing?.priceRange?.start?.gross?.amount}{" "}
            {product.pricing?.priceRange?.start?.gross?.currency}
          </p>
          <Button variant="default">Add to Cart</Button>
        </CardContent>
      </Card>
    </div>
  );
}
