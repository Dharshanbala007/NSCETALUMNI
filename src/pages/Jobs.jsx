import React, { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, UserCheck, Plus, X, Send, Check, FileText } from "lucide-react";
import API_BASE from "../config";

export default function Jobs({ currentUser, onRegisterClick }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  
  useEffect(() => {
    fetch(`${API_BASE}/api/jobs`)
      .then(res => res.json())
      .then(data => {
        setJobs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Modal states
  const [showPostModal, setShowPostModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [activeJob, setActiveJob] = useState(null);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeSkills, setResumeSkills] = useState([]);
  const [isParsing, setIsParsing] = useState(false);

  // New job form states
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newType, setNewType] = useState("Full-time");
  const [newDesc, setNewDesc] = useState("");
  const [newApply, setNewApply] = useState("");
  const [newReferral, setNewReferral] = useState(true);

  // Referral Request message state
  const [referralMessage, setReferralMessage] = useState("");
  const [referralSubmitted, setReferralSubmitted] = useState(false);

  // Post Submit handler
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.alumni_id) {
      alert("You must be logged in as an alumnus to post a job.");
      return;
    }

    const payload = {
      posted_by: currentUser.alumni_id,
      company: newCompany,
      role: newTitle,
      location: newLoc,
      description: newDesc,
      apply_link: newApply,
      employment_type: newType,
      referral_available: newReferral
    };

    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newJob = await res.json();
        // Optimistically add name mapping
        newJob.posted_by_name = currentUser.name || "You";
        setJobs([newJob, ...jobs]);
        setShowPostModal(false);
        setNewTitle("");
        setNewCompany("");
        setNewLoc("");
        setNewDesc("");
        setNewApply("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestReferralSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.alumni_id) {
      alert("You must be logged in to request a referral.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/jobs/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: activeJob.id,
          requester_id: currentUser.alumni_id,
          poster_id: activeJob.posted_by,
          message: referralMessage
        })
      });
      if (res.ok) {
        setReferralSubmitted(true);
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === activeJob.id 
              ? { ...job, referral_request_count: (job.referral_request_count || 0) + 1 }
              : job
          )
        );
        setTimeout(() => {
          setShowReferralModal(false);
          setReferralSubmitted(false);
          setReferralMessage("");
        }, 2000);
      } else {
        alert("Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    const file = e.target.resume.files[0];
    if (!file) return;

    setIsParsing(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch(`${API_BASE}/api/jobs/parse-resume`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setResumeSkills(data.skills);
        setShowResumeModal(false);
      } else {
        alert("Failed to parse resume.");
      }
    } catch (err) {
      console.error(err);
      alert("Error parsing resume.");
    } finally {
      setIsParsing(false);
    }
  };

  // Filter Logic
  const filteredJobs = jobs.filter((job) => {
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      const roleMatch = job.role?.toLowerCase().includes(q);
      const companyMatch = job.company?.toLowerCase().includes(q);
      const descMatch = job.description?.toLowerCase().includes(q);
      const locMatch = job.location?.toLowerCase().includes(q);
      if (!roleMatch && !companyMatch && !descMatch && !locMatch) {
        return false;
      }
    }

    if (selectedType !== "All" && job.employment_type !== selectedType) {
      return false;
    }

    return true;
  });

  // Sort by matched skills if available
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (resumeSkills.length === 0) return 0;
    
    const textA = (a.role + " " + a.description).toLowerCase();
    const textB = (b.role + " " + b.description).toLowerCase();
    
    let scoreA = 0;
    let scoreB = 0;
    
    resumeSkills.forEach(skill => {
      if (textA.includes(skill.toLowerCase())) scoreA++;
      if (textB.includes(skill.toLowerCase())) scoreB++;
    });
    
    // Sort descending
    return scoreB - scoreA;
  });

  // Helper to highlight skills
  const highlightMatches = (job) => {
    if (resumeSkills.length === 0) return null;
    const text = (job.role + " " + job.description).toLowerCase();
    const matches = resumeSkills.filter(s => text.includes(s.toLowerCase()));
    if (matches.length > 0) {
      return (
        <div className="flex flex-wrap gap-1 mt-3">
          <span className="text-[10px] font-bold text-ink-muted mr-1">Matched Skills:</span>
          {matches.map(m => (
            <span key={m} className="text-[10px] font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/40 px-1.5 py-0.5 rounded-sm animate-pulse">
              {m}
            </span>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Jobs Header */}
      <header className="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Jobs & Referrals</h1>
          <p className="font-sans text-xs text-ink-muted mt-1">
            Browse internal opportunities and referral pipelines shared directly by NSCET alumni.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setShowResumeModal(true)}
            className={`text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xs transition-colors flex items-center justify-center gap-1.5 border shadow-xs ${
              resumeSkills.length > 0 
                ? 'bg-accent-gold text-surface border-accent-gold'
                : 'bg-surface text-ink border-line hover:border-accent-gold hover:text-accent-gold'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{resumeSkills.length > 0 ? `${resumeSkills.length} Skills Matched` : "Smart Match Resume"}</span>
          </button>
          {currentUser && (
            <button
              onClick={() => setShowPostModal(true)}
              className="bg-ink hover:bg-ink-muted text-surface hover:text-accent-gold text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xs transition-colors flex items-center justify-center gap-1.5 border border-ink cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Job Opening</span>
            </button>
          )}
        </div>
      </header>

      {/* Filter Options Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-surface border border-line p-3 rounded-sm">
        {/* Search */}
        <div className="flex items-center bg-bg border border-line rounded-sm px-3 py-1 flex-1 w-full">
          <Search className="w-4 h-4 text-ink-muted shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search roles, companies, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-0 outline-none text-ink text-xs py-2 w-full"
          />
        </div>

        {/* Role Type Filter */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto shrink-0 pb-1 md:pb-0">
          {["All", "Full-time", "Intern", "Remote"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-xs font-semibold px-4 py-2.5 rounded-sm border transition-all shrink-0 cursor-pointer ${
                selectedType === type
                  ? "bg-ink border-ink text-surface"
                  : "bg-surface border-line text-ink-muted hover:border-accent-gold"
              }`}
            >
              {type === "All" ? "All Openings" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Listing Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-ink-muted text-sm font-semibold">Loading jobs...</div>
        ) : sortedJobs.length > 0 ? (
          sortedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-surface border border-line p-6 rounded-sm space-y-4 hover:border-accent-emerald/60 hover:shadow-xs transition-all duration-150 flex flex-col justify-between"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                {/* Left Side: Role details */}
                <div className="space-y-2.5">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <h3 className="font-display font-bold text-lg text-ink">
                      {job.role}
                    </h3>
                    <span className={`
                      text-[9px] font-bold px-2 py-0.5 rounded-sm border uppercase tracking-wider
                      ${job.employment_type === "Full-time" ? "bg-ink/5 border-ink/20 text-ink" : ""}
                      ${job.employment_type === "Intern" ? "bg-accent-gold/15 border-accent-gold/30 text-accent-gold" : ""}
                      ${job.employment_type === "Remote" ? "bg-accent-emerald/15 border-accent-emerald/30 text-accent-emerald" : ""}
                    `}>
                      {job.employment_type}
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-ink-muted">
                    <span className="text-ink">{job.company}</span>
                    <span className="text-line">|</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-accent-emerald" />
                      <span>{job.location}</span>
                    </span>
                  </div>

                  <p className="font-sans text-xs text-ink-muted leading-relaxed max-w-3xl">
                    {job.description}
                  </p>
                  
                  {/* Smart Match Indicator */}
                  {highlightMatches(job)}
                </div>

                {/* Right Side: Apply Buttons */}
                <div className="flex flex-col gap-2 w-full md:w-44 shrink-0">
                  {job.referral_available ? (
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          if (onRegisterClick) onRegisterClick();
                        } else {
                          setActiveJob(job);
                          setShowReferralModal(true);
                        }
                      }}
                      className="bg-accent-emerald hover:bg-accent-emerald/90 text-surface text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 rounded-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Request Referral</span>
                    </button>
                  ) : (
                    <a
                      href={job.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-ink hover:bg-ink-muted text-surface text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 rounded-xs transition-colors text-center block"
                    >
                      Apply Directly
                    </a>
                  )}
                  
                  <span className="text-[10px] text-ink-muted text-center block">
                    Posted on {job.posted_date}
                  </span>
                </div>
              </div>

              {/* Referrer Alumnus Footer */}
              <div className="pt-3 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-muted bg-bg/40 -mx-6 -mb-6 p-4 border-b border-line rounded-b-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-gold"></span>
                  <span>Posted by: <strong className="text-ink font-display font-medium">{job.posted_by_name}</strong> {job.posted_by_batch ? `(Batch of ${job.posted_by_batch} · ${job.posted_by_dept})` : ''}</span>
                </span>
                
                {job.referral_available && (
                  <span className="font-data text-[10px] font-bold text-accent-emerald">
                    👥 {job.referral_request_count} graduates requested referrals
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-surface border border-line rounded-sm p-12 text-center max-w-xl mx-auto space-y-4">
            <Briefcase className="w-12 h-12 text-ink-muted mx-auto opacity-40" />
            <h3 className="font-display font-semibold text-lg text-ink">No Job Listings Found</h3>
            <p className="font-sans text-xs text-ink-muted leading-relaxed">
              No jobs or referrals currently match your search criteria. Try modifying your filters or check back later!
            </p>
          </div>
        )}
      </div>

      {/* Modal 1: Post Job Form */}
      {showPostModal && (
        <div className="fixed inset-0 bg-ink/55 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <div className="bg-surface border border-line rounded-sm w-full max-w-lg shadow-lg relative animate-scale-up">
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handlePostJob} className="p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-line pb-3">
                <Briefcase className="w-5 h-5 text-accent-gold" />
                <h3 className="font-display font-semibold text-lg text-ink">Post a Job Opening</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Software Dev II"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Google"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Chennai or Remote"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Role Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Intern">Intern</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Application Link</label>
                <input
                  type="url"
                  placeholder="e.g., https://company.com/careers/job"
                  value={newApply}
                  onChange={(e) => setNewApply(e.target.value)}
                  className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Description</label>
                <textarea
                  required
                  placeholder="Paste roles, requirements, or referral specifications here..."
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none resize-none"
                />
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-ink-muted">
                  <input
                    type="checkbox"
                    checked={newReferral}
                    onChange={(e) => setNewReferral(e.target.checked)}
                    className="rounded-sm border-line text-accent-emerald focus:ring-accent-emerald/40"
                  />
                  <span>I am available to refer applicants</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="border border-line hover:bg-bg px-4 py-2.5 rounded-xs text-ink-muted font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-ink hover:bg-ink-muted text-surface px-5 py-2.5 rounded-xs font-bold"
                  >
                    Publish Post
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Request Referral Form */}
      {showReferralModal && activeJob && (
        <div className="fixed inset-0 bg-ink/55 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <div className="bg-surface border border-line rounded-sm w-full max-w-lg shadow-lg relative animate-scale-up">
            <button
              onClick={() => setShowReferralModal(false)}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleRequestReferralSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-line pb-3">
                <Send className="w-5 h-5 text-accent-emerald" />
                <div>
                  <h3 className="font-display font-semibold text-lg text-ink">Request Referral</h3>
                  <p className="font-sans text-xs text-ink-muted">For {activeJob.role} at {activeJob.company}</p>
                </div>
              </div>

              {referralSubmitted ? (
                <div className="py-8 text-center space-y-3 text-accent-emerald">
                  <div className="w-12 h-12 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto border border-accent-emerald/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-sans font-bold text-sm">Referral Request Sent!</h4>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    A notification was dispatched to <strong>{activeJob.posted_by_name}</strong>. They will review your profile and reach out via email.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-bg border border-line p-3 rounded-xs text-[11px] leading-relaxed text-ink-muted">
                    ℹ️ The poster will automatically be able to see your registered NSCET profile details, including your education major, batch, skills, and career timeline.
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Short Note / Pitch</label>
                    <textarea
                      required
                      placeholder="Briefly state why you are a good fit for this role, or provide a link to your resume..."
                      rows={5}
                      value={referralMessage}
                      onChange={(e) => setReferralMessage(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-line flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowReferralModal(false)}
                      className="border border-line hover:bg-bg px-4 py-2.5 rounded-xs text-ink-muted font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-accent-emerald hover:bg-accent-emerald/90 text-surface px-5 py-2.5 rounded-xs font-bold"
                    >
                      Submit Request
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
      
      {/* Modal 3: Smart Match Resume */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-ink/55 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <div className="bg-surface border border-line rounded-sm w-full max-w-md shadow-lg relative animate-scale-up">
            <button
              onClick={() => setShowResumeModal(false)}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleResumeUpload} className="p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-line pb-3">
                <FileText className="w-5 h-5 text-accent-gold" />
                <div>
                  <h3 className="font-display font-semibold text-lg text-ink">Smart Job Matcher</h3>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  Upload your PDF resume. Our local AI will extract your core skills and automatically reorganize the job board to highlight the best matches for you!
                </p>
                <div className="border-2 border-dashed border-line rounded-sm p-6 flex flex-col items-center justify-center hover:border-accent-gold transition-colors">
                  <FileText className="w-8 h-8 text-line mb-2" />
                  <input required type="file" name="resume" accept="application/pdf" className="text-xs text-ink w-full max-w-[220px]" />
                </div>
              </div>

              <div className="pt-2 border-t border-line flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setResumeSkills([]);
                    setShowResumeModal(false);
                  }}
                  className="border border-line hover:bg-bg px-4 py-2.5 rounded-xs text-ink-muted font-bold"
                >
                  Clear & Cancel
                </button>
                <button
                  type="submit"
                  disabled={isParsing}
                  className="bg-ink hover:bg-ink-muted text-surface px-5 py-2.5 rounded-xs font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  {isParsing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-surface"></div>
                      Parsing...
                    </>
                  ) : (
                    "Upload & Match"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
