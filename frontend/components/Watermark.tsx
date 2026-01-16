// File: frontend/components/Watermark.tsx

"use client";

export default function Watermark() {
  return (
    <>
      <style>{`
        .watermark-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }

        .watermark-pattern {
          position: absolute;
          inset: -50%;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 200px,
            rgba(128, 128, 128, 0.08) 200px,
            rgba(128, 128, 128, 0.08) 400px
          );
          animation: watermarkSlide 20s linear infinite;
        }

        .watermark-text {
          position: absolute;
          font-family: 'Playfair Display', serif;
          font-size: 4rem;
          font-weight: 600;
          color: rgba(128, 128, 128, 0.15);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          white-space: nowrap;
          transform: rotate(-45deg);
          user-select: none;
        }

        @keyframes watermarkSlide {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        /* Responsive font sizes */
        @media (max-width: 768px) {
          .watermark-text {
            font-size: 2rem;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .watermark-text {
            font-size: 3rem;
          }
        }
      `}</style>

      <div className="watermark-container">
        <div className="watermark-pattern" />
        
        {/* Multiple watermark text instances for full coverage */}
        <div className="watermark-text" style={{ top: '10%', left: '10%' }}>
          SCROLLVITE
        </div>
        <div className="watermark-text" style={{ top: '10%', right: '10%' }}>
          SCROLLVITE
        </div>
        <div className="watermark-text" style={{ top: '30%', left: '30%' }}>
          PREVIEW
        </div>
        <div className="watermark-text" style={{ top: '30%', right: '30%' }}>
          PREVIEW
        </div>
        <div className="watermark-text" style={{ top: '50%', left: '15%' }}>
          SCROLLVITE
        </div>
        <div className="watermark-text" style={{ top: '50%', right: '15%' }}>
          SCROLLVITE
        </div>
        <div className="watermark-text" style={{ top: '70%', left: '25%' }}>
          PREVIEW
        </div>
        <div className="watermark-text" style={{ top: '70%', right: '25%' }}>
          PREVIEW
        </div>
        <div className="watermark-text" style={{ bottom: '10%', left: '20%' }}>
          SCROLLVITE
        </div>
        <div className="watermark-text" style={{ bottom: '10%', right: '20%' }}>
          SCROLLVITE
        </div>
      </div>
    </>
  );
}