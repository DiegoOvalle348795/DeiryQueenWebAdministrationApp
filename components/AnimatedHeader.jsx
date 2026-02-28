'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import logoDairyQueen from "@/components/images/Dairy_Queen_logo.png";

export default function AnimatedHeader({ activeItem = "ubicaciones" }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "inicio", href: "#inicio", label: "Inicio" },
    { id: "ubicaciones", href: "#ubicaciones", label: "Ubicaciones" },
    { id: "reportes", href: "#reportes", label: "Reportes" },
    { id: "ayuda", href: "#ayuda", label: "Ayuda" },
  ];

  const linkBase = "text-sm font-medium transition-colors duration-300";
  const linkColor = scrolled
    ? "text-slate-700 hover:text-slate-900"
    : "text-white/90 hover:text-white";

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center pointer-events-none">
      <div
        style={{
          maxWidth: scrolled ? "720px" : "100%",
          marginTop: scrolled ? "14px" : "0px",
          borderRadius: scrolled ? "9999px" : "0px",
          paddingLeft: scrolled ? "20px" : "32px",
          paddingRight: scrolled ? "20px" : "24px",
          paddingTop: scrolled ? "10px" : "14px",
          paddingBottom: scrolled ? "10px" : "14px",
          transition:
            "max-width 420ms cubic-bezier(0.4,0,0.2,1), " +
            "margin-top 420ms cubic-bezier(0.4,0,0.2,1), " +
            "border-radius 420ms cubic-bezier(0.4,0,0.2,1), " +
            "padding 420ms cubic-bezier(0.4,0,0.2,1), " +
            "background-color 420ms ease, " +
            "box-shadow 420ms ease, " +
            "border-color 420ms ease",
        }}
        className={`pointer-events-auto w-full flex items-center justify-between gap-6 text-sm font-medium ${
          scrolled
            ? "bg-white/75 backdrop-blur-[14px] shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-white/60"
            : "bg-gradient-to-b from-black/40 via-black/20 to-transparent backdrop-blur-[6px] border-b border-white/10"
        }`}
      >
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center shrink-0" aria-label="Dairy Queen - Inicio">
          <Image
            src={logoDairyQueen}
            alt="Dairy Queen"
            width={100}
            height={40}
            className={`object-contain object-left transition-all duration-[420ms] ${
              scrolled ? "h-7 w-auto md:h-8" : "h-8 w-auto md:h-9"
            }`}
            priority
          />
        </Link>

        {/* ── Nav centrada ── */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex flex-1 items-center justify-center gap-6"
        >
          {navLinks.map(({ id, href, label }) => {
            const isActive = id === activeItem;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`${linkBase} ${linkColor} relative`}
              >
                <span>{label}</span>
                {isActive && (
                  <span
                    className={`pointer-events-none absolute -bottom-1 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full ${
                      scrolled ? "bg-slate-800/80" : "bg-white/90"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Acciones ── */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            aria-label="Mi Perfil"
            className={`hidden md:inline-flex items-center justify-center rounded-full bg-[#007aff] text-white font-semibold shadow-md shadow-sky-900/20 transition-all duration-[420ms] hover:bg-[#0060df] ${
              scrolled ? "px-4 py-1.5 text-xs" : "px-5 py-2 text-sm"
            }`}
          >
            Mi Perfil
          </button>

          {/* Botón menú móvil */}
          <button
            type="button"
            aria-label="Abrir menú"
            className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-medium backdrop-blur-sm ring-1 md:hidden transition-all duration-[420ms] ${
              scrolled
                ? "bg-white/90 text-slate-900 ring-slate-200"
                : "bg-white/10 text-white ring-white/20"
            }`}
          >
            Menú
          </button>
        </div>
      </div>
    </header>
  );
}
