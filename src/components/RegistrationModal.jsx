import React, { useState } from "react";
import { X, Check } from "lucide-react";
import API_BASE from "../config";

export default function RegistrationModal({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    batch_year: "",
    department: "",
    current_company: "",
    current_role: "",
    location_city: "",
    location_country: "India",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/alumni/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const data = await response.json();
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-line w-full max-w-lg rounded-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-line bg-bg/50 shrink-0 flex justify-between items-center">
          <div>
            <h2 className="font-display font-bold text-xl text-ink">Alumni Registration</h2>
            <p className="font-sans text-xs text-ink-muted mt-1">Submit your profile for admin verification</p>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4 text-accent-emerald">
              <div className="w-16 h-16 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto border border-accent-emerald/30 animate-pulse">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="font-sans font-bold text-base">Registration Request Sent!</h4>
              <p className="font-sans text-xs text-ink-muted leading-relaxed max-w-sm mx-auto">
                Your profile is pending verification. Once approved by an admin, you will be able to log in using your name and the default password (1234).
              </p>
              <button 
                onClick={onClose}
                className="mt-6 bg-accent-emerald text-surface px-6 py-2 rounded-xs font-bold text-xs shadow-xs"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-sm font-sans">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase">Full Name *</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase">Batch Year *</label>
                  <input required type="number" name="batch_year" value={formData.batch_year} onChange={handleChange} className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none" placeholder="e.g. 2024" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase">Department *</label>
                  <input required name="department" value={formData.department} onChange={handleChange} className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none" placeholder="e.g. CSE" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase">Current Company</label>
                  <input name="current_company" value={formData.current_company} onChange={handleChange} className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase">Role / Title</label>
                  <input name="current_role" value={formData.current_role} onChange={handleChange} className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase">City</label>
                  <input name="location_city" value={formData.location_city} onChange={handleChange} className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase">Country</label>
                  <input name="location_country" value={formData.location_country} onChange={handleChange} className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-line flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-ink-muted hover:bg-bg rounded-xs transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-accent-gold text-ink px-5 py-2 text-xs font-bold uppercase rounded-xs hover:bg-accent-gold/90 transition-colors disabled:opacity-50">
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
