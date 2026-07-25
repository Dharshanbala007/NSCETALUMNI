import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, MapPin, Award, CheckCircle2, CircleOff, X, Briefcase } from "lucide-react";
import { departments } from "../data/mockAlumni";
import { getImageUrl } from "../config";

export default function Directory({ setView, filterSearch, setFilterSearch, filterDept, setFilterDept, mockAlumni }) {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [showOnlyPlaced, setShowOnlyPlaced] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync with global home page search query
  useEffect(() => {
    if (filterSearch !== undefined) {
      setSearch(filterSearch);
    }
  }, [filterSearch]);

  // Sync with global department filter
  useEffect(() => {
    if (filterDept) {
      setSelectedDept([filterDept]);
      setFilterDept(""); // Clear global indicator after applying
    }
  }, [filterDept, setFilterDept]);

  const clearFilters = () => {
    setSearch("");
    setSelectedDept([]);
    setSelectedBatch("All");
    setSelectedCompany("All");
    setSelectedCountry("All");
    setOnlyVerified(false);
    setShowOnlyPlaced(false);
    setFilterSearch("");
  };

  // Compile lists for dropdowns
  const approvedAlumni = mockAlumni.filter(a => a.status === "approved");
  
  const allBatches = [...new Set(approvedAlumni.map(a => a.batch_year))].sort((a, b) => b - a);
  
  const allCompanies = [...new Set(
    approvedAlumni
      .map(a => a.current_company)
      .filter(c => c !== null && c !== undefined && c !== "")
  )].sort();

  const allCountries = [...new Set(
    approvedAlumni
      .map(a => a.location?.country)
      .filter(c => c !== null && c !== undefined && c !== "")
  )].sort();

  // Filter Logic
  const filteredAlumni = approvedAlumni.filter((alumnus) => {
    // 1. Text Search (matches name, current role, company, skills, location, bio)
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      const nameMatch = (alumnus.name || "").toLowerCase().includes(q);
      const companyMatch = (alumnus.current_company || "").toLowerCase().includes(q);
      const roleMatch = (alumnus.current_role || "").toLowerCase().includes(q);
      const bioMatch = (alumnus.bio || "").toLowerCase().includes(q);
      const cityMatch = (alumnus.location?.city || "").toLowerCase().includes(q);
      const countryMatch = (alumnus.location?.country || "").toLowerCase().includes(q);
      const skillsMatch = alumnus.skills?.some(s => (s || "").toLowerCase().includes(q));
      
      if (!nameMatch && !companyMatch && !roleMatch && !bioMatch && !cityMatch && !countryMatch && !skillsMatch) {
        return false;
      }
    }

    // 2. Department
    if (selectedDept.length > 0 && !selectedDept.includes(alumnus.department)) {
      return false;
    }

    // 3. Batch
    if (selectedBatch !== "All" && alumnus.batch_year !== parseInt(selectedBatch)) {
      return false;
    }

    // 4. Company
    if (selectedCompany !== "All" && alumnus.current_company !== selectedCompany) {
      return false;
    }

    // 5. Country
    if (selectedCountry !== "All" && alumnus.location?.country !== selectedCountry) {
      return false;
    }

    // 6. Verified
    if (onlyVerified && !alumnus.verified) {
      return false;
    }

    // 7. Placed
    if (showOnlyPlaced && !alumnus.placed) {
      return false;
    }

    return true;
  });

  const handleDeptToggle = (dept) => {
    if (selectedDept.includes(dept)) {
      setSelectedDept(selectedDept.filter(d => d !== dept));
    } else {
      setSelectedDept([...selectedDept, dept]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Directory Page Header */}
      <header className="border-b border-line pb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Alumni Directory</h1>
          <p className="font-sans text-xs text-ink-muted mt-1">
            Browse and filter through our verified network of graduates.
          </p>
        </div>
        
        {/* Active Filters count tag */}
        <div className="font-data text-xs text-ink bg-surface border border-line px-3 py-1 rounded-sm flex items-center gap-1.5 self-start">
          <span className="w-2 h-2 rounded-full bg-accent-emerald"></span>
          <span>Showing <strong className="text-accent-gold">{filteredAlumni.length}</strong> of {approvedAlumni.length} Registry Records</span>
        </div>
      </header>

      {/* Main Grid: Filters Left + Cards Right */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="font-sans font-bold text-sm text-ink uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-accent-gold" />
              <span>Filters</span>
            </span>
            {(search || selectedDept.length > 0 || selectedBatch !== "All" || selectedCompany !== "All" || selectedCountry !== "All" || onlyVerified) && (
              <button 
                onClick={clearFilters}
                className="font-sans text-xs text-accent-emerald hover:text-accent-gold hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="space-y-3">
            <h3 className="font-sans font-bold text-xs text-ink-muted uppercase tracking-wider">Department</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {departments.map((dept) => (
                <label key={dept} className="flex items-center gap-2.5 text-xs text-ink cursor-pointer hover:text-accent-gold">
                  <input
                    type="checkbox"
                    checked={selectedDept.includes(dept)}
                    onChange={() => handleDeptToggle(dept)}
                    className="rounded-sm border-line text-accent-emerald focus:ring-accent-emerald/40 w-4 h-4"
                  />
                  <span>{dept}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Batch Year Filter */}
          <div className="space-y-3">
            <h3 className="font-sans font-bold text-xs text-ink-muted uppercase tracking-wider">Batch Year</h3>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full bg-surface border border-line rounded-sm px-3 py-2 text-xs text-ink outline-none focus:border-accent-gold"
            >
              <option value="All">All Batches</option>
              {allBatches.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div className="space-y-3">
            <h3 className="font-sans font-bold text-xs text-ink-muted uppercase tracking-wider">Current Company</h3>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-surface border border-line rounded-sm px-3 py-2 text-xs text-ink outline-none focus:border-accent-gold"
            >
              <option value="All">All Companies</option>
              {allCompanies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div className="space-y-3">
            <h3 className="font-sans font-bold text-xs text-ink-muted uppercase tracking-wider">Country</h3>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-surface border border-line rounded-sm px-3 py-2 text-xs text-ink outline-none focus:border-accent-gold"
            >
              <option value="All">All Countries</option>
              {allCountries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Verification & Placement Status */}
          <div className="pt-2 border-t border-line space-y-2">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-ink cursor-pointer hover:text-accent-gold">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="rounded-sm border-line text-accent-emerald focus:ring-accent-emerald/40 w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-accent-emerald" />
                <span>Only show Verified Profiles</span>
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-ink cursor-pointer hover:text-accent-gold">
              <input
                type="checkbox"
                checked={showOnlyPlaced}
                onChange={(e) => setShowOnlyPlaced(e.target.checked)}
                className="rounded-sm border-line text-accent-emerald focus:ring-accent-emerald/40 w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-accent-emerald" />
                <span>Only Placed / Employed</span>
              </span>
            </label>
          </div>
        </aside>

        {/* Mobile Filters Header & Trigger */}
        <div className="lg:hidden flex items-center justify-between border border-line bg-surface p-3.5 rounded-sm">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="font-sans font-bold text-xs text-ink uppercase tracking-wider flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-accent-gold" />
            <span>Filter List ({filteredAlumni.length} Results)</span>
          </button>
          
          {showMobileFilters && (
            <button 
              onClick={() => setShowMobileFilters(false)}
              className="text-ink hover:text-accent-gold"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mobile Filters Drawer / Expandable */}
        {showMobileFilters && (
          <div className="lg:hidden bg-surface border border-line p-5 rounded-sm space-y-4 animate-slide-down">
            <div className="flex justify-between items-center border-b border-line pb-2">
              <span className="font-sans font-bold text-xs text-ink">Active Filter Settings</span>
              <button 
                onClick={clearFilters}
                className="font-sans text-xs text-accent-emerald font-bold"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">Batch Year</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink"
                >
                  <option value="All">All Batches</option>
                  {allBatches.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">Current Company</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink"
                >
                  <option value="All">All Companies</option>
                  {allCompanies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink"
                >
                  <option value="All">All Countries</option>
                  {allCountries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">Department (Multi)</label>
                <div className="flex flex-wrap gap-2">
                  {departments.map((dept) => {
                    const isChecked = selectedDept.includes(dept);
                    return (
                      <button
                        key={dept}
                        onClick={() => handleDeptToggle(dept)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                          isChecked 
                            ? "bg-accent-emerald border-accent-emerald text-surface" 
                            : "bg-surface border-line text-ink-muted hover:border-accent-gold"
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-line flex flex-col gap-3">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-ink font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={(e) => setOnlyVerified(e.target.checked)}
                    className="rounded-sm border-line text-accent-emerald focus:ring-accent-emerald/40 w-4 h-4"
                  />
                  <span>Only Verified Profiles</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-ink font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyPlaced}
                    onChange={(e) => setShowOnlyPlaced(e.target.checked)}
                    className="rounded-sm border-line text-accent-emerald focus:ring-accent-emerald/40 w-4 h-4"
                  />
                  <span>Only Placed / Employed</span>
                </label>
              </div>
              
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-ink text-surface text-xs font-semibold px-4 py-2.5 rounded-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Directory Results (Search + Cards Grid) */}
        <div className="flex-1 space-y-6">
          
          {/* Main Search Input */}
          <div className="relative">
            <div className="flex items-center bg-surface border border-line focus-within:border-accent-gold focus-within:ring-2 focus-within:ring-accent-gold/15 transition-all rounded-sm px-3 shadow-xs">
              <Search className="w-5 h-5 text-ink-muted shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="Search database by graduate name, keywords, city, or employer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-ink text-sm py-3.5"
              />
              {search && (
                <button 
                  onClick={() => { setSearch(""); setFilterSearch(""); }}
                  className="text-ink-muted hover:text-ink shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredAlumni.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAlumni.map((alumnus) => (
                <div
                  key={alumnus.id}
                  onClick={() => {
                    setView("profile");
                    window.setSelectedAlumniId(alumnus.id);
                  }}
                  className="bg-surface border border-line hover:border-accent-emerald hover:shadow-xs p-6 rounded-sm cursor-pointer transition-all duration-150 group flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center gap-3.5 mb-3.5">
                      {alumnus.photo_url ? (
                        <img
                          src={getImageUrl(alumnus.photo_url)}
                          alt={alumnus.name}
                          className="w-12 h-12 rounded-full border border-line object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full border border-line bg-ink text-surface flex items-center justify-center font-display font-bold text-base select-none">
                          {alumnus.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-bold text-base text-ink group-hover:text-accent-emerald transition-colors">
                            {alumnus.name}
                          </h3>
                          {alumnus.verified && (
                            <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" />
                          )}
                        </div>
                        <div className="font-data text-xs text-accent-gold font-bold">
                          Batch of {alumnus.batch_year} · {alumnus.department}
                        </div>
                      </div>
                    </div>

                    {/* Role & Company with Graceful Degradation */}
                    <div className="space-y-0.5">
                      {alumnus.current_role ? (
                        <p className="font-sans text-xs font-semibold text-ink-muted uppercase tracking-wider truncate">
                          {alumnus.current_role}
                        </p>
                      ) : null}
                      {alumnus.current_company ? (
                        <p className="font-sans text-sm font-bold text-ink truncate">
                          {alumnus.current_company}
                        </p>
                      ) : (
                        /* Graceful fallbacks instead of undefined/blank space */
                        <p className="font-sans text-xs font-medium text-accent-emerald italic">
                          🌱 Exploring fresh opportunities / Freelancing
                        </p>
                      )}
                    </div>

                    {/* Bio Snippet */}
                    {alumnus.bio ? (
                      <p className="font-sans text-xs text-ink-muted mt-3 line-clamp-2 leading-relaxed">
                        {alumnus.bio}
                      </p>
                    ) : (
                      <p className="font-sans text-xs text-ink-muted/50 mt-3 italic leading-relaxed">
                        No bio description added yet.
                      </p>
                    )}

                    {/* Skills tags list */}
                    {alumnus.skills && alumnus.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {alumnus.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="bg-bg border border-line text-ink-muted text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {alumnus.skills.length > 3 && (
                          <span className="font-data text-[9px] text-accent-gold font-bold flex items-center px-1">
                            +{alumnus.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card footer details */}
                  <div className="mt-5 pt-3 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-accent-emerald" />
                      <span>{alumnus.location?.city || "Unknown City"}, {alumnus.location?.country || "Unknown Country"}</span>
                    </span>
                    
                    {alumnus.mentor_available && (
                      <span className="font-sans text-[10px] font-bold text-accent-gold border border-accent-gold/30 px-1.5 py-0.5 rounded-sm bg-accent-gold/5 uppercase tracking-wide">
                        Available to Mentor
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-surface border border-line rounded-sm p-12 text-center max-w-xl mx-auto space-y-4">
              <CircleOff className="w-12 h-12 text-ink-muted mx-auto opacity-40" />
              <h3 className="font-display font-semibold text-lg text-ink">No Alumni Records Match Your Criteria</h3>
              <p className="font-sans text-xs text-ink-muted leading-relaxed">
                There are no registry profiles matching the search query or filters. Try adjusting your selections or typing different keywords.
              </p>
              <button
                onClick={clearFilters}
                className="bg-ink hover:bg-ink-muted text-surface px-5 py-2 rounded-xs font-sans text-xs font-semibold uppercase tracking-wider"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
