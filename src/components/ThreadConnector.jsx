import React from "react";

export function VerticalThread({ children }) {
  return (
    <div className="relative border-l-2 border-dashed border-accent-emerald/40 pl-6 ml-3 space-y-8 py-2">
      {children}
    </div>
  );
}

export function ThreadNode({ isCurrent, year, title, subtitle, description }) {
  return (
    <div className="relative">
      {/* Node Dot */}
      <span className={`
        absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-surface transition-all duration-300
        ${isCurrent 
          ? "border-accent-gold ring-4 ring-accent-gold/20 scale-110" 
          : "border-accent-emerald bg-accent-emerald/10"
        }
      `} />
      
      {/* Content */}
      <div className="group">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-data font-bold text-sm text-accent-gold">{year}</span>
          <h4 className="font-sans font-bold text-ink text-base group-hover:text-accent-emerald transition-colors">
            {title}
          </h4>
        </div>
        <p className="font-sans text-sm text-ink-muted mt-0.5 font-medium">{subtitle}</p>
        {description && (
          <p className="font-sans text-xs text-ink-muted mt-2 bg-bg p-3 border border-line rounded-xs max-w-xl italic">
            "{description}"
          </p>
        )}
      </div>
    </div>
  );
}

export function HorizontalThread({ items }) {
  return (
    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 py-8 px-6 md:px-12 bg-surface border border-line rounded-sm overflow-hidden">
      {/* Background Thread Line */}
      <div className="hidden md:block absolute top-[44%] left-12 right-12 h-0.5 border-t-2 border-dashed border-accent-emerald/30 -z-0" />
      
      {items.map((item, idx) => (
        <div key={idx} className="relative z-10 flex items-center md:flex-col gap-4 md:gap-2 text-left md:text-center flex-1">
          {/* Node Icon/Shape */}
          <div className="w-12 h-12 rounded-full border border-line bg-bg flex items-center justify-center text-accent-emerald font-data font-bold text-lg md:mb-1 transition-all duration-300 hover:border-accent-gold hover:text-accent-gold hover:scale-105 shadow-xs">
            {item.icon || (idx + 1)}
          </div>
          
          <div>
            <div className="font-data font-bold text-2xl md:text-3xl text-ink leading-tight">
              {item.value}
            </div>
            <div className="font-sans text-xs uppercase tracking-wider font-semibold text-ink-muted">
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
