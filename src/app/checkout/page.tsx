"use client";

import { useState, useEffect } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const GET_CHECKOUT = gql`
  query GetCheckout($token: UUID!) {
    checkout(token: $token) {
      id
      totalPrice {
        gross {
          amount
          currency
        }
      }
    }
  }
`;

const CHECKOUT_EMAIL_UPDATE = gql`
  mutation CheckoutEmailUpdate($checkoutId: ID!, $email: String!) {
    checkoutEmailUpdate(checkoutId: $checkoutId, email: $email) {
      checkout {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;

const CHECKOUT_BILLING_ADDRESS_UPDATE = gql`
  mutation CheckoutBillingAddressUpdate($checkoutId: ID!, $billingAddress: AddressInput!) {
    checkoutBillingAddressUpdate(checkoutId: $checkoutId, billingAddress: $billingAddress) {
      checkout {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;

const CREATE_PAYMENT = gql`
  mutation CheckoutPaymentCreate($checkoutId: ID!, $paymentInput: PaymentInput!) {
    checkoutPaymentCreate(checkoutId: $checkoutId, paymentInput: $paymentInput) {
      payment {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;

const CHECKOUT_COMPLETE = gql`
  mutation CheckoutComplete($checkoutId: ID!) {
    checkoutComplete(checkoutId: $checkoutId) {
      order {
        id
        number
      }
      errors {
        field
        message
      }
    }
  }
`;

export default function CheckoutPage() {
  const { checkoutToken, clearCart } = useCart();
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    streetAddress1: "",
    city: "",
    postalCode: "",
    country: "US",
    state: "",
  });

  const { data: checkoutData } = useQuery(GET_CHECKOUT, {
    variables: { token: checkoutToken },
    skip: !checkoutToken,
  });

  const [updateEmail] = useMutation(CHECKOUT_EMAIL_UPDATE);
  const [updateBillingAddress] = useMutation(CHECKOUT_BILLING_ADDRESS_UPDATE);
  const [createPayment] = useMutation(CREATE_PAYMENT);
  const [completeCheckout] = useMutation(CHECKOUT_COMPLETE);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async () => {
    if (!checkoutData?.checkout?.id) {
      alert("Checkout not found. Please add items to your cart.");
      return;
    }

    const checkoutId = checkoutData.checkout.id;
    const totalAmount = checkoutData.checkout.totalPrice.gross.amount;
    const currency = checkoutData.checkout.totalPrice.gross.currency;

    try {
      // Step 1: Update Email
      const emailResult = await updateEmail({
        variables: { checkoutId, email: formData.email },
      });
      if (emailResult.data?.checkoutEmailUpdate?.errors?.length) {
        throw new Error("Email errors: " + JSON.stringify(emailResult.data.checkoutEmailUpdate.errors));
      }

      // Step 2: Update Billing Address
      const billingResult = await updateBillingAddress({
        variables: {
          checkoutId,
          billingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            streetAddress1: formData.streetAddress1,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            countryArea: formData.state,
          },
        },
      });
      if (billingResult.data?.checkoutBillingAddressUpdate?.errors?.length) {
        throw new Error("Billing address errors: " + JSON.stringify(billingResult.data.checkoutBillingAddressUpdate.errors));
      }

      // Step 3: Create Payment
      const paymentResult = await createPayment({
        variables: {
          checkoutId,
          paymentInput: {
            gateway: "dummy",
            amount: totalAmount,
            token: "dummy-token",
          },
        },
      });
      if (paymentResult.data?.checkoutPaymentCreate?.errors?.length) {
        throw new Error("Payment errors: " + JSON.stringify(paymentResult.data.checkoutPaymentCreate.errors));
      }

      // Step 4: Complete Checkout
      const completeResult = await completeCheckout({ variables: { checkoutId } });
      if (completeResult.data?.checkoutComplete?.errors?.length) {
        throw new Error("Checkout errors: " + JSON.stringify(completeResult.data.checkoutComplete.errors));
      }

      setCheckoutCompleted(true);
      clearCart();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during checkout.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {checkoutCompleted ? (
        <div className="text-green-600">
          <p>Checkout completed successfully!</p>
          <Link href="/">
            <Button className="mt-4">Return Home</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="border p-2 w-full" required />
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="border p-2 w-full" required />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="border p-2 w-full" required />
          <input type="text" name="streetAddress1" placeholder="Street Address" value={formData.streetAddress1} onChange={handleChange} className="border p-2 w-full" required />
          <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="border p-2 w-full" required />
          <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} className="border p-2 w-full" required />
          <select name="country" value={formData.country} onChange={handleChange} className="border p-2 w-full">
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
          </select>
          <input type="text" name="state" placeholder="State / Province" value={formData.state} onChange={handleChange} className="border p-2 w-full" />

          <Button onClick={handleCheckout}>Complete Checkout</Button>
        </div>
      )}
    </div>
  );
}
