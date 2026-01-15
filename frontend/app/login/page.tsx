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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fixed background images
  const backgroundImages = [
    'https://picsum.photos/1600/900?random=101',
    'https://picsum.photos/1600/900?random=102',
    'https://picsum.photos/1600/900?random=103',
    'https://picsum.photos/1600/900?random=104',
    'https://picsum.photos/1600/900?random=105',
    'https://picsum.photos/1600/900?random=106',
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const templateShowcases = [
    { title: "Floral Romance", description: "Delicate florals with soft pastels" },
    { title: "Modern Elegance", description: "Contemporary design with clean lines" },
    { title: "Royal Heritage", description: "Regal patterns and traditional elements" },
    { title: "Minimalist Chic", description: "Simple sophistication and timeless style" },
    { title: "Garden Dreams", description: "Nature-inspired with botanical elements" },
    { title: "Classic Luxury", description: "Timeless elegance and refined details" }
  ];

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
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Caveat:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      
      <main className="h-screen overflow-hidden relative">
        <style>{`
          .indian-circle {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .indian-circle::before {
            content: '';
            position: absolute;
            inset: 0;
            border: 2px solid currentColor;
            border-radius: 50%;
            opacity: 0.4;
          }

          .indian-circle::after {
            content: '';
            position: absolute;
            inset: 8px;
            border: 1px dashed currentColor;
            border-radius: 50%;
            opacity: 0.3;
          }

          .indian-circle-inner {
            position: absolute;
            width: 8px;
            height: 8px;
            background: currentColor;
            border-radius: 50%;
            opacity: 0.6;
          }

          /* Petal decorations */
          .indian-circle-petal {
            position: absolute;
            width: 4px;
            height: 12px;
            background: currentColor;
            border-radius: 50%;
            opacity: 0.4;
            left: 50%;
            top: -8px;
            transform: translateX(-50%);
          }

          .indian-circle-petal:nth-child(1) { transform: translateX(-50%) rotate(0deg); }
          .indian-circle-petal:nth-child(2) { transform: translateX(-50%) rotate(45deg); }
          .indian-circle-petal:nth-child(3) { transform: translateX(-50%) rotate(90deg); }
          .indian-circle-petal:nth-child(4) { transform: translateX(-50%) rotate(135deg); }
          .indian-circle-petal:nth-child(5) { transform: translateX(-50%) rotate(180deg); }
          .indian-circle-petal:nth-child(6) { transform: translateX(-50%) rotate(225deg); }
          .indian-circle-petal:nth-child(7) { transform: translateX(-50%) rotate(270deg); }
          .indian-circle-petal:nth-child(8) { transform: translateX(-50%) rotate(315deg); }

          /* Template Box - Inclined with small dotted border */
          .template-box {
            position: relative;
            border: 1px dotted rgba(255, 255, 255, 0.8);
            padding: 1.5rem 1rem;
            transform: rotate(-3deg) skewY(-2deg);
            transition: all 0.3s ease;
            overflow: visible;
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(2px);
          }

          .template-box:hover {
            border-color: rgba(255, 255, 255, 1);
            background: rgba(0, 0, 0, 0.2);
          }
        `}</style>

        {/* Background Image Container with Smooth Transition */}
        <div 
          suppressHydrationWarning
          className="absolute inset-0 opacity-80 transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: mounted 
              ? (hoveredIndex !== null && backgroundImages[hoveredIndex] 
                ? `url('${backgroundImages[hoveredIndex]}')`
                : `url('${backgroundImages[0] || ''}')`)
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Top Navigation - Overlaid on Background */}
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

        {/* Main Showcase Content */}
        <div className="relative z-10 w-full h-screen flex items-center justify-center px-4 sm:px-6 md:px-8">
          {/* Center Large Template Name - Breaking on new lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {hoveredIndex === null ? (
              // Default state - show big SCROLLVITE
              <div className="relative w-full h-full flex items-center justify-center">
                <h2 
                  className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white transition-opacity duration-500"
                  style={{
                    fontFamily: 'Caveat',
                    textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    fontWeight: '700',
                  }}
                >
                  SCROLLVITE
                </h2>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {/* Split template name across the screen */}
                {templateShowcases[hoveredIndex].title.split(' ').length > 1 ? (
                  // Multi-word titles - break them on separate lines
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-8 md:px-16">
                    <p 
                      className="text-sm sm:text-base md:text-lg text-white/70 mb-1 tracking-wider transition-opacity duration-500"
                      style={{
                        fontFamily: 'Playfair Display',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        letterSpacing: '0.15em',
                        fontWeight: '400',
                      }}
                    >
                      SCROLLVITE
                    </p>
                    <h2 
                      className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white transition-opacity duration-500"
                      style={{
                        fontFamily: 'Caveat',
                        textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                        letterSpacing: '0.05em',
                        lineHeight: '1',
                        fontWeight: '700',
                      }}
                    >
                      {templateShowcases[hoveredIndex].title.split(' ')[0].toUpperCase()}
                    </h2>
                    <h2 
                      className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white transition-opacity duration-500"
                      style={{
                        fontFamily: 'Caveat',
                        textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                        letterSpacing: '0.05em',
                        marginLeft: '8rem',
                        lineHeight: '1',
                        fontWeight: '700',
                      }}
                    >
                      {templateShowcases[hoveredIndex].title.split(' ')[1].toUpperCase()}
                    </h2>
                  </div>
                ) : (
                  // Single word - center it
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 
                      className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white transition-opacity duration-500"
                      style={{
                        fontFamily: 'Caveat',
                        textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                        letterSpacing: '0.05em',
                        textAlign: 'center',
                        fontWeight: '700',
                      }}
                    >
                      {templateShowcases[hoveredIndex].title.toUpperCase()}
                    </h2>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Showcase Items - Positioned Around the Screen */}
          <div className="w-full h-screen relative">
            {templateShowcases.map((template, index) => {
              // Position items in a circular arrangement
              const angle = (index * 60) * (Math.PI / 180); // 60 degrees apart
              const radius = 35; // percentage from center
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div
                  key={index}
                  suppressHydrationWarning
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="absolute cursor-pointer transition-all duration-500 group"
                  style={{
                    left: `calc(50% + ${x}vw)`,
                    top: `calc(50% + ${y}vh)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Text Content with Inclined Box */}
                  <div className={`template-box text-center transition-all duration-500 ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-70'
                  }`}>
                    <h3 
                      className="text-lg sm:text-xl text-white mb-2 transition-all duration-500"
                      style={{
                        fontFamily: 'Caveat, cursive',
                        fontWeight: '600',
                        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {template.title}
                    </h3>
                    <p 
                      className="text-xs sm:text-sm text-white/90 font-light leading-relaxed overflow-visible"
                      style={{
                        fontFamily: 'Caveat, cursive',
                        fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                      }}
                    >
                      {template.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Text Hint */}
        <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
          <p className="text-xs sm:text-sm text-white/70 font-light tracking-widest uppercase">
            Hover to explore
          </p>
        </div>
      </main>
    </>
  );
}