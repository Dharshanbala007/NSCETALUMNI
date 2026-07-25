import React, { useState, useEffect, useRef } from "react";
import LeftRailNav from "./components/LeftRailNav";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import Profile from "./pages/Profile";
import Map from "./pages/Map";
import Analytics from "./pages/Analytics";
import Jobs from "./pages/Jobs";
import Mentorship from "./pages/Mentorship";
import Events from "./pages/Events";
import Admin from "./pages/Admin";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Gallery from "./pages/Gallery";
import Contributions from "./pages/Contributions";
import EventGallery from "./pages/EventGallery";
import RegistrationModal from "./components/RegistrationModal";
import { User, LogIn, LogOut, Shield, Check, AlertCircle, X, ArrowUp, CheckCircle, MapPin } from "lucide-react";

// Mock databases
import { mockAlumni as initialAlumni } from "./data/mockAlumni";
import { mockJobs as initialJobs } from "./data/mockJobs";
import { mockEvents as initialEvents } from "./data/mockEvents";

const cityCoordsLookup = {
  theni: { lat: 10.0104, lng: 77.4768 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  trichy: { lat: 10.7905, lng: 78.7047 },
  tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  dindigul: { lat: 10.3673, lng: 77.9803 },
  salem: { lat: 11.6643, lng: 78.1460 },
  tirunelveli: { lat: 8.7139, lng: 77.7567 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  karur: { lat: 10.9601, lng: 78.0766 },
  erode: { lat: 11.3410, lng: 77.7172 },
  sivakasi: { lat: 9.4532, lng: 77.7951 },
  virudhunagar: { lat: 9.5680, lng: 77.9624 },
  bodinayakanur: { lat: 10.0104, lng: 77.3486 },
  cumbum: { lat: 9.7362, lng: 77.2818 },
  periyakulam: { lat: 10.1188, lng: 77.5482 }
};

const quotes = [
  { text: "Engineering is not only study of subjects, but it is the moral studies of intellectual life.", author: "Nikola Tesla" },
  { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" },
  { text: "Connection is the energy that exists between people when they feel seen, heard, and valued.", author: "Brené Brown" },
  { text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
  { text: "Technology is best when it brings people together.", author: "Matt Mullenweg" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "It is not enough to be industrious; so are the ants. What are you industrious about?", author: "Henry David Thoreau" },
  { text: "Scientists study the world as it is; engineers create the world that has never been.", author: "Theodore von Kármán" }
];

export default function App() {
  const [currentView, setView] = useState("home");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [selectedAlumniId, setSelectedAlumniId] = useState("a1");

  // Scroll tracking and scroll-to-top controls
  const mainRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = (e) => {
    if (e.target.scrollTop > 300) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  };

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset scroll level on page navigation
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentView]);
  
  // Database States (fallbacks loaded initially)
  const [mockAlumni, setMockAlumni] = useState(initialAlumni);
  const [mockJobs, setMockJobs] = useState(initialJobs);
  const [mockEvents, setMockEvents] = useState(initialEvents);

  // Authentication States
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [loginTab, setLoginTab] = useState("alumni"); // alumni, admin
  const [loginError, setLoginError] = useState("");
  const [hasEntered, setHasEntered] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // View Transition Quote Loader states
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  const triggerNavigationLoader = (targetView) => {
    setView(targetView);
  };

  // Form fields
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [alumniName, setAlumniName] = useState("");
  const [alumniPassword, setAlumniPassword] = useState("");

  // 1. Sync Alumni records from Express API
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        console.log("[App] Syncing records from backend API...");
        const response = await fetch("/api/alumni");
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setMockAlumni(data);
            console.log(`[App] Sync complete: Loaded ${data.length} records from PostgreSQL database.`);
          }
        }
      } catch (err) {
        console.log("⚠️ [App] Backend server offline, operating in local mock database mode.");
      }
    };
    
    fetchAlumni();
  }, []);

  // 2. Check for existing auth session in localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("nscet_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem("nscet_user");
      }
    }
  }, []);

  // 3. Set global handler for profile links
  window.setSelectedAlumniId = (id) => {
    setSelectedAlumniId(id);
    triggerNavigationLoader("profile");
  };

  // Sign out handler
  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem("nscet_user");
    localStorage.removeItem("jwt_token");
    setView("home");
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    // Setup payload
    const payload = loginTab === "admin" 
      ? { username: adminUsername, password: adminPassword, loginType: "admin" }
      : { name: alumniName, password: alumniPassword, loginType: "alumni" };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem("nscet_user", JSON.stringify(data.user));
        localStorage.setItem("jwt_token", data.token);
        setShowLoginModal(false);

        // Clear fields
        setAdminUsername("");
        setAdminPassword("");
        setAlumniName("");
        setAlumniPassword("");

        // Route to dashboard
        if (data.user.role === "admin") {
          triggerNavigationLoader("admin");
        } else {
          setSelectedAlumniId(data.user.id);
          triggerNavigationLoader("profile");
        }
        setHasEntered(true);
        setIsLoggingIn(false);
      } else {
        const errData = await response.json();
        setLoginError(errData.error || "Authentication failed. Check credentials.");
      }
    } catch (err) {
      // BACKEND OFFLINE FALLBACK
      console.log("⚠️ [Auth] Server offline, executing client-side simulation check...");
      
      if (loginTab === "admin") {
        if (adminUsername.trim() === "asdf" && adminPassword === "1234") {
          const mockAdminUser = { username: "asdf", role: "admin" };
          setCurrentUser(mockAdminUser);
          localStorage.setItem("nscet_user", JSON.stringify(mockAdminUser));
          setShowLoginModal(false);
          setAdminUsername("");
          setAdminPassword("");
          setView("admin");
          setHasEntered(true);
          setIsLoggingIn(false);
        } else {
          setLoginError("Invalid credentials. Username: asdf / Password: 1234");
        }
      } else {
        // Match alumni in local database by name + universal password
        if (alumniPassword !== "1234") {
          setLoginError("Invalid password.");
          return;
        }
        const cleanInputName = alumniName.trim().toLowerCase();

        const matchedAlumni = mockAlumni.find(a => 
          a.name.trim().toLowerCase() === cleanInputName
        );

        if (matchedAlumni) {
          const mockAlumniUser = {
            id: matchedAlumni.id,
            name: matchedAlumni.name,
            role: "alumni",
            email: matchedAlumni.email || "Not Found",
            batch_year: matchedAlumni.batch_year,
            department: matchedAlumni.department
          };
          setCurrentUser(mockAlumniUser);
          localStorage.setItem("nscet_user", JSON.stringify(mockAlumniUser));
          setShowLoginModal(false);
          setAlumniName("");
          setAlumniPassword("");
          setSelectedAlumniId(matchedAlumni.id);
          setView("profile");
          setHasEntered(true);
          setIsLoggingIn(false);
        } else {
          setLoginError("Alumni name not found. Check your name matches the registry.");
        }
      }
    }
  };

  // Geolocation update states at root level
  const [editingGeoAlumni, setEditingGeoAlumni] = useState(null);
  const [geoCity, setGeoCity] = useState("");
  const [geoCountry, setGeoCountry] = useState("India");
  const [geoLat, setGeoLat] = useState("");
  const [geoLng, setGeoLng] = useState("");
  const [geoSaveStatus, setGeoSaveStatus] = useState("");

  const startEditGeo = (alumnus) => {
    setEditingGeoAlumni(alumnus);
    setGeoCity(alumnus.location?.city || "");
    setGeoCountry(alumnus.location?.country || "India");
    setGeoLat(alumnus.location?.lat !== null && alumnus.location?.lat !== undefined ? alumnus.location.lat.toString() : "");
    setGeoLng(alumnus.location?.lng !== null && alumnus.location?.lng !== undefined ? alumnus.location.lng.toString() : "");
    setGeoSaveStatus("");
  };

  const handleCityChange = (val) => {
    setGeoCity(val);
    const cleanCity = val.trim().toLowerCase();
    if (cityCoordsLookup[cleanCity]) {
      setGeoLat(cityCoordsLookup[cleanCity].lat.toString());
      setGeoLng(cityCoordsLookup[cleanCity].lng.toString());
    }
  };

  const handleSaveGeo = async (e) => {
    e.preventDefault();
    setGeoSaveStatus("saving");

    // Artificial delay for smooth transition loader feedback
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const response = await fetch("/api/alumni/update-geo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        },
        body: JSON.stringify({
          id: editingGeoAlumni.id,
          city: geoCity,
          country: geoCountry,
          lat: geoLat !== "" ? parseFloat(geoLat) : null,
          lng: geoLng !== "" ? parseFloat(geoLng) : null
        })
      });

      if (response.ok) {
        setMockAlumni(prev => 
          prev.map(a => a.id === editingGeoAlumni.id 
            ? { 
                ...a, 
                location: { 
                  city: geoCity, 
                  country: geoCountry, 
                  lat: geoLat !== "" ? parseFloat(geoLat) : null, 
                  lng: geoLng !== "" ? parseFloat(geoLng) : null 
                } 
              } 
            : a
          )
        );
        setGeoSaveStatus("success");
        setTimeout(() => setEditingGeoAlumni(null), 1200);
      } else {
        setGeoSaveStatus("error");
      }
    } catch (err) {
      setMockAlumni(prev => 
        prev.map(a => a.id === editingGeoAlumni.id 
          ? { 
              ...a, 
              location: { 
                city: geoCity, 
                country: geoCountry, 
                lat: geoLat !== "" ? parseFloat(geoLat) : null, 
                lng: geoLng !== "" ? parseFloat(geoLng) : null 
              } 
            } 
          : a
        )
      );
      setGeoSaveStatus("success");
      setTimeout(() => setEditingGeoAlumni(null), 1000);
    }
  };

  const pendingCount = mockAlumni.filter(a => a.status === "pending").length;

  // Render Splash Screen or Dedicated Login page if not entered yet
  if (!hasEntered) {
    if (isLoggingIn) {
      return (
        <Login 
          onBack={() => {
            setLoginError("");
            setIsLoggingIn(false);
          }}
          handleLogin={handleLoginSubmit}
          loginTab={loginTab}
          setLoginTab={setLoginTab}
          adminUsername={adminUsername}
          setAdminUsername={setAdminUsername}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          alumniName={alumniName}
          setAlumniName={setAlumniName}
          alumniPassword={alumniPassword}
          setAlumniPassword={setAlumniPassword}
          loginError={loginError}
        />
      );
    }

    return (
      <Landing 
        onEnterAsGuest={() => {
          setHasEntered(true);
          triggerNavigationLoader("home");
        }}
        onSignIn={() => {
          setLoginError("");
          setIsLoggingIn(true);
        }}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg relative overflow-hidden dashboard-aurora-bg">
      {/* Persistent Left Nav */}
      <LeftRailNav 
        currentView={currentView} 
        setView={triggerNavigationLoader} 
        pendingCount={pendingCount}
        currentUser={currentUser}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Pane wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        
        {/* Top Header Bar for Authentication Actions */}
        <header className="bg-surface border-b border-line px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
          <div className="text-xs font-semibold text-ink-muted flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"></span>
            {currentUser ? (
              <span>
                Session: <strong className="text-ink">{currentUser.name || currentUser.email}</strong> 
                <span className="bg-bg border border-line text-ink-muted text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ml-2 tracking-wide font-data">
                  {currentUser.role}
                </span>
              </span>
            ) : (
              <span>Institutional registry portal active. Placements and map data readable.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="bg-bg border border-line hover:border-red-600 hover:text-red-600 text-ink text-xs font-semibold px-4.5 py-2.5 rounded-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setLoginError("");
                  setShowLoginModal(true);
                }}
                className="bg-ink hover:bg-ink-muted text-surface hover:text-accent-gold text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm transition-all border border-ink shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Views Routing */}
        <main 
          ref={mainRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto relative scroll-smooth bg-bg"
        >
          {/* The Institutional Banner Header Image - Styled Custom HTML replacement */}
          <div className="bg-surface/60 backdrop-blur-md border-b border-line py-5 px-4 md:px-8 flex justify-between items-center shrink-0 group relative overflow-hidden transition-all duration-500 hover:bg-surface hover:shadow-sm">
            {/* Background Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full ease-in-out"></div>

            {/* Left Logo */}
            <div className="shrink-0 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1 z-10">
              <img src="/college_logo.png" alt="NSCET Logo" className="h-16 md:h-24 w-auto object-contain drop-shadow-sm mix-blend-multiply" />
            </div>

            {/* Center Text */}
            <div className="flex flex-col items-center justify-center text-center px-4 z-10 w-full max-w-4xl">
              <h3 className="font-sans text-[10px] md:text-xs font-bold text-ink-muted uppercase tracking-[0.2em] mb-1.5 transition-colors duration-300 group-hover:text-accent-gold">
                Theni Melapettai Hindu Nadargal Uravinmurai
              </h3>
              
              <h1 className="font-display text-base md:text-2xl lg:text-3xl font-extrabold text-ink tracking-tight mb-2.5 transition-all duration-300 group-hover:tracking-normal">
                <span className="text-[#002b5e] group-hover:text-[#003c80] transition-colors duration-300">NADAR SARASWATHI COLLEGE</span>
                <br className="md:hidden" />
                <span className="text-[#002b5e] group-hover:text-[#003c80] transition-colors duration-300 md:ml-2">OF ENGINEERING & TECHNOLOGY</span>
              </h1>
              
              <div className="font-sans text-[8px] md:text-[11px] font-medium text-ink-muted/80 flex flex-col items-center gap-0.5 md:gap-1 transition-colors duration-300 group-hover:text-ink-muted">
                <p className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <span>Approved by AICTE, New Delhi</span>
                  <span className="hidden md:inline text-accent-gold/50">•</span>
                  <span>Affiliated to Anna University, Chennai</span>
                </p>
                <p className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <span>Accredited by NAAC with 'A' Grade</span>
                  <span className="hidden md:inline text-accent-gold/50">•</span>
                  <span>Recognized under Section 2(f)</span>
                  <span className="hidden md:inline text-accent-gold/50">•</span>
                  <span>An ISO 9001:2015 Certified Institution</span>
                </p>
                <p className="font-bold text-ink mt-1 md:mt-1.5 group-hover:text-accent-gold transition-colors duration-300">
                  Vadapudupatti, Annanji (PO), Theni - 625 531
                </p>
              </div>
            </div>

            {/* Right Logo (Kamarajar Logo) */}
            <div className="shrink-0 hidden lg:flex w-24 h-24 items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3 z-10 rounded-full overflow-hidden shadow-sm border border-line">
              <img 
                src="/kamarajar.jpg" 
                alt="Kamarajar Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          {/* Smooth transition container keyed to view changes */}
          <div key={currentView} className="animate-scroll-up">
            {currentView === "home" && (
              <Home 
                setView={setView} 
                setFilterSearch={setFilterSearch} 
                setFilterDept={setFilterDept}
                mockAlumni={mockAlumni} 
                currentUser={currentUser}
                onRegisterClick={() => setShowRegistrationModal(true)}
              />
            )}
            {currentView === "directory" && (
              <Directory 
                setView={setView} 
                filterSearch={filterSearch} 
                setFilterSearch={setFilterSearch} 
                filterDept={filterDept}
                setFilterDept={setFilterDept}
                mockAlumni={mockAlumni} 
              />
            )}
            {currentView === "gallery" && (
              <Gallery 
                setView={setView} 
                mockAlumni={mockAlumni} 
              />
            )}
            {currentView === "profile" && (
              <Profile 
                setView={setView} 
                mockAlumni={mockAlumni} 
                selectedAlumniId={selectedAlumniId}
                currentUser={currentUser}
                setMockAlumni={setMockAlumni}
              />
            )}
            {currentView === "map" && (
              <Map 
                setView={setView} 
                mockAlumni={mockAlumni} 
              />
            )}
            {currentView === "analytics" && (
              <Analytics 
                mockAlumni={mockAlumni} 
              />
            )}
            {currentView === "jobs" && (
              <Jobs 
                mockJobs={mockJobs} 
                setMockJobs={setMockJobs} 
                currentUser={currentUser}
              />
            )}
            {currentView === "mentorship" && (
              <Mentorship 
                mockAlumni={mockAlumni} 
                setView={setView} 
                currentUser={currentUser}
              />
            )}
            {currentView === "events" && (
              <Events 
                mockEvents={mockEvents} 
                setMockEvents={setMockEvents} 
              />
            )}
            {currentView === "contributions" && (
              <Contributions currentUser={currentUser} />
            )}
            {currentView === "event-gallery" && (
              <EventGallery />
            )}
            {currentView === "admin" && (
              currentUser && currentUser.role === "admin" ? (
                <Admin 
                  mockAlumni={mockAlumni} 
                  setMockAlumni={setMockAlumni} 
                  startEditGeo={startEditGeo}
                />
              ) : (
                <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-scroll-up bg-surface border border-line rounded-sm p-8 my-8 shadow-sm">
                  <AlertCircle className="w-12 h-12 text-accent-gold mx-auto animate-pulse" />
                  <h3 className="font-display font-bold text-xl text-ink">Access Restricted</h3>
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    The institutional moderation console is restricted to authenticated administrators. Guest users are not permitted to register profiles, upload rosters, or approve registrations.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setLoginError("");
                        setShowLoginModal(true);
                      }}
                      className="bg-ink hover:bg-ink-muted text-surface hover:text-accent-gold text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-sm transition-all shadow-md cursor-pointer"
                    >
                      Sign In as Administrator
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Scroll-to-Top Floating Button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-50 bg-ink hover:bg-accent-gold text-surface p-3 rounded-full border border-line shadow-lg transition-all duration-300 transform scale-100 hover:scale-110 active:scale-95 animate-scroll-up cursor-pointer flex items-center justify-center shadow-accent-gold/10"
            >
              <ArrowUp className="w-5 h-5 text-surface" />
            </button>
          )}
        </main>
      </div>

      {/* Authentication Modals */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-ink/55 backdrop-blur-xs flex items-center justify-center p-4 z-[100]">
          <div className="bg-surface border border-line rounded-sm w-full max-w-md shadow-lg relative animate-scale-up">
            
            {/* Close modal */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header Tab toggles */}
            <div className="flex border-b border-line">
              <button
                onClick={() => { setLoginTab("alumni"); setLoginError(""); }}
                className={`flex-1 py-4 text-center font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  loginTab === "alumni" 
                    ? "border-b-2 border-accent-emerald text-accent-emerald bg-bg/20" 
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Alumni Login
              </button>
              <button
                onClick={() => { setLoginTab("admin"); setLoginError(""); }}
                className={`flex-1 py-4 text-center font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  loginTab === "admin" 
                    ? "border-b-2 border-accent-gold text-accent-gold bg-bg/20" 
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Admin Login
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-line pb-2.5 mb-2">
                {loginTab === "admin" ? (
                  <>
                    <Shield className="w-5 h-5 text-accent-gold" />
                    <h3 className="font-display font-semibold text-lg text-ink">Admin Dashboard Login</h3>
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5 text-accent-emerald" />
                    <h3 className="font-display font-semibold text-lg text-ink">Alumni Verification</h3>
                  </>
                )}
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-sm p-3 flex gap-2 text-xs leading-relaxed items-start animate-shake">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Form Input fields */}
              {loginTab === "admin" ? (
                <>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Admin Username</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter admin username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2.5 text-xs text-ink focus:border-accent-gold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2.5 text-xs text-ink focus:border-accent-gold outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Alumni Registered Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abirami A"
                      value={alumniName}
                      onChange={(e) => setAlumniName(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2.5 text-xs text-ink focus:border-accent-emerald outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={alumniPassword}
                      onChange={(e) => setAlumniPassword(e.target.value)}
                      className="w-full bg-bg border border-line rounded-sm px-3 py-2.5 text-xs text-ink focus:border-accent-emerald outline-none"
                    />
                  </div>
                </>
              )}

              {/* Form Action CTAs */}
              <div className="pt-4 border-t border-line flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="border border-line hover:bg-bg px-4 py-2.5 rounded-xs font-semibold text-ink-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`text-surface px-5 py-2.5 rounded-xs font-bold cursor-pointer ${
                    loginTab === "admin" ? "bg-accent-gold hover:bg-accent-gold/90" : "bg-accent-emerald hover:bg-accent-emerald/90"
                  }`}
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showRegistrationModal && (
        <RegistrationModal onClose={() => setShowRegistrationModal(false)} />
      )}

      {/* Geolocation Update Modal popup overlay */}
      {editingGeoAlumni && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-[110] p-4">
          <div className="bg-surface border border-line rounded-md p-6 max-w-md w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setEditingGeoAlumni(null)}
              className="absolute right-4 top-4 text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-ink">Update Location Data</h3>
              <p className="font-sans text-[11px] font-medium text-ink-muted">
                Specify city and exact coordinates for <strong className="text-ink">{editingGeoAlumni.name}</strong> to plot them on the Global Map.
              </p>
            </div>

            <form onSubmit={handleSaveGeo} className="space-y-4">
              {geoSaveStatus === "saving" ? (
                <div className="py-12 text-center space-y-4 animate-scroll-up flex flex-col items-center justify-center">
                  {/* Radar Ripple Wave Animation */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-accent-gold/20 animate-ping"></span>
                    <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center shadow-lg shadow-accent-gold/20 z-10">
                      <MapPin className="w-5 h-5 text-surface animate-bounce" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-semibold text-sm text-ink animate-pulse">Mapping Coordinates...</h4>
                    <p className="font-sans text-[10px] text-ink-muted">
                      Syncing location coordinates with the institutional database registry.
                    </p>
                  </div>
                </div>
              ) : geoSaveStatus === "success" ? (
                <div className="py-6 text-center space-y-2 text-accent-emerald">
                  <CheckCircle className="w-10 h-10 mx-auto animate-bounce" />
                  <h4 className="font-sans font-bold text-sm">Location Saved Successfully!</h4>
                </div>
              ) : (
                <>
                  {geoSaveStatus === "error" && (
                    <div className="bg-red-500/10 border border-red-500/35 rounded-sm p-3 flex items-center gap-2 text-red-500 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Failed to save location. Try again.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">City Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Theni"
                        value={geoCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                      {cityCoordsLookup[geoCity.trim().toLowerCase()] && (
                        <span className="block text-[10px] text-accent-emerald font-semibold mt-1">
                          ✔ Auto-filled coordinates for {geoCity}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Country</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. India"
                        value={geoCountry}
                        onChange={(e) => setGeoCountry(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Latitude (Lat)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 10.0104"
                        value={geoLat}
                        onChange={(e) => setGeoLat(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-ink uppercase tracking-wider">Longitude (Lng)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 77.4768"
                        value={geoLng}
                        onChange={(e) => setGeoLng(e.target.value)}
                        className="w-full bg-bg border border-line rounded-sm px-3 py-2 text-xs text-ink focus:border-accent-gold outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-ink-muted leading-relaxed italic">
                    * Leaving Latitude and Longitude empty will securely keep them hidden from the Global Map view.
                  </p>

                  <div className="pt-2 flex justify-end gap-2 border-t border-line">
                    <button
                      type="button"
                      onClick={() => setEditingGeoAlumni(null)}
                      className="border border-line hover:border-ink hover:text-ink text-ink-muted text-xs font-semibold px-4 py-2 rounded-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-accent-emerald hover:bg-accent-emerald/90 text-surface text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-xs shadow-xs cursor-pointer"
                    >
                      Save Location
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
