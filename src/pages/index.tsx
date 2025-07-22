import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import React, { useRef, useEffect, useState, MouseEvent as ReactMouseEvent } from "react";

// Glitch/Typing effect for hero title
function useGlitchText(text: string, speed = 60) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    let i = 0;
    let raf: number;
    function type() {
      setDisplay(text.slice(0, i) + (i < text.length ? "|" : ""));
      if (i < text.length) {
        i++;
        raf = window.setTimeout(type, speed + Math.random() * 40);
      } else {
        setTimeout(() => setDisplay(text), 400);
      }
    }
    type();
    return () => clearTimeout(raf);
  }, [text, speed]);
  return display;
}

// Mascote SVG animado (foguete friendly)
function MascotRocket({ hover }: { hover: boolean }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="transition-transform duration-500" style={{ transform: hover ? 'translateY(-12px) scale(1.08) rotate(-8deg)' : 'none' }}>
      <g>
        <ellipse cx="40" cy="70" rx="16" ry="6" fill="#0002" />
        <g className="transition-transform duration-500" style={{ transform: hover ? 'translateY(-6px)' : 'none' }}>
          <rect x="36" y="30" width="8" height="28" rx="4" fill="#e0e7ef" stroke="#b0b8c1" strokeWidth="2" />
          <polygon points="40,10 48,32 32,32" fill="#6ee7b7" stroke="#059669" strokeWidth="2" />
          <ellipse cx="40" cy="38" rx="3" ry="2" fill="#fff" />
          <rect x="38" y="58" width="4" height="8" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
          <polygon points="40,66 44,74 36,74" fill="#f59e42" />
        </g>
      </g>
    </svg>
  );
}



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const testimonials: { name: string; avatar: string; text: string }[] = [
  {
    name: "@expertvendas",
    avatar: "/assets/images/dog.jpg",
    text: "Aumentei em 37% a conversão das minhas VSLs depois que migrei para o Scale. Analytics detalhado mudou meu jogo.",
  },
  {
    name: "@copypro",
    avatar: "/assets/images/dog.jpg",
    text: "O player é rápido, bonito e meus leads assistem até o fim. Recomendo para todo mundo do marketing digital.",
  },
  {
    name: "@infoprodutor",
    avatar: "/assets/images/dog.jpg",
    text: "Nunca foi tão fácil criar, hospedar e vender com VSL. O suporte do Scale é surreal.",
  },
];

