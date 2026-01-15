// Luxury Wedding Invitation - Premium Minimal Design inspired by Kategora

"use client";

import { useState, useEffect } from "react";

interface RoyalWeddingTemplateProps {
  schema: any;
}

export default function RoyalWeddingTemplate({ schema }: RoyalWeddingTemplateProps) {
  const { hero, couple_story, venue, events, closing } = schema;
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const safeHero = hero || {};
  const safeVenue = venue || {};
  const safeEvents = events || [];
  const safeClosing = closing || { 
    message: "We look forward to celebrating with you!", 
    signature: "With love" 
  };

  // Generate placeholder hero images
  const defaultHeroImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1465014888286-e1c285276ab9?w=1200&h=800&fit=crop',
  ];

  // Use uploaded couple photo if available, otherwise use defaults
  const heroImages = safeHero.couple_photo 
    ? [safeHero.couple_photo, ...defaultHeroImages]
    : defaultHeroImages;

  // Scroll effect handler
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Caveat:wght@600;700&display=swap"
        rel="stylesheet"
      />
      
      <div className="bg-black text-white min-h-screen overflow-hidden">
        
        {/* Hero Section - Full Screen Image Carousel */}
        <section className="h-screen relative overflow-hidden flex items-center justify-center">
          {/* Background Images */}
          <div className="absolute inset-0">
            {heroImages.map((img, idx) => (
              <div
                key={idx}
                className="absolute inset-0 transition-opacity duration-1000 ease-out"
                style={{
                  backgroundImage: `url('${img}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: activeTab === idx ? 1 : 0,
                }}
              />
            ))}
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-4xl px-6 md:px-8">
            <p className="text-white/60 tracking-[0.25em] uppercase text-xs md:text-sm mb-8 animate-fade-in-up">
              {safeHero.greeting || "Together Forever"}
            </p>
            
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light tracking-tight mb-6 animate-fade-in-up-delay-1" style={{ fontFamily: "'Playfair Display'" }}>
              {safeHero.bride_name || "Bride"}
            </h1>

            <div className="flex items-center justify-center gap-8 md:gap-12 my-8 md:my-12">
              <div className="w-12 md:w-16 h-px bg-gradient-to-r from-transparent to-white/40"></div>
              <p className="text-2xl md:text-3xl font-light tracking-widest">&</p>
              <div className="w-12 md:w-16 h-px bg-gradient-to-l from-transparent to-white/40"></div>
            </div>

            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light tracking-tight mb-12 animate-fade-in-up-delay-2" style={{ fontFamily: "'Playfair Display'" }}>
              {safeHero.groom_name || "Groom"}
            </h1>

            <p className="text-xl md:text-2xl text-white/70 mb-12 font-light" style={{ fontFamily: "'Caveat'" }}>
              {safeHero.tagline || "Begin a beautiful journey together"}
            </p>

            <p className="text-lg md:text-2xl tracking-widest uppercase font-light animate-fade-in-up-delay-3">
              {new Date(safeHero.wedding_date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>

            {/* Image carousel indicators */}
            <div className="flex justify-center gap-3 mt-16">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    activeTab === idx ? 'bg-white w-8' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
            <div className="text-white/60 text-sm tracking-widest uppercase">Scroll</div>
          </div>
        </section>

        {/* Story Section */}
        {couple_story?.enabled && (
          <section className="h-screen flex items-center justify-center px-6 md:px-16 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}></div>
            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative z-10 max-w-3xl" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
              <p className="text-white/40 tracking-[0.25em] uppercase text-xs md:text-sm mb-8">Our Story</p>
              
              <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-12" style={{ fontFamily: "'Playfair Display'" }}>
                {couple_story.title}
              </h2>

              <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light max-w-2xl">
                {couple_story.content}
              </p>
            </div>
          </section>
        )}

        {/* Events Section */}
        <section className="min-h-screen py-20 md:py-32 px-6 md:px-16">
          <div className="max-w-6xl mx-auto">
            <p className="text-white/40 tracking-[0.25em] uppercase text-xs md:text-sm mb-8">Events</p>
            
            <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-20" style={{ fontFamily: "'Playfair Display'" }}>
              Wedding Celebrations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
              {safeEvents.map((event: any, idx: number) => (
                <div
                  key={idx}
                  className="group cursor-pointer relative"
                  style={{
                    animation: `fadeInUp 1s ease-out ${idx * 0.2}s both`
                  }}
                >
                  {/* Event Image Background */}
                  <div className="absolute inset-0 h-64 md:h-80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&h=400&fit=crop')`,
                        transform: 'scale(1.05)',
                        transition: 'transform 0.5s ease-out'
                      }}
                    ></div>
                    <div className="absolute inset-0 bg-black/40"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 pb-12 border-b border-white/10 group-hover:border-white/30 transition-colors duration-300">
                    <h3 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-6 group-hover:text-white/80 transition-colors" style={{ fontFamily: "'Playfair Display'" }}>
                      {event.name}
                    </h3>

                    <div className="space-y-4 text-white/60 text-sm md:text-base">
                      <div className="flex items-baseline gap-4">
                        <span className="w-16 tracking-widest uppercase font-light text-white/40">Date</span>
                        <span className="font-light">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-baseline gap-4">
                        <span className="w-16 tracking-widest uppercase font-light text-white/40">Time</span>
                        <span className="font-light">{event.time}</span>
                      </div>

                      <div className="flex items-baseline gap-4">
                        <span className="w-16 tracking-widest uppercase font-light text-white/40">Venue</span>
                        <span className="font-light">{event.venue}</span>
                      </div>

                      {event.dress_code && (
                        <div className="flex items-baseline gap-4">
                          <span className="w-16 tracking-widest uppercase font-light text-white/40">Dress</span>
                          <span className="font-light">{event.dress_code}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="mt-6 text-white/50 italic font-light">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Venue Section */}
        <section className="h-screen relative overflow-hidden flex items-end justify-start">
          {/* Background Image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1400&h=800&fit=crop')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

          {/* Content */}
          <div className="relative z-10 w-full p-8 md:p-16 pb-24">
            <p className="text-white/40 tracking-[0.25em] uppercase text-xs md:text-sm mb-8">The Venue</p>
            
            <h2 className="font-serif text-6xl md:text-7xl font-light tracking-tight mb-6" style={{ fontFamily: "'Playfair Display'" }}>
              {safeVenue.name || "Venue TBD"}
            </h2>

            <p className="text-white/70 text-lg md:text-xl max-w-xl font-light mb-12">
              {safeVenue.address || safeVenue.city || "Location"}
            </p>

            {safeVenue.google_maps_link && (
              <a
                href={safeVenue.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block tracking-widest uppercase text-sm font-light border border-white/40 px-8 py-4 hover:border-white hover:bg-white/5 transition-all duration-300"
              >
                View Location
              </a>
            )}
          </div>
        </section>

        {/* Closing Section */}
        <section className="h-screen flex items-center justify-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255,255,255,.03) 100px, rgba(255,255,255,.03) 200px)',
            }}></div>
          </div>

          <div className="relative z-10 text-center max-w-2xl px-6 md:px-8">
            <p className="text-white/40 tracking-[0.25em] uppercase text-xs md:text-sm mb-12">The Celebration</p>
            
            <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight mb-12" style={{ fontFamily: "'Playfair Display'" }}>
              {safeClosing.message}
            </h2>

            <p className="text-white/60 font-light" style={{ fontFamily: "'Caveat'", fontSize: '2.5rem' }}>
              {safeClosing.signature}
            </p>

            <div className="mt-16 space-y-4">
              <p className="text-white/40 text-sm tracking-widest uppercase">With gratitude</p>
              <div className="w-12 h-px bg-white/20 mx-auto"></div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-8 md:px-16">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-white/40 text-sm font-light">© {new Date().getFullYear()} {safeHero.bride_name} & {safeHero.groom_name}</p>
            <p className="text-white/40 text-sm font-light">Crafted with ScrollVite</p>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animate-fade-in-up-delay-1 {
          animation: fade-in-up 1s ease-out 0.2s both;
        }

        .animate-fade-in-up-delay-2 {
          animation: fade-in-up 1s ease-out 0.4s both;
        }

        .animate-fade-in-up-delay-3 {
          animation: fade-in-up 1s ease-out 0.6s both;
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
      `}} />
    </>
  );
}