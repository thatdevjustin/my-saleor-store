"use client";

import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// GraphQL query: fetch first 12 products from default channel
const GET_PRODUCTS = gql`
  query GetProducts($channel: String!) {
    products(first: 12, channel: $channel) {
      edges {
        node {
          id
          name
          slug
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
    }
  }
`;

export default function HomePage() {
  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: { channel: "default-channel" },
  });

  if (loading) {
    return <p className="text-gray-500">Loading products...</p>;
  }
  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  const products = data?.products?.edges?.map((edge: any) => edge.node) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      {/* Responsive grid container */}
      <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="w-full">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                {product.thumbnail?.url ? (
                  <img
                    src={product.thumbnail.url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-t">
                    No image
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                  {product.name}
                </CardTitle>
                <p className="text-gray-700 mb-4">
                  {product.pricing?.priceRange?.start?.gross?.amount}{" "}
                  {product.pricing?.priceRange?.start?.gross?.currency}
                </p>
                <Link href={`/products/${product.slug}`}>
                  <Button variant="default">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      {/* Dummy element to force generation of responsive classes */}
      <div className="hidden sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"></div>
    </div>
  );
}