export default function Home() {
  // Spotlight effect
  const spotlightRef = useRef<HTMLDivElement>(null);
  const glitchTitle = useGlitchText("Scale");
  const [mascotHover, setMascotHover] = useState(false);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current) return;
      const rect = spotlightRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlightRef.current.style.setProperty("--x", `${x}px`);
      spotlightRef.current.style.setProperty("--y", `${y}px`);
    };
    const el = spotlightRef.current;
    if (el) el.addEventListener("mousemove", handleMouseMove);
    return () => {
      if (el) el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-gradient-to-br from-scale-950 via-scale-900 to-scale-800 relative overflow-x-hidden`}
    >
      {/* PARTICLE BACKGROUND */}
      <ParticleBackground />

      {/* HERO CINEMATOGRÁFICO COM SVG, GLITCH E MASCOTE */}
      <header ref={spotlightRef} className="w-full px-6 pt-24 pb-40 flex flex-col items-center justify-center text-center relative z-10 overflow-hidden spotlight-hero">
        {/* SVG background waves */}
        <svg className="absolute left-0 top-0 w-full h-full -z-10" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,400 Q360,500 720,400 T1440,400 V600 H0 Z" fill="#fff1" />
          <path d="M0,300 Q360,400 720,300 T1440,300 V600 H0 Z" fill="#fff2" />
        </svg>
        <div className="absolute inset-0 pointer-events-none" style={{background: "radial-gradient(600px at var(--x,50vw) var(--y,30vh), rgba(255,255,255,0.10) 0%, transparent 100%)"}} />
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl px-8 py-14 max-w-3xl mx-auto flex flex-col items-center animate-fade-in-up relative">
          <div
            className="mb-4 cursor-pointer"
            onMouseEnter={() => setMascotHover(true)}
            onMouseLeave={() => setMascotHover(false)}
            tabIndex={0}
            aria-label="Mascote foguete animado"
          >
            <MascotRocket hover={mascotHover} />
          </div>
          <h1 className="text-7xl sm:text-9xl font-extrabold text-white drop-shadow-xl tracking-tight bg-gradient-to-r from-scale-200 via-white to-scale-400 bg-clip-text text-transparent animate-gradient-x glitch-text">
            {glitchTitle}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-medium text-silver-100 max-w-2xl mt-4 animate-fade-in">
            O futuro das VSLs para Marketing Digital chegou.<br />
            <span className="text-scale-200 font-bold">Transforme espectadores em clientes com tecnologia, dados e criatividade.</span>
          </h2>
          <p className="text-lg sm:text-xl text-silver-200 max-w-2xl mx-auto mt-6 mb-10 animate-fade-in">
            Crie, hospede e otimize Vídeo Sales Letters com recursos avançados de analytics, personalização e performance. Tudo em uma plataforma pensada para quem vive de vendas online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link
              href="/sign-in"
              className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-scale-900 via-scale-700 to-scale-900 text-white font-bold text-lg shadow-2xl hover:scale-105 hover:bg-scale-800 transition border-2 border-white/10 focus:ring-4 focus:ring-scale-400/30 focus:outline-none animate-neon"
            >
              Comece Agora
            </Link>
            <Link
              href="/pricing"
              className="inline-block px-10 py-4 rounded-xl bg-white/10 text-white font-semibold text-lg shadow-lg hover:bg-white/20 border-2 border-white/10 hover:scale-105 transition focus:ring-4 focus:ring-scale-200/30 focus:outline-none"
            >
              Ver Planos
            </Link>
          </div>
        </div>
      </header>

      {/* FEATURES 3D COM PARALLAX */}
      <FeaturesParallaxSection />

      {/* LINHA DO TEMPO ANIMADA */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20 animate-fade-in">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12 text-center drop-shadow-lg">Sua Jornada no Scale</h2>
        <Timeline />
      </section>

      {/* SHOWCASE 3D DE MOCKUPS */}
      <section className="w-full flex flex-col items-center justify-center py-24 px-6 bg-gradient-to-br from-scale-900 via-scale-800 to-scale-950 relative animate-fade-in-up overflow-x-hidden">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12 text-center drop-shadow-lg">Veja o Scale em ação</h2>
        <Showcase3D />
      </section>

      {/* CARROSSEL DEPOIMENTOS */}
      <section className="w-full bg-gradient-to-tr from-scale-900 via-scale-800 to-scale-700 py-20 px-6 flex flex-col items-center animate-fade-in relative overflow-hidden">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12 text-center drop-shadow-lg animate-fade-in-up">Quem já escala com a gente</h2>
        <TestimonialCarousel3D testimonials={testimonials} />
      </section>

      {/* CTA FINAL COM SCANLINE/BRILHO E NEON */}
      <section className="w-full flex flex-col items-center justify-center py-20 px-6 bg-gradient-to-r from-scale-800 via-scale-700 to-scale-900 relative animate-fade-in-up overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-1 animate-scanline" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1 animate-scanline" style={{ animationDelay: '0.5s' }} />
        </div>
        {/* Brilho dinâmico */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-brilho pointer-events-none" />
        <div className="text-center max-w-2xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 drop-shadow-lg animate-wave-text">
            Pronto para escalar seu negócio?
          </h2>
          <p className="text-silver-200 text-lg mb-8 animate-wave-text" style={{ animationDelay: '0.1s' }}>
            Junte-se a milhares de profissionais que já transformaram seus resultados com o Scale.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-scale-400 to-scale-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 neon-pulse-button relative overflow-hidden group"
          >
            <span className="relative z-10">Começar Agora</span>
            <svg className="ml-2 w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {/* Efeito de brilho interno */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </div>
      </section>
      {/* FOOTER GEOMÉTRICO ANIMADO */}
      <footer className="w-full py-12 flex flex-col items-center justify-center bg-scale-950 border-t border-white/10 mt-auto animate-fade-in relative overflow-hidden">
        {/* SVG orgânico animado */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <FooterBlobs />
          <FooterParticles />
        </div>
        <div className="text-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-scale-400 to-scale-600 rounded-xl mr-3 animate-pulse-slow shadow-lg" />
            <span className="text-3xl font-bold text-white">Scale</span>
          </div>
          <p className="text-silver-300 text-base mb-6 max-w-md mx-auto">
            Transformando o marketing digital com VSLs que convertem e escalam seu negócio.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm mb-6">
            <a href="#" className="text-silver-400 hover:text-white transition-colors duration-300 underline-animate-footer group">
              <span className="relative">
                Termos de Uso
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-scale-400 to-scale-600 group-hover:w-full transition-all duration-300" />
              </span>
            </a>
            <a href="#" className="text-silver-400 hover:text-white transition-colors duration-300 underline-animate-footer group">
              <span className="relative">
                Política de Privacidade
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-scale-400 to-scale-600 group-hover:w-full transition-all duration-300" />
              </span>
            </a>
            <a href="#" className="text-silver-400 hover:text-white transition-colors duration-300 underline-animate-footer group">
              <span className="relative">
                Suporte
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-scale-400 to-scale-600 group-hover:w-full transition-all duration-300" />
              </span>
            </a>
          </div>
          <div className="text-silver-500 text-xs">
            © 2024 Scale. Todos os direitos reservados.
          </div>
        </div>
      </footer>
      {/* ANIMAÇÕES TAILWIND CUSTOM E CSS PURO */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes neon {
          0%, 100% { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #0ff; }
          50% { box-shadow: 0 0 2.5px #fff, 0 0 5px #fff, 0 0 7.5px #fff, 0 0 10px #0ff; }
        }
        @keyframes avatar-pulse {
          0%, 100% { border-color: #64748b; }
          50% { border-color: #fbbf24; }
        }
        @keyframes underline-animate {
          0% { width: 0; }
          100% { width: 100%; }
        }
        @keyframes feature-icon {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(5deg); }
        }
        @keyframes footer-blob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes footer-wave {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(5px) scale(1.05); }
        }
        @keyframes showcase-reflex {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes showcase-play {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes showcase-highlight {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes neon-pulse {
          0%, 100% { 
            box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #0ff, 0 0 30px #0ff;
            text-shadow: 0 0 5px #fff, 0 0 10px #fff;
          }
          50% { 
            box-shadow: 0 0 2px #fff, 0 0 5px #fff, 0 0 8px #fff, 0 0 12px #0ff, 0 0 20px #0ff;
            text-shadow: 0 0 2px #fff, 0 0 5px #fff;
          }
        }
        @keyframes wave-text {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-2px); }
          75% { transform: translateY(2px); }
        }
        @keyframes brilho {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        .neon-pulse-button {
          animation: neon-pulse 2s ease-in-out infinite;
        }
        .animate-wave-text {
          animation: wave-text 3s ease-in-out infinite;
        }
        .animate-brilho {
          animation: brilho 4s ease-in-out infinite;
        }
        .animate-scanline {
          animation: scanline 3s linear infinite;
        }
        .underline-animate-footer:hover .underline-animate-footer::after {
          width: 100%;
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 4s ease-in-out infinite; }
        .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        .glitch-text { animation: glitch 0.3s ease-in-out infinite; }
        .animate-scanline { animation: scanline 3s linear infinite; }
        .animate-neon { animation: neon 2s ease-in-out infinite; }
        .animate-avatar-pulse { animation: avatar-pulse 2s ease-in-out infinite; }
        .underline-animate::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #64748b, #fbbf24);
          transition: width 0.3s ease;
        }
        .underline-animate:hover::after {
          width: 100%;
        }
        .animate-feature-icon { animation: feature-icon 2s ease-in-out infinite; }
        .animate-footer-blob { animation: footer-blob 6s ease-in-out infinite; }
        .animate-footer-wave { animation: footer-wave 8s ease-in-out infinite; }
        .animate-showcase-reflex { animation: showcase-reflex 3s ease-in-out infinite; }
        .animate-showcase-play { animation: showcase-play 2s ease-in-out infinite; }
        .animate-showcase-highlight { animation: showcase-highlight 1.5s ease-in-out infinite; }
        .glass-blur {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .border-gradient-to-r {
          border-image: linear-gradient(90deg, #64748b, #fbbf24) 1;
        }
        .perspective-1200 {
          perspective: 1200px;
        }
        .spotlight-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.1), transparent 40%);
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

// PARTICLE BACKGROUND (CSS only, no canvas)
function ParticleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white/10 animate-particle"
          style={{
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 8 + 6}s`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes particle {
          0% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { opacity: 1; }
          100% { transform: translateY(-60vh) scale(1.2); opacity: 0.2; }
        }
        .animate-particle { animation: particle linear infinite; }
      `}</style>
    </div>
  );
}

// FeatureCard 3D com parallax, glass, reflexo e ícone animado
function AnimatedFeatureIcon({ type, animate }: { type: 'player' | 'analytics' | 'conversion', animate: boolean }) {
  // Morph entre paths para animação sutil
  if (type === 'player') {
    return (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="8" y="14" width="40" height="28" rx="6" fill="#fff" fillOpacity="0.12" stroke="#6ee7b7" strokeWidth="2" />
        <polygon points="24,22 38,28 24,34" fill="#6ee7b7">
          {animate && <animate attributeName="points" values="24,22 38,28 24,34;26,20 40,28 26,36;24,22 38,28 24,34" dur="2s" repeatCount="indefinite" />}
        </polygon>
      </svg>
    );
  }
  if (type === 'analytics') {
    return (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="10" y="14" width="36" height="28" rx="6" fill="#fff" fillOpacity="0.12" stroke="#60a5fa" strokeWidth="2" />
        <polyline points="18,34 26,26 32,32 38,20" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {animate && <animate attributeName="points" values="18,34 26,26 32,32 38,20;18,32 26,28 32,34 38,18;18,34 26,26 32,32 38,20" dur="2s" repeatCount="indefinite" />}
        </polyline>
        <circle cx="38" cy="20" r="2.5" fill="#60a5fa" />
      </svg>
    );
  }
  // conversion
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <rect x="10" y="14" width="36" height="28" rx="6" fill="#fff" fillOpacity="0.12" stroke="#fbbf24" strokeWidth="2" />
      <path d="M28 22v10" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round">
        {animate && <animate attributeName="d" values="M28 22v10;M28 18v14;M28 22v10" dur="2s" repeatCount="indefinite" />}
      </path>
      <circle cx="28" cy="36" r="3" fill="#fbbf24" />
    </svg>
  );
}

function FeaturesParallaxSection() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  function handleMouseMove(e: ReactMouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setParallax({ x, y });
  }
  function handleMouseLeave() {
    setParallax({ x: 0, y: 0 });
    setHovered(null);
  }

  const features = [
    {
      icon: 'player' as const,
      title: 'Player Ultra Rápido',
      desc: 'Streaming instantâneo, sem travar, com controles customizáveis e experiência premium para seu público.'
    },
    {
      icon: 'analytics' as const,
      title: 'Analytics de Verdade',
      desc: 'Descubra quem assiste, quanto tempo, onde desistem e otimize cada segundo da sua VSL com dados reais.'
    },
    {
      icon: 'conversion' as const,
      title: 'Conversão Máxima',
      desc: 'Botões de CTA, timers, personalização e integrações para transformar cada view em venda.'
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-16 perspective-1200 animate-fade-in-up relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Shapes SVG removidos para fundo mais clean */}
      {features.map((f, i) => {
        // Parallax: cada card reage ao mouse
        const rotateY = parallax.x * 12 + (i - 1) * 8;
        const rotateX = -parallax.y * 10;
        const scale = hovered === i ? 1.08 : 1;
        return (
          <div
            key={f.title}
            className="relative group cursor-pointer"
            style={{
              transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
              transition: 'transform 0.5s cubic-bezier(.23,1.01,.32,1)',
              zIndex: hovered === i ? 2 : 1,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            tabIndex={0}
            aria-label={f.title}
          >
            {/* Glassmorphism layer */}
            <div className="bg-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 p-12 flex flex-col items-center text-center relative overflow-hidden">
              {/* Reflexo */}
              <div className="absolute left-0 top-0 w-full h-1/3 bg-gradient-to-b from-white/40 to-transparent opacity-60 pointer-events-none" style={{ filter: 'blur(6px)' }} />
              {/* Sombra interna */}
              <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none" style={{ boxShadow: 'inset 0 8px 32px 0 #0002' }} />
              {/* Ícone animado */}
              <div className="mb-6">
                <AnimatedFeatureIcon type={f.icon} animate={hovered === i} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg animate-gradient-x bg-gradient-to-r from-scale-200 via-white to-scale-400 bg-clip-text text-transparent">
                {f.title}
              </h3>
              <p className="text-silver-200 text-lg animate-fade-in">{f.desc}</p>
            </div>
        </div>
        );
      })}
    </section>
  );
}

// TIMELINE
function Timeline() {
  const steps = [
    { title: "Cadastro", desc: "Crie sua conta em segundos.", color: '#6ee7b7', icon: 'user' },
    { title: "Envie sua VSL", desc: "Faça upload do seu vídeo com facilidade.", color: '#60a5fa', icon: 'upload' },
    { title: "Personalize", desc: "Adicione CTAs, timers e branding.", color: '#fbbf24', icon: 'edit' },
    { title: "Acompanhe Analytics", desc: "Veja dados em tempo real de cada view.", color: '#a78bfa', icon: 'chart' },
    { title: "Otimize e Venda", desc: "Aumente conversão com insights acionáveis.", color: '#f472b6', icon: 'rocket' },
  ];
  // Reveal animation on scroll
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 120) setVisible(true);
    }
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div ref={ref} className="relative flex flex-col items-start max-w-2xl mx-auto">
      {/* Linha vertical com rastro luminoso à esquerda */}
      <div className="absolute left-6 top-0 h-full w-2 flex items-start">
        <div className={`w-2 bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-100 rounded-full shadow-lg transition-all duration-1000 ${visible ? 'h-full' : 'h-0'}`} style={{ transitionDelay: visible ? '0.2s' : '0s' }} />
      </div>
      <ol className="relative z-10 w-full">
        {steps.map((step, i) => (
          <li
            key={i}
            className={`flex items-center group mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            style={{ transitionDelay: `${i * 0.15 + 0.2}s` }}
            tabIndex={0}
          >
            {/* Ícone animado sobre a linha */}
            <div className="flex flex-col items-center mr-8 relative z-20">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white bg-white"
                style={{ background: step.color, boxShadow: `0 0 24px 0 ${step.color}88` }}
              >
                <TimelineIcon type={step.icon} animate={visible} />
              </div>
              {i < steps.length - 1 && (
                <div className="w-1 h-16 bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-100 opacity-70" />
              )}
            </div>
            {/* Card à direita da linha */}
            <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300 ml-2">
              <h4 className="text-xl font-bold text-white mb-1 flex items-center">
                {step.title}
              </h4>
              <p className="text-silver-200">{step.desc}</p>
            </div>
          </li>
        ))}
        </ol>
    </div>
  );
}

