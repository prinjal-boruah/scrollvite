// File: frontend/components/Navbar.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/lib/api";

type User = {
  role?: string;
};

// Custom Google Button Component (same as login page)
function CustomGoogleButton({ 
  onSuccess, 
  onError,
}: { 
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkForGoogleButton = () => {
      if (googleButtonRef.current) {
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
    
    checkForGoogleButton();
    const interval = setInterval(checkForGoogleButton, 100);
    setTimeout(() => clearInterval(interval), 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (googleButtonRef.current) {
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
          googleButton.click();
          if ((googleButton as any).onclick) {
            (googleButton as any).onclick();
          }
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
        className="scrollvite-google-button px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
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

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("access");
    const userRaw = localStorage.getItem("user");
    
    if (token && userRaw) {
      setUser(JSON.parse(userRaw));
      setIsLoggedIn(true);
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;

    try {
      const data = await googleLogin(idToken);
      localStorage.setItem("access", data.access);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Use window.location for full page reload to update state
      window.location.href = "/categories";
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    alert("Login failed. Please try again.");
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <nav className="bg-white border-b border-[#D4AF37] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
          <h1 
            className="font-serif text-xl sm:text-2xl font-medium text-gray-900 cursor-pointer" 
            style={{fontFamily: 'Playfair Display'}}
          >
            ScrollVite
          </h1>
          <div className="flex items-center gap-6 sm:gap-8"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-[#D4AF37] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
        <h1 
          className="font-serif text-xl sm:text-2xl font-medium text-gray-900 cursor-pointer" 
          style={{fontFamily: 'Playfair Display'}}
          onClick={() => {
            if (isLoggedIn) {
              router.push("/categories");
            } else {
              router.push("/login");
            }
          }}
        >
          ScrollVite
        </h1>
        <div className="flex items-center gap-6 sm:gap-8">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => router.push("/my-templates")}
                className="text-gray-700 hover:text-[#BFA37C] transition-colors text-sm sm:text-base font-light"
                style={{fontFamily: 'Playfair Display'}}
              >
                My Templates
              </button>
              
              {user?.role && (
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {user.role}
                </span>
              )}
              
              <button
                onClick={logout}
                className="text-gray-700 hover:text-[#BFA37C] transition-colors text-sm sm:text-base font-light"
              >
                Log out
              </button>
            </>
          ) : (
            <CustomGoogleButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          )}
        </div>
      </div>
    </nav>
  );
}