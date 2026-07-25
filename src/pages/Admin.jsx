import React, { useState } from "react";
import { 
  ShieldAlert, 
  UserCheck, 
  Trash2, 
  Upload, 
  UserPlus, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  FileCheck,
  Users,
  Search,
  Check,
  X,
  Briefcase,
  Award,
  SlidersHorizontal,
  Mail,
  Phone,
  Image,
  Video
} from "lucide-react";
import { departments } from "../data/mockAlumni";
import API_BASE from "../config";

export default function Admin({ mockAlumni, setMockAlumni, startEditGeo }) {
  const [activeTab, setActiveTab] = useState("queue"); // queue, all, placed, register, import, editRequests
  const [searchTerm, setSearchTerm] = useState("");
  const [adminSelectedDept, setAdminSelectedDept] = useState("ALL");

  const [editRequests, setEditRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);

  const [pendingContributions, setPendingContributions] = useState([]);
  const [isLoadingContribs, setIsLoadingContribs] = useState(false);

  const fetchEditRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/edit-requests`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEditRequests(data);
      }
    } catch (err) {
      console.log("Offline mode: Loading empty edit requests list");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchPendingRegistrations = async () => {
    setIsLoadingPending(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/pending-registrations`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("jwt_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingAlumni(data);
      }
    } catch (err) {
      console.log("Offline mode: Empty pending list");
    } finally {
      setIsLoadingPending(false);
    }
  };

  const fetchPendingContributions = async () => {
    setIsLoadingContribs(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/pending-contributions`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("jwt_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingContributions(data);
      }
    } catch (err) {
      console.log("Offline mode: Empty pending contributions");
    } finally {
      setIsLoadingContribs(false);
    }
  };

  React.useEffect(() => {
    fetchEditRequests();
    fetchPendingRegistrations();
    fetchPendingContributions();
  }, []);

  const handleModerateEditRequest = async (requestId, action, pendingData, alumniId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/edit-requests/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        },
        body: JSON.stringify({ requestId, action })
      });

      if (res.ok) {
        if (action === "approve") {
          setMockAlumni(prev => prev.map(a => {
            if (a.id == alumniId || a.id == parseInt(alumniId)) {
              const skillsArray = typeof pendingData.skills === 'string'
                ? pendingData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
                : (Array.isArray(pendingData.skills) ? pendingData.skills : []);
              const achievementsArray = typeof pendingData.achievements === 'string'
                ? pendingData.achievements.split(',').map(s => s.trim()).filter(s => s !== '')
                : (Array.isArray(pendingData.achievements) ? pendingData.achievements : []);
              const isPlaced = pendingData.current_company && !["nil", "n/a", "none", ""].includes(pendingData.current_company.toLowerCase());

              return {
                ...a,
                email: pendingData.email || null,
                current_company: pendingData.current_company || null,
                current_role: pendingData.current_role || null,
                location: {
                  city: pendingData.location_city || null,
                  country: pendingData.location_country || 'India'
                },
                location_city: pendingData.location_city || null,
                location_country: pendingData.location_country || 'India',
                bio: pendingData.bio || null,
                experience_years: pendingData.experience_years || null,
                skills: skillsArray,
                achievements: achievementsArray,
                placed: isPlaced || false
              };
            }
            return a;
          }));
        }
        
        setEditRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (err) {
      console.log("Offline mode: Moderate request locally");
      if (action === "approve") {
        setMockAlumni(prev => prev.map(a => {
          if (a.id == alumniId || a.id == parseInt(alumniId)) {
            const skillsArray = typeof pendingData.skills === 'string'
              ? pendingData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
              : (Array.isArray(pendingData.skills) ? pendingData.skills : []);
            const achievementsArray = typeof pendingData.achievements === 'string'
              ? pendingData.achievements.split(',').map(s => s.trim()).filter(s => s !== '')
              : (Array.isArray(pendingData.achievements) ? pendingData.achievements : []);
            const isPlaced = pendingData.current_company && !["nil", "n/a", "none", ""].includes(pendingData.current_company.toLowerCase());

            return {
              ...a,
              email: pendingData.email || null,
              current_company: pendingData.current_company || null,
              current_role: pendingData.current_role || null,
              location: {
                city: pendingData.location_city || null,
                country: pendingData.location_country || 'India'
              },
              location_city: pendingData.location_city || null,
              location_country: pendingData.location_country || 'India',
              bio: pendingData.bio || null,
              experience_years: pendingData.experience_years || null,
              skills: skillsArray,
              achievements: achievementsArray,
              placed: isPlaced || false
            };
          }
          return a;
        }));
      }
      setEditRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };
  
  // 1. Approval queue state
  const approvedAlumni = mockAlumni.filter(a => a.status === "approved" || !a.status);

  const handleApprove = async (id) => {
    const targetAlumni = pendingAlumni.find(a => a.id === id);
    setPendingAlumni(prev => prev.filter(a => a.id !== id));
    
    if (targetAlumni) {
      setMockAlumni(prev => [{ ...targetAlumni, status: "approved", verified: true }, ...prev]);
    }
    
    try {
      await fetch(`${API_BASE}/api/alumni/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        },
        body: JSON.stringify({ id, action: "approve" })
      });
    } catch (err) {
      console.log("Offline mode: Approved in memory only");
    }
  };

  const handleReject = async (id) => {
    setPendingAlumni(prev => prev.filter(a => a.id !== id));
    
    try {
      await fetch(`${API_BASE}/api/alumni/moderate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        },
        body: JSON.stringify({ id, action: "reject" })
      });
    } catch (err) {
      console.log("Offline mode: Rejected in memory only");
    }
  };

  // 2. Register Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBatch, setRegBatch] = useState(2022);
  const [regDept, setRegDept] = useState("CSE");
  const [regCompany, setRegCompany] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regCountry, setRegCountry] = useState("India");
  const [regBio, setRegBio] = useState("");
  const [regSkills, setRegSkills] = useState("");
  
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleSelfRegister = (e) => {
    e.preventDefault();
    const skillsArray = regSkills
      ? regSkills.split(",").map(s => s.trim()).filter(s => s !== "")
      : [];

    const isPlaced = regCompany && !["nil", "n/a", "none", ""].includes(regCompany.toLowerCase());

    const newAlumni = {
      id: "a_reg_" + (mockAlumni.length + 1),
      name: regName,
      photo_url: null,
      email: regEmail || null, 
      phone: regPhone || null, 
      batch_year: parseInt(regBatch),
      department: regDept,
      registration_no: null,
      linkedin_url: null,
      current_company: regCompany || null,
      current_role: regRole || null,
      location: {
        city: regCity || "Chennai",
        country: regCountry || "India",
        lat: 13.0827,
        lng: 80.2707
      },
      career_history: regCompany ? [{ company: regCompany, role: regRole, start_year: parseInt(regBatch), end_year: null }] : [],
      bio: regBio || null,
      achievements: [],
      skills: skillsArray,
      mentor_available: false,
      mentor_fields: [],
      verified: false,
      status: "pending", 
      placed: isPlaced
    };

    setMockAlumni([...mockAlumni, newAlumni]);
    setRegisterSuccess(true);
    
    // Reset Form
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegCompany("");
    setRegRole("");
    setRegCity("");
    setRegBio("");
    setRegSkills("");

    setTimeout(() => {
      setRegisterSuccess(false);
      setActiveTab("queue"); 
    }, 2000);
  };

  // 3. Bulk Import simulator state
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState(null);

  const simulateCSVImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      const mockCSVData = [
        {
          id: "bulk_1",
          name: "Harish Kumar",
          email: null, 
          phone: "9123456780",
          batch_year: 2021,
          department: "IT",
          current_company: "Zoho",
          current_role: "Software Developer",
          location: { city: "Chennai", country: "India", lat: 13.0827, lng: 80.2707 },
          skills: ["Java", "JS"],
          verified: true,
          status: "approved",
          placed: true
        },
        {
          id: "bulk_2",
          name: "Aisha Fatima",
          email: "aisha.f@intel.com",
          phone: "9988776655",
          batch_year: 2018,
          department: "ECE",
          current_company: "Intel",
          current_role: "VLSI Validation Engineer",
          location: { city: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946 },
          skills: ["Verilog", "ASIC"],
          verified: true,
          status: "approved",
          placed: true
        },
        {
          id: "bulk_3",
          name: "John Wesley",
          email: null, 
          phone: null, 
          batch_year: 2015,
          department: "Chemical",
          current_company: null, 
          current_role: null,
          location: { city: "Houston", country: "USA", lat: 29.7604, lng: -95.3698 },
          skills: [],
          verified: true,
          status: "approved",
          placed: false
        }
      ];

      setMockAlumni(prev => [...prev, ...mockCSVData]);
      setIsImporting(false);
      setCsvUploaded(true);
      setImportReport({
        recordsParsed: 3,
        recordsInserted: 3,
        errors: 0
      });
    }, 2000);
  };

  // Filter for "All Alumni" database table (incorporates department selector)
  const filteredAllAlumni = mockAlumni.filter((a) => {
    if (adminSelectedDept !== "ALL" && a.department !== adminSelectedDept) {
      return false;
    }
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        (a.current_company || "").toLowerCase().includes(q) ||
        a.batch_year.toString().includes(q)
      );
    }
    return true;
  });

  // Filter for "Placed Alumni" database table (incorporates department selector)
  const filteredPlacedAlumni = mockAlumni.filter((a) => {
    if (!a.placed) {
      return false;
    }
    if (adminSelectedDept !== "ALL" && a.department !== adminSelectedDept) {
      return false;
    }
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        (a.current_company || "").toLowerCase().includes(q) ||
        a.batch_year.toString().includes(q)
      );
    }
    return true;
  });

  const renderComparison = (req) => {
    const currentAlumni = mockAlumni.find(a => a.id == req.alumni_id || a.id == parseInt(req.alumni_id));
    if (!currentAlumni) return <p className="text-red-500 text-xs">Corresponding alumni record not found.</p>;

    const fields = [
      { label: "Email", key: "email", current: currentAlumni.email, proposed: req.pending_data.email },
      { label: "Current Company", key: "current_company", current: currentAlumni.current_company, proposed: req.pending_data.current_company },
      { label: "Current Role", key: "current_role", current: currentAlumni.current_role, proposed: req.pending_data.current_role },
      { label: "Location City", key: "location_city", current: currentAlumni.location_city || currentAlumni.location?.city, proposed: req.pending_data.location_city },
      { label: "Location Country", key: "location_country", current: currentAlumni.location_country || currentAlumni.location?.country, proposed: req.pending_data.location_country },
      { label: "Experience Years", key: "experience_years", current: currentAlumni.experience_years, proposed: req.pending_data.experience_years },
      { 
        label: "Skills", 
        key: "skills", 
        current: Array.isArray(currentAlumni.skills) ? currentAlumni.skills.join(", ") : currentAlumni.skills, 
        proposed: req.pending_data.skills 
      },
      { 
        label: "Achievements", 
        key: "achievements", 
        current: Array.isArray(currentAlumni.achievements) ? currentAlumni.achievements.join(", ") : currentAlumni.achievements, 
        proposed: req.pending_data.achievements 
      },
      {
        label: "Profile Photo",
        key: "photo_url",
        current: currentAlumni.photo_url || "No photo",
        proposed: req.pending_data.photo_url || "No new photo",
        isImage: true
      },
      { label: "Bio", key: "bio", current: currentAlumni.bio, proposed: req.pending_data.bio }
    ];

    const changedFields = fields.filter(f => {
      const normCurrent = (f.current || "").toString().trim().toLowerCase();
      const normProposed = (f.proposed || "").toString().trim().toLowerCase();
      return normCurrent !== normProposed;
    });

    if (changedFields.length === 0) {
      return <p className="text-ink-muted text-xs italic">Submitted details match current values.</p>;
    }

    return (
      <div className="overflow-x-auto border border-line rounded-sm bg-bg/50">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="bg-bg border-b border-line text-ink-muted">
              <th className="p-3 font-semibold uppercase tracking-wider">Field</th>
              <th className="p-3 font-semibold uppercase tracking-wider">Current Live Data</th>
              <th className="p-3 font-semibold uppercase tracking-wider">Proposed Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            {changedFields.map(f => (
              <tr key={f.key} className="hover:bg-bg/10 transition-colors">
                <td className="p-3 font-bold text-ink">{f.label}</td>
                <td className="p-3 text-ink-muted line-through decoration-red-400">
                  {f.isImage && f.current !== "No photo" ? <img src={`${API_BASE}${f.current}`} alt="current" className="w-12 h-12 rounded-sm object-cover"/> : f.current || "Not Provided"}
                </td>
                <td className="p-3 text-accent-emerald font-semibold bg-accent-emerald/5">
                  {f.isImage && f.proposed !== "No new photo" ? <img src={`${API_BASE}${f.proposed}`} alt="proposed" className="w-12 h-12 rounded-sm object-cover border border-accent-emerald"/> : f.proposed || "Not Provided"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      
      {/* Admin Dashboard Header */}
      <header className="border-b border-line pb-4">
        <h1 className="font-display font-bold text-3xl text-ink">Registry Management</h1>
        <p className="font-sans text-xs text-ink-muted mt-1">
          Perform administrative tasks, manage registrations, review contact records, or import spreadsheet rosters.
        </p>
      </header>

      {/* Grid: Sub-sidebar left + Main Content right */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Sub-Sidebar */}
        <aside className="w-full md:w-64 shrink-0 bg-surface border border-line rounded-sm p-4 space-y-1">
          <span className="font-sans font-bold text-[10px] text-ink-muted uppercase tracking-wider block px-2 mb-3">
            Admin Console Menu
          </span>
          
          <button
            onClick={() => setActiveTab("queue")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === "queue" 
                ? "bg-ink border-ink text-surface" 
                : "border-transparent text-ink hover:bg-bg hover:text-accent-gold"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Approval Queue</span>
            </div>
            {pendingAlumni.length > 0 && (
              <span className="font-data text-[10px] bg-accent-gold text-surface px-1.5 py-0.5 rounded-full font-bold">
                {pendingAlumni.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("all"); setAdminSelectedDept("ALL"); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-sm font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === "all" 
                ? "bg-ink border-ink text-surface" 
                : "border-transparent text-ink hover:bg-bg hover:text-accent-gold"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>All Alumni List</span>
          </button>

          <button
            onClick={() => { setActiveTab("placed"); setAdminSelectedDept("ALL"); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-sm font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === "placed" 
                ? "bg-ink border-ink text-surface" 
                : "border-transparent text-ink hover:bg-bg hover:text-accent-gold"
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Placed Alumni List</span>
          </button>

          <button
            onClick={() => setActiveTab("register")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-sm font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === "register" 
                ? "bg-ink border-ink text-surface" 
                : "border-transparent text-ink hover:bg-bg hover:text-accent-gold"
            }`}
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Register Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("import")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-sm font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === "import" 
                ? "bg-ink border-ink text-surface" 
                : "border-transparent text-ink hover:bg-bg hover:text-accent-gold"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Bulk Import Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab("editRequests")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === "editRequests" 
                ? "bg-ink border-ink text-surface" 
                : "border-transparent text-ink hover:bg-bg hover:text-accent-gold"
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Profile Edit Requests</span>
            </div>
            {editRequests.length > 0 && (
              <span className="font-data text-[10px] bg-accent-gold text-surface px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {editRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("contributions")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === "contributions" 
                ? "bg-ink border-ink text-surface" 
                : "border-transparent text-ink hover:bg-bg hover:text-accent-gold"
            }`}
          >
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 shrink-0" />
              <span>Pending Contributions</span>
            </div>
            {pendingContributions.length > 0 && (
              <span className="font-data text-[10px] bg-accent-gold text-surface px-1.5 py-0.5 rounded-full font-bold">
                {pendingContributions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("gallery")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-sm font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
              activeTab === "gallery" 
                ? "bg-ink border-ink text-surface" 
                : "border-transparent text-ink hover:bg-bg hover:text-accent-gold"
            }`}
          >
            <Image className="w-4 h-4 shrink-0" />
            <span>Upload to Gallery</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full bg-surface border border-line rounded-sm p-6 min-h-[450px]">
          
          {/* Tab 1: Approval Queue Panel */}
          {activeTab === "queue" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-accent-gold" />
                  <span>Pending Approvals Queue</span>
                </h3>
                <p className="font-sans text-xs text-ink-muted mt-1">
                  Alumni profiles awaiting verification against university graduation records.
                </p>
              </div>

              {pendingAlumni.length > 0 ? (
                <div className="divide-y divide-line">
                  {pendingAlumni.map((item) => (
                    <div key={item.id} className="py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-ink text-surface flex items-center justify-center font-display font-bold text-sm">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-sans font-bold text-sm text-ink">{item.name}</h4>
                            <p className="font-sans text-xs text-ink-muted">{item.email || "Not Found"}</p>
                          </div>
                        </div>
                        
                        <div className="font-data text-xs text-accent-gold font-bold flex flex-wrap items-center gap-2 pl-1">
                          <span>Batch of {item.batch_year}</span>
                          <span>•</span>
                          <span>{item.department}</span>
                          {item.current_company ? (
                            <>
                              <span>•</span>
                              <span className="text-ink font-sans">{item.current_role || "Not Found"} @ {item.current_company}</span>
                            </>
                          ) : (
                            <>
                              <span>•</span>
                              <span className="text-ink-muted italic font-sans">Not Placed</span>
                            </>
                          )}
                        </div>
                        
                        {item.phone && (
                          <div className="text-xs text-ink-muted pl-1 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-accent-emerald" />
                            <span>Registry Phone: <strong>{item.phone}</strong></span>
                          </div>
                        )}
                        
                        {item.bio && (
                          <p className="font-sans text-xs text-ink-muted/80 pl-1 max-w-2xl italic">
                            "{item.bio}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="bg-accent-emerald hover:bg-accent-emerald/90 text-surface text-xs font-bold py-2.5 px-4 rounded-xs transition-colors flex items-center justify-center gap-1 w-full md:w-auto shadow-xs"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        
                        <button
                          onClick={() => handleReject(item.id)}
                          className="border border-line hover:border-red-500 hover:text-red-500 text-ink-muted text-xs font-semibold py-2.5 px-4 rounded-xs transition-all w-full md:w-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center max-w-md mx-auto space-y-3">
                  <CheckCircle className="w-12 h-12 text-accent-emerald mx-auto opacity-50" />
                  <h4 className="font-sans font-bold text-sm text-ink">Queue is Empty</h4>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    All submitted alumni records are processed.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: All Alumni Database Panel (Admin ONLY - Shows Phone Numbers, Department-wise) */}
          {activeTab === "all" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent-gold" />
                  <span>All Alumni Registry (Department-wise)</span>
                </h3>
                <p className="font-sans text-xs text-ink-muted mt-1">
                  Complete list of registered graduates. Use the tabs below to view records department-wise.
                </p>
              </div>

              {/* Department Selector Tabs */}
              <div className="space-y-2 border-b border-line pb-3">
                <span className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider">Select Department</span>
                <div className="flex flex-wrap gap-1.5">
                  {["ALL", ...departments].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setAdminSelectedDept(dept)}
                      className={`px-3 py-1.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        adminSelectedDept === dept
                          ? "bg-accent-gold border-accent-gold text-surface"
                          : "bg-bg border-line text-ink-muted hover:border-accent-gold hover:text-ink"
                      }`}
                    >
                      {dept === "ALL" ? "All Departments" : dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Database search box */}
              <div className="relative">
                <div className="flex items-center bg-bg border border-line focus-within:border-accent-gold transition-all rounded-sm px-3 shadow-xs">
                  <Search className="w-4.5 h-4.5 text-ink-muted shrink-0 mr-2" />
                  <input
                    type="text"
                    placeholder="Search active lists by name, company, or batch year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-ink text-xs py-3"
                  />
                </div>
              </div>

              {/* Table Ledger Grid */}
              <div className="overflow-x-auto border border-line rounded-sm">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg border-b border-line text-ink-muted uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Batch</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Employer / Company</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Location / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredAllAlumni.length > 0 ? (
                      filteredAllAlumni.map((a, idx) => (
                        <tr key={idx} className="hover:bg-bg/40">
                          <td className="py-3.5 px-4 font-bold text-ink">{a.name}</td>
                          <td className="py-3.5 px-4 font-data font-semibold text-accent-gold">{a.batch_year}</td>
                          <td className="py-3.5 px-4 font-semibold text-ink-muted">{a.department}</td>
                          <td className="py-3.5 px-4 font-medium text-ink">
                            {a.placed ? (
                              <span className="flex items-center gap-1 text-ink">
                                <Briefcase className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                                <span className="truncate max-w-[120px]">{a.current_company}</span>
                              </span>
                            ) : (
                              <span className="text-ink-muted italic">Not Found</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-data text-ink font-semibold">
                            {a.phone ? (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-accent-emerald shrink-0" />
                                <span>{a.phone}</span>
                              </span>
                            ) : (
                              <span className="text-ink-muted/50 italic">Not Found</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border uppercase tracking-wider ${
                              a.status === 'approved' 
                                ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald'
                                : a.status === 'pending'
                                ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold'
                                : 'bg-red-50 border-red-200 text-red-600'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              {a.location?.lat && a.location?.lng ? (
                                <span className="text-accent-emerald font-semibold font-data">
                                  📍 {a.location.city} ({a.location.lat.toFixed(2)}, {a.location.lng.toFixed(2)})
                                </span>
                              ) : (
                                <span className="text-ink-muted/50 italic">
                                  No coordinates
                                </span>
                              )}
                              <button
                                onClick={() => startEditGeo(a)}
                                className="text-accent-gold hover:text-accent-gold/80 font-bold uppercase tracking-wider text-[10px] text-left underline cursor-pointer"
                              >
                                Edit Geo
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-ink-muted">
                          No database records match the selected department or query criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Placed Alumni Database Panel (Admin ONLY - Shows Phone Numbers, Department-wise) */}
          {activeTab === "placed" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent-emerald" />
                  <span>Placed Alumni Registry (Department-wise)</span>
                </h3>
                <p className="font-sans text-xs text-ink-muted mt-1">
                  Complete list of employed graduates. Use the tabs below to view records department-wise.
                </p>
              </div>

              {/* Department Selector Tabs */}
              <div className="space-y-2 border-b border-line pb-3">
                <span className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider">Select Department</span>
                <div className="flex flex-wrap gap-1.5">
                  {["ALL", ...departments].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setAdminSelectedDept(dept)}
                      className={`px-3 py-1.5 rounded-sm font-sans text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        adminSelectedDept === dept
                          ? "bg-accent-gold border-accent-gold text-surface"
                          : "bg-bg border-line text-ink-muted hover:border-accent-gold hover:text-ink"
                      }`}
                    >
                      {dept === "ALL" ? "All Departments" : dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Database search box */}
              <div className="relative">
                <div className="flex items-center bg-bg border border-line focus-within:border-accent-gold transition-all rounded-sm px-3 shadow-xs">
                  <Search className="w-4.5 h-4.5 text-ink-muted shrink-0 mr-2" />
                  <input
                    type="text"
                    placeholder="Search active lists by name, company, or batch year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-ink text-xs py-3"
                  />
                </div>
              </div>

              {/* Table Ledger Grid */}
              <div className="overflow-x-auto border border-line rounded-sm">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg border-b border-line text-ink-muted uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Batch</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Company / Employer</th>
                      <th className="py-3 px-4">Role Designation</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Location / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredPlacedAlumni.length > 0 ? (
                      filteredPlacedAlumni.map((a, idx) => (
                        <tr key={idx} className="hover:bg-bg/40">
                          <td className="py-3.5 px-4 font-bold text-ink">{a.name}</td>
                          <td className="py-3.5 px-4 font-data font-semibold text-accent-gold">{a.batch_year}</td>
                          <td className="py-3.5 px-4 font-semibold text-ink-muted">{a.department}</td>
                          <td className="py-3.5 px-4 font-semibold text-accent-emerald">
                            {a.current_company || "Not Found"}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-ink">
                            {a.current_role || "Not Found"}
                          </td>
                          <td className="py-3.5 px-4 font-data text-ink font-semibold">
                            {a.phone ? (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-accent-emerald shrink-0" />
                                <span>{a.phone}</span>
                              </span>
                            ) : (
                              <span className="text-ink-muted/50 italic">Not Found</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              {a.location?.lat && a.location?.lng ? (
                                <span className="text-accent-emerald font-semibold font-data">
                                  📍 {a.location.city} ({a.location.lat.toFixed(2)}, {a.location.lng.toFixed(2)})
                                </span>
                              ) : (
                                <span className="text-ink-muted/50 italic">
                                  No coordinates
                                </span>
                              )}
                              <button
                                onClick={() => startEditGeo(a)}
                                className="text-accent-gold hover:text-accent-gold/80 font-bold uppercase tracking-wider text-[10px] text-left underline cursor-pointer"
                              >
                                Edit Geo
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-ink-muted">
                          No placed records match the selected department or query criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Register Form Panel */}
          {activeTab === "register" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-accent-emerald" />
                  <span>Self-Registration Simulator</span>
                </h3>
                <p className="font-sans text-xs text-ink-muted mt-1">
                  Simulate registrations. Records without details will show "Not Found" rather than fake values.
                </p>
              </div>

              {registerSuccess ? (
                <div className="py-12 text-center max-w-sm mx-auto space-y-3 text-accent-emerald">
                  <div className="w-12 h-12 rounded-full bg-accent-emerald/10 border border-accent-emerald/30 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-sans font-bold text-base">Registration Submitted!</h4>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    Profile successfully placed in the Approval Queue. Redirecting...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSelfRegister} className="space-y-4 max-w-3xl">
                  
                  {/* Identity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter name (e.g. Abirami A)"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Contact Phone (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 9629613521"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Email & Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="Leave blank if NIL (shows Not Found)"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Department</label>
                      <select
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      >
                        {departments.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Batch & Employer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Batch Year</label>
                      <input
                        type="number"
                        required
                        min={2000}
                        max={2026}
                        value={regBatch}
                        onChange={(e) => setRegBatch(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Employer / Company (Optional)</label>
                      <input
                        type="text"
                        placeholder="Leave blank if NIL (shows Not Found)"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Designation / Role (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Consultant QA"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">City (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Bangalore"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Skills (Optional)</label>
                    <input
                      type="text"
                      placeholder="React, Java, VLSI"
                      value={regSkills}
                      onChange={(e) => setRegSkills(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Bio Biography</label>
                    <textarea
                      placeholder="Brief summary..."
                      rows={3}
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none resize-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-line flex justify-end">
                    <button
                      type="submit"
                      className="bg-accent-emerald hover:bg-accent-emerald/90 text-surface text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xs transition-colors shadow-xs"
                    >
                      Register Profile
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab 5: CSV Import Panel */}
          {activeTab === "import" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-accent-gold" />
                  <span>Bulk Sheet Ingestion</span>
                </h3>
                <p className="font-sans text-xs text-ink-muted mt-1">
                  Upload registrar rosters. Non-existent fields will remain null (rendered as "Not Found" in directory).
                </p>
              </div>

              {csvUploaded ? (
                <div className="bg-bg border border-line p-6 rounded-sm space-y-4 animate-fade-in max-w-xl">
                  <div className="flex items-center gap-2 text-accent-emerald font-bold text-sm">
                    <FileCheck className="w-5 h-5" />
                    <span>Spreadsheet Successfully Imported!</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 py-2 font-data text-xs border-y border-line">
                    <div>
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Parsed</span>
                      <span className="font-bold text-lg text-ink">{importReport.recordsParsed}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Inserted</span>
                      <span className="font-bold text-lg text-accent-emerald">{importReport.recordsInserted}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Errors</span>
                      <span className="font-bold text-lg text-red-500">{importReport.errors}</span>
                    </div>
                  </div>

                  <div className="text-xs text-ink-muted space-y-1 font-semibold">
                    <p>✔ Harish Kumar (IT 2021) - Added (Email: Not Found)</p>
                    <p>✔ Aisha Fatima (ECE 2018) - Added (Email: aisha.f@intel.com)</p>
                    <p>✔ John Wesley (Chemical 2015) - Added (Email: Not Found, Placed: Not Found)</p>
                  </div>

                  <button
                    onClick={() => {
                      setCsvUploaded(false);
                      setImportReport(null);
                    }}
                    className="bg-ink text-surface text-xs font-semibold px-4 py-2.5 rounded-xs"
                  >
                    Import Another Sheet
                  </button>
                </div>
              ) : (
                <div className="max-w-xl space-y-6">
                  {/* Drag-drop box */}
                  <div className="border-2 border-dashed border-line hover:border-accent-emerald rounded-sm p-12 text-center bg-bg/50 cursor-pointer transition-colors group">
                    <Upload className="w-10 h-10 text-ink-muted mx-auto mb-3 opacity-60 group-hover:text-accent-emerald" />
                    <h4 className="font-sans font-bold text-sm text-ink mb-1">Upload Alumni Sheet</h4>
                    <p className="font-sans text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                      Select CSV or XLS spreadsheet. Any columns like email or company lacking data will display as "Not Found".
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={simulateCSVImport}
                      disabled={isImporting}
                      className="bg-ink hover:bg-ink-muted disabled:bg-ink-muted text-surface text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-xs transition-colors flex items-center justify-center gap-2 border border-ink shadow-sm"
                    >
                      {isImporting ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-surface border-t-transparent animate-spin mr-1"></span>
                          <span>Parsing Sheet...</span>
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>Simulate Sheet Import</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Profile Edit Requests Moderation Panel */}
          {activeTab === "editRequests" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-accent-gold" />
                  <span>Profile Modification Requests</span>
                </h3>
                <p className="font-sans text-xs text-ink-muted mt-1">
                  Review and moderate updates requested by alumni for their profile records. Approving merges changes; rejecting discards them.
                </p>
              </div>

              {isLoadingRequests ? (
                <div className="flex flex-col items-center justify-center py-12 text-ink-muted gap-2">
                  <span className="font-sans text-xs">Loading modification requests...</span>
                </div>
              ) : editRequests.length > 0 ? (
                <div className="space-y-6">
                  {editRequests.map((req) => (
                    <div key={req.id} className="border border-line bg-surface p-5 rounded-sm space-y-4 shadow-xs">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-line">
                        <div>
                          <h4 className="font-display font-bold text-base text-ink">{req.name}</h4>
                          <p className="font-sans text-xs text-accent-gold font-semibold">
                            Batch of {req.batch_year} · {req.department} Department
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleModerateEditRequest(req.id, "reject", req.pending_data, req.alumni_id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold uppercase py-2 px-4 rounded-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModerateEditRequest(req.id, "approve", req.pending_data, req.alumni_id)}
                            className="bg-accent-emerald hover:bg-accent-emerald/90 text-surface text-xs font-bold uppercase py-2 px-5 rounded-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        </div>
                      </div>

                      {/* Side-by-side comparison */}
                      {renderComparison(req)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-bg/50 border border-line rounded-sm space-y-3">
                  <div className="w-12 h-12 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mx-auto text-accent-emerald font-bold">
                    ✓
                  </div>
                  <h4 className="font-display font-bold text-sm text-ink">All Up To Date</h4>
                  <p className="font-sans text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                    There are no pending profile modification requests to review.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* New Tab: Pending Contributions */}
          {activeTab === "contributions" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl text-ink">Pending Alumni Contributions</h2>
                <p className="font-sans text-xs text-ink-muted mt-1 max-w-2xl">
                  Review and approve webinars, masterclasses, and workshops submitted by alumni.
                </p>
              </div>

              {isLoadingContribs ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold mx-auto"></div>
                </div>
              ) : pendingContributions.length === 0 ? (
                <div className="text-center py-20 border border-line border-dashed rounded-md bg-bg">
                  <CheckCircle className="w-8 h-8 text-ink-muted mx-auto mb-3" />
                  <p className="font-sans font-semibold text-ink-muted">No pending contributions to review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingContributions.map((c) => (
                    <div key={c.id} className="bg-bg border border-line rounded-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold border border-accent-gold/20 bg-accent-gold/10 px-2 py-0.5 rounded-sm">
                            {c.type}
                          </span>
                          <span className="font-sans text-xs font-bold text-ink-muted">{new Date(c.event_date).toLocaleString()}</span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-ink">{c.title}</h3>
                        <p className="font-sans text-sm text-ink-muted line-clamp-2">{c.description}</p>
                        <p className="font-sans text-xs text-ink mt-2">
                          Submitted by: <span className="font-bold">{c.name}</span> ({c.department}, {c.batch_year})
                        </p>
                        {c.link && (
                          <p className="font-sans text-xs text-accent-emerald mt-1">Link: {c.link}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`${API_BASE}/api/admin/moderate-contribution`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
                                },
                                body: JSON.stringify({ id: c.id, action: 'approve' })
                              });
                              if (res.ok) fetchPendingContributions();
                            } catch (e) { console.error(e); }
                          }}
                          className="px-4 py-2 bg-ink hover:bg-ink-muted text-surface text-xs font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`${API_BASE}/api/admin/moderate-contribution`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
                                },
                                body: JSON.stringify({ id: c.id, action: 'reject' })
                              });
                              if (res.ok) fetchPendingContributions();
                            } catch (e) { console.error(e); }
                          }}
                          className="px-4 py-2 border border-line text-ink hover:bg-bg hover:text-accent-red text-xs font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Tab: Gallery Upload */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl text-ink">Upload to Event Gallery</h2>
                <p className="font-sans text-xs text-ink-muted mt-1 max-w-2xl">
                  Add new photos to the alumni event gallery.
                </p>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  try {
                    const res = await fetch(`${API_BASE}/api/admin/gallery`, {
                      method: "POST",
                      headers: {
                        "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
                      },
                      body: formData
                    });
                    if (res.ok) {
                      alert("Image uploaded successfully!");
                      e.target.reset();
                    } else {
                      alert("Upload failed.");
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Error uploading image.");
                  }
                }}
                className="max-w-md bg-bg border border-line p-6 rounded-sm space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Title</label>
                  <input required name="title" type="text" className="w-full bg-surface border border-line p-2 text-sm rounded-xs focus:border-accent-gold outline-none" placeholder="e.g., Annual Tech Fest 2026" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Category</label>
                  <input required name="category" type="text" className="w-full bg-surface border border-line p-2 text-sm rounded-xs focus:border-accent-gold outline-none" placeholder="e.g., Hackathons, Reunions" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Event Date</label>
                  <input required name="event_date" type="date" className="w-full bg-surface border border-line p-2 text-sm rounded-xs focus:border-accent-gold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">Image File</label>
                  <input required name="image" type="file" accept="image/*" className="w-full bg-surface border border-line p-2 text-sm rounded-xs focus:border-accent-gold outline-none" />
                </div>
                <button type="submit" className="w-full bg-ink hover:bg-ink-muted text-surface py-3 rounded-sm font-sans text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload Image
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Geolocation Update Modal popup overlay removed from Admin.jsx (moved to App.jsx root) */}

    </div>
  );
}
