import { useState, useEffect, useRef } from "react";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// ── Utility ──────────────────────────────────────────────────
const cn = (...classes) => classes.filter(Boolean).join(" ");

// ── Icons (inline SVG to avoid external deps) ────────────────
const Shield = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const AlertTriangle = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const CheckCircle = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const Zap = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const Eye = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const Lock = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const ArrowRight = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const Share2 = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const Moon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const Sun = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

// ── Animated Counter ──────────────────────────────────────────
function AnimCounter({ to, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        setVal(Math.round(ease * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Typing animation ─────────────────────────────────────────
function TypingText({ texts, speed = 60, pause = 2000 }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = texts[idx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (displayed.length < current.length) {
          setDisplayed(current.slice(0, displayed.length + 1));
        } else {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1));
        } else {
          setDeleting(false);
          setIdx((idx + 1) % texts.length);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx, texts, speed, pause]);
  return (
    <span>
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// ── Risk Gauge ────────────────────────────────────────────────
function RiskGauge({ risk }) {
  const color = risk >= 70 ? "#EF4444" : risk >= 40 ? "#F59E0B" : "#10B981";
  const label = risk >= 70 ? "ALTO RIESGO" : risk >= 40 ? "RIESGO MEDIO" : "RIESGO BAJO";
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (risk / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease" }}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{risk}%</span>
        </div>
      </div>
      <span className="text-sm font-bold tracking-widest" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Example messages for the hero ────────────────────────────
const EXAMPLES = [
  {
    text: "Hola usuario, su cuenta bancaria será suspendida. Haga clic aquí para verificar: http://bancoseguro-verify.xyz/login",
    risk: 94,
  },
  {
    text: "¡Felicitaciones! Has ganado un iPhone 15 Pro. Envía tus datos personales y $5 para el envío a: premios@winning-now.net",
    risk: 88,
  },
  {
    text: "Tu paquete no pudo ser entregado. Paga $1.99 de aduana en: dhl-tracking-co.ml/pay o será devuelto.",
    risk: 91,
  },
];

// ── Main App ──────────────────────────────────────────────────
export default function ScamCheck() {
  const [dark, setDark] = useState(true);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeExample, setActiveExample] = useState(null);
  const [shared, setShared] = useState(false);
  const analyzerRef = useRef(null);

  const scrollToAnalyzer = () => analyzerRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadExample = () => {
    const ex = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    setActiveExample(ex);
    setText(ex.text);
    setResult(null);
    scrollToAnalyzer();
  };

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShared(false);

    try {
      const resp = await fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text }),
});

if (!resp.ok) throw new Error("Error de API");
const parsed = await resp.json();
setResult(parsed);
      
    } catch (e) {
      setError("No se pudo analizar el mensaje. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (!risk && risk !== 0) return "#2563EB";
    if (risk >= 70) return "#EF4444";
    if (risk >= 40) return "#F59E0B";
    return "#10B981";
  };

  const getVerdictBg = (verdict) => {
    if (!verdict) return "";
    if (verdict.includes("ESTAFA")) return "from-red-500/10 to-red-600/5 border-red-500/30";
    if (verdict.includes("POSIBLE") || verdict.includes("SOSPECHOSO")) return "from-amber-500/10 to-amber-600/5 border-amber-500/30";
    return "from-emerald-500/10 to-emerald-600/5 border-emerald-500/30";
  };

  const shareResult = () => {
    const txt = result
      ? `ScamCheck detectó: ${result.verdict} (${result.risk}% riesgo)\n${result.recommendation}\n\nAnaliza mensajes sospechosos en ScamCheck.`
      : "";
    navigator.clipboard.writeText(txt).then(() => setShared(true));
  };

  const bg = dark ? "bg-gray-950" : "bg-slate-50";
  const card = dark ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200";
  const text_ = dark ? "text-gray-100" : "text-gray-900";
  const muted = dark ? "text-gray-400" : "text-gray-500";
  const input = dark ? "bg-gray-800/60 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  return (
    <div className={cn("min-h-screen font-sans transition-colors duration-300", bg, text_)}
      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className={cn("fixed top-0 inset-x-0 z-50 border-b backdrop-blur-xl",
        dark ? "bg-gray-950/80 border-gray-800" : "bg-white/80 border-gray-200")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white"/>
            </div>
            <span className="font-black text-lg tracking-tight">ScamCheck</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {["Inicio","Cómo funciona","Casos reales","FAQ"].map(l => (
              <a key={l} href="#" className={cn("hover:text-blue-500 transition-colors", muted)}>{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setDark(!dark)}
              className={cn("p-2 rounded-lg transition-colors", dark ? "hover:bg-gray-800" : "hover:bg-gray-100")}>
              {dark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
            </button>
            <button className={cn("hidden sm:block text-sm font-medium px-4 py-2 rounded-lg transition-colors", muted,
              dark ? "hover:bg-gray-800" : "hover:bg-gray-100")}>
              Iniciar sesión
            </button>
            <button onClick={scrollToAnalyzer}
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/20 active:scale-95">
              Probar Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #2563EB 0%, transparent 70%)", filter: "blur(60px)" }}/>
          <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #EF4444 0%, transparent 70%)", filter: "blur(60px)" }}/>
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className={cn("inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border mb-6",
            dark ? "bg-blue-600/10 border-blue-600/30 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600")}>
            <Zap className="w-3 h-3"/> Impulsado por IA · Análisis en segundos
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            ¿Te están{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #EF4444 0%, #F97316 100%)" }}>
                intentando
              </span>
            </span>
            <br/>
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)" }}>
              estafar?
            </span>
          </h1>

          <p className={cn("text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed", muted)}>
            Analiza cualquier mensaje, correo o enlace sospechoso con IA en segundos.{" "}
            <span className={dark ? "text-gray-200" : "text-gray-700"}>Protege tu dinero e identidad.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <button onClick={scrollToAnalyzer}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-500 transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-95">
              <Shield className="w-5 h-5"/> Analizar Ahora
            </button>
            <button onClick={loadExample}
              className={cn("flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border font-semibold text-base transition-all active:scale-95",
                dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100")}>
              <Eye className="w-5 h-5"/> Ver Ejemplo
            </button>
          </div>

          {/* Demo card */}
          <div className={cn("max-w-sm mx-auto p-4 rounded-2xl border text-left text-sm",
            dark ? "bg-red-950/30 border-red-800/40" : "bg-red-50 border-red-200")}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0"/>
              <span className="text-red-500 font-semibold text-xs">Ejemplo de estafa detectada</span>
            </div>
            <p className={cn("leading-relaxed", dark ? "text-gray-300" : "text-gray-700")}>
              <TypingText
                texts={[
                  "Hola, su cuenta será suspendida hoy. Verifique aquí: bancoseguro-verify.xyz...",
                  "¡Ganaste $50,000! Envía tus datos para reclamar el premio...",
                  "Pago pendiente de $2.99 o su paquete será devuelto mañana...",
                ]}
                speed={45}
                pause={2500}
              />
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className={cn("border-y py-12", dark ? "border-gray-800 bg-gray-900/40" : "border-gray-200 bg-white")}>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[
            { val: 15, suffix: "M+", label: "Intentos de estafa diarios en Latam" },
            { val: 90, suffix: "%", label: "Empiezan por SMS o WhatsApp" },
            { val: 500, suffix: "K+", label: "Mensajes analizados esta semana" },
          ].map(({ val, suffix, label }) => (
            <div key={label}>
              <div className="text-3xl sm:text-4xl font-black text-blue-500 mb-1">
                <AnimCounter to={val} suffix={suffix}/>
              </div>
              <p className={cn("text-xs sm:text-sm", muted)}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ANALYZER ── */}
      <section ref={analyzerRef} id="analyzer" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Analiza cualquier mensaje</h2>
            <p className={muted}>Pega el texto, correo, SMS o enlace sospechoso y obtén un análisis instantáneo</p>
          </div>

          <div className={cn("rounded-3xl border p-6 sm:p-8 backdrop-blur-sm", card)}>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setResult(null); }}
              placeholder="Pega aquí el mensaje, correo, SMS o enlace sospechoso..."
              rows={6}
              className={cn("w-full rounded-2xl border p-4 text-sm leading-relaxed resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500", input)}
            />

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={analyze}
                disabled={loading || !text.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-600/20 active:scale-95">
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Analizando...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5"/> Analizar Mensaje
                  </>
                )}
              </button>
              <button
                onClick={loadExample}
                className={cn("flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border font-medium text-sm transition-all active:scale-95",
                  dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100")}>
                <Eye className="w-4 h-4"/> Cargar ejemplo
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
          </div>

          {/* ── RESULT ── */}
          {result && (
            <div className={cn("mt-6 rounded-3xl border p-6 sm:p-8 backdrop-blur-sm bg-gradient-to-br",
              card, getVerdictBg(result.verdict))}
              style={{ animation: "fadeInUp 0.4s ease" }}>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b"
                style={{ borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
                <RiskGauge risk={result.risk}/>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5" style={{ color: getRiskColor(result.risk) }}/>
                    <h3 className="text-xl font-black" style={{ color: getRiskColor(result.risk) }}>
                      {result.verdict}
                    </h3>
                  </div>
                  <p className={cn("text-sm mb-2", muted)}>
                    Tipo: <span className={dark ? "text-gray-200" : "text-gray-700"}>{result.type}</span>
                  </p>
                  <div className={cn("inline-block text-xs px-2.5 py-1 rounded-lg font-semibold",
                    result.risk >= 70
                      ? "bg-red-500/15 text-red-500"
                      : result.risk >= 40
                        ? "bg-amber-500/15 text-amber-500"
                        : "bg-emerald-500/15 text-emerald-500")}>
                    Nivel de riesgo: {result.risk >= 70 ? "Alto" : result.risk >= 40 ? "Medio" : "Bajo"}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: getRiskColor(result.risk) }}>
                  Señales detectadas
                </h4>
                <ul className="space-y-2.5">
                  {result.signals?.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${getRiskColor(result.risk)}20` }}>
                        <span style={{ color: getRiskColor(result.risk), fontSize: 10 }}>✕</span>
                      </div>
                      <span className={dark ? "text-gray-200" : "text-gray-700"}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={cn("p-4 rounded-2xl mb-6", dark ? "bg-gray-800/60" : "bg-gray-100")}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2 text-blue-500">Recomendación</p>
                <p className={cn("text-sm leading-relaxed", dark ? "text-gray-200" : "text-gray-700")}>
                  {result.recommendation}
                </p>
              </div>

              <button onClick={shareResult}
                className={cn("flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-all active:scale-95",
                  dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100",
                  shared && "text-emerald-500 border-emerald-500/30 bg-emerald-500/5")}>
                {shared ? <CheckCircle className="w-4 h-4"/> : <Share2 className="w-4 h-4"/>}
                {shared ? "¡Copiado al portapapeles!" : "Compartir resultado"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={cn("py-24 px-4 border-t", dark ? "border-gray-800" : "border-gray-200")}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Cómo funciona</h2>
            <p className={muted}>Tres pasos para protegerte de estafas digitales</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", icon: <Share2 className="w-6 h-6"/>, title: "Pega el mensaje", desc: "Copia cualquier texto, correo, SMS, enlace o publicación sospechosa.", color: "#2563EB" },
              { step: "02", icon: <Zap className="w-6 h-6"/>, title: "La IA lo analiza", desc: "Nuestro modelo detecta patrones de estafa, urgencia artificial y enlaces maliciosos.", color: "#7C3AED" },
              { step: "03", icon: <Shield className="w-6 h-6"/>, title: "Obtén el resultado", desc: "Recibe un porcentaje de riesgo, señales detectadas y recomendaciones claras.", color: "#10B981" },
            ].map(({ step, icon, title, desc, color }) => (
              <div key={step}
                className={cn("relative p-6 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-xl", card)}
                style={{ "--c": color }}>
                <div className="absolute top-6 right-6 text-4xl font-black opacity-10" style={{ color }}>{step}</div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${color}15`, color }}>
                  {icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className={cn("text-sm leading-relaxed", muted)}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL CASES ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Casos reales detectados</h2>
            <p className={muted}>Tipos de estafas más comunes que ScamCheck identifica</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: "WhatsApp falso",
                badge: "94% riesgo",
                msg: '"Tu cuenta fue suspendida. Verifica en: whatsapp-verify-now.xyz para recuperar acceso..."',
                signals: ["Dominio falso", "Urgencia artificial", "Suplantación de marca"],
                color: "#EF4444",
              },
              {
                title: "Phishing bancario",
                badge: "89% riesgo",
                msg: '"Su tarjeta fue bloqueada por actividad inusual. Ingrese sus datos en: banco-seguro-co.ml"',
                signals: ["URL maliciosa", "Solicita datos bancarios", "Crea falsa alarma"],
                color: "#F97316",
              },
              {
                title: "Inversión falsa",
                badge: "91% riesgo",
                msg: '"Invierte $100 y gana $3000 en 24 horas. Únete a nuestro grupo VIP de criptomonedas..."',
                signals: ["Promesa irreal", "Esquema Ponzi", "Sin regulación"],
                color: "#EF4444",
              },
            ].map(({ title, badge, msg, signals, color }) => (
              <div key={title} className={cn("p-6 rounded-3xl border", card)}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold">{title}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: `${color}15`, color }}>{badge}</span>
                </div>
                <p className={cn("text-xs leading-relaxed mb-4 p-3 rounded-xl italic", dark ? "bg-gray-800/60 text-gray-400" : "bg-gray-100 text-gray-600")}>
                  {msg}
                </p>
                <ul className="space-y-1.5">
                  {signals.map(s => (
                    <li key={s} className="flex items-center gap-2 text-xs" style={{ color }}>
                      <span>⚠</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className={cn("py-24 px-4 border-t", dark ? "border-gray-800" : "border-gray-200")}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Planes simples y transparentes</h2>
            <p className={muted}>Empieza gratis, escala cuando lo necesites</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className={cn("p-8 rounded-3xl border", card)}>
              <div className={cn("text-xs font-bold uppercase tracking-widest mb-4", muted)}>Gratis</div>
              <div className="text-5xl font-black mb-2">$0</div>
              <p className={cn("text-sm mb-8", muted)}>Para empezar a protegerte</p>
              <ul className="space-y-3 mb-8">
                {["20 análisis por día","Detección de riesgo básica","Sin historial","Soporte comunidad"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0"/>
                    <span className={dark ? "text-gray-300" : "text-gray-700"}>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={scrollToAnalyzer}
                className={cn("w-full py-3 rounded-2xl border font-semibold text-sm transition-all active:scale-95",
                  dark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100")}>
                Comenzar gratis
              </button>
            </div>
            {/* Premium */}
            <div className="p-8 rounded-3xl border border-blue-500/50 bg-blue-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }}/>
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Premium</span>
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">Popular</span>
                </div>
                <div className="text-5xl font-black text-white mb-1">$7</div>
                <p className="text-blue-200 text-sm mb-8">por mes · cancela cuando quieras</p>
                <ul className="space-y-3 mb-8">
                  {["Análisis ilimitados","IA avanzada con contexto","Historial completo","Alertas en tiempo real","Soporte prioritario"].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-white shrink-0"/>
                      <span className="text-white/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 rounded-2xl bg-white text-blue-600 font-bold text-sm transition-all hover:bg-blue-50 active:scale-95 flex items-center justify-center gap-2">
                  Empezar prueba <ArrowRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={cn("border-t py-12 px-4", dark ? "border-gray-800" : "border-gray-200")}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white"/>
              </div>
              <span className="font-black">ScamCheck</span>
              <span className={cn("text-sm", muted)}>© 2026</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              {["Privacidad","Términos","Contacto","API"].map(l => (
                <a key={l} href="#" className={cn("hover:text-blue-500 transition-colors", muted)}>{l}</a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-500"/>
              <span className="text-xs text-emerald-500 font-medium">Análisis privado y seguro</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;900&display=swap');
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
