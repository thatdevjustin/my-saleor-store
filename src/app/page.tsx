"use client";

import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const GET_PRODUCTS = gql`
  query GetProducts($channel: String!, $first: Int!, $after: String) {
    products(first: $first, after: $after, channel: $channel) {
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export default function HomePage() {
  const firstCount = 12;
  const { loading, error, data, fetchMore } = useQuery(GET_PRODUCTS, {
    variables: { channel: "default-channel", first: firstCount, after: null },
    notifyOnNetworkStatusChange: true,
  });

  if (loading && !data) {
    return <p className="text-gray-500">Loading products...</p>;
  }
  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  // Extract products and pagination info from the query response.
  const products = data.products.edges.map((edge: any) => edge.node);
  const { hasNextPage, endCursor } = data.products.pageInfo;

  const handleLoadMore = () => {
    fetchMore({
      variables: {
        after: endCursor,
      },
      updateQuery: (prevResult: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult) return prevResult;
        return {
          products: {
            __typename: prevResult.products.__typename,
            edges: [
              ...prevResult.products.edges,
              ...fetchMoreResult.products.edges,
            ],
            pageInfo: fetchMoreResult.products.pageInfo,
          },
        };
      },
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      {/* Responsive grid: 1 column on mobile, 2 on small, 3 on medium, 4 on extra-large */}
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
      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleLoadMore} variant="default">
            Load More
          </Button>
        </div>
      )}
      {/* Dummy element to force generation of responsive classes */}
      <div className="hidden sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"></div>
    </div>
  );
}