function TimelineIcon({ type, animate }: { type: string, animate: boolean }) {
  if (type === 'user') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="12" r="6" fill="#fff" />
        <ellipse cx="16" cy="24" rx="8" ry="5" fill="#fff" fillOpacity="0.7">
          {animate && <animate attributeName="rx" values="8;10;8" dur="2s" repeatCount="indefinite" />}
        </ellipse>
      </svg>
    );
  }
  if (type === 'upload') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="8" y="20" width="16" height="4" rx="2" fill="#fff" />
        <path d="M16 22V10" stroke="#fff" strokeWidth="3" strokeLinecap="round">
          {animate && <animate attributeName="d" values="M16 22V10;M16 26V6;M16 22V10" dur="2s" repeatCount="indefinite" />}
        </path>
        <polygon points="12,14 16,8 20,14" fill="#fff" />
      </svg>
    );
  }
  if (type === 'edit') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="8" y="20" width="16" height="4" rx="2" fill="#fff" />
        <rect x="12" y="12" width="8" height="6" rx="2" fill="#fff" />
        <rect x="14" y="14" width="4" height="2" rx="1" fill="#fbbf24">
          {animate && <animate attributeName="width" values="4;8;4" dur="2s" repeatCount="indefinite" />}
        </rect>
      </svg>
    );
  }
  if (type === 'chart') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="8" y="20" width="3" height="6" rx="1.5" fill="#fff">
          {animate && <animate attributeName="height" values="6;12;6" dur="2s" repeatCount="indefinite" />}
        </rect>
        <rect x="14" y="16" width="3" height="10" rx="1.5" fill="#fff">
          {animate && <animate attributeName="height" values="10;16;10" dur="2s" repeatCount="indefinite" />}
        </rect>
        <rect x="20" y="12" width="3" height="14" rx="1.5" fill="#fff">
          {animate && <animate attributeName="height" values="14;20;14" dur="2s" repeatCount="indefinite" />}
        </rect>
      </svg>
    );
  }
  // rocket
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <polygon points="16,4 22,20 10,20" fill="#fff" />
      <rect x="14" y="20" width="4" height="6" rx="2" fill="#f472b6" />
      <polygon points="16,26 19,30 13,30" fill="#f472b6" />
      {animate && <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="2s" repeatCount="indefinite" />}
    </svg>
  );
}

