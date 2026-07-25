import React, { useState, useEffect } from "react";
import { Calendar, Video, Clock, MonitorPlay, Users, ArrowRight, ExternalLink, Plus, X } from "lucide-react";
import API_BASE, { getImageUrl } from "../config";

export default function Contributions({ currentUser }) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchContributions = () => {
    fetch(`${API_BASE}/api/alumni-contributions`)
      .then(res => res.json())
      .then(data => {
        setContributions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch contributions", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const handleHostSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API_BASE}/api/alumni/contributions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Session submitted successfully! Waiting for admin approval.");
        setShowModal(false);
        fetchContributions(); // Auto-refresh the list
      } else {
        alert("Failed to submit session.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting session.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  const upcoming = contributions.filter(c => c.status === "upcoming" || c.status === "ongoing");
  const completed = contributions.filter(c => c.status === "completed");

  const renderCard = (c) => (
    <div key={c.id} className="tilt-card bg-surface border border-line rounded-md p-6 space-y-5 shadow-sm group hover:border-accent-gold transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {c.type === "webinar" && <Video className="w-5 h-5 text-accent-emerald" />}
          {c.type === "masterclass" && <MonitorPlay className="w-5 h-5 text-accent-emerald" />}
          {c.type === "workshop" && <Users className="w-5 h-5 text-accent-emerald" />}
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            {c.type}
          </span>
        </div>
        <span className={`text-[10px] font-data font-bold uppercase tracking-wider px-2 py-1 rounded-sm border ${
          c.status === "upcoming" ? "bg-accent-gold/10 text-accent-gold border-accent-gold/20" :
          c.status === "ongoing" ? "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20" :
          "bg-line text-ink-muted border-line"
        }`}>
          {c.status}
        </span>
      </div>

      <div>
        <h3 className="font-display font-bold text-xl text-ink leading-tight mb-2 group-hover:text-accent-gold transition-colors">{c.title}</h3>
        <p className="font-sans text-sm text-ink-muted line-clamp-2">{c.description}</p>
      </div>

      <div className="pt-4 border-t border-line flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-line overflow-hidden shrink-0 border border-line">
          {c.photo_url ? (
            <img src={getImageUrl(c.photo_url)} alt={c.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display font-bold text-ink bg-bg">
              {c.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <p className="font-sans font-bold text-sm text-ink">{c.name}</p>
          <p className="font-sans text-xs text-ink-muted">{c.current_role} {c.current_company ? `at ${c.current_company}` : ''} • Batch of {c.batch_year}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
          <Calendar className="w-4 h-4" />
          <span>{new Date(c.event_date).toLocaleDateString()}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{new Date(c.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        
        {c.status !== "completed" && (
          <button className="flex items-center gap-2 bg-ink hover:bg-ink-muted text-surface px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all">
            <span>RSVP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        {c.status === "completed" && c.link && (
          <a href={c.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-accent-gold hover:underline text-xs font-bold uppercase tracking-wider">
            <span>Watch</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12 animate-scroll-up">
      <header className="border-b border-line pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Alumni Contributions</h1>
          <p className="font-sans text-sm text-ink-muted mt-2 max-w-2xl">
            Discover exclusive webinars, masterclasses, and workshops hosted by our distinguished alumni network. Upskill and learn from industry leaders.
          </p>
        </div>
        {currentUser && currentUser.role === 'alumni' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-ink hover:bg-ink-muted text-surface px-5 py-2.5 rounded-sm font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Host a Session
          </button>
        )}
      </header>

      {upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-sans font-bold text-lg text-ink uppercase tracking-wider">Upcoming & Live</h2>
            <div className="flex-1 h-px bg-line"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map(renderCard)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-sans font-bold text-lg text-ink uppercase tracking-wider">Past Recordings</h2>
            <div className="flex-1 h-px bg-line"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map(renderCard)}
          </div>
        </section>
      )}
      
      {contributions.length === 0 && (
        <div className="text-center py-20 border border-line border-dashed rounded-md bg-surface/50">
          <MonitorPlay className="w-8 h-8 text-line mx-auto mb-3" />
          <p className="font-sans font-semibold text-ink-muted">No contributions listed at the moment.</p>
        </div>
      )}

      {/* Host a Session Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-lg rounded-sm shadow-xl border border-line flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-line">
              <h3 className="font-display font-bold text-xl text-ink">Host a Session</h3>
              <button onClick={() => setShowModal(false)} className="text-ink-muted hover:text-ink cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form id="hostForm" onSubmit={handleHostSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Session Title</label>
                  <input required name="title" type="text" className="w-full bg-bg border border-line p-2 text-sm rounded-xs focus:border-accent-gold outline-none" placeholder="e.g., Intro to Machine Learning" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Type</label>
                  <select required name="type" className="w-full bg-bg border border-line p-2 text-sm rounded-xs focus:border-accent-gold outline-none">
                    <option value="webinar">Webinar</option>
                    <option value="masterclass">Masterclass</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Description</label>
                  <textarea required name="description" rows="3" className="w-full bg-bg border border-line p-2 text-sm rounded-xs focus:border-accent-gold outline-none" placeholder="Briefly describe what attendees will learn..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Event Date & Time</label>
                  <input required name="event_date" type="datetime-local" className="w-full bg-bg border border-line p-2 text-sm rounded-xs focus:border-accent-gold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Meeting Link / Recording (Optional)</label>
                  <input name="link" type="url" className="w-full bg-bg border border-line p-2 text-sm rounded-xs focus:border-accent-gold outline-none" placeholder="https://..." />
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-line bg-bg flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-line text-ink text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-surface transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" form="hostForm" className="px-5 py-2 bg-accent-emerald hover:bg-accent-emerald/90 text-surface shadow-xs text-xs font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
