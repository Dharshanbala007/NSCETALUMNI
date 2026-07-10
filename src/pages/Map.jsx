import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Users, Award, ExternalLink } from "lucide-react";
import { departments } from "../data/mockAlumni";

// Resolve Leaflet icon compilation issue by using custom inline SVGs
const createAlumniMarkerIcon = (isVerified = true) => {
  const color = isVerified ? "#2F7A5C" : "#C08A2E"; // Emerald for verified, Gold for unverified
  return new L.DivIcon({
    html: `
      <div style="position: relative; display: flex; items-center: justify-content: center; width: 24px; height: 24px;">
        <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #FFFFFF; box-shadow: 0 1px 4px rgba(22,35,63,0.35); margin: auto;"></div>
      </div>
    `,
    className: "custom-alumni-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export default function Map({ setView, mockAlumni }) {
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");

  const approvedAlumni = mockAlumni.filter(
    (a) => a.status === "approved" && a.location?.lat && a.location?.lng
  );

  const allBatches = [...new Set(approvedAlumni.map((a) => a.batch_year))].sort((a, b) => b - a);

  // Apply filters
  const mapAlumni = approvedAlumni.filter((alumnus) => {
    if (selectedDept !== "All" && alumnus.department !== selectedDept) {
      return false;
    }
    if (selectedBatch !== "All" && alumnus.batch_year !== parseInt(selectedBatch)) {
      return false;
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col min-h-[calc(100vh-80px)] md:min-h-screen">
      
      {/* Map Control Bar */}
      <header className="bg-surface border-b border-line px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Global Alumni Map</h1>
          <p className="font-sans text-xs text-ink-muted mt-0.5">
            Trace the global flight paths and current settlements of NSCET grads.
          </p>
        </div>

        {/* Map Filters */}
        <div className="flex flex-wrap gap-3 items-center text-xs">
          <div className="flex items-center bg-bg border border-line rounded-sm px-2">
            <span className="text-ink-muted font-semibold uppercase tracking-wider text-[10px] px-1 mr-2 border-r border-line">Dept</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent border-0 outline-none text-ink py-2 pr-4 font-semibold"
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-bg border border-line rounded-sm px-2">
            <span className="text-ink-muted font-semibold uppercase tracking-wider text-[10px] px-1 mr-2 border-r border-line">Batch</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-transparent border-0 outline-none text-ink py-2 pr-4 font-semibold"
            >
              <option value="All">All Batches</option>
              {allBatches.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="font-data text-xs text-ink bg-surface border border-line px-3 py-2 rounded-sm font-semibold">
            Pins plotted: <span className="text-accent-emerald font-bold">{mapAlumni.length}</span>
          </div>
        </div>
      </header>

      {/* Leaflet Map Area - Explicit Height to prevent collapsing */}
      <div className="w-full relative border border-line rounded-sm overflow-hidden bg-surface shadow-xs">
        <MapContainer
          center={[11.0, 78.0]}
          zoom={6}
          scrollWheelZoom={true}
          style={{ height: "550px", width: "100%", zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mapAlumni.map((alumnus) => (
            <Marker
              key={alumnus.id}
              position={[alumnus.location.lat, alumnus.location.lng]}
              icon={createAlumniMarkerIcon(alumnus.verified)}
            >
              <Popup>
                <div className="font-sans p-1 text-ink max-w-[200px] space-y-2">
                  <div className="space-y-0.5">
                    <h4 className="font-display font-bold text-sm text-ink m-0 leading-tight flex items-center gap-1">
                      <span>{alumnus.name}</span>
                      {alumnus.verified && (
                        <span className="text-accent-emerald text-xs">✓</span>
                      )}
                    </h4>
                    <p className="font-sans text-[10px] text-accent-gold font-bold m-0 uppercase tracking-wide">
                      Batch of {alumnus.batch_year} · {alumnus.department}
                    </p>
                  </div>

                  <div className="text-[11px] text-ink-muted border-t border-line pt-1.5 space-y-0.5">
                    {alumnus.current_role && (
                      <p className="m-0 leading-snug">
                        <strong>{alumnus.current_role}</strong> at {alumnus.current_company}
                      </p>
                    )}
                    <p className="m-0 flex items-center gap-0.5 text-ink-muted/80">
                      <span>📍 {alumnus.location.city}, {alumnus.location.country}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setView("profile");
                      window.setSelectedAlumniId(alumnus.id);
                    }}
                    className="w-full bg-ink hover:bg-ink-muted text-surface text-[10px] font-bold py-1.5 rounded-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
    </div>
  );
}
