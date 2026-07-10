import React, { useState } from "react";
import { LogIn, ArrowLeft, Shield, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import RegistrationModal from "../components/RegistrationModal";

export default function Login({ 
  onBack, 
  handleLogin,
  loginTab,
  setLoginTab,
  adminUsername,
  setAdminUsername,
  adminPassword,
  setAdminPassword,
  alumniName,
  setAlumniName,
  alumniPassword,
  setAlumniPassword,
  loginError
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  // 3D Tilt & Radial Spotlight Cursor tracking handler
  const handleMouseMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const angleX = (yc - y) / 25; // tilt angle around X axis
    const angleY = (x - xc) / 25; // tilt angle around Y axis
    
    el.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseLeave = (e) => {
    const el = e.currentTarget;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-ink font-sans">
      
      {/* Background Campus Image with Cinematic Ken Burns Panning */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-ken-burns"
        style={{ backgroundImage: "url('/college_entrance.png')" }}
      />
      
      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-ink/75 z-5 backdrop-blur-xs" />

      {/* Floating Animated Glassmorphic Light Orbs (Z-index: 6) */}
      <div className="absolute top-[15%] left-[8%] w-64 h-64 md:w-80 md:h-80 rounded-full bg-accent-gold/15 blur-[60px] md:blur-[80px] animate-float-1 z-6 pointer-events-none" />
      <div className="absolute bottom-[15%] right-[8%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-accent-emerald/15 blur-[60px] md:blur-[80px] animate-float-2 z-6 pointer-events-none" />

      {/* Main Glassmorphic Login Card (Z-index: 10) - Expanded to md:max-w-xl */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="tilt-card tilt-card-gold relative z-10 w-full max-w-md md:max-w-xl mx-4 bg-surface/10 backdrop-blur-md border border-surface/20 rounded-md p-6 md:p-10 shadow-2xl space-y-6 md:space-y-8 animate-scroll-up cursor-pointer"
      >
        
        {/* Back Link & Logo */}
        <div className="flex items-center justify-between border-b border-surface/15 pb-4 relative z-10">
          <button 
            onClick={onBack}
            className="text-surface/70 hover:text-accent-gold text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
          
          <img 
            src="/college_logo.png" 
            alt="NSCET Crest"
            className="w-12 h-12 object-contain filter drop-shadow-[0_4px_8px_rgba(192,138,46,0.25)]"
          />
        </div>

        {/* Header Title */}
        <div className="text-center space-y-1 relative z-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-surface">Registry Portal</h2>
          <p className="text-xs text-surface/60 font-medium">Verify your credentials to manage your registry logs</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-black/35 rounded-sm p-1 border border-surface/10 relative z-10">
          <button
            onClick={() => setLoginTab("alumni")}
            className={`flex-1 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2
              ${loginTab === "alumni" 
                ? "bg-accent-gold text-ink shadow-md" 
                : "text-surface/70 hover:text-surface hover:bg-surface/5"
              }
            `}
          >
            <User className="w-3.5 h-3.5" />
            <span>Alumni Sign In</span>
          </button>
          <button
            onClick={() => setLoginTab("admin")}
            className={`flex-1 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2
              ${loginTab === "admin" 
                ? "bg-accent-gold text-ink shadow-md" 
                : "text-surface/70 hover:text-surface hover:bg-surface/5"
              }
            `}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Sign In</span>
          </button>
        </div>

        {/* Validation Error Feedback */}
        {loginError && (
          <div className="bg-red-500/20 border border-red-500/35 rounded-sm p-3.5 flex items-start gap-2.5 animate-scroll-up relative z-10">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-200 leading-normal font-medium">{loginError}</p>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5 relative z-10">
          {loginTab === "alumni" ? (
            <>
              {/* Alumni Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-surface/70">Alumni Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={alumniName}
                    onChange={(e) => setAlumniName(e.target.value)}
                    placeholder="Enter your registered name (e.g. Abirami A)"
                    className="w-full bg-black/40 border border-surface/25 focus:border-accent-gold text-surface placeholder-surface/40 text-xs px-4 py-3.5 md:py-4 rounded-sm focus:outline-none transition-all"
                  />
                </div>
              </div>
              
              {/* Alumni Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-surface/70">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={alumniPassword}
                    onChange={(e) => setAlumniPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-black/40 border border-surface/25 focus:border-accent-gold text-surface placeholder-surface/40 text-xs pl-4 pr-11 py-3.5 md:py-4 rounded-sm focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface/50 hover:text-surface transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Admin Username */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-surface/70">Admin Username</label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full bg-black/40 border border-surface/25 focus:border-accent-gold text-surface placeholder-surface/40 text-xs px-4 py-3.5 md:py-4 rounded-sm focus:outline-none transition-all"
                />
              </div>

              {/* Admin Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-surface/70">Secret Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-surface/25 focus:border-accent-gold text-surface placeholder-surface/40 text-xs pl-4 pr-11 py-3.5 md:py-4 rounded-sm focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface/50 hover:text-surface transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-accent-gold hover:bg-accent-gold/90 text-ink py-3.5 md:py-4 rounded-sm font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-102 active:scale-98 shadow-md flex items-center justify-center gap-2 cursor-pointer group"
            >
              <LogIn className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Verify & Authenticate</span>
            </button>
          </div>
        </form>

        {/* Help Notice & Registration */}
        <div className="relative z-10 space-y-4 text-center">
          <p className="text-[10px] text-surface/40 leading-normal">
            Registry logs are sync-validated. In case of verification problems, contact the administrative office.
          </p>
          
          {loginTab === "alumni" && (
            <div className="pt-2 border-t border-surface/10">
              <p className="text-[10px] text-surface/60 mb-2 font-bold uppercase tracking-widest">Guest Mode</p>
              <button
                type="button"
                onClick={() => setShowRegistration(true)}
                className="text-accent-gold hover:text-accent-gold/80 text-xs font-bold underline decoration-accent-gold/50 cursor-pointer transition-colors"
              >
                Register as Alumni
              </button>
            </div>
          )}
        </div>
      </div>

      {showRegistration && (
        <RegistrationModal onClose={() => setShowRegistration(false)} />
      )}
    </div>
  );
}
