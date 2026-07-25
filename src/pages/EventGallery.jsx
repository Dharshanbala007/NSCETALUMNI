import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Filter } from "lucide-react";

export default function EventGallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("http://localhost:5000/api/event-gallery")
      .then(res => res.json())
      .then(data => {
        setGallery(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch gallery", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  // Extract unique categories
  const categories = ["All", ...new Set(gallery.map(item => item.category))];

  const filteredGallery = activeCategory === "All" 
    ? gallery 
    : gallery.filter(item => item.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-scroll-up">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-line pb-4 gap-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Alumni Event Gallery</h1>
          <p className="font-sans text-sm text-ink-muted mt-2 max-w-2xl">
            A visual retrospective of our vibrant campus events, alumni reunions, and technical fests.
          </p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-4 h-4 text-ink-muted mr-2" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeCategory === cat 
                  ? "bg-ink text-surface border-ink shadow-sm" 
                  : "bg-surface text-ink-muted border-line hover:border-accent-gold hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Masonry-style Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredGallery.map(item => (
          <div key={item.id} className="break-inside-avoid relative group rounded-md overflow-hidden bg-surface border border-line cursor-pointer shadow-sm tilt-card">
            <div className="relative aspect-auto">
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="inline-block bg-accent-gold text-surface text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm mb-2">
                  {item.category}
                </span>
                <h3 className="text-surface font-display font-bold text-xl leading-tight mb-1">{item.title}</h3>
                {item.event_date && (
                  <p className="text-surface/80 font-sans text-xs">
                    {new Date(item.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGallery.length === 0 && (
        <div className="text-center py-20 border border-line border-dashed rounded-md bg-surface/50">
          <ImageIcon className="w-8 h-8 text-line mx-auto mb-3" />
          <p className="font-sans font-semibold text-ink-muted">No images found for this category.</p>
        </div>
      )}
    </div>
  );
}
