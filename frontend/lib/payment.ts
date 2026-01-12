// Razorpay payment utilities

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Load Razorpay script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Create payment order in backend
 */
export async function createPaymentOrder(templateId: string) {
  const token = localStorage.getItem("access");
  
  const res = await fetch(
    `${API_BASE_URL}/api/create-payment-order/${templateId}/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create payment order");
  }

  return res.json();
}

/**
 * Verify payment after Razorpay success
 */
export async function verifyPayment(paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const token = localStorage.getItem("access");

  const res = await fetch(`${API_BASE_URL}/api/verify-payment/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  });

  if (!res.ok) {
    throw new Error("Payment verification failed");
  }

  return res.json();
}

/**
 * Open Razorpay payment modal
 */
export function openRazorpayCheckout(
  orderData: any,
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) {
  const options = {
    key: orderData.razorpay_key_id,
    amount: orderData.amount * 100, // Convert to paise
    currency: orderData.currency,
    name: "ScrollVite",
    description: orderData.template_title,
    order_id: orderData.razorpay_order_id,
    handler: function (response: any) {
      onSuccess(response);
    },
    prefill: {
      name: "",
      email: "",
      contact: "",
    },
    theme: {
      color: "#000000",
    },
    modal: {
      ondismiss: function () {
        onFailure({ error: "Payment cancelled by user" });
      },
    },
  };

  // @ts-ignore - Razorpay is loaded dynamically
  const razorpay = new window.Razorpay(options);
  razorpay.open();
}