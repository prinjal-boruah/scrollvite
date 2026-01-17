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
import { showToast } from "@/lib/toast";

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
  const [loading, setLoading] = useState(true);
  const [checkingOwnership, setCheckingOwnership] = useState(true);

  useEffect(() => {
    // Load Razorpay script
    loadRazorpayScript().then((loaded) => {
      setRazorpayLoaded(loaded);
      if (!loaded) {
        showToast.error("Payment gateway failed to load. Please refresh the page.");
      }
    });

    // Load user (client only)
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      setUser(JSON.parse(userRaw));
    }

    // Fetch template details
    setLoading(true);
    fetchTemplateDetail(templateId)
      .then((data) => {
        setTemplate(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load template:", err);
        showToast.error("Failed to load template. Please try again.");
        setLoading(false);
      });

    // Check if user already owns this template
    if (userRaw) {
      const parsedUser = JSON.parse(userRaw);
      if (parsedUser.role === "BUYER") {
        setCheckingOwnership(true);
        fetchMyTemplates()
          .then((templates) => {
            const owned = templates.find((t: any) => t.template_id === parseInt(templateId));
            if (owned && !owned.is_expired) {
              setAlreadyOwned(true);
              setOwnedInviteId(owned.invite_id);
            }
            setCheckingOwnership(false);
          })
          .catch((err) => {
            console.error("Failed to check ownership:", err);
            setCheckingOwnership(false);
          });
      } else {
        setCheckingOwnership(false);
      }
    } else {
      setCheckingOwnership(false);
    }
  }, [templateId]);

  const handleBuyOrEdit = async () => {
    // If already owned, go directly to editor
    if (alreadyOwned && ownedInviteId) {
      showToast.success("Opening your editor...");
      router.push(`/editor/${ownedInviteId}`);
      return;
    }

    // Check if Razorpay is loaded
    if (!razorpayLoaded) {
      showToast.error("Payment gateway not loaded. Please refresh and try again.");
      return;
    }

    setBuying(true);

    try {
      // Step 1: Create payment order
      const loadingToast = showToast.loading("Preparing payment...");
      const orderData = await createPaymentOrder(templateId);
      showToast.dismiss(loadingToast);

      // Check if already purchased (backend double-check)
      if (orderData.already_purchased) {
        showToast.success(orderData.message);
        router.push(orderData.editor_url);
        return;
      }

      // Step 2: Open Razorpay checkout
      openRazorpayCheckout(
        orderData,
        async (response) => {
          // Step 3: Verify payment
          const verifyingToast = showToast.loading("Verifying payment...");
          
          try {
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            showToast.dismiss(verifyingToast);
            showToast.success("Payment successful! 🎉");
            
            // Redirect after a brief moment to show success message
            setTimeout(() => {
              router.push(verificationResult.editor_url);
            }, 1000);
          } catch (error) {
            showToast.dismiss(verifyingToast);
            showToast.error("Payment verification failed. Please contact support.");
            setBuying(false);
          }
        },
        (error) => {
          // Payment failed or cancelled
          console.error("Payment failed:", error);
          showToast.error("Payment cancelled or failed. Please try again.");
          setBuying(false);
        }
      );
    } catch (error) {
      console.error("Payment initiation failed:", error);
      showToast.error("Failed to initiate payment. Please try again.");
      setBuying(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-[#8B4513]" style={{ fontFamily: 'Playfair Display' }}>
            Loading template...
          </p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f5f2]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Template not found</p>
          <button
            onClick={() => router.push("/categories")}
            className="gradient-button text-[#2C2416] px-6 py-3 rounded-full font-semibold"
          >
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  // Determine button text and state
  const getButtonText = () => {
    if (checkingOwnership) return "Checking...";
    if (alreadyOwned) return "Edit Your Invite";
    if (buying) return "Processing Payment...";
    if (!razorpayLoaded) return "Loading Payment...";
    return `Buy ₹${template.price || "..."}`;
  };

  const isButtonDisabled = checkingOwnership || (!alreadyOwned && (buying || !razorpayLoaded));

  return (
    <main className="relative">
      <style>{`
        .gradient-button {
          background: linear-gradient(135deg, #D4AF37 0%, #C49A2C 100%);
        }
        .gradient-button:hover:not(:disabled) {
          box-shadow: 0 12px 24px rgba(212, 175, 55, 0.4);
        }
        .gradient-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      {/* ADMIN ACTION: Edit Template Blueprint */}
      {user?.role === "SUPER_ADMIN" && (
        <div className="fixed top-20 right-8 z-50">
          <button
            onClick={() => router.push(`/admin/templates/${templateId}`)}
            className="gradient-button text-[#2C2416] px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition text-sm"
          >
            Edit Template
          </button>
        </div>
      )}

      {/* BUYER ACTION: Purchase or Edit */}
      {user?.role === "BUYER" && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleBuyOrEdit}
            disabled={isButtonDisabled}
            className="gradient-button text-[#2C2416] px-8 py-4 rounded-full shadow-lg font-semibold transition text-base flex items-center gap-3"
          >
            {buying && (
              <div className="animate-spin h-4 w-4 border-2 border-[#2C2416] border-t-transparent rounded-full"></div>
            )}
            <span>{getButtonText()}</span>
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