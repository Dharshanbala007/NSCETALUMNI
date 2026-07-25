import React, { useState } from "react";
import { Search, Briefcase, Globe, Users, ArrowRight, Award, MapPin } from "lucide-react";
import { HorizontalThread } from "../components/ThreadConnector";
import HallOfFame from "../components/HallOfFame";
import { getImageUrl } from "../config";

export default function Home({ setView, setFilterSearch, setFilterDept, mockAlumni, currentUser, onRegisterClick }) {
  const [query, setQuery] = useState("");

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
    
    el.style.setProperty("--rx", `${angleX}deg`);
    el.style.setProperty("--ry", `${angleY}deg`);
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };

  const handleMouseLeave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const handleProfileClick = () => {
    if (!currentUser) {
      if (onRegisterClick) onRegisterClick();
    } else if (currentUser.role === "admin") {
      setView("admin");
    } else {
      setView("profile");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilterSearch(query);
    setView("directory");
  };

  // Get some interesting stats
  const totalAlumni = mockAlumni.filter(a => a.status === "approved").length;
  
  const uniqueCompanies = new Set(
    mockAlumni
      .filter(a => a.status === "approved" && a.current_company)
      .map(a => a.current_company)
  ).size;

  const uniqueCountries = new Set(
    mockAlumni
      .filter(a => a.status === "approved" && a.location?.country)
      .map(a => a.location.country)
  ).size;

  // Selected featured alumni (Arjun E, Priya ECE, Divya EEE)
  const featuredAlumni = mockAlumni.filter(a => ["a1", "a2", "a4"].includes(a.id));

  const statsItems = [
    { label: "Alumni Registered", value: totalAlumni, icon: "👤" },
    { label: "Companies Represented", value: uniqueCompanies, icon: "💼" },
    { label: "Global Countries", value: uniqueCountries, icon: "🌍" }
  ];

  const departmentsList = [
    { id: "Civil", name: "Civil Engineering" },
    { id: "Mech", name: "Mechanical Engineering" },
    { id: "CSE", name: "Computer Science & Eng." },
    { id: "ECE", name: "Electronics & Comm. Eng." },
    { id: "AI&DS", name: "Artificial Intelligence & Data Science" },
    { id: "IT", name: "Information Technology" },
    { id: "EEE", name: "Electrical & Electronics Eng." }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12 animate-fade-in">
      
      {/* Hero Section */}
      <header className="text-center space-y-5">
        <h1 className="font-display font-bold text-4xl md:text-5xl text-ink tracking-tight max-w-3xl mx-auto leading-tight">
          Find where your batch went.<br/>
          <span className="text-accent-gold">Find who can help you get there.</span>
        </h1>
        <p className="font-sans text-ink-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Welcome to the official NSCET Alumni Registry. A professional network tracing the continuous career threads of our graduates globally.
        </p>

        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative mt-6">
          <div className="flex items-center bg-surface border border-line focus-within:border-accent-gold focus-within:ring-2 focus-within:ring-accent-gold/15 transition-all rounded-sm p-1.5 pl-4 shadow-sm">
            <Search className="w-5 h-5 text-ink-muted shrink-0 mr-3" />
            <input
              type="text"
              placeholder="Search by name, company, skill, department, or city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-ink text-sm placeholder:text-ink-muted/70 py-2.5"
            />
            <button
              type="submit"
              className="bg-ink hover:bg-ink-muted text-surface hover:text-accent-gold px-5 py-2.5 rounded-xs font-sans text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2"
            >
              <span>Search</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </form>
      </header>

      {/* Hall of Fame */}
      <HallOfFame mockAlumni={mockAlumni} />

      {/* Browse by Department navigation */}
      <section className="space-y-6 pt-2">
        <div className="border-b border-line pb-3">
          <h2 className="font-display font-bold text-xl md:text-2xl text-ink">Browse by Department</h2>
          <p className="font-sans text-xs text-ink-muted mt-0.5">Click any degree program to explore its graduates registry.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {departmentsList.map((dept) => (
            <div
              key={dept.id}
              onClick={() => {
                setFilterDept(dept.id);
                setFilterSearch("");
                setView("directory");
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="tilt-card bg-surface border border-line hover:border-accent-emerald hover:shadow-xs p-5 rounded-sm cursor-pointer transition-all duration-150 group flex flex-col justify-between"
            >
              <div>
                <span className="font-display font-bold text-base text-accent-emerald group-hover:text-accent-gold transition-colors">
                  {dept.id}
                </span>
                <h3 className="font-sans font-bold text-xs text-ink-muted mt-1 leading-tight group-hover:text-ink transition-colors">
                  {dept.name}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-dashed border-line">
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-ink-muted group-hover:text-accent-emerald transition-colors">
                  View Registry
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent-emerald transition-all duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Thread Stat Strip */}
      <section className="py-2">
        <HorizontalThread items={statsItems} />
      </section>

      {/* Featured Spotlight Grid */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <h2 className="font-display font-bold text-xl md:text-2xl text-ink">Alumni Spotlight</h2>
          <button 
            onClick={() => setView("directory")}
            className="font-sans text-xs font-bold text-accent-emerald hover:text-accent-gold hover:underline flex items-center gap-1 group transition-colors"
          >
            <span>Browse Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredAlumni.map((alumnus) => (
            <div 
              key={alumnus.id} 
              onClick={() => {
                setView("profile");
                window.setSelectedAlumniId(alumnus.id);
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="tilt-card bg-surface border border-line hover:border-accent-emerald hover:shadow-xs p-6 rounded-sm cursor-pointer transition-all duration-150 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {alumnus.photo_url ? (
                    <img 
                      src={getImageUrl(alumnus.photo_url)} 
                      alt={alumnus.name}
                      className="w-12 h-12 rounded-full border border-line object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-line bg-ink text-surface flex items-center justify-center font-display font-semibold text-base">
                      {alumnus.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-base text-ink group-hover:text-accent-emerald transition-colors">
                      {alumnus.name}
                    </h3>
                    <div className="font-data text-xs text-accent-gold font-bold">
                      Batch of {alumnus.batch_year} · {alumnus.department}
                    </div>
                  </div>
                </div>

                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {alumnus.current_role ? `${alumnus.current_role} @` : "Open to opportunities"}
                </p>
                <p className="font-sans text-sm font-bold text-ink mt-0.5">
                  {alumnus.current_company || ""}
                </p>

                {alumnus.bio && (
                  <p className="font-sans text-xs text-ink-muted mt-3 line-clamp-3 leading-relaxed">
                    {alumnus.bio}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent-emerald" />
                  <span>{alumnus.location.city}, {alumnus.location.country}</span>
                </span>
                {alumnus.verified && (
                  <span className="bg-accent-emerald/10 text-accent-emerald font-sans font-bold text-[10px] px-2 py-0.5 rounded-sm flex items-center gap-0.5">
                    <Award className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reconnection CTA Banner */}
      <section className="bg-ink text-surface rounded-sm p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-accent-gold">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <span className="font-sans text-[10px] font-bold tracking-widest text-accent-gold uppercase bg-surface/10 px-3 py-1 rounded-full border border-accent-gold/20">
            For Alumni Only
          </span>
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-surface">
            Are you an NSCET Graduate?
          </h2>
          <p className="font-sans text-surface/80 text-sm leading-relaxed">
            Help us expand our map. Register your profile to let batchmates reach out, advertise referrals, or share advice with students.
          </p>
        </div>
        <button 
          onClick={handleProfileClick}
          className="bg-accent-gold hover:bg-accent-gold/90 text-ink px-6 py-3.5 rounded-xs font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-102 shrink-0 shadow-sm"
        >
          Add / Manage Profile
        </button>
      </section>
      
    </div>
  );
}
