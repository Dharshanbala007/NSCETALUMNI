import React, { useState } from "react";
import { Search, Mail, ArrowRight, LayoutGrid, Award } from "lucide-react";
import { departments } from "../data/mockAlumni";
import API_BASE from "../config";

export default function Gallery({ setView, mockAlumni }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");

  const approvedAlumni = mockAlumni.filter(a => a.status === "approved");

  // Department options
  const depts = ["ALL", ...departments];

  // Filter logic
  const filteredAlumni = approvedAlumni.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.batch_year || "").toString().includes(searchTerm);
      
    const matchesDept = selectedDept === "ALL" || a.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  // 3D Tilt & Radial Spotlight Cursor tracking handler
  const handleMouseMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const angleX = (yc - y) / 12; // tilt angle around X axis
    const angleY = (x - xc) / 12; // tilt angle around Y axis
    
    el.style.transform = `perspective(600px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseLeave = (e) => {
    const el = e.currentTarget;
    el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Info */}
      <div className="border-b border-line pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Alumni Spotlight</h1>
          <p className="font-sans text-xs text-ink-muted mt-1">
            Browse our alumni registry visually. Showing names, batch years, and email coordinates.
          </p>
        </div>
        <div className="font-data text-xs text-ink-muted bg-surface border border-line px-3.5 py-1.5 rounded-sm self-start">
          Displaying <strong className="text-ink">{filteredAlumni.length}</strong> of {approvedAlumni.length} Graduates
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="w-full md:max-w-md relative bg-surface border border-line rounded-sm flex items-center px-3.5">
          <Search className="w-4.5 h-4.5 text-ink-muted mr-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or batch year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-ink text-xs py-3.5"
          />
        </div>

        {/* Department Filters */}
        <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {depts.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer
                ${selectedDept === dept
                  ? "bg-ink text-surface shadow-sm"
                  : "bg-surface text-ink-muted border border-line hover:border-ink hover:text-ink"
                }
              `}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Cards Grid */}
      {filteredAlumni.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAlumni.map((alumnus) => (
            <div
              key={alumnus.id}
              onClick={() => {
                window.setSelectedAlumniId(alumnus.id);
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="tilt-card bg-surface border border-line hover:border-accent-emerald hover:shadow-md p-6 rounded-sm cursor-pointer transition-all duration-150 group flex flex-col items-center text-center space-y-4"
            >
              {/* Large Profile Picture */}
              <div className="relative shrink-0 z-10">
                {alumnus.photo_url ? (
                  <img
                    src={alumnus.photo_url.startsWith('/') ? `${API_BASE}${alumnus.photo_url}` : alumnus.photo_url}
                    alt={alumnus.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-line group-hover:border-accent-emerald transition-colors shadow-xs"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-line bg-ink text-surface flex items-center justify-center font-display font-semibold text-2xl group-hover:border-accent-emerald transition-colors shadow-xs select-none">
                    {alumnus.name.charAt(0)}
                  </div>
                )}
                {alumnus.verified && (
                  <span className="absolute bottom-0 right-0 bg-accent-emerald text-surface rounded-full p-1 border border-surface shadow-xs flex items-center justify-center">
                    <Award className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between z-10">
                <div>
                  <h3 className="font-display font-bold text-base text-ink group-hover:text-accent-emerald transition-colors leading-tight">
                    {alumnus.name}
                  </h3>
                  <div className="font-data text-xs text-accent-gold font-bold uppercase tracking-wider mt-1">
                    Batch of {alumnus.batch_year}
                  </div>
                  <p className="font-sans text-[10px] font-bold text-ink-muted uppercase tracking-widest mt-0.5">
                    {alumnus.department} Department
                  </p>
                </div>

                <div className="pt-3 border-t border-line/60 mt-3 space-y-1.5">
                  {/* Email */}
                  {alumnus.email ? (
                    <a
                      href={`mailto:${alumnus.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-sans text-xs text-ink-muted hover:text-accent-emerald transition-colors flex items-center justify-center gap-1.5 truncate max-w-[180px] mx-auto font-medium"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0 text-accent-emerald" />
                      <span className="truncate">{alumnus.email}</span>
                    </a>
                  ) : (
                    <span className="font-sans text-xs text-ink-muted italic flex items-center justify-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-line" />
                      <span>Not Found</span>
                    </span>
                  )}
                </div>
              </div>

              {/* View Profile Action Link */}
              <div className="w-full pt-3 border-t border-dashed border-line flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted group-hover:text-accent-emerald transition-colors z-10">
                <span>View Full Profile</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-sm p-16 text-center space-y-3">
          <LayoutGrid className="w-12 h-12 text-line mx-auto" />
          <h3 className="font-display font-bold text-lg text-ink">No Graduates Found</h3>
          <p className="font-sans text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
            No approved alumni match your search filters. Try selecting a different department pill or clearing the search bar.
          </p>
        </div>
      )}

    </div>
  );
}
