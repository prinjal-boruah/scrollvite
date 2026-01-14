"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TemplateRenderer from "@/components/TemplateRenderer";
import { fetchTemplateDetail, fetchMyTemplates } from "@/lib/api";
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
  const [alreadyOwned, setAlreadyOwned] = useState(false);
  const [ownedInviteId, setOwnedInviteId] = useState<string | null>(null);

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

    // Fetch template details
    fetchTemplateDetail(templateId)
      .then((data) => {
        setTemplate(data);
      })
      .catch((err) => {
        console.error("Failed to load template:", err);
      });

    // Check if user already owns this template
    if (userRaw) {
      const parsedUser = JSON.parse(userRaw);
      if (parsedUser.role === "BUYER") {
        fetchMyTemplates()
          .then((templates) => {
            const owned = templates.find((t: any) => t.template_id === parseInt(templateId));
            if (owned && !owned.is_expired) {
              setAlreadyOwned(true);
              setOwnedInviteId(owned.invite_id);
            }
          })
          .catch((err) => {
            console.error("Failed to check ownership:", err);
          });
      }
    }
  }, [templateId]);

  const handleBuyOrEdit = async () => {
    // If already owned, go directly to editor
    if (alreadyOwned && ownedInviteId) {
      router.push(`/editor/${ownedInviteId}`);
      return;
    }

    // Otherwise, proceed with purchase
    if (!razorpayLoaded) {
      alert("Payment gateway not loaded. Please refresh and try again.");
      return;
    }

    setBuying(true);

    try {
      // Step 1: Create payment order
      const orderData = await createPaymentOrder(templateId);

      // Check if already purchased (backend double-check)
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

  // Determine button text and state
  const getButtonText = () => {
    if (alreadyOwned) return "✏️ Edit Your Invite";
    if (buying) return "Processing...";
    if (!razorpayLoaded) return "Loading...";
    return `Buy ₹${template.price || "..."}`;
  };

  const isButtonDisabled = !alreadyOwned && (buying || !razorpayLoaded);

  return (
    <main className="relative">
      {/* ADMIN ACTION: Edit Template Blueprint */}
      {user?.role === "SUPER_ADMIN" && (
        <div className="fixed top-20 right-8 z-50">
          <button
            onClick={() => router.push(`/admin/templates/${templateId}`)}
            className="bg-black text-white px-4 py-2 rounded shadow-lg hover:bg-gray-800 transition"
          >
            ⚙️ Edit Template
          </button>
        </div>
      )}

      {/* BUYER ACTION: Purchase or Edit */}
      {user?.role === "BUYER" && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleBuyOrEdit}
            disabled={isButtonDisabled}
            className={`px-8 py-4 rounded-full shadow-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition ${
              alreadyOwned 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-black hover:bg-gray-800 text-white"
            }`}
          >
            {getButtonText()}
          </button>
        </div>
      )}

      {/* Template Preview - Renders the actual template */}
      <TemplateRenderer
        templateComponent={template.template_component}
        schema={template.schema}
      />
    </main>
  );
}