"use client";

import React from "react";
import { ApolloProvider } from "@apollo/client";
import client from "../../lib/apolloClient";
import { CartProvider } from "../context/CartContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={client}>
      <CartProvider>{children}</CartProvider>
    </ApolloProvider>
  );
}