// SHOWCASE 3D
function Showcase3D() {
  // Simula mockups de vídeo flutuando e girando
  const [hovered, setHovered] = useState<number | null>(null);
  const [rotation, setRotation] = useState([0, 0, 0]);
  // Rotação automática
  useEffect(() => {
    let frame: number;
    function animate() {
      setRotation(([a, b, c]) => [a + 0.005, b + 0.007, c + 0.003]);
      frame = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);
  // Tilt ao mouse
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>, i: number) {
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setRotation(r => r.map((v, idx) => idx === i ? v + x * 0.1 - y * 0.1 : v) as [number, number, number]);
  }
  return (
    <div className="relative flex flex-wrap justify-center gap-12 min-h-[320px]">
      {[0, 1, 2].map((i) => {
        // 3D rotation
        const baseRot = i === 0 ? -18 : i === 2 ? 18 : 0;
        const autoRot = rotation[i] || 0;
        const isHovered = hovered === i;
        return (
          <div
            key={i}
            className="w-72 h-44 bg-gradient-to-br from-scale-700 via-scale-400 to-scale-900 rounded-2xl shadow-2xl border-4 border-white/10 overflow-hidden flex items-center justify-center relative animate-float cursor-pointer group"
            style={{
              transform: `perspective(900px) rotateY(${baseRot + (isHovered ? 0 : autoRot * 20)}deg) rotateZ(${i === 1 ? 2 : 0}deg) scale(${i === 1 ? 1.1 : 1}) translateY(${i === 1 ? '-16px' : '0'})`,
              zIndex: i === 1 ? 2 : 1,
              boxShadow: i === 1 ? '0 8px 48px 0 #fff5' : undefined,
              transition: 'transform 0.5s cubic-bezier(.23,1.01,.32,1)',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onMouseMove={e => handleMouseMove(e, i)}
            tabIndex={0}
            aria-label={`Mockup de vídeo ${i + 1}`}
          >
            {/* Reflexo animado */}
            <div className="absolute left-0 top-0 w-full h-1/3 bg-gradient-to-r from-white/60 to-transparent opacity-30 pointer-events-none animate-showcase-reflex" style={{ filter: 'blur(8px)' }} />
            {/* Overlay de play animado */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="drop-shadow-xl">
                <circle cx="28" cy="28" r="26" fill="#fff" fillOpacity="0.18" />
                <polygon points="24,20 40,28 24,36" fill="#fff" className="animate-showcase-play" />
              </svg>
            </div>
            {/* Mockup de vídeo (placeholder) */}
            <div className="w-56 h-32 bg-black/70 rounded-xl flex items-center justify-center relative z-0">
              <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
                <rect x="0" y="0" width="80" height="40" rx="8" fill="#222" />
                <rect x="10" y="10" width="60" height="20" rx="4" fill="#444" />
              </svg>
            </div>
            {/* Highlight ao hover */}
            {isHovered && (
              <div className="absolute inset-0 rounded-2xl border-4 border-yellow-300/60 pointer-events-none animate-showcase-highlight" />
            )}
          </div>
        );
      })}
      <style jsx global>{`
        @keyframes showcase-reflex {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-showcase-reflex { animation: showcase-reflex 3s ease-in-out infinite; }
        @keyframes showcase-play {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.85; }
        }
        .animate-showcase-play { animation: showcase-play 2s ease-in-out infinite; }
        @keyframes showcase-highlight {
          0%, 100% { box-shadow: 0 0 0 0 #fbbf24; }
          50% { box-shadow: 0 0 32px 8px #fbbf24cc; }
        }
        .animate-showcase-highlight { animation: showcase-highlight 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// CARROSSEL DEPOIMENTOS
function TestimonialCarousel3D({ testimonials }: { testimonials: { name: string; avatar: string; text: string }[] }) {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const cardCount = testimonials.length;
  // Autoplay
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setTimeout(() => setIndex((prev) => (prev + 1) % cardCount), 4000);
    return () => clearTimeout(timer);
  }, [index, autoPlay, cardCount]);
  // Swipe touch
  const touchStart = useRef<number | null>(null);
  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
    setAutoPlay(false);
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (delta > 40) setIndex((prev) => (prev === 0 ? cardCount - 1 : prev - 1));
    if (delta < -40) setIndex((prev) => (prev + 1) % cardCount);
    touchStart.current = null;
    setTimeout(() => setAutoPlay(true), 2000);
  }
  // 3D positions
  const radius = 320;
  const angleStep = (2 * Math.PI) / cardCount;
  const cardBaseClass = "bg-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-xl flex flex-col items-center text-center border border-white/10 glass-blur transition-transform duration-500 animate-fade-in";
  const avatarBaseClass = "mb-4 rounded-full shadow-lg";
  return (
    <div className="relative w-full flex flex-col items-center" style={{ perspective: 1200 }}>
      {/* Fundo com blur dinâmico */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-scale-900 via-scale-800 to-scale-700 blur-2xl opacity-80" />
      </div>
      {/* Carrossel 3D */}
      <div
        className="relative w-full h-80 flex items-center justify-center select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {testimonials.map((t, i) => {
          const angle = angleStep * (i - index);
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          const scale = 0.7 + 0.3 * (1 - Math.abs(i - index) / cardCount);
          const isActive = i === index;
          return (
            <div
              key={i}
              className={`absolute left-1/2 top-1/2 w-80 max-w-xs -translate-x-1/2 -translate-y-1/2 ${cardBaseClass} ${isActive ? 'z-20 scale-105' : 'z-10 scale-95'} group`}
              style={{
                transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) scale(${scale}) rotateY(${angle * 180 / Math.PI}deg)`,
                opacity: Math.abs(i - index) > 1 ? 0.3 : 1,
                filter: isActive ? 'blur(0)' : 'blur(2px)',
                pointerEvents: isActive ? 'auto' : 'none',
              }}
              tabIndex={0}
              aria-label={`Depoimento de ${t.name}`}
            >
              <Image src={t.avatar} alt={t.name} width={64} height={64} className={avatarBaseClass} />
              <p className="text-silver-100 italic mb-2">“{t.text}”</p>
              <span className="text-scale-200 font-semibold">{t.name}</span>
            </div>
          );
        })}
        {/* Setas de navegação */}
        <button
          aria-label="Anterior"
          onClick={() => { setIndex((prev) => (prev === 0 ? cardCount - 1 : prev - 1)); setAutoPlay(false); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 z-30 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          aria-label="Próximo"
          onClick={() => { setIndex((prev) => (prev + 1) % cardCount); setAutoPlay(false); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 z-30 shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      {/* Dots */}
      <div className="flex gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full ${i === index ? 'bg-yellow-400' : 'bg-white/30'} transition-all`}
            onClick={() => { setIndex(i); setAutoPlay(false); }}
            aria-label={`Ir para depoimento ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}



function FooterBlobs() {
  return (
    <>
      {/* Blob 1 */}
      <svg className="absolute bottom-0 left-0 w-40 h-40 text-scale-800/20 animate-footer-blob" viewBox="0 0 100 100">
        <path d="M20,50 Q40,20 60,50 T100,50 L100,100 L20,100 Z" fill="currentColor" />
      </svg>
      {/* Blob 2 */}
      <svg className="absolute top-0 right-0 w-32 h-32 text-scale-700/15 animate-footer-wave" viewBox="0 0 100 100">
        <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor" />
      </svg>
      {/* Blob 3 */}
      <svg className="absolute bottom-0 right-0 w-24 h-24 text-scale-600/10 animate-footer-blob" style={{ animationDelay: '1s' }} viewBox="0 0 100 100">
        <path d="M0,30 Q30,10 60,30 T100,30 L100,100 L0,100 Z" fill="currentColor" />
      </svg>
      {/* Blob 4 */}
      <svg className="absolute top-0 left-0 w-20 h-20 text-scale-500/8 animate-footer-wave" style={{ animationDelay: '0.5s' }} viewBox="0 0 100 100">
        <path d="M0,40 Q40,20 80,40 T100,40 L100,100 L0,100 Z" fill="currentColor" />
      </svg>
    </>
  );
}

function FooterParticles() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const anim = () => { setTick(t => t + 1); requestAnimationFrame(anim); };
    anim();
    return () => {};
  }, []);
  
  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: Math.sin((tick + i * 30) * 0.005) * 30 + 50,
    y: Math.cos((tick + i * 40) * 0.008) * 20 + 50,
    r: Math.random() * 3 + 1,
    o: 0.1 + Math.abs(Math.sin((tick + i * 15) * 0.01)) * 0.1,
  }));
  
  return (
    <svg className="absolute inset-0 w-full h-full" width="100%" height="100%">
      {particles.map((p, i) => (
        <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill="#64748b" opacity={p.o} />
      ))}
    </svg>
  );
}
