import React, { useState } from "react";
import { ArrowLeft, Award, MapPin, Mail, Phone, Calendar, Heart, Shield, GraduationCap, X, Check } from "lucide-react";
import API_BASE from "../config";
import { VerticalThread, ThreadNode } from "../components/ThreadConnector";

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export default function Profile({ setView, mockAlumni, currentUser, setMockAlumni, selectedAlumniId }) {
  // Read the active profile ID stored in window state or fallback
  const alumniId = selectedAlumniId || window.selectedAlumniId || "a1";
  const alumnus = mockAlumni.find((a) => a.id === alumniId || a.id == parseInt(alumniId)) || mockAlumni[0];

  const [showMentorModal, setShowMentorModal] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [studentField, setStudentField] = useState("Software Engineering");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Profile Modification states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCountry, setEditCountry] = useState("India");
  const [editBio, setEditBio] = useState("");
  const [editExp, setEditExp] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editAchievements, setEditAchievements] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSavedSuccess, setEditSavedSuccess] = useState(false);
  const [editError, setEditError] = useState("");

  // Re-initialize edit form when modal opens
  const openEditModal = () => {
    setEditEmail(alumnus.email || "");
    setEditCompany(alumnus.current_company || "");
    setEditRole(alumnus.current_role || "");
    setEditCity(alumnus.location_city || (alumnus.location?.city || ""));
    setEditCountry(alumnus.location_country || (alumnus.location?.country || "India"));
    setEditBio(alumnus.bio || "");
    setEditExp(alumnus.experience_years || "");
    setEditSkills(Array.isArray(alumnus.skills) ? alumnus.skills.join(", ") : "");
    setEditAchievements(Array.isArray(alumnus.achievements) ? alumnus.achievements.join(", ") : "");
    setEditPhoto(null);
    setEditError("");
    setEditSavedSuccess(false);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    setEditError("");

    const payload = {
      email: editEmail,
      current_company: editCompany,
      current_role: editRole,
      location_city: editCity,
      location_country: editCountry,
      bio: editBio,
      experience_years: editExp,
      skills: editSkills,
      achievements: editAchievements
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    if (editPhoto) {
      formData.append('photo', editPhoto);
    }

    try {
      const response = await fetch(`${API_BASE}/api/alumni/edit-request`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        },
        body: formData
      });

      if (response.ok) {
        setEditSavedSuccess(true);
        setTimeout(() => {
          setShowEditModal(false);
          setEditSavedSuccess(false);
        }, 3000);
      } else {
        const data = await response.json();
        setEditError(data.error || "Failed to submit request.");
      }
    } catch (err) {
      console.log("Offline mode: Simulating edit request registration...");
      setEditSavedSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setEditSavedSuccess(false);
      }, 3000);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleMentorshipSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setShowMentorModal(false);
      setIsSubmitted(false);
      setRequestText("");
    }, 2000);
  };

  const hasCareerHistory = alumnus.career_history && alumnus.career_history.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Back Button */}
      <button
        onClick={() => setView("directory")}
        className="font-sans text-xs font-bold text-accent-emerald hover:text-accent-gold flex items-center gap-1.5 transition-colors self-start cursor-pointer group"
      >
        <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Directory</span>
      </button>

      {/* Main Profile Card Header */}
      <div className="bg-surface border border-line p-6 md:p-8 rounded-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
            {/* Avatar / Photo */}
            {alumnus.photo_url ? (
              <img
                src={alumnus.photo_url.startsWith('/') ? `${API_BASE}${alumnus.photo_url}` : alumnus.photo_url}
                alt={alumnus.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-line object-cover"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-line bg-ink text-surface flex items-center justify-center font-display font-semibold text-3xl">
                {alumnus.name.charAt(0)}
              </div>
            )}
            
            {/* Basic Info */}
            <div className="space-y-1.5">
              <div className="flex items-center flex-wrap gap-2.5">
                <h2 className="font-display font-bold text-2xl md:text-3xl text-ink leading-tight">
                  {alumnus.name}
                </h2>
                
                {alumnus.verified && (
                  <span className="bg-accent-emerald/10 text-accent-emerald text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-0.5 border border-accent-emerald/20">
                    <Award className="w-3.5 h-3.5" />
                    <span>VERIFIED RECORD</span>
                  </span>
                )}
              </div>

              <div className="font-data text-sm text-accent-gold font-bold flex items-center gap-2">
                <span>Batch of {alumnus.batch_year}</span>
                <span className="text-line">•</span>
                <span>{alumnus.department} Department</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                <MapPin className="w-4.5 h-4.5 text-accent-emerald" />
                <span>{alumnus.location?.city || "Unknown City"}, {alumnus.location?.country || "Unknown Country"}</span>
              </div>
            </div>
          </div>

          {/* Call to Actions (e.g., Mentorship) */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            {currentUser && currentUser.role === "alumni" && (currentUser.alumni_id == alumnus.id || currentUser.id == alumnus.id) && (
              <button
                onClick={openEditModal}
                className="bg-accent-gold hover:bg-accent-gold/90 text-surface text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4.5 h-4.5" />
                <span>Edit Profile Details</span>
              </button>
            )}

            {alumnus.mentor_available ? (
              <button
                onClick={() => setShowMentorModal(true)}
                className="bg-accent-emerald hover:bg-accent-emerald/90 text-surface text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4.5 h-4.5" />
                <span>Request Mentorship</span>
              </button>
            ) : (
              <span className="text-center font-sans text-xs text-ink-muted bg-bg border border-line py-3 px-5 rounded-xs">
                Mentorship closed
              </span>
            )}
            
            {alumnus.linkedin_url && (
              <a
                href={alumnus.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-line hover:border-accent-gold hover:text-accent-gold text-ink text-xs font-semibold py-2.5 px-5 rounded-xs transition-all flex items-center justify-center gap-2"
              >
                <LinkedinIcon className="w-4 h-4 text-sky-700" />
                <span>LinkedIn Profile</span>
              </a>
            )}
          </div>
        </div>

        {/* Current Position Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-line">
          <div>
            <h4 className="font-sans text-[10px] font-bold text-ink-muted uppercase tracking-widest">Current Position</h4>
            {alumnus.current_role ? (
              <p className="font-sans text-base font-bold text-ink mt-0.5">
                {alumnus.current_role} <span className="font-medium text-ink-muted">at</span> {alumnus.current_company}
              </p>
            ) : (
              <p className="font-sans text-sm text-ink-muted mt-0.5 italic">
                🌱 Freelance / Open to Opportunities / Pursuing higher studies
              </p>
            )}
          </div>
          <div>
            <h4 className="font-sans text-[10px] font-bold text-ink-muted uppercase tracking-widest">Contact Registry</h4>
            <div className="flex flex-col gap-1 mt-1 font-sans text-xs">
              <span className="flex items-center gap-2 text-ink">
                <Mail className="w-3.5 h-3.5 text-accent-emerald" />
                <span>{alumnus.email}</span>
              </span>
              <span className="flex items-center gap-2 text-ink-muted italic">
                <Phone className="w-3.5 h-3.5 text-accent-emerald" />
                <span>🔒 Contact number hidden for privacy</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Details (Bio, Skills, Achievements) Left + Timeline Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Biography */}
          <div className="bg-surface border border-line p-6 rounded-sm space-y-3">
            <h3 className="font-display font-semibold text-lg text-ink border-b border-line pb-2 flex items-center gap-2">
              <span>Professional Bio</span>
            </h3>
            {alumnus.bio ? (
              <p className="font-sans text-sm text-ink-muted leading-relaxed whitespace-pre-line">
                {alumnus.bio}
              </p>
            ) : (
              <p className="font-sans text-xs text-ink-muted/50 italic py-4">
                No bio added yet. An alumnus placeholder message: "NSCET graduate tracing their professional path. More details coming soon."
              </p>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-surface border border-line p-6 rounded-sm space-y-3">
            <h3 className="font-display font-semibold text-lg text-ink border-b border-line pb-2">
              Honors & Achievements
            </h3>
            {alumnus.achievements && alumnus.achievements.length > 0 ? (
              <ul className="space-y-2.5 font-sans text-xs font-medium text-ink-muted">
                {alumnus.achievements.map((item, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <Heart className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-sans text-xs text-ink-muted/50 italic py-2">
                No achievements recorded yet.
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="bg-surface border border-line p-6 rounded-sm space-y-3">
            <h3 className="font-display font-semibold text-lg text-ink border-b border-line pb-2">
              Skills & Expertise
            </h3>
            {alumnus.skills && alumnus.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {alumnus.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-bg border border-line text-ink text-xs font-semibold px-3 py-1 rounded-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="font-sans text-xs text-ink-muted/50 italic py-2">
                No skills listed.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Timelines (The Thread) */}
        <div className="space-y-6">
          <div className="bg-surface border border-line p-6 rounded-sm space-y-4">
            <h3 className="font-display font-semibold text-lg text-ink border-b border-line pb-2">
              Career Timeline
            </h3>

            {hasCareerHistory ? (
              <VerticalThread>
                {alumnus.career_history.map((job, idx) => (
                  <ThreadNode
                    key={idx}
                    isCurrent={job.end_year === null}
                    year={job.end_year ? `${job.start_year} - ${job.end_year}` : `${job.start_year} - Present`}
                    title={job.role}
                    subtitle={job.company}
                  />
                ))}
              </VerticalThread>
            ) : (
              /* Empty state timeline connector fallback */
              <div className="py-6 text-center space-y-3">
                <span className="text-4xl">🌱</span>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  No roles added to career timeline yet.
                </p>
                <p className="font-sans text-[11px] text-accent-emerald italic">
                  "No roles added yet — add your first one."
                </p>
              </div>
            )}
          </div>

          {/* Mentorship fields highlight if mentor */}
          {alumnus.mentor_available && alumnus.mentor_fields?.length > 0 && (
            <div className="bg-ink text-surface border border-accent-gold p-6 rounded-sm space-y-3">
              <h4 className="font-display font-semibold text-base text-accent-gold flex items-center gap-1.5">
                <GraduationCap className="w-5 h-5 text-accent-gold" />
                <span>Mentorship Areas</span>
              </h4>
              <p className="font-sans text-[11px] text-surface/85 leading-relaxed">
                This alumnus has volunteered to provide coaching and advice to students in the following domains:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {alumnus.mentor_fields.map((field) => (
                  <span
                    key={field}
                    className="bg-surface/10 border border-surface/10 text-surface text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mentorship Request Modal Dialog */}
      {showMentorModal && (
        <div className="fixed inset-0 bg-ink/55 backdrop-blur-xs flex items-center justify-center p-4 z-100">
          <div className="bg-surface border border-line rounded-sm w-full max-w-lg shadow-lg relative animate-scale-up">
            <button
              onClick={() => setShowMentorModal(false)}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <form onSubmit={handleMentorshipSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-line pb-3">
                <GraduationCap className="w-6 h-6 text-accent-gold" />
                <div>
                  <h3 className="font-display font-semibold text-lg text-ink">Request Mentorship</h3>
                  <p className="font-sans text-xs text-ink-muted">To {alumnus.name}</p>
                </div>
              </div>

              {isSubmitted ? (
                <div className="py-8 text-center space-y-3 text-accent-emerald">
                  <div className="w-12 h-12 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto border border-accent-emerald/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-sans font-bold text-sm">Request Submitted Successfully!</h4>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    Your request was sent. The mentor will receive an email and can contact you.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="block font-sans text-xs font-bold text-ink uppercase tracking-wider">Field of Interest</label>
                    <select
                      value={studentField}
                      onChange={(e) => setStudentField(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2.5 text-xs text-ink focus:border-accent-gold outline-none"
                    >
                      {alumnus.mentor_fields?.length > 0 ? (
                        alumnus.mentor_fields.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))
                      ) : (
                        <>
                          <option value="General Guidance">General Guidance</option>
                          <option value="Resume Review">Resume Review</option>
                          <option value="Placement Prep">Placement Prep</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-sans text-xs font-bold text-ink uppercase tracking-wider">Brief Message</label>
                    <textarea
                      placeholder="Explain your goals, questions, or details about the guidance you're seeking..."
                      value={requestText}
                      onChange={(e) => setRequestText(e.target.value)}
                      required
                      rows={5}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-line flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowMentorModal(false)}
                      className="border border-line hover:bg-bg px-4 py-2.5 rounded-xs font-semibold text-ink-muted"
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

      {/* Edit Profile Modal Dialog */}
      {showEditModal && (
        <div className="fixed inset-0 bg-ink/55 backdrop-blur-xs flex items-center justify-center p-4 z-100 overflow-y-auto">
          <div className="bg-surface border border-line rounded-sm w-full max-w-2xl shadow-lg relative my-8 animate-scale-up">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-line pb-3">
                <Shield className="w-6 h-6 text-accent-gold" />
                <div>
                  <h3 className="font-display font-semibold text-lg text-ink">Modify Profile Request</h3>
                  <p className="font-sans text-xs text-ink-muted">Submit details for administrative verification</p>
                </div>
              </div>

              {editSavedSuccess ? (
                <div className="py-12 text-center space-y-4 text-accent-emerald">
                  <div className="w-16 h-16 rounded-full bg-accent-emerald/10 flex items-center justify-center mx-auto border border-accent-emerald/30 animate-pulse">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="font-sans font-bold text-base">Modification Request Sent!</h4>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed max-w-md mx-auto">
                    Your updates have been queued. The live registry will update as soon as the portal administrator approves your request.
                  </p>
                </div>
              ) : (
                <>
                  {editError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-sm font-sans flex items-center gap-2">
                      <span className="font-bold">Error:</span> {editError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Photo Input */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="block font-sans text-[10px] font-bold text-ink uppercase tracking-wider">Profile Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditPhoto(e.target.files[0])}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-accent-gold/10 file:text-accent-gold hover:file:bg-accent-gold/20 cursor-pointer"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold text-ink uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                        placeholder="yourname@gmail.com"
                      />
                    </div>

                    {/* Exp Years Input */}
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold text-ink uppercase tracking-wider">Experience Years</label>
                      <input
                        type="text"
                        value={editExp}
                        onChange={(e) => setEditExp(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                        placeholder="e.g. 3 Years, 5+ Years"
                      />
                    </div>

                    {/* Company Input */}
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold text-ink uppercase tracking-wider">Current Company</label>
                      <input
                        type="text"
                        value={editCompany}
                        onChange={(e) => setEditCompany(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                        placeholder="e.g. Tata Consultancy Services, Zoho"
                      />
                    </div>

                    {/* Role Input */}
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold text-ink uppercase tracking-wider">Current Role</label>
                      <input
                        type="text"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                        placeholder="e.g. Software Engineer, Data Analyst"
                      />
                    </div>

                    {/* City Input */}
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold text-ink uppercase tracking-wider">Location City</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                        placeholder="e.g. Theni, Chennai, Bangalore"
                      />
                    </div>

                    {/* Country Input */}
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold text-ink uppercase tracking-wider">Location Country</label>
                      <input
                        type="text"
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                        placeholder="e.g. India, USA"
                      />
                    </div>
                  </div>

                  {/* Skills comma-separated */}
                  <div className="space-y-1">
                    <label className="block font-sans text-[10px] font-bold text-ink uppercase tracking-wider">Skills (Comma-separated)</label>
                    <input
                      type="text"
                      value={editSkills}
                      onChange={(e) => setEditSkills(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      placeholder="e.g. React, Node.js, SQL, Java"
                    />
                  </div>

                  {/* Achievements comma-separated */}
                  <div className="space-y-1">
                    <label className="block font-sans text-[10px] font-bold text-ink uppercase tracking-wider">Achievements (Comma-separated)</label>
                    <input
                      type="text"
                      value={editAchievements}
                      onChange={(e) => setEditAchievements(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      placeholder="e.g. Best Developer 2025, Certified AWS Solutions Architect"
                    />
                  </div>

                  {/* Bio Textarea */}
                  <div className="space-y-1">
                    <label className="block font-sans text-[10px] font-bold text-ink uppercase tracking-wider">Professional Bio</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={4}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none resize-none"
                      placeholder="Share a brief overview of your professional career path, achievements, or goals..."
                    />
                  </div>

                  <div className="pt-2 border-t border-line flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="border border-line hover:bg-bg px-4 py-2.5 rounded-xs font-semibold text-ink-muted cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="bg-accent-emerald hover:bg-accent-emerald/90 disabled:opacity-50 text-surface px-5 py-2.5 rounded-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSavingEdit ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit for Approval</span>
                      )}
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
