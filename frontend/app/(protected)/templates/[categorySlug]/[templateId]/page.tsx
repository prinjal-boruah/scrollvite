"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  loadRazorpayScript, 
  createPaymentOrder, 
  openRazorpayCheckout, 
  verifyPayment 
} from "@/lib/payment";

type User = {
  role?: string;
};

export default function TemplatePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const [template, setTemplate] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [buying, setBuying] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    loadRazorpayScript().then((loaded) => {
      setRazorpayLoaded(loaded);
    });

    // Load user (client only)
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      setUser(JSON.parse(userRaw));
    }

    const token = localStorage.getItem("access");

    fetch(
      `http://127.0.0.1:8000/api/template-editor/${templateId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setTemplate(data);
      })
      .catch((err) => {
        console.error("Failed to load template:", err);
      });
  }, [templateId]);

  const handleBuy = async () => {
    if (!razorpayLoaded) {
      alert("Payment gateway not loaded. Please refresh and try again.");
      return;
    }

    setBuying(true);

    try {
      // Step 1: Create payment order
      const orderData = await createPaymentOrder(templateId);

      // Check if already purchased
      if (orderData.already_purchased) {
        alert(orderData.message);
        router.push(orderData.editor_url);
        return;
      }

      // Step 2: Open Razorpay checkout
      openRazorpayCheckout(
        orderData,
        async (response) => {
          // Step 3: Verify payment
          try {
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Success! Redirect to editor
            alert(verificationResult.message);
            router.push(verificationResult.editor_url);
          } catch (error) {
            alert("Payment verification failed. Please contact support.");
            setBuying(false);
          }
        },
        (error) => {
          // Payment failed or cancelled
          console.error("Payment failed:", error);
          alert("Payment was cancelled or failed. Please try again.");
          setBuying(false);
        }
      );
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to initiate payment. Please try again.");
      setBuying(false);
    }
  };

  if (!template) {
    return (
      <div className="p-8 text-gray-500">
        Loading template…
      </div>
    );
  }

  const { hero, venue, events } = template.schema;

  return (
    <main className="bg-[#fafafa] text-gray-800">
      {/* ADMIN ACTION: Edit Template Blueprint */}
      {user?.role === "SUPER_ADMIN" && (
        <div className="fixed top-20 right-8 z-50">
          <button
            onClick={() => router.push(`/admin/templates/${templateId}`)}
            className="bg-black text-white px-4 py-2 rounded shadow"
          >
            Edit Template (Admin)
          </button>
        </div>
      )}

      {/* BUYER ACTION: Purchase & Create Instance */}
      {user?.role === "BUYER" && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleBuy}
            disabled={buying || !razorpayLoaded}
            className="bg-black text-white px-6 py-3 rounded-full shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {buying 
              ? "Processing..." 
              : !razorpayLoaded 
              ? "Loading..." 
              : `Buy ₹${template.price || "..."}`}
          </button>
        </div>
      )}

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="tracking-widest text-sm uppercase mb-4">
          Wedding Invitation
        </p>

        <h1 className="text-4xl md:text-5xl font-serif mb-2">
          {hero.bride_name}
        </h1>

        <p className="text-xl my-2">&</p>

        <h1 className="text-4xl md:text-5xl font-serif mb-6">
          {hero.groom_name}
        </h1>

        <p className="italic text-gray-600 mb-4">
          {hero.subtitle}
        </p>

        <p className="font-medium tracking-wide">
          {hero.wedding_date}
        </p>
      </section>

      {/* VENUE */}
      <section className="py-20 px-6 text-center bg-white">
        <h2 className="text-2xl font-serif mb-4">
          Venue
        </h2>
        <p className="text-lg">{venue.name}</p>
        <p className="text-gray-600 mt-1">
          {venue.city}
        </p>
      </section>

      {/* EVENTS */}
      <section className="py-20 px-6 bg-[#fafafa]">
        <h2 className="text-2xl font-serif text-center mb-10">
          Wedding Events
        </h2>

        <div className="max-w-md mx-auto space-y-6">
          {events.map((event: any, idx: number) => (
            <div
              key={idx}
              className="border rounded-lg p-6 text-center bg-white"
            >
              <h3 className="text-lg font-medium mb-2">
                {event.name}
              </h3>
              <p className="text-gray-600">
                {event.date}
              </p>
              <p className="text-gray-600">
                {event.time}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}