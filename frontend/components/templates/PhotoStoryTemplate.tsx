// Photo Story Wedding Template - Modern Visual Storytelling Design

"use client";

import { useState, useEffect } from "react";

interface PhotoStoryTemplateProps {
  schema: any;
}

export default function PhotoStoryTemplate({ schema }: PhotoStoryTemplateProps) {
  const { hero, our_story, wedding_details, photo_gallery, rsvp } = schema;
  const [scrollY, setScrollY] = useState(0);

  // Safe defaults with proper null checks
  const safeHero = hero || {};
  const safeStory = our_story || { timeline: [] };
  const safeDetails = wedding_details || {};
  const safeGallery = photo_gallery || { photos: [] };
  const safeRsvp = rsvp || {};

  // Default placeholder images for gallery
  const defaultGalleryPhotos = [
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=800&fit=crop',
  ];

  // Use uploaded photos or defaults
  const galleryPhotos = safeGallery.photos && safeGallery.photos.length > 0 
    ? safeGallery.photos 
    : defaultGalleryPhotos;

  // Hero image - check multiple possible locations
  const heroImage = safeHero.couple_photo || safeHero.hero_image || safeHero.image || null;

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&family=Great+Vibes&display=swap"
        rel="stylesheet"
      />
      
      <div className="bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 min-h-screen">
        
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl"></div>

          {/* Hero Image Background (if uploaded) */}
          {heroImage && (
            <div className="absolute inset-0 opacity-20">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${heroImage}')` }}
              ></div>
            </div>
          )}

          <div className="relative z-10 text-center max-w-4xl">
            <div className="mb-8">
              <div className="inline-block">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="mx-auto mb-6 animate-pulse">
                  <path d="M30 50C30 50 10 40 10 25C10 15 15 10 22 10C26 10 30 13 30 13C30 13 34 10 38 10C45 10 50 15 50 25C50 40 30 50 30 50Z" 
                    fill="url(#gradient)" stroke="#E07A5F" strokeWidth="2"/>
                  <defs>
                    <linearGradient id="gradient" x1="10" y1="10" x2="50" y2="50">
                      <stop offset="0%" stopColor="#F4A261"/>
                      <stop offset="100%" stopColor="#E07A5F"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Display uploaded couple photo if available */}
            {heroImage && (
              <div className="mb-8">
                <img 
                  src={heroImage} 
                  alt="Couple" 
                  className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover mx-auto shadow-2xl border-4 border-white"
                />
              </div>
            )}

            <h1 
              className="text-7xl md:text-9xl mb-4 font-light tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#2C2416' }}
            >
              {safeHero.bride_name || "Sarah"}
            </h1>

            <p className="text-4xl md:text-5xl mb-4 font-light" style={{ fontFamily: "'Great Vibes', cursive", color: '#E07A5F' }}>
              &
            </p>

            <h1 
              className="text-7xl md:text-9xl mb-12 font-light tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#2C2416' }}
            >
              {safeHero.groom_name || "Michael"}
            </h1>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
              <p 
                className="text-xl md:text-2xl italic"
                style={{ fontFamily: "'Great Vibes', cursive", color: '#E07A5F' }}
              >
                {safeHero.tagline || "Two hearts, one beautiful journey"}
              </p>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
            </div>

            {/* Wedding Date */}
            {safeHero.wedding_date && (
              <p className="text-xl md:text-2xl tracking-wide uppercase font-light text-gray-700">
                {formatDate(safeHero.wedding_date)}
              </p>
            )}

            {/* Scroll indicator */}
            <div className="mt-20 animate-bounce">
              <svg width="30" height="50" viewBox="0 0 30 50" fill="none" className="mx-auto">
                <rect x="1" y="1" width="28" height="48" rx="14" stroke="#E07A5F" strokeWidth="2"/>
                <circle cx="15" cy="15" r="4" fill="#E07A5F">
                  <animate attributeName="cy" from="15" to="35" dur="1.5s" repeatCount="indefinite"/>
                </circle>
              </svg>
              <p className="text-sm tracking-widest mt-2" style={{ color: '#81654F' }}>SCROLL</p>
            </div>
          </div>
        </section>

        {/* Our Story Timeline */}
        {safeStory.timeline && safeStory.timeline.length > 0 && (
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <p className="text-sm tracking-widest mb-4" style={{ color: '#81654F' }}>OUR JOURNEY</p>
                <h2 
                  className="text-5xl md:text-6xl font-light"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: '#2C2416' }}
                >
                  Our Story
                </h2>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-rose-200 via-orange-200 to-pink-200"></div>

                {/* Timeline items */}
                {safeStory.timeline.map((item: any, idx: number) => (
                  <div key={idx} className={`relative mb-20 ${idx % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2'}`}>
                    <div className={`md:flex ${idx % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                      <div className={`md:w-1/2 ${idx % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                        <div 
                          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,250,245,0.95) 100%)',
                            animation: `fadeInUp 0.8s ease-out ${idx * 0.2}s both`
                          }}
                        >
                          <p 
                            className="text-2xl mb-2 font-light"
                            style={{ fontFamily: "'Great Vibes', cursive", color: '#E07A5F' }}
                          >
                            {item.season || item.date || ""}
                          </p>
                          <h3 
                            className="text-3xl mb-4 font-semibold"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#2C2416' }}
                          >
                            {item.title || ""}
                          </h3>
                          <p className="text-gray-600 leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                            {item.description || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline dot */}
                    <div 
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #F4A261 0%, #E07A5F 100%)' }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Wedding Details */}
        <section className="py-20 px-6 bg-white/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm tracking-widest mb-4" style={{ color: '#81654F' }}>SAVE THE DATE</p>
              <h2 
                className="text-5xl md:text-6xl font-light mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#2C2416' }}
              >
                Wedding Details
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Date & Time */}
              <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="mb-4">
                  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" className="mx-auto">
                    <rect x="8" y="12" width="34" height="30" rx="4" stroke="#E07A5F" strokeWidth="2" fill="none"/>
                    <line x1="8" y1="20" x2="42" y2="20" stroke="#E07A5F" strokeWidth="2"/>
                    <line x1="17" y1="8" x2="17" y2="16" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="33" y1="8" x2="33" y2="16" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2C2416' }}>Date & Time</h3>
                <p className="text-gray-600">
                  {safeDetails.date ? formatDate(safeDetails.date) : "June 15, 2024"}
                </p>
                <p className="text-gray-600">{safeDetails.time || "4:00 PM"}</p>
              </div>

              {/* Venue */}
              <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="mb-4">
                  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" className="mx-auto">
                    <path d="M25 5L10 15V40H18V28H32V40H40V15L25 5Z" stroke="#E07A5F" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2C2416' }}>Venue</h3>
                <p className="text-gray-600">{safeDetails.venue_name || "Grand Ballroom"}</p>
                <p className="text-gray-600 text-sm">{safeDetails.venue_address || "123 Main Street"}</p>
              </div>

              {/* Dress Code */}
              <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="mb-4">
                  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" className="mx-auto">
                    <path d="M25 8L15 14V18L20 28L18 42H32L30 28L35 18V14L25 8Z" stroke="#E07A5F" strokeWidth="2" fill="none"/>
                    <circle cx="25" cy="8" r="3" stroke="#E07A5F" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2C2416' }}>Dress Code</h3>
                <p className="text-gray-600">{safeDetails.dress_code || "Formal Attire"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm tracking-widest mb-4" style={{ color: '#81654F' }}>MEMORIES</p>
              <h2 
                className="text-5xl md:text-6xl font-light"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#2C2416' }}
              >
                Our Moments
              </h2>
            </div>

            {/* Masonry Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryPhotos.map((photo: string, idx: number) => (
                <div 
                  key={idx}
                  className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                    idx % 5 === 0 ? 'md:row-span-2' : ''
                  }`}
                  style={{ 
                    animation: `fadeIn 0.6s ease-out ${idx * 0.1}s both`
                  }}
                >
                  <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url('${photo}')`,
                      minHeight: idx % 5 === 0 ? '400px' : '200px'
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RSVP Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-rose-100 via-orange-100 to-pink-100">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-12">
              <p className="text-sm tracking-widest mb-4" style={{ color: '#81654F' }}>JOIN US</p>
              <h2 
                className="text-5xl md:text-6xl font-light mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#2C2416' }}
              >
                RSVP
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                {safeRsvp.message || "We would be honored to have you celebrate with us on our special day."}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                {safeRsvp.deadline && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#2C2416' }}>RSVP Deadline</h3>
                    <p className="text-gray-600">{formatDate(safeRsvp.deadline)}</p>
                  </div>
                )}

                {(safeRsvp.contact_email || safeRsvp.contact_phone) && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#2C2416' }}>Contact</h3>
                    {safeRsvp.contact_email && (
                      <p className="text-gray-600">{safeRsvp.contact_email}</p>
                    )}
                    {safeRsvp.contact_phone && (
                      <p className="text-gray-600">{safeRsvp.contact_phone}</p>
                    )}
                  </div>
                )}

                {safeRsvp.additional_info && (
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-gray-600 italic">{safeRsvp.additional_info}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Closing Message */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p 
              className="text-4xl md:text-5xl mb-6"
              style={{ fontFamily: "'Great Vibes', cursive", color: '#E07A5F' }}
            >
              We can't wait to celebrate with you!
            </p>
            <p className="text-gray-600 text-lg mb-12">
              {safeHero.bride_name || "Sarah"} & {safeHero.groom_name || "Michael"}
            </p>

            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-300"></div>
              <div className="w-2 h-2 rounded-full bg-orange-300"></div>
              <div className="w-2 h-2 rounded-full bg-pink-300"></div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-gray-200 bg-white/30">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-gray-500">Crafted with love using ScrollVite</p>
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}} />
    </>
  );
}