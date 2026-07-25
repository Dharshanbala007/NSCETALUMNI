import React, { useState, useEffect, useRef } from "react";
import { departments } from "../data/mockAlumni";
import { Star, Award, Building } from "lucide-react";
import { getImageUrl } from "../config";

export default function HallOfFame({ mockAlumni }) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Pick some top alumni for the Hall of Fame (e.g., founders, directors, senior engineers)
  const topAlumni = mockAlumni.filter(a => 
    a.current_role && (
      a.current_role.toLowerCase().includes('founder') || 
      a.current_role.toLowerCase().includes('ceo') || 
      a.current_role.toLowerCase().includes('director') ||
      a.current_role.toLowerCase().includes('senior')
    )
  ).slice(0, 5); // Limit to 5 for the carousel

  if (topAlumni.length === 0) return null;

  return (
    <section className="mb-12 relative w-full overflow-hidden py-12 bg-gradient-to-br from-bg to-surface border border-line rounded-md shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]"></div>
      
      <div className="relative z-10 text-center mb-10">
        <h2 className="font-display font-bold text-3xl text-ink tracking-tight flex items-center justify-center gap-3">
          <Award className="w-8 h-8 text-accent-gold" />
          Hall of Fame
          <Award className="w-8 h-8 text-accent-gold" />
        </h2>
        <p className="font-sans text-sm text-ink-muted mt-2 max-w-lg mx-auto">
          Celebrating our most distinguished alumni leading the industry across the globe.
        </p>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col items-center">
        {/* 3D Carousel Container */}
        <div 
          className="relative w-full max-w-sm h-96 [perspective:1200px]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {topAlumni.map((alumni, index) => {
            // Calculate offsets
            const offset = (index - activeIndex + topAlumni.length) % topAlumni.length;
            const isCenter = offset === 0;
            const isLeft = offset === topAlumni.length - 1;
            const isRight = offset === 1;

            let transform = "translateZ(-400px) scale(0.8) opacity-0";
            let zIndex = 0;
            
            if (isCenter) {
              transform = "translateZ(0px) scale(1) translateX(0%)";
              zIndex = 10;
            } else if (isLeft) {
              transform = "translateZ(-150px) scale(0.9) translateX(-60%) rotateY(15deg)";
              zIndex = 5;
            } else if (isRight) {
              transform = "translateZ(-150px) scale(0.9) translateX(60%) rotateY(-15deg)";
              zIndex = 5;
            }

            return (
              <div 
                key={alumni.id}
                onClick={() => setActiveIndex(index)}
                className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] cursor-pointer
                  ${isCenter ? 'opacity-100' : isLeft || isRight ? 'opacity-50 hover:opacity-80' : 'opacity-0 pointer-events-none'}`}
                style={{ 
                  transform, 
                  zIndex,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Profile Card */}
                <div className={`w-full h-full rounded-md p-6 flex flex-col items-center text-center backdrop-blur-md border 
                  ${isCenter ? 'bg-surface/80 border-accent-gold shadow-[0_0_30px_rgba(212,175,55,0.2)]' : 'bg-surface/50 border-line shadow-lg'}`}>
                  
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-gold/50 mx-auto">
                      {alumni.photo_url ? (
                        <img src={getImageUrl(alumni.photo_url)} alt={alumni.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-line flex items-center justify-center font-display font-bold text-2xl text-ink">
                          {alumni.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {isCenter && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent-gold text-surface text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-surface" /> Top Alumni
                      </div>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-xl text-ink mb-1">{alumni.name}</h3>
                  <p className="font-sans font-semibold text-sm text-accent-gold mb-3">{alumni.current_role}</p>
                  
                  <div className="flex items-center gap-2 text-xs font-sans text-ink-muted bg-bg/50 px-3 py-1.5 rounded-sm">
                    <Building className="w-3.5 h-3.5" />
                    <span>{alumni.current_company}</span>
                  </div>
                  
                  <p className="font-sans text-xs text-ink-muted mt-4 line-clamp-3 italic">
                    "{alumni.bio || `A proud alumnus of the ${alumni.department} department, batch of ${alumni.batch_year}, making waves in the industry.`}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Indicators */}
        <div className="flex gap-2 mt-8">
          {topAlumni.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-8 bg-accent-gold' : 'bg-line hover:bg-ink-muted'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
