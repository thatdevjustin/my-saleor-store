"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CartPage() {
  const { cartItems, removeFromCart } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between border-b pb-2"
            >
              <div className="flex items-center space-x-4">
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x {item.price} {item.currency}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => removeFromCart(item.productId)}
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="mt-4 text-xl font-semibold">
            Total: {total} {/* Add currency if needed */}
          </div>
          <Link href="/checkout">
            <Button variant="default" className="mt-4">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
