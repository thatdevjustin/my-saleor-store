"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

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
      variants {
        id
      }
    }
  }
`;

const CHECKOUT_CREATE = gql`
  mutation CheckoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        token
      }
      errors {
        field
        message
      }
    }
  }
`;

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug: string };
  const { addToCart, checkoutToken, setCheckoutToken } = useCart();
  const [creatingCheckout, setCreatingCheckout] = useState(false);

  const { loading, error, data } = useQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug, channel: "default-channel" },
  });

  const [checkoutCreate] = useMutation(CHECKOUT_CREATE);

  if (loading) return <p className="text-gray-500">Loading product...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  const product = data?.product;
  if (!product) return <p className="text-gray-700">No product found.</p>;

  // Ensure we have a valid variant id (using the first variant)
  const variantId = product.variants?.[0]?.id;
  if (!variantId) {
    return <p className="text-gray-700">No variant available for this product.</p>;
  }

  const handleAddToCart = async () => {
    // If there's no checkout token, create a new checkout
    if (!checkoutToken && !creatingCheckout) {
      setCreatingCheckout(true);
      try {
        const { data: checkoutData } = await checkoutCreate({
          variables: {
            input: {
              channel: "default-channel",
              lines: [
                {
                  variantId,
                  quantity: 1,
                },
              ],
            },
          },
        });
        if (
          checkoutData &&
          checkoutData.checkoutCreate &&
          checkoutData.checkoutCreate.checkout &&
          checkoutData.checkoutCreate.checkout.token
        ) {
          setCheckoutToken(checkoutData.checkoutCreate.checkout.token);
        } else {
          console.error("Checkout creation errors:", checkoutData.checkoutCreate.errors);
          alert("Failed to create checkout.");
          setCreatingCheckout(false);
          return;
        }
      } catch (err: any) {
        console.error("Checkout creation error:", err);
        alert("An error occurred while creating checkout.");
        setCreatingCheckout(false);
        return;
      }
      setCreatingCheckout(false);
    }

    // Now add the product to the cart
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.pricing?.priceRange?.start?.gross?.amount || 0,
      currency: product.pricing?.priceRange?.start?.gross?.currency || "",
      quantity: 1,
      thumbnail: product.thumbnail?.url,
    });

    alert("Product added to cart!");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
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
          <p className="text-gray-700 mb-4">
            {product.description || "No description available."}
          </p>
          <p className="text-gray-700 mb-4">
            Price: {product.pricing?.priceRange?.start?.gross?.amount}{" "}
            {product.pricing?.priceRange?.start?.gross?.currency}
          </p>
          <Button onClick={handleAddToCart} variant="default">
            {creatingCheckout ? "Creating Checkout..." : "Add to Cart"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
