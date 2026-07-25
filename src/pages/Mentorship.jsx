import React, { useState, useEffect } from "react";
import { GraduationCap, Award, Search, Mail, ArrowRight, UserCheck, X, Check } from "lucide-react";
import API_BASE from "../config";

export default function Mentorship({ setView, currentUser }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedField, setSelectedField] = useState("Software Engineering");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/mentorship`)
      .then(res => res.json())
      .then(data => {
        setMentors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Compile list of unique mentor fields for the selector
  const allFields = [...new Set(mentors.flatMap(m => m.mentor_fields || []))].sort();

  const handleRequestMatch = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.alumni_id) {
      alert("You must be logged in as an alumnus to request a match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/mentorship/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentee_id: currentUser.alumni_id,
          message,
          field: selectedField
        })
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowFormModal(false);
          setSubmitted(false);
          setMessage("");
        }, 2000);
      } else {
        alert("Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      const nameMatch = mentor.name.toLowerCase().includes(q);
      const companyMatch = mentor.current_company?.toLowerCase().includes(q);
      const fieldMatch = mentor.mentor_fields?.some(f => f.toLowerCase().includes(q));
      const skillsMatch = mentor.skills?.some(s => s.toLowerCase().includes(q));
      if (!nameMatch && !companyMatch && !fieldMatch && !skillsMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Mentorship Header */}
      <header className="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Mentorship Hub</h1>
          <p className="font-sans text-xs text-ink-muted mt-1">
            Connect directly with experienced seniors for career guidance, CV reviews, and prep.
          </p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="bg-ink hover:bg-ink-muted text-surface hover:text-accent-gold text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 border border-ink"
        >
          <GraduationCap className="w-4.5 h-4.5" />
          <span>General Match Request</span>
        </button>
      </header>

      {/* Mentor Banner */}
      <div className="bg-ink text-surface rounded-sm p-6 border border-accent-gold flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-lg text-accent-gold">Need guidance on specific careers?</h3>
          <p className="font-sans text-xs text-surface/80 max-w-xl">
            Browse our list of verified mentors below. Select a mentor to view their detailed timeline, or click the matching button to let admins suggest a mentor for you.
          </p>
        </div>
        <div className="font-data text-xs text-accent-gold font-bold bg-surface/10 px-4 py-2 border border-accent-gold/20 rounded-xs">
          🌟 {mentors.length} ACTIVE VOLUNTEERS
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-surface border border-line focus-within:border-accent-gold focus-within:ring-2 focus-within:ring-accent-gold/15 transition-all rounded-sm px-3 shadow-xs">
          <Search className="w-4.5 h-4.5 text-ink-muted shrink-0 mr-2.5" />
          <input
            type="text"
            placeholder="Search mentors by name, company, sector (e.g. EV, VLSI), or key expertise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-ink text-xs py-3.5"
          />
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMentors.length > 0 ? (
          filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-surface border border-line p-6 rounded-sm flex flex-col justify-between hover:border-accent-gold/50 transition-all duration-150"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  {mentor.photo_url ? (
                    <img
                      src={mentor.photo_url}
                      alt={mentor.name}
                      className="w-12 h-12 rounded-full border border-line object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-line bg-ink text-surface flex items-center justify-center font-display font-bold text-base select-none">
                      {mentor.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-base text-ink">{mentor.name}</h3>
                    <p className="font-data text-[10px] text-accent-gold font-bold">
                      Batch of {mentor.batch_year} · {mentor.department}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-sans text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    {mentor.current_role ? `${mentor.current_role} @` : ""}
                  </p>
                  <p className="font-sans text-sm font-bold text-ink truncate">
                    {mentor.current_company || "Details not provided"}
                  </p>
                </div>

                {mentor.bio && (
                  <p className="font-sans text-xs text-ink-muted mt-3 line-clamp-2 leading-relaxed">
                    {mentor.bio}
                  </p>
                )}

                {/* Mentorship fields */}
                {mentor.mentor_fields && mentor.mentor_fields.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Areas of expertise:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.mentor_fields.map((field) => (
                        <span
                          key={field}
                          className="bg-bg border border-line text-accent-emerald font-sans font-semibold text-[10px] px-2 py-0.5 rounded-sm"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* View Profile Action */}
              <div className="mt-5 pt-3 border-t border-line flex items-center justify-between text-xs">
                <span className="text-ink-muted flex items-center gap-1">
                  📍 {mentor.location.city}, {mentor.location.country}
                </span>

                <button
                  onClick={() => {
                    setView("profile");
                    window.setSelectedAlumniId(mentor.id);
                  }}
                  className="text-accent-emerald hover:text-accent-gold font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Connect & View Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-surface border border-line rounded-sm p-12 text-center max-w-xl mx-auto space-y-4">
            <GraduationCap className="w-12 h-12 text-ink-muted mx-auto opacity-40" />
            <h3 className="font-display font-semibold text-lg text-ink">No Mentors Match Search</h3>
            <p className="font-sans text-xs text-ink-muted leading-relaxed">
              We couldn't find any mentors matching your search query. Try typing simpler keywords or check our general matching pipeline.
            </p>
          </div>
        )}
      </div>

      {/* General Match Request Modal Form */}
      {showFormModal && (
        <div className="fixed inset-0 bg-ink/55 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <div className="bg-surface border border-line rounded-sm w-full max-w-lg shadow-lg relative animate-scale-up">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleRequestMatch} className="p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-line pb-3">
                <GraduationCap className="w-5 h-5 text-accent-gold" />
                <h3 className="font-display font-semibold text-lg text-ink">General Mentorship Match</h3>
              </div>

              {submitted ? (
                <div className="py-8 text-center space-y-3 text-accent-emerald">
                  <div className="w-12 h-12 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto border border-accent-emerald/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-sans font-bold text-sm">Match Request Dispatched!</h4>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    Registry administrators will check available alumni aligned with your interest field and make a connection.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-bg border border-line p-3 rounded-xs text-[11px] leading-relaxed text-ink-muted">
                    If you don't know who to choose, fill this out and our admin team will pair you with a mentor based on your field of interest.
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Field of Interest</label>
                    <select
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                    >
                      {allFields.length > 0 ? (
                        allFields.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))
                      ) : (
                        <>
                          <option value="Software Engineering">Software Engineering</option>
                          <option value="VLSI / Hardware">VLSI / Hardware</option>
                          <option value="EV Technology">EV Technology</option>
                          <option value="Civil Infrastructures">Civil Infrastructures</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Guidance Details / Message</label>
                    <textarea
                      required
                      placeholder="Detail your queries (e.g. Master's in Germany, interview prep for Google, switching to hardware, etc.)"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-line flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowFormModal(false)}
                      className="border border-line hover:bg-bg px-4 py-2.5 rounded-xs text-ink-muted font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-accent-emerald hover:bg-accent-emerald/90 text-surface px-5 py-2.5 rounded-xs font-bold"
                    >
                      Send Request
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
