import React, { useState, useEffect } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // 1. Detect device touch/mouse support and mobile viewports
  useEffect(() => {
    const checkMobile = () => {
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setIsMobile(window.innerWidth < 768 || isTouch);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 2. Track mouse position globally
  useEffect(() => {
    if (isMobile) return;

    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updatePosition);
    return () => window.removeEventListener("mousemove", updatePosition);
  }, [isMobile]);

  // 3. Scan hover elements under cursor
  useEffect(() => {
    if (isMobile) return;

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const isClickable = 
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest(".cursor-pointer") ||
        target.closest("[role='button']");

      setIsHovered(!!isClickable);
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Lagging outer halo glow */}
      <div
        className="fixed pointer-events-none z-[99999] rounded-full border transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isHovered ? "44px" : "28px",
          height: isHovered ? "44px" : "28px",
          borderColor: isHovered ? "var(--color-accent-emerald)" : "var(--color-accent-gold)",
          backgroundColor: isHovered ? "rgba(47, 122, 92, 0.08)" : "rgba(192, 138, 46, 0.02)",
          boxShadow: isHovered 
            ? "0 0 16px rgba(47, 122, 92, 0.25)" 
            : "0 0 8px rgba(192, 138, 46, 0.1)",
          transitionProperty: "width, height, border-color, background-color, box-shadow"
        }}
      />

      {/* Instant solid core dot */}
      <div
        className="fixed pointer-events-none z-[99999] w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          backgroundColor: isHovered ? "var(--color-accent-emerald)" : "var(--color-accent-gold)",
          transform: `translate(-50%, -50%) scale(${isMouseDown ? 0.7 : isHovered ? 1.2 : 1})`,
          boxShadow: isHovered
            ? "0 0 8px var(--color-accent-emerald)"
            : "0 0 4px var(--color-accent-gold)"
        }}
      />
    </>
  );
}
