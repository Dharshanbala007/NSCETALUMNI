import React, { useState } from "react";
import { Calendar, MapPin, Clock, CheckCircle2, Star, Users } from "lucide-react";

export default function Events({ mockEvents, setMockEvents }) {
  // Store user RSVPs in local state
  const [userRsvps, setUserRsvps] = useState([]);

  const toggleRsvp = (eventId) => {
    if (userRsvps.includes(eventId)) {
      setUserRsvps(userRsvps.filter(id => id !== eventId));
      // Decrement count in list
      setMockEvents(prev => 
        prev.map(e => e.id === eventId ? { ...e, rsvps: e.rsvps.filter(uid => uid !== "current_user") } : e)
      );
    } else {
      setUserRsvps([...userRsvps, eventId]);
      // Increment count in list
      setMockEvents(prev => 
        prev.map(e => e.id === eventId ? { ...e, rsvps: [...e.rsvps, "current_user"] } : e)
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      
      {/* Events Page Header */}
      <header className="border-b border-line pb-4">
        <h1 className="font-display font-bold text-3xl text-ink">Events & Reunions</h1>
        <p className="font-sans text-xs text-ink-muted mt-1">
          Stay connected via departmental reunions, campus meets, and specialized online panel discussions.
        </p>
      </header>

      {/* Grid of Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockEvents.map((event) => {
          const isRegistered = userRsvps.includes(event.id);
          const totalRsvps = event.rsvps.length;

          return (
            <div
              key={event.id}
              className="bg-surface border border-line rounded-sm overflow-hidden flex flex-col justify-between hover:border-accent-emerald/60 hover:shadow-xs transition-all duration-150"
            >
              {/* Event Image Banner */}
              <div className="h-44 relative bg-ink/90 overflow-hidden shrink-0 border-b border-line">
                <img
                  src={event.cover_image}
                  alt={event.title}
                  className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-300"
                />
                
                {/* RSVP Status tag */}
                {isRegistered && (
                  <span className="absolute top-4 right-4 bg-accent-emerald text-surface font-sans font-bold text-[9px] px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Registered RSVP</span>
                  </span>
                )}
              </div>

              {/* Event Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-tight">
                    {event.title}
                  </h3>

                  {/* Dates & Location metadata */}
                  <div className="space-y-1.5 text-xs text-ink-muted font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent-gold" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent-gold" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent-emerald" />
                      <span className="text-ink">{event.location}</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Footer RSVP interaction */}
                <div className="pt-4 border-t border-line flex items-center justify-between">
                  <span className="font-data text-xs text-ink-muted font-semibold flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-ink-muted" />
                    <span><strong className="text-ink">{totalRsvps}</strong> attending guests</span>
                  </span>

                  <button
                    onClick={() => toggleRsvp(event.id)}
                    className={`
                      text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-xs cursor-pointer transition-all duration-150 border
                      ${isRegistered
                        ? "bg-bg border-line text-ink-muted hover:border-red-600 hover:text-red-600"
                        : "bg-ink hover:bg-ink-muted text-surface hover:text-accent-gold border-ink"
                      }
                    `}
                  >
                    {isRegistered ? "Cancel RSVP" : "Confirm RSVP"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
