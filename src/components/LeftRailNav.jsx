import React, { useState } from "react";
import { 
  Home, 
  Users, 
  Map, 
  BarChart2, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  ShieldCheck,
  Menu,
  X,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Mic,
  Image
} from "lucide-react";

export default function LeftRailNav({ currentView, setView, pendingCount, currentUser, isCollapsed, onToggleCollapse }) {
  const [isOpen, setIsOpen] = useState(false);

  // Configure menu items dynamically based on current user roles
  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "directory", label: "Alumni Directory", icon: Users },
    { id: "gallery", label: "Alumni Spotlight", icon: LayoutGrid },
    { id: "map", label: "Global Map", icon: Map },
    { id: "analytics", label: "Analytics & Trends", icon: BarChart2 },
    { id: "jobs", label: "Jobs & Referrals", icon: Briefcase },
    { id: "mentorship", label: "Mentorship", icon: GraduationCap },
    { id: "events", label: "Events & Reunions", icon: Calendar },
    { id: "contributions", label: "Alumni Contribution", icon: Mic },
    { id: "event-gallery", label: "Alumni Gallery", icon: Image },
    ...(currentUser && currentUser.role === "admin"
      ? [{ id: "admin", label: "Registry Admin", icon: ShieldCheck, badge: pendingCount }]
      : [])
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-surface border-b border-line px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-2" onClick={() => setView("home")}>
          <img 
            src="/college_logo.png" 
            alt="NSCET Logo"
            className="w-9 h-9 object-contain shrink-0 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
          />
          <span className="font-display font-semibold text-ink text-lg tracking-tight">NSCET Registry</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-ink hover:text-accent-gold focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar background overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-ink/40 backdrop-blur-xs z-45"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 bg-surface border-r border-line z-50 transition-all duration-300 transform
        md:relative md:top-auto md:bottom-auto md:left-auto md:translate-x-0 md:h-screen md:flex md:flex-col md:shrink-0
        ${isCollapsed ? "w-0 md:w-0 overflow-hidden border-r-0" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo/Branding Header */}
        <div className="px-6 py-8 border-b border-line hidden md:block">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView("home")}>
            <img 
              src="/college_logo.png" 
              alt="NSCET Logo"
              className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)]"
            />
            <div>
              <h1 className="font-display font-bold text-ink text-lg leading-tight tracking-tight">NSCET</h1>
              <p className="font-sans text-xs font-semibold tracking-wider uppercase text-accent-gold">Alumni Registry</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-3 rounded-sm font-sans text-sm font-medium transition-all duration-150 group
                  ${isActive 
                    ? "bg-ink/5 text-ink border-l-2 border-accent-gold font-semibold pl-2.5" 
                    : "text-ink-muted hover:bg-bg hover:text-ink border-l-2 border-transparent"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`
                    w-4 h-4 transition-colors
                    ${isActive ? "text-accent-gold" : "text-ink-muted group-hover:text-ink"}
                  `} />
                  <span>{item.label}</span>
                </div>
                
                {item.badge > 0 && (
                  <span className="font-data text-xs px-2 py-0.5 bg-accent-gold text-surface rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-line bg-bg/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-emerald text-surface flex items-center justify-center font-semibold text-xs shadow-xs select-none">
              {currentUser 
                ? (currentUser.name || currentUser.email || 'A').substring(0, 2).toUpperCase()
                : 'GV'
              }
            </div>
            <div className="overflow-hidden">
              <p className="font-sans text-xs font-semibold text-ink truncate">
                {currentUser ? (currentUser.name || currentUser.email) : 'Guest Visitor'}
              </p>
              <p className="font-sans text-[10px] text-ink-muted truncate capitalize">
                {currentUser 
                  ? `${currentUser.role} Session`
                  : 'Read-only Access'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Hide toggle button - visible only on desktop */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6.5 h-12 bg-surface border border-line border-l-0 rounded-r-md items-center justify-center cursor-pointer shadow-md hover:text-accent-gold text-ink-muted transition-colors z-[60]"
            title="Hide Sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </aside>

      {/* Unhide floating handle - visible on desktop when collapsed */}
      {isCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex fixed top-1/2 left-0 -translate-y-1/2 w-6.5 h-12 bg-surface border border-line border-l-0 rounded-r-md items-center justify-center cursor-pointer shadow-lg hover:text-accent-gold text-ink-muted transition-colors z-[100]"
          title="Show Sidebar"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </>
  );
}
