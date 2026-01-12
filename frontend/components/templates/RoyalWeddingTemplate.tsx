"use client";

interface RoyalWeddingTemplateProps {
  schema: any;
}

export default function RoyalWeddingTemplate({ schema }: RoyalWeddingTemplateProps) {
  const { hero, couple_story, venue, events, closing } = schema;

  // Safe fallbacks for optional fields
  const safeHero = hero || {};
  const safeVenue = venue || {};
  const safeEvents = events || [];
  const safeClosing = closing || { 
    message: "We look forward to celebrating with you!", 
    signature: "With love" 
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:wght@400;500&display=swap"
        rel="stylesheet"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#FFF5E6] text-[#2C2416]">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 py-16 relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)'
            }}></div>
          </div>

          <div className="relative z-10 max-w-4xl animate-fade-in-up">
            <div className="text-6xl text-[#D4AF37] mb-6 animate-sparkle">✦</div>
            
            <p className="text-sm uppercase tracking-widest text-[#8B4513] mb-8 font-medium">
              {safeHero.greeting || "You are invited to the wedding of"}
            </p>

            <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#2C2416] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              {safeHero.bride_name || "Bride"}
            </h1>
            
            <div className="text-5xl text-[#D4AF37] my-6 italic">&</div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#2C2416] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              {safeHero.groom_name || "Groom"}
            </h1>

            <p className="text-xl italic text-[#8B4513] mt-8 mb-6">
              {safeHero.tagline || "Two hearts, one soul"}
            </p>

            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto my-12"></div>

            <p className="text-2xl font-semibold tracking-wider">
              {safeHero.wedding_date ? new Date(safeHero.wedding_date).toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              }) : "Date TBD"}
            </p>

            <div className="text-6xl text-[#D4AF37] mt-6 animate-sparkle">✦</div>
          </div>
        </section>

        {/* Story Section */}
        {couple_story?.enabled && (
          <section className="max-w-4xl mx-auto px-6 py-16">
            <h2 className="font-serif text-4xl text-center mb-12 relative" style={{ fontFamily: "'Playfair Display', serif" }}>
              {couple_story.title}
              <span className="block w-16 h-1 bg-[#D4AF37] mx-auto mt-4"></span>
            </h2>
            
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
              <p className="text-lg leading-relaxed text-gray-700 text-center">
                {couple_story.content}
              </p>
            </div>
          </section>
        )}

        {/* Events Section */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-serif text-4xl text-center mb-12 relative" style={{ fontFamily: "'Playfair Display', serif" }}>
            Wedding Events
            <span className="block w-16 h-1 bg-[#D4AF37] mx-auto mt-4"></span>
          </h2>

          <div className="space-y-6">
            {safeEvents.map((event: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border-l-4 border-[#D4AF37] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <h3 className="font-serif text-2xl md:text-3xl text-[#2C2416] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {event.name}
                </h3>

                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-[#D4AF37] font-bold">📅</span>
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#D4AF37] font-bold">🕐</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#D4AF37] font-bold">📍</span>
                    <span>{event.venue}</span>
                  </div>
                  {event.dress_code && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#D4AF37] font-bold">👗</span>
                      <span>{event.dress_code}</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="mt-4 pt-4 border-t border-gray-200 italic text-gray-500">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Venue Section */}
        <section className="bg-gradient-to-br from-[#8B4513] to-[#D4AF37] text-white py-20 px-6 my-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-4xl mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              Venue
            </h2>
            
            <p className="text-3xl font-semibold mb-4">{safeVenue.name || "Venue TBD"}</p>
            <p className="text-xl opacity-90 mb-8">{safeVenue.address || safeVenue.city || ""}</p>
            
            {safeVenue.google_maps_link && (
              <a
                href={safeVenue.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-[#8B4513] px-8 py-3 rounded-full font-semibold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                View on Map
              </a>
            )}
          </div>
        </section>

        {/* Closing Section */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl text-center">
            <div className="text-4xl text-[#D4AF37] mb-6">✦</div>
            
            <p className="text-xl md:text-2xl text-[#2C2416] mb-6">
              {safeClosing.message}
            </p>
            
            <p className="font-serif text-xl md:text-2xl italic text-[#8B4513] whitespace-pre-line" style={{ fontFamily: "'Playfair Display', serif" }}>
              {safeClosing.signature}
            </p>
            
            <div className="text-4xl text-[#D4AF37] mt-6">✦</div>
          </div>
        </section>

        <div className="h-16"></div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
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

        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1.2s ease-out;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
      `}} />
    </>
  );
}