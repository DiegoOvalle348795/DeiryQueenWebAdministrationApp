"use client";

import { useEffect, useState } from "react";
import InteractiveMap from "@/components/MexicoMap";

const COUNTRIES = [
  { key: "mexico",  label: "México",         flag: "🇲🇽", isoCode: "MX" },
  { key: "usa",     label: "Estados Unidos",  flag: "🇺🇸", isoCode: "US" },
  { key: "canada",  label: "Canadá",          flag: "🇨🇦", isoCode: "CA" },
  { key: "germany", label: "Alemania",        flag: "🇩🇪", isoCode: "DE" },
  { key: "china",   label: "China",           flag: "🇨🇳", isoCode: "CN" },
];

const REGION_LABEL = {
  mexico:  "Estado",
  usa:     "Estado",
  canada:  "Provincia",
  germany: "Estado federado",
  china:   "Provincia",
};

export default function LocationWizard() {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState(null);
  const [region, setRegion] = useState(null);
  const [regions, setRegions] = useState([]);
  const [autoDetected, setAutoDetected] = useState(false);
  const [detecting, setDetecting] = useState(true);

  // --- Detección automática por IP ---
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const iso = data?.country_code;
        const match = COUNTRIES.find((c) => c.isoCode === iso);
        if (match) {
          setAutoDetected(true);
          setCountry(match.key);
          setTimeout(() => setStep(2), 1200);
        }
      } catch {
        // silencioso — el usuario elige manualmente
      } finally {
        setDetecting(false);
      }
    })();
  }, []);

  function handleCountrySelect(key) {
    setCountry(key);
    setRegion(null);
    setRegions([]);
    setStep(2);
  }

  function handleRegionSelect(name) {
    setRegion(name);
  }

  function handleDropdownChange(e) {
    setRegion(e.target.value || null);
  }

  function handleBack() {
    if (step === 2) {
      setStep(1);
      setRegion(null);
      setRegions([]);
    } else if (step === 3) {
      setStep(2);
    }
  }

  function handleContinue() {
    if (step === 2 && region) setStep(3);
  }

  const currentCountry = COUNTRIES.find((c) => c.key === country);
  const regionLabel = REGION_LABEL[country] ?? "Región";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl">

        {/* ── Indicador de pasos ── */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                  s < step
                    ? "bg-[#fac800] text-black"
                    : s === step
                    ? "bg-white text-black"
                    : "bg-white/20 text-white/50"
                }`}
              >
                {s < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 transition-all duration-500 ${s < step ? "bg-[#fac800]" : "bg-white/20"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ══════════════ PASO 1 — País ══════════════ */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">¿En qué país estás?</h2>
              <p className="text-white/60">
                {detecting ? "Detectando tu ubicación…" : "Selecciona tu país para continuar"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COUNTRIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => handleCountrySelect(c.key)}
                  className={`group flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 text-left
                    ${autoDetected && country === c.key
                      ? "border-[#fac800] bg-[#fac800]/15 shadow-[0_0_24px_rgba(250,200,0,0.2)]"
                      : "border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10"
                    }`}
                >
                  <span className="text-4xl">{c.flag}</span>
                  <div>
                    <div className="text-white font-semibold">{c.label}</div>
                    {autoDetected && country === c.key && (
                      <div className="text-[#fac800] text-xs mt-0.5">Detectado automáticamente</div>
                    )}
                  </div>
                  <svg
                    className="ml-auto w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ PASO 2 — Región ══════════════ */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">{currentCountry?.flag}</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Selecciona tu {regionLabel.toLowerCase()}
              </h2>
              <p className="text-white/60">Haz clic en el mapa o usa el selector</p>
            </div>

            {/* Mapa */}
            <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm overflow-hidden mb-4">
              <InteractiveMap
                country={country}
                selectedState={region}
                onSelect={handleRegionSelect}
                onRegionsReady={setRegions}
              />
            </div>

            {/* Dropdown sincronizado */}
            <div className="flex gap-3 items-center mb-6">
              <div className="relative flex-1">
                <select
                  value={region ?? ""}
                  onChange={handleDropdownChange}
                  className="w-full appearance-none bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#fac800]/60 transition-colors cursor-pointer"
                >
                  <option value="" className="bg-slate-800">— Selecciona un {regionLabel.toLowerCase()} —</option>
                  {regions.map((r) => (
                    <option key={r} value={r} className="bg-slate-800">{r}</option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <button
                onClick={handleContinue}
                disabled={!region}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  region
                    ? "bg-[#fac800] text-black hover:bg-[#e6b800] shadow-[0_4px_20px_rgba(250,200,0,0.3)]"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                Continuar →
              </button>
            </div>

            <button onClick={handleBack} className="text-white/40 hover:text-white/70 text-sm transition-colors">
              ← Volver
            </button>
          </div>
        )}

        {/* ══════════════ PASO 3 — Confirmar ══════════════ */}
        {step === 3 && (
          <div className="animate-fade-in text-center">
            <div className="text-5xl mb-4">{currentCountry?.flag}</div>
            <h2 className="text-3xl font-bold text-white mb-2">¡Listo!</h2>
            <p className="text-white/60 mb-8">Tu ubicación seleccionada</p>

            <div className="inline-flex flex-col gap-3 mb-10 w-full max-w-sm">
              <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/15 bg-white/5">
                <span className="text-2xl">{currentCountry?.flag}</span>
                <div className="text-left">
                  <div className="text-white/50 text-xs uppercase tracking-wider mb-0.5">País</div>
                  <div className="text-white font-semibold">{currentCountry?.label}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-[#fac800]/40 bg-[#fac800]/10">
                <span className="text-2xl">📍</span>
                <div className="text-left">
                  <div className="text-[#fac800]/70 text-xs uppercase tracking-wider mb-0.5">{regionLabel}</div>
                  <div className="text-white font-semibold">{region}</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {}}
              className="w-full max-w-sm px-8 py-4 rounded-2xl bg-[#fac800] text-black font-bold text-base shadow-[0_8px_32px_rgba(250,200,0,0.35)] hover:bg-[#e6b800] hover:shadow-[0_8px_40px_rgba(250,200,0,0.5)] transition-all duration-300 active:scale-[0.98]"
            >
              Ver Sucursales
            </button>

            <div className="mt-6">
              <button onClick={handleBack} className="text-white/40 hover:text-white/70 text-sm transition-colors">
                ← Cambiar ubicación
              </button>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 400ms ease forwards;
        }
      `}</style>
    </div>
  );
}
