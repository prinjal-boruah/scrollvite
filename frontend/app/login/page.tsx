"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { googleLogin } from "@/lib/api";
import { useState, useRef, useEffect } from "react";

// Custom Google Button Component
function CustomGoogleButton({ 
  onSuccess, 
  onError, 
  size = "medium",
  className = "" 
}: { 
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
  size?: "small" | "medium" | "large";
  className?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find and hide the Google button
    const checkForGoogleButton = () => {
      if (googleButtonRef.current) {
        // Try multiple selectors to find the Google button
        const selectors = [
          'button',
          'div[role="button"]',
          'iframe + div button',
          '[data-testid*="google"]',
          'div[id*="google-signin"] button'
        ];
        
        for (const selector of selectors) {
          const googleButton = googleButtonRef.current.querySelector(selector) as HTMLElement;
          if (googleButton) {
            googleButton.style.display = 'none';
            googleButton.style.visibility = 'hidden';
            googleButton.style.position = 'absolute';
            googleButton.style.opacity = '0';
            googleButton.style.pointerEvents = 'none';
            break;
          }
        }
      }
    };
    
    // Check immediately and then periodically
    checkForGoogleButton();
    const interval = setInterval(checkForGoogleButton, 100);
    setTimeout(() => clearInterval(interval), 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (googleButtonRef.current) {
      // Try multiple selectors to find and click the Google button
      const selectors = [
        'button',
        'div[role="button"]',
        'iframe + div button',
        '[data-testid*="google"]',
        'div[id*="google-signin"] button'
      ];
      
      for (const selector of selectors) {
        const googleButton = googleButtonRef.current.querySelector(selector) as HTMLElement;
        if (googleButton) {
          // Try multiple click methods
          googleButton.click();
          if ((googleButton as any).onclick) {
            (googleButton as any).onclick();
          }
          // Also try dispatching events
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          googleButton.dispatchEvent(clickEvent);
          break;
        }
      }
    }
  };

  const sizeClasses = {
    small: "px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm",
    medium: "px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base",
    large: "px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg"
  };

  return (
    <div className="relative">
      <div ref={googleButtonRef} className="absolute opacity-0 pointer-events-none">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          useOneTap={false}
        />
      </div>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`scrollvite-google-button ${sizeClasses[size]} ${className} ${size === "large" ? "scrollvite-google-button-large" : ""}`}
      >
        <svg 
          width={size === "large" ? "20" : size === "small" ? "16" : "18"} 
          height={size === "large" ? "20" : size === "small" ? "16" : "18"} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
          {/* Black Google G logo */}
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#000"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#000"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#000"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#000"/>
        </svg>
        <span className="whitespace-nowrap text-black">Sign in with Google</span>
      </button>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    const idToken = credentialResponse.credential;

    try {
      const data = await googleLogin(idToken);

      localStorage.setItem("access", data.access);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/categories");
    } catch (error) {
      alert("Login failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert("Login failed. Please try again.");
    setLoading(false);
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      
      <main className="h-screen overflow-hidden">
        {/* Hero Section - Full Screen Background */}
        <div className="relative w-full h-screen flex flex-col items-center justify-between overflow-hidden">
          {/* Background with blur effect - Navratri celebration */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://img.freepik.com/free-photo/celebration-navratri-deity_23-2151219992.jpg?w=1060')",
              filter: "blur(50px)",
              transform: "scale(1.15)",
            }}
          />
          
          {/* Overlay gradient - champagne gold tint with soft fade */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#BFA37C]/25 via-[#BFA37C]/15 to-[#363636]/10" />
          
          {/* Top Navigation - Overlaid on Image */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-3.5">
            <div className="font-serif text-lg sm:text-xl md:text-2xl font-medium text-white tracking-tight" style={{fontFamily: 'Playfair Display'}}>
              ScrollVite
            </div>
            <div className="flex items-center gap-6 sm:gap-8">
              <a href="#" className="text-white hover:text-[#D4AF37] transition-colors text-sm sm:text-base font-light cursor-pointer" style={{fontFamily: 'Playfair Display'}}>
                Templates
              </a>
              <CustomGoogleButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="small"
              />
            </div>
          </div>
          
          {/* Main Content - Centered */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 text-center flex-1">
            {/* Tagline */}
            <p className="text-xs sm:text-sm tracking-[0.25em] text-[#BFA37C] mb-3 sm:mb-4 md:mb-5 font-light uppercase" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'}}>
              Elegant Modern Classic Luxe
            </p>
            
            {/* Main Title */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.15] mb-4 sm:mb-5 md:mb-6 text-white" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'}}>
              Begin Your Forever,
              <br />
              Beautifully
            </h1>
            
            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-[#BFA37C] max-w-2xl mb-6 sm:mb-8 md:mb-10 font-light leading-relaxed" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'}}>
              A premium digital wedding invitation platform, high and champagne gold pair.
            </p>
            
            {/* CTA Button */}
            <div className="w-full sm:w-auto">
              <CustomGoogleButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                className="shadow-sm hover:shadow-md w-full sm:w-auto"
              />
            </div>
          </div>

          {/* Terms Text - At Bottom of Image */}
          <div className="relative z-10 w-full pb-4 sm:pb-6 px-4">
            <p className="text-xs sm:text-sm text-[#BFA37C] text-center leading-relaxed max-w-4xl mx-auto" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'}}>
              By continuing, you agree to our{" "}
              <span className="underline cursor-pointer hover:text-[#D4AF37] transition-colors">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="underline cursor-pointer hover:text-[#D4AF37] transition-colors">
                Privacy Policy
              </span>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}