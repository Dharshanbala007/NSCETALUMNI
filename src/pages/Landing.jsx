import React, { useState, useEffect } from "react";
import { LogIn, LogOut, Compass, ArrowRight, ShieldCheck } from "lucide-react";

export default function Landing({ onEnterAsGuest, onSignIn, currentUser, onSignOut }) {
  const [loading, setLoading] = useState(true);

  // Simulate loader screen transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-ink relative overflow-hidden font-sans">
        {/* Glow Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-accent-gold/20 animate-ping duration-1000 z-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-accent-emerald/20 animate-pulse duration-700 z-5" />

        {/* Central Spinning Gear and Logo */}
        <div className="relative z-10 space-y-6 text-center">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {/* Spinning Golden border aura */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-accent-gold/60 animate-spin duration-3000" />
            <img 
              src="/college_logo.png" 
              alt="NSCET Crest"
              className="w-20 h-20 object-contain filter drop-shadow-[0_4px_8px_rgba(192,138,46,0.3)] animate-pulse"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-surface tracking-wider">NSCET ALUMNI PORTAL</h3>
            <p className="font-sans text-[10px] tracking-widest text-accent-emerald font-bold uppercase animate-pulse">
              Initializing Database Registry...
            </p>
          </div>
        </div>

        {/* Bottom copyright/design system watermark */}
        <div className="absolute bottom-8 text-[9px] font-data text-surface/30 tracking-widest uppercase">
          Nadar Saraswathi College of Engineering & Technology
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-ink font-sans">
      
      {/* Background Campus Image with Cinematic Ken Burns Panning & Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-ken-burns"
        style={{ 
          backgroundImage: "url('/college_entrance.png')",
        }}
      />
      
      {/* Multi-layered dark gradients for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/25 z-5" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/30 via-transparent to-ink/30 z-5" />

      {/* Interactive Constellation Network Background Canvas */}
      <NetworkCanvas />

      {/* Decorative Golden / Emerald Aura Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-gold/10 blur-[120px] z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-emerald/10 blur-[120px] z-10 animate-pulse" />

      {/* Landing Center Panel Container */}
      <div className="relative z-10 max-w-2xl w-full mx-4 text-center space-y-8 animate-scroll-up">
        
        {/* College Header Crest / Label */}
        <div className="space-y-4">
          <div className="relative flex justify-center items-center group cursor-pointer">
            {/* Glowing Aura Highlight behind the logo */}
            <div className="absolute w-36 h-36 bg-accent-gold/20 rounded-full blur-2xl transition-all duration-500 group-hover:bg-accent-gold/40 group-hover:scale-125" />
            
            {/* Enlarged logo with intense golden drop shadow */}
            <img 
              src="/college_logo.png" 
              alt="NSCET Crest"
              className="relative z-10 w-40 h-40 object-contain transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1 filter drop-shadow-[0_8px_30px_rgba(192,138,46,0.5)]"
            />
          </div>
          
          <div className="space-y-1">

            <h1 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight leading-tight pt-2 drop-shadow-md">
              Nadar Saraswathi College of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-lg">Engineering & Technology</span>
            </h1>
            <p className="font-sans text-xs md:text-sm font-semibold tracking-wider text-surface/75 uppercase mt-1">
              Alumni Registry Portal
            </p>
          </div>
        </div>

        {/* Floating Description Board with 3D Tilt and Cursor radial spotlight */}
        <div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="tilt-card tilt-card-gold bg-surface/10 backdrop-blur-md border border-surface/20 rounded-md p-6 md:p-8 shadow-2xl space-y-4 max-w-xl mx-auto cursor-pointer"
        >
          <p className="text-surface/90 text-sm md:text-base leading-relaxed relative z-10">
            Welcome to the gateway of our global graduates directory. Tracing career milestones, sharing mentorship paths, and networking across batches.
          </p>
          
          <div className="grid grid-cols-3 gap-4 pt-2 font-data text-surface/95 border-t border-surface/15 text-xs relative z-10">
            <div>
              <span className="font-bold text-sm text-accent-gold">450+</span>
              <span className="text-[10px] text-surface/60 block uppercase mt-0.5 font-sans">Graduates</span>
            </div>
            <div>
              <span className="font-bold text-sm text-accent-emerald">12+</span>
              <span className="text-[10px] text-surface/60 block uppercase mt-0.5 font-sans">Batches</span>
            </div>
            <div>
              <span className="font-bold text-sm text-accent-gold">8</span>
              <span className="text-[10px] text-surface/60 block uppercase mt-0.5 font-sans">Departments</span>
            </div>
          </div>
        </div>

        {/* Action Gateway Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto w-full">
          {currentUser ? (
            <>
              {/* Active Session Entry */}
              <button
                onClick={onEnterAsGuest}
                className="w-full sm:w-auto bg-accent-gold hover:bg-accent-gold/90 text-ink px-8 py-4 rounded-sm font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-98 shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Active Session Terminate */}
              <button
                onClick={onSignOut}
                className="w-full sm:w-auto bg-surface/10 hover:bg-surface/20 text-surface border border-surface/30 px-6 py-4 rounded-sm font-sans text-[11px] font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-98 backdrop-blur-xs flex items-center justify-center gap-2 cursor-pointer group"
              >
                <LogOut className="w-4 h-4 shrink-0 group-hover:text-red-400 transition-colors" />
                <span className="truncate">Sign Out ({currentUser.name || currentUser.email})</span>
              </button>
            </>
          ) : (
            <>
              {/* Main login pathway */}
              <button
                onClick={onSignIn}
                className="w-full sm:w-auto bg-accent-gold hover:bg-accent-gold/90 text-ink px-8 py-4 rounded-sm font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-98 shadow-md flex items-center justify-center gap-2 cursor-pointer group"
              >
                <LogIn className="w-4 h-4 shrink-0 group-hover:-translate-y-0.5 transition-transform" />
                <span>Sign In to Profile</span>
                <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Guest browsing pathway */}
              <button
                onClick={onEnterAsGuest}
                className="w-full sm:w-auto bg-surface/10 hover:bg-surface/20 text-surface border border-surface/30 px-8 py-4 rounded-sm font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-98 backdrop-blur-xs flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Compass className="w-4 h-4 shrink-0 group-hover:rotate-45 transition-transform" />
                <span>Explore as Guest</span>
              </button>
            </>
          )}
        </div>

        {/* Guest limitations advisory footer */}
        <div className="text-[10px] text-surface/50 max-w-sm mx-auto flex items-center justify-center gap-1.5 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
          <span>Guest mode features read-only logs with search active.</span>
        </div>

      </div>

      {/* Theni District background watermark text */}
      <div className="absolute bottom-6 left-6 text-[10px] text-surface/35 font-data z-10 hidden md:block">
        Theni, Tamil Nadu · India
      </div>
      <div className="absolute bottom-6 right-6 text-[10px] text-surface/35 font-sans z-10 hidden md:block">
        ISO 9001:2015 Certified
      </div>

    </div>
  );
}

function NetworkCanvas() {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse coordinates
    const mouse = { x: null, y: null, radius: 150 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Particle definition
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? "rgba(192, 138, 46, 0.4)" : "rgba(16, 185, 129, 0.4)";
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const particleCount = Math.min(65, Math.floor((width * height) / 22000));
    const particles = Array.from({ length: particleCount }, () => new Particle());

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Draw links to mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(192, 138, 46, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw links between nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color.includes("192")
              ? `rgba(192, 138, 46, ${alpha})`
              : `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawLines();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-6 pointer-events-none opacity-80" />;
}
