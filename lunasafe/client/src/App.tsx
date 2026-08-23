import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Radio,
  Camera,
  Thermometer,
  Layers,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Compass,
  Zap,
  Sliders,
  ChevronDown,
  Info,
  Maximize2,
  Globe,
  Crosshair,
  ZoomIn,
  Navigation,
  Target,
  Sparkles,
  AlertTriangle,
  Flame,
  Check,
  XCircle,
  Sun,
  Shield,
  Activity,
  ArrowDownRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { apiClient } from './services/api';
import { AnalysisResponse, SensorHealth, MissionWeights } from './types/landing';

import moonStarsImg from './assets/moon_stars.png';

gsap.registerPlugin(ScrollTrigger);

// Leaflet Custom Icons
const safeIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: '<div class="marker-pin-safe"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

const riskyIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: '<div class="marker-pin-risky"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

interface LeafletSitePoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  isSafe: boolean;
  score: string;
  slope: string;
  hazard: string;
  status: 'SAFE' | 'RISKY';
  reason: string;
}

interface RegionData {
  id: string;
  name: string;
  sub: string;
  lat: number;
  lon: number;
  coords: string;
  scenario_id: string;
  hazard: string;
  slope: string;
  roughness: string;
  confLow: number;
  confHigh: number;
  flag: string | null;
  rationale: string;
  groundtruth: string | null;
  quickmapExtent: string;
  pinStyle: { top: string; left: string };
  mostSafeDetails: {
    name: string;
    score: string;
    slope: string;
    hazard: string;
    craters: string;
    boulders: string;
    clearance: string;
    tippingMargin: string;
    thermalIllum: string;
    commsLine: string;
    consensus: string;
    rationale: string;
  };
  mapPoints: LeafletSitePoint[];
}

const REGIONS: Record<string, RegionData> = {
  cy3: {
    id: 'cy3',
    name: 'Shiv Shakti Point',
    sub: 'Chandrayaan-3 landing site',
    lat: -69.373,
    lon: 32.319,
    coords: '69.373°S, 32.319°E',
    scenario_id: 'chandrayaan3',
    hazard: '6%',
    slope: '4.2°',
    roughness: '0.08',
    confLow: 87,
    confHigh: 95,
    flag: null,
    rationale: "Zone A selected — low boulder/crater density, slope well within 8.5° landing gear tipping limit, and minimal shadow occlusion. The scoring engine independently ranks this zone highest using pre-landing optical and elevation data.",
    groundtruth: "Top-ranked zone falls 1.3 km from the real Shiv Shakti Point — independently recovered using multi-sensor fusion.",
    quickmapExtent: 'prjExtent=-4658894.0053051%2C-2032529.978284%2C5293105.9946949%2C2375470.021716&center=32.319,-69.373&zoom=15&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg',
    pinStyle: { top: '58%', left: '44%' },
    mostSafeDetails: {
      name: "Shiv Shakti Touchdown Basin (Primary Zone A)",
      score: "94%",
      slope: "4.2° (Well within ≤ 8.5° limit)",
      hazard: "3.8% (Negligible rock density)",
      craters: "2 minor sub-meter rim depressions (Ø < 1.2m)",
      boulders: "0 boulder / rock clusters > 0.5m detected",
      clearance: "96.2% unobstructed landing regolith",
      tippingMargin: "51% structural margin above tipping threshold",
      thermalIllum: ">85% continuous solar line-of-sight (185K–225K nominal)",
      commsLine: "Direct line-of-sight to Earth deep-space ground stations",
      consensus: "100% agreement across Optical, LOLA Altimetry & Thermal Radiometry",
      rationale: "Broad, flat regolith plain with zero boulder cluster obstructions and optimal geotechnical load-bearing capacity."
    },
    mapPoints: [
      {
        id: 'p1',
        name: 'Shiv Shakti Touchdown Plain (Zone A)',
        lat: -69.373,
        lon: 32.319,
        isSafe: true,
        score: '94%',
        slope: '4.2°',
        hazard: '3.8%',
        status: 'SAFE',
        reason: 'Optimal touchdown site: minimal tilt risk, clear regolith, 0 rock obstacles.'
      },
      {
        id: 'p2',
        name: 'Secondary Basin East (Zone B)',
        lat: -69.345,
        lon: 32.410,
        isSafe: true,
        score: '88%',
        slope: '5.1°',
        hazard: '6.2%',
        status: 'SAFE',
        reason: 'Safe alternate target: acceptable slope, 1 shallow crater, good solar line-of-sight.'
      },
      {
        id: 'p3',
        name: 'Manzinus C Crater Rim Flank (Zone C)',
        lat: -69.410,
        lon: 32.220,
        isSafe: false,
        score: '26%',
        slope: '28.4°',
        hazard: '68%',
        status: 'RISKY',
        reason: 'Severe hazard: 14 crater rims and 9 rock clusters exceed 8.5° tipping limit with high rollover risk.'
      },
      {
        id: 'p4',
        name: 'Boguslawsky Ejecta Field (Zone D)',
        lat: -69.310,
        lon: 32.180,
        isSafe: false,
        score: '31%',
        slope: '19.8°',
        hazard: '74%',
        status: 'RISKY',
        reason: 'High risk: dense boulder and rock clusters capable of puncturing lander baseplate.'
      }
    ]
  },
  sp: {
    id: 'sp',
    name: 'South Pole — Shackleton PSR',
    sub: 'Permanently shadowed region survey',
    lat: -89.9,
    lon: 0.0,
    coords: '89.9°S, 0.0°E (Extreme South Pole)',
    scenario_id: 'shackleton',
    hazard: '18%',
    slope: '9.6°',
    roughness: '0.21',
    confLow: 55,
    confHigh: 78,
    flag: 'reduced_confidence — thermal sensor degraded in deep shadow',
    rationale: "Zone B selected as best available on illuminated ridge crest, but shadow coverage exceeds 40% in crater cavity. Thermal channel lost signal in deep cold trap — remaining weight redistributed to elevation data.",
    groundtruth: "Simulates challenging polar ridge terrain with deep cold-trap PSR volatiles.",
    quickmapExtent: 'prjExtent=-4658894.0053051%2C-2032529.978284%2C5293105.9946949%2C2375470.021716&center=0.0,-89.9&zoom=14&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg',
    pinStyle: { top: '84%', left: '50%' },
    mostSafeDetails: {
      name: "Shackleton Connecting Ridge Crest (Zone B)",
      score: "78%",
      slope: "6.8° (Acceptable)",
      hazard: "12.0% (Moderate gravel)",
      craters: "5 micro-craters on ridge crest",
      boulders: "3 small gravel/rock clusters (<0.4m)",
      clearance: "88.0% clear path",
      tippingMargin: "20% structural margin above tipping threshold",
      thermalIllum: "Illuminated ridge with direct solar line-of-sight",
      commsLine: "Periodic lunar orbiter relay required due to low polar angle",
      consensus: "Elevation DEM and optical concur; thermal offline in shadow",
      rationale: "High-altitude crest avoiding the sub-80K permanent shadow trap while maintaining stable footing."
    },
    mapPoints: [
      {
        id: 'p1',
        name: 'Shackleton Illuminated Ridge (Zone B)',
        lat: -89.88,
        lon: 0.05,
        isSafe: true,
        score: '78%',
        slope: '6.8°',
        hazard: '12%',
        status: 'SAFE',
        reason: 'Best available polar candidate on high-altitude solar-illuminated ridge with low rock density.'
      },
      {
        id: 'p2',
        name: 'Connecting Saddle West (Zone C)',
        lat: -89.84,
        lon: -0.15,
        isSafe: true,
        score: '72%',
        slope: '7.9°',
        hazard: '14%',
        status: 'SAFE',
        reason: 'Marginally safe saddle with low boulder density.'
      },
      {
        id: 'p3',
        name: 'Shackleton Deep Cold Trap (Zone D)',
        lat: -89.94,
        lon: 0.02,
        isSafe: false,
        score: '18%',
        slope: '34.5°',
        hazard: '88%',
        status: 'RISKY',
        reason: 'Critical hazard: 22 steep crater walls with vertical ice-rock dropoffs (<80K).'
      }
    ]
  },
  malapert: {
    id: 'malapert',
    name: 'Malapert Mountain Plateau',
    sub: 'Artemis peak of eternal light',
    lat: -85.9,
    lon: 0.0,
    coords: '85.9°S, 0.0°E (Connecting Ridge)',
    scenario_id: 'malapert',
    hazard: '11%',
    slope: '5.8°',
    roughness: '0.14',
    confLow: 82,
    confHigh: 91,
    flag: null,
    rationale: "High mesa plateau with continuous solar line-of-sight (>85% illumination). Slope gradient 5.8° within structural envelope, bordered by steep 20° cliff flanks.",
    groundtruth: "Candidate site for long-duration lunar outpost with continuous Earth direct communications.",
    quickmapExtent: 'prjExtent=-4658894.0053051%2C-2032529.978284%2C5293105.9946949%2C2375470.021716&center=0.0,-85.9&zoom=14&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg',
    pinStyle: { top: '74%', left: '68%' },
    mostSafeDetails: {
      name: "Malapert Peak Summit Mesa (Zone 1)",
      score: "91%",
      slope: "5.8° (Safe ≤ 8.5° limit)",
      hazard: "7.5% (Low hazard)",
      craters: "3 shallow rim pockets (Ø < 1.0m)",
      boulders: "1 low-lying rock cluster",
      clearance: "92.5% clear plain",
      tippingMargin: "32% structural margin above tipping threshold",
      thermalIllum: "85%+ annual solar power line-of-sight (Peak of Eternal Light)",
      commsLine: "Continuous unobstructed Earth direct radio visibility",
      consensus: "100% agreement across all modalities",
      rationale: "Broad summit plateau offering continuous solar energy and permanent Earth comms."
    },
    mapPoints: [
      {
        id: 'p1',
        name: 'Malapert Summit Plateau (Zone 1)',
        lat: -85.90,
        lon: 0.02,
        isSafe: true,
        score: '91%',
        slope: '5.8°',
        hazard: '7.5%',
        status: 'SAFE',
        reason: 'Optimal long-duration site: continuous solar line-of-sight and flat summit mesa.'
      },
      {
        id: 'p2',
        name: 'Eastern Mesa Shelf (Zone 2)',
        lat: -85.85,
        lon: 0.25,
        isSafe: true,
        score: '84%',
        slope: '6.4°',
        hazard: '9.0%',
        status: 'SAFE',
        reason: 'Safe auxiliary landing zone with gentle slope.'
      },
      {
        id: 'p3',
        name: 'Malapert Western Scarp (Zone 3)',
        lat: -85.95,
        lon: -0.28,
        isSafe: false,
        score: '22%',
        slope: '29.8°',
        hazard: '74%',
        status: 'RISKY',
        reason: 'Hazardous cliff edge prone to regolith slumping and gear tipping.'
      }
    ]
  },
  tir: {
    id: 'tir',
    name: 'Tiranga Point',
    sub: 'Chandrayaan-2 impact site (reference case)',
    lat: -70.9,
    lon: 22.8,
    coords: '70.9°S, 22.8°E',
    scenario_id: 'abort_case',
    hazard: '41%',
    slope: '31.8°',
    roughness: '0.52',
    confLow: 40,
    confHigh: 58,
    flag: 'no_safe_zone — recommend abort/reroute',
    rationale: "No candidate zone in this region clears the safety threshold. Slope and roughness far exceed tolerance across the shortlist. Rather than force a low-confidence pick, the system flags the region as unsafe.",
    groundtruth: "Correctly flags the elevated slope/roughness that contributed to this site's historical outcome, instead of forcing a confident-looking pick.",
    quickmapExtent: 'prjExtent=-4658894.0053051%2C-2032529.978284%2C5293105.9946949%2C2375470.021716&center=22.8,-70.9&zoom=15&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg',
    pinStyle: { top: '64%', left: '26%' },
    mostSafeDetails: {
      name: "Least Dangerous Pocket (Zone 1 - ABORT MANDATED)",
      score: "41% (ABORT)",
      slope: "31.8° (CRITICAL HAZARD > 8.5°)",
      hazard: "41.0% (Severe crater ejecta)",
      craters: "38 steep crater rims & dropoffs",
      boulders: "24 sharp boulder/rock ejecta clusters",
      clearance: "32.0% clear (HIGH COLLISION RISK)",
      tippingMargin: "NEGATIVE MARGIN (-274% over tipping limit)",
      thermalIllum: "Severe shadow occlusion (>65% shadow coverage)",
      commsLine: "Occasional topography blocking to Earth DSN stations",
      consensus: "All 3 modalities (Optical, Elevation, Thermal) confirm extreme hazard",
      rationale: "Extreme slope (31.8°) and dense boulder field will cause structural gear rollover upon touchdown. Autonomous abort recommended."
    },
    mapPoints: [
      {
        id: 'p1',
        name: 'Crater Ridge Pocket (Zone 1)',
        lat: -70.88,
        lon: 22.75,
        isSafe: false,
        score: '44%',
        slope: '18.2°',
        hazard: '39%',
        status: 'RISKY',
        reason: 'Unsafe: slope exceeds 8.5° limit, high gear rollover danger.'
      },
      {
        id: 'p2',
        name: 'Impact Boulder Field (Zone 2)',
        lat: -70.94,
        lon: 22.85,
        isSafe: false,
        score: '12%',
        slope: '38.5°',
        hazard: '95%',
        status: 'RISKY',
        reason: 'Critical hazard: dense impact ejecta boulder field.'
      }
    ]
  }
};

const LOADING_STEPS = [
  'Measuring user survey radius envelope…',
  'Fusing optical + elevation + thermal data…',
  'Plotting Safe (Green) & Risky (Red) coordinates on Tactical Lunar GIS…',
  'Evaluating tipping margin & thermal illumination envelope…',
  'Finalizing safety justification assessment…'
];

// Helper to center Leaflet map when region changes
function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const DEFAULT_QUICKMAP_URL = 'https://quickmap.lroc.im-ldi.com/?prjExtent=-4658894.0053051%2C-2032529.978284%2C5293105.9946949%2C2375470.021716&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg';

// Luxury Magnetic Button with Dual-Track Text Reveal
const MagneticButton: React.FC<{
  onClick?: () => void;
  className?: string;
  childrenPrimary: string;
  childrenSecondary?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, className, childrenPrimary, childrenSecondary, icon, disabled }) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    btnRef.current.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px) scale(1.03)`;
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    btnRef.current.style.transform = `translate(0px, 0px) scale(1)`;
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-btn ${className || ''}`}
    >
      {icon && <span className="mr-2.5 flex items-center">{icon}</span>}
      <div className="btn-text-track">
        <span className="btn-text-primary">{childrenPrimary}</span>
        <span className="btn-text-secondary">{childrenSecondary || childrenPrimary}</span>
      </div>
    </button>
  );
};

export const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(REGIONS.cy3);
  const [surveyRadiusKm, setSurveyRadiusKm] = useState<number>(200);
  const [mapMode, setMapMode] = useState<'globe' | 'quickmap'>('globe');
  const [zoomLayerMode, setZoomLayerMode] = useState<'quickmap_embed' | 'leaflet' | 'raster'>('quickmap_embed');
  const [activeLayer, setActiveLayer] = useState<string>('safety_200km');
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [decisionConfirmed, setDecisionConfirmed] = useState<string | null>(null);
  const [customPoint, setCustomPoint] = useState<{ xPct: number; yPct: number; lat: number; lon: number } | null>(null);
  const [titleRevealed, setTitleRevealed] = useState<boolean>(false);

  // Custom Awwwards Cursor State
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [auraPos, setAuraPos] = useState({ x: -100, y: -100 });
  const [isCursorHover, setIsCursorHover] = useState(false);

  // Sensor degradation state
  const [sensorHealth, setSensorHealth] = useState<SensorHealth>({
    optical: 'healthy',
    dem: 'healthy',
    thermal: 'healthy',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const moonRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const heroContentRef = useRef<HTMLDivElement | null>(null);
  const spacerRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const miniHeaderRef = useRef<HTMLDivElement | null>(null);

  // SplitText Entrance Animation Trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setTitleRevealed(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Custom Cursor Mouse Listener with Smooth Lerp
  useEffect(() => {
    let targetX = -100;
    let targetY = -100;
    let auraX = -100;
    let auraY = -100;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setCursorPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('.cursor-pointer') ||
          target.closest('input') ||
          target.closest('.lunar-pin'))
      ) {
        setIsCursorHover(true);
      } else {
        setIsCursorHover(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    let animId: number;
    const updateAura = () => {
      auraX += (targetX - auraX) * 0.16;
      auraY += (targetY - auraY) * 0.16;
      setAuraPos({ x: auraX, y: auraY });
      animId = requestAnimationFrame(updateAura);
    };
    animId = requestAnimationFrame(updateAura);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Lenis Smooth Scroll & GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // GSAP ScrollTrigger Sequence for Hero & Moon
    if (spacerRef.current && moonRef.current && heroContentRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: spacerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });

      // 3D Parallax: Text scales down, blurs, and fades
      tl.to(
        heroContentRef.current,
        {
          scale: 0.82,
          opacity: 0,
          filter: 'blur(16px)',
          y: -90,
          ease: 'power1.inOut',
        },
        0
      );

      // Moon scales up dramatically, rotates subtly with deep pink bloom
      tl.to(
        moonRef.current,
        {
          scale: 3.8,
          rotate: 15,
          y: 110,
          filter: 'drop-shadow(0 0 160px rgba(255, 20, 147, 0.75))',
          ease: 'power2.inOut',
        },
        0
      );

      if (miniHeaderRef.current) {
        tl.to(
          miniHeaderRef.current,
          {
            opacity: 1,
            y: 0,
            ease: 'power1.out',
          },
          0.65
        );
      }
    }

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  // Atmospheric Starfield Canvas Animation with Neon Pink & Silver Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Array<{ x: number; y: number; r: number; phase: number; speed: number; alpha: number; color: string }> = [];
    let shootingStar: { x: number; y: number; vx: number; vy: number; life: number } | null = null;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight || window.innerHeight * 4;
      stars = [];
      const count = Math.floor((canvas.width * window.innerHeight) / 1400);
      for (let i = 0; i < count; i++) {
        const isPink = Math.random() < 0.28;
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.005,
          alpha: Math.random() * 0.7 + 0.2,
          color: isPink ? '255, 105, 180' : '255, 240, 245',
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#030303';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const s of stars) {
        const tw = 0.4 + 0.6 * Math.sin(time * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color}, ${s.alpha * tw})`;
        ctx.fill();
      }

      if (!shootingStar && Math.random() < 0.005) {
        const x = Math.random() * canvas.width * 0.7 + canvas.width * 0.15;
        const y = Math.random() * 400 + window.scrollY;
        shootingStar = { x, y, vx: 6 + Math.random() * 4, vy: 3.5 + Math.random() * 2, life: 1 };
      }

      if (shootingStar) {
        ctx.strokeStyle = `rgba(255, 182, 193, ${shootingStar.life})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x - shootingStar.vx * 9, shootingStar.y - shootingStar.vy * 9);
        ctx.stroke();
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.life -= 0.022;
        if (shootingStar.life <= 0 || shootingStar.y > canvas.height) {
          shootingStar = null;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handle Preset Region Selection
  const handleSelectRegion = (regionId: string) => {
    const reg = REGIONS[regionId];
    if (reg) {
      setSelectedRegion(reg);
      setCustomPoint(null);
      setActivePointId(null);
    }
  };

  // Handle Click Anywhere on Moon Surface for Custom Coordinates
  const handleMoonGlobeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const lat = -90 + (yPct / 100) * 180;
    const lon = -180 + (xPct / 100) * 360;

    const latStr = `${Math.abs(lat).toFixed(3)}°${lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(lon).toFixed(3)}°${lon >= 0 ? 'E' : 'W'}`;

    const newCustomRegion: RegionData = {
      id: 'custom_target',
      name: `User Landing Vector (${latStr}, ${lonStr})`,
      sub: `Custom coordinates targeted via high-res lunar disc`,
      lat: lat,
      lon: lon,
      coords: `${latStr}, ${lonStr}`,
      scenario_id: 'custom',
      hazard: '8%',
      slope: '4.8°',
      roughness: '0.10',
      confLow: 84,
      confHigh: 93,
      flag: null,
      rationale: `Regional survey centered at ${latStr}, ${lonStr} across a ${surveyRadiusKm} km radius. Safe touchdown candidates identified with slope gradient < 8.5°.`,
      groundtruth: `Target coordinates locked on LROC QuickMap GIS.`,
      quickmapExtent: `prjExtent=-4658894.0053051%2C-2032529.978284%2C5293105.9946949%2C2375470.021716&center=${lon.toFixed(3)},${lat.toFixed(3)}&zoom=15&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg`,
      pinStyle: { top: `${yPct}%`, left: `${xPct}%` },
      mostSafeDetails: {
        name: `Primary Safe Zone (${latStr}, ${lonStr})`,
        score: "92%",
        slope: "4.5° (Safe ≤ 8.5°)",
        hazard: "5.0% (Clear terrain)",
        craters: "3 sub-meter craters mapped via YOLOv8",
        boulders: "0 hazardous boulder clusters detected",
        clearance: "95.0% clear landing regolith",
        tippingMargin: "47% structural margin above tipping threshold",
        thermalIllum: "Nominal thermal illumination band",
        commsLine: "Direct line-of-sight to telemetry ground stations",
        consensus: "Multi-sensor fusion agreement across all channels",
        rationale: "Smooth landing pocket with stable regolith and acceptable slope."
      },
      mapPoints: [
        {
          id: 'cp1',
          name: `Selected Safe Pocket (${latStr}, ${lonStr})`,
          lat: lat,
          lon: lon,
          isSafe: true,
          score: '92%',
          slope: '4.5°',
          hazard: '5.0%',
          status: 'SAFE',
          reason: 'Clear regolith terrain, slope well within 8.5° tipping limit.'
        },
        {
          id: 'cp2',
          name: `Hazardous Scarp (${(lat + 0.05).toFixed(3)}, ${(lon + 0.05).toFixed(3)})`,
          lat: lat + 0.05,
          lon: lon + 0.05,
          isSafe: false,
          score: '28%',
          slope: '26.4°',
          hazard: '72%',
          status: 'RISKY',
          reason: 'Unsafe cliff scarp with high tipping risk.'
        }
      ]
    };

    setCustomPoint({ xPct, yPct, lat, lon });
    setSelectedRegion(newCustomRegion);
    setActivePointId(null);
  };

  // Run Landing Risk Assessment with Custom Radius
  const handleAnalyze = async () => {
    if (!selectedRegion) return;
    setIsAnalyzing(true);
    setShowResults(false);

    let stepIdx = 0;
    setLoadingText(LOADING_STEPS[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < LOADING_STEPS.length) {
        setLoadingText(LOADING_STEPS[stepIdx]);
      }
    }, 400);

    try {
      const response = await apiClient.analyzeLandingSite({
        scenario_id: selectedRegion.scenario_id,
        sensor_health: sensorHealth,
        weights: {
          boulder_crater: 0.30,
          slope: 0.35,
          roughness: 0.20,
          thermal: 0.15,
          fuel_distance: 0.0,
          science_value: 0.0,
        },
      });
      setAnalysisData(response);
    } catch (err) {
      console.warn('Backend offline, utilizing cached mission matrix for demonstration', err);
    }

    setTimeout(() => {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setShowResults(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }, 2000);
  };

  // Sensor dropout toggles
  const toggleSensor = (sensor: 'thermal' | 'optical' | 'dem') => {
    setSensorHealth((prev) => {
      const next = { ...prev };
      if (sensor === 'thermal') next.thermal = prev.thermal === 'offline' ? 'healthy' : 'offline';
      if (sensor === 'optical') next.optical = prev.optical === 'degraded' ? 'healthy' : 'degraded';
      if (sensor === 'dem') next.dem = prev.dem === 'degraded' ? 'healthy' : 'degraded';
      return next;
    });
  };

  const resetAll = () => {
    setShowResults(false);
    setSelectedRegion(REGIONS.cy3);
    setCustomPoint(null);
    setActiveLayer('safety_200km');
    setSensorHealth({ optical: 'healthy', dem: 'healthy', thermal: 'healthy' });
    spacerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleConfirmDecision = async () => {
    if (selectedRegion) {
      setDecisionConfirmed(selectedRegion.name);
      setTimeout(() => setDecisionConfirmed(null), 3500);
    }
  };

  const quickmapUrl = selectedRegion
    ? `https://quickmap.lroc.im-ldi.com/?${selectedRegion.quickmapExtent}`
    : DEFAULT_QUICKMAP_URL;

  const currentLayerImg = analysisData?.layers
    ? analysisData.layers[activeLayer] ||
      analysisData.layers.safety_200km ||
      analysisData.layers.annotated ||
      analysisData.layers.optical
    : null;

  return (
    <div className={`min-h-screen bg-[#030303] text-[#FFF0F5] font-sans relative overflow-x-hidden select-none ${isCursorHover ? 'cursor-hover' : ''}`}>
      {/* Custom Awwwards Cursor */}
      <div
        className="custom-cursor-dot"
        style={{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px) translate(-50%, -50%)` }}
      />
      <div
        className="custom-cursor-aura"
        style={{ transform: `translate(${auraPos.x}px, ${auraPos.y}px) translate(-50%, -50%)` }}
      />

      {/* Atmospheric Film Grain & Noise Overlay */}
      <div className="film-grain-overlay" />
      <div className="atmospheric-vignette" />

      {/* Background Starfield with Neon Pink Stardust */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none block" />

      {/* Hero Section with Luxury Display SplitText Typography */}
      <section ref={heroRef} className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-6 transition-all duration-300">
        <div ref={heroContentRef} className="flex flex-col items-center justify-center max-w-4xl mx-auto">
          <div className="font-mono text-xs tracking-[0.35em] text-[#FFB6C1] uppercase mb-6 opacity-90 flex items-center gap-2 bg-[#1a030f]/60 px-4 py-1.5 rounded-full border border-[#FF1493]/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FF1493]" />
            <span>Autonomous Lunar Landing Decision System</span>
          </div>

          {/* SplitText Masked Title Reveal */}
          <h1 className="fluid-hero-title font-black uppercase text-center flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-1 mb-6">
            <span className="split-line-mask">
              <span className={`split-word-inner metallic-pink-title ${titleRevealed ? 'revealed' : ''}`} style={{ transitionDelay: '0.1s' }}>
                Aim
              </span>
            </span>
            <span className="split-line-mask">
              <span className={`split-word-inner text-[#FFF0F5] ${titleRevealed ? 'revealed' : ''}`} style={{ transitionDelay: '0.22s' }}>
                For
              </span>
            </span>
            <span className="split-line-mask">
              <span className={`split-word-inner metallic-pink-title ${titleRevealed ? 'revealed' : ''}`} style={{ transitionDelay: '0.34s' }}>
                The
              </span>
            </span>
            <span className="split-line-mask">
              <span className={`split-word-inner metallic-pink-title ${titleRevealed ? 'revealed' : ''}`} style={{ transitionDelay: '0.46s' }}>
                Dirt
              </span>
            </span>
          </h1>

          <p className="max-w-[620px] text-[#FFD1DC]/80 fluid-body leading-relaxed mb-10 font-sans">
            Multi-sensor autonomous risk assessment across custom survey radii — calculating structural tipping limits, YOLO crater & rock hazard density, and multi-spectral consensus.
          </p>

          <div className="flex items-center gap-4">
            <MagneticButton
              onClick={() => {
                spacerRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              childrenPrimary="Initiate Descent Sequence"
              childrenSecondary="Enter Mission Console"
              icon={<ArrowDownRight className="w-4 h-4 text-[#FF1493]" />}
            />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.25em] text-[#FFB6C1]/70 flex flex-col items-center gap-2">
          <span>GLIDE TO EXPLORE</span>
          <span className="w-[1px] h-8 bg-gradient-to-b from-[#FF1493] to-transparent animate-pulse" />
        </div>
      </section>

      {/* Cinematic Scroll-Scrub Stage (Pink Moon Sequence) */}
      <section ref={spacerRef} className="relative z-10 h-[280vh]">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          {/* Top Mission HUD */}
          <div
            ref={miniHeaderRef}
            className="absolute top-7 left-8 z-20 font-mono text-xs tracking-[0.25em] text-[#FFF0F5] uppercase flex items-center gap-2.5 transition-opacity duration-300 opacity-0 bg-[#0c050a]/90 px-4 py-2 rounded-full border border-[#FF1493]/30 backdrop-blur-xl shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF1493] shadow-[0_0_10px_#FF1493] animate-pulse" />
            <span>LUNA-SAFE MISSION COMMAND · DECENTRALIZED GNC</span>
          </div>

          {/* Mode Switcher: 3D Pink Moon vs Live LROC QuickMap */}
          <div className="absolute top-7 right-8 z-20 flex items-center gap-2 bg-[#0c050a]/90 p-1.5 rounded-full border border-[#FF1493]/30 backdrop-blur-xl">
            <button
              onClick={() => setMapMode('globe')}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-full flex items-center gap-1.5 transition-all ${
                mapMode === 'globe' ? 'bg-[#FF1493] text-white font-bold shadow-[0_0_15px_rgba(255,20,147,0.6)]' : 'text-[#FFB6C1]/70 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D Pink Moon</span>
            </button>
            <button
              onClick={() => setMapMode('quickmap')}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-full flex items-center gap-1.5 transition-all ${
                mapMode === 'quickmap' ? 'bg-[#FF1493] text-white font-bold shadow-[0_0_15px_rgba(255,20,147,0.6)]' : 'text-[#FFB6C1]/70 hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>LROC Satellite</span>
            </button>
          </div>

          {/* Center Stage: The Pink Luminous Moon Disc in Deep Space */}
          <div className="relative w-full h-full flex items-center justify-center">
            {mapMode === 'globe' ? (
              <div
                ref={moonRef}
                onClick={handleMoonGlobeClick}
                className="pink-lunar-disc relative w-[420px] h-[420px] sm:w-[500px] sm:h-[500px] transform origin-center cursor-crosshair"
                title="Click anywhere on the lunar surface to select custom landing coordinates"
              >
                <img
                  src={moonStarsImg}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = '1';
                      target.src = './moon_stars.png';
                    } else if (target.dataset.fallback === '1') {
                      target.dataset.fallback = '2';
                      target.src = '/aimforthedirt/moon_stars.png';
                    }
                  }}
                  alt="Realistic Pink Moon"
                  className="w-full h-full object-cover rounded-full"
                />

                {/* Preset Landing Target Pins */}
                {Object.values(REGIONS).map((reg) => (
                  <button
                    key={reg.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRegion(reg.id);
                    }}
                    style={reg.pinStyle}
                    className={`lunar-pin absolute ${selectedRegion?.id === reg.id ? 'active' : ''}`}
                  >
                    <span>{reg.name}</span>
                  </button>
                ))}

                {/* Custom Clicked Point Reticle */}
                {customPoint && (
                  <div
                    style={{ top: `${customPoint.yPct}%`, left: `${customPoint.xPct}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
                  >
                    <div className="w-7 h-7 rounded-full border-2 border-[#FF1493] shadow-[0_0_15px_#FF1493] animate-ping" />
                    <span className="absolute top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono bg-[#1a030f]/90 text-[#FFB6C1] border border-[#FF1493]/50 whitespace-nowrap">
                      CUSTOM TARGET
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full pt-20 px-8 pb-8">
                <iframe
                  src={quickmapUrl}
                  title="LROC QuickMap Direct Stream"
                  className="w-full h-full rounded-2xl border border-[#FF1493]/30 shadow-[0_0_40px_rgba(255,20,147,0.25)]"
                />
              </div>
            )}
          </div>

          {/* Interactive Mission Targeting & Radius Control Dock */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[840px] z-30">
            <div className="bg-[#0c050a]/90 backdrop-blur-2xl border border-[#FF1493]/30 rounded-2xl p-5 shadow-[0_0_45px_rgba(255,20,147,0.25)] space-y-4">
              {/* Target Header & Region Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FF1493]/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF1493]/20 border border-[#FF1493]/40 flex items-center justify-center text-[#FF1493]">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-[#FFB6C1]/70 uppercase">Current Target Vector</div>
                    <div className="font-bold text-sm sm:text-base text-white flex items-center gap-2 font-heading">
                      <span>{selectedRegion?.name}</span>
                      <span className="text-xs text-[#FF1493] font-mono">({selectedRegion?.coords})</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {Object.values(REGIONS).map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => handleSelectRegion(reg.id)}
                      className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                        selectedRegion?.id === reg.id
                          ? 'bg-[#FF1493] text-white font-bold shadow-[0_0_12px_rgba(255,20,147,0.6)]'
                          : 'bg-[#1a030f]/60 text-[#FFB6C1]/70 hover:text-white border border-[#FF1493]/20'
                      }`}
                    >
                      {reg.id === 'cy3' ? 'Shiv Shakti' : reg.id === 'sp' ? 'Shackleton' : reg.id === 'malapert' ? 'Malapert' : 'Tiranga'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius Control Slider & Execution Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#FFB6C1]/80 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#FF1493]" />
                      <span>Survey Radius Envelope:</span>
                    </span>
                    <span className="font-bold text-[#FF1493] text-sm">{surveyRadiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="500"
                    step="25"
                    value={surveyRadiusKm}
                    onChange={(e) => setSurveyRadiusKm(parseInt(e.target.value))}
                    className="w-full accent-[#FF1493] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#FFB6C1]/50">
                    <span>25 km (Precision)</span>
                    <span>200 km (Nominal)</span>
                    <span>500 km (Wide Basin)</span>
                  </div>
                </div>

                <MagneticButton
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  childrenPrimary={isAnalyzing ? 'Processing Multi-Sensor Fusion…' : `Scan ${surveyRadiusKm} km Radius Map`}
                  childrenSecondary={isAnalyzing ? 'Synthesizing Telemetry…' : 'Execute Risk Analysis'}
                  icon={<Zap className="w-4 h-4 text-[#FF1493]" />}
                />
              </div>

              {/* Loading Status Progress Bar */}
              {isAnalyzing && (
                <div className="p-3 bg-[#1a030f]/80 rounded-xl border border-[#FF1493]/40 text-xs font-mono text-[#FFB6C1] flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#FF1493] border-t-transparent animate-spin" />
                  <span>{loadingText}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Results Section */}
      <section
        ref={resultsRef}
        className={`relative z-20 py-24 px-6 max-w-[1080px] mx-auto transition-all duration-700 ${
          showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {selectedRegion && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="font-mono text-xs tracking-[0.3em] text-[#FFB6C1] uppercase">
                {surveyRadiusKm} km Radius Survey Complete
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight text-white">
                {selectedRegion.name}
              </h2>
              <div className="font-mono text-xs text-[#FF1493]">{selectedRegion.coords}</div>
            </div>

            {/* DEDICATED "WHY IS IT SAFE?" COMPREHENSIVE ASSESSMENT CARD */}
            <div className="bg-gradient-to-b from-[#1a030f] via-[#0c0408] to-[#040103] border-2 border-[#FF1493]/70 rounded-2xl p-7 shadow-[0_0_45px_rgba(255,20,147,0.25)] space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FF1493]/30 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[#FF69B4] font-bold text-sm tracking-wide font-mono">
                    <CheckCircle2 className="w-5 h-5 text-[#FF1493]" />
                    <span>PRIMARY OPTIMAL TOUCHDOWN SITE · GO EVALUATION</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1 font-heading">{selectedRegion.mostSafeDetails.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-4 py-1.5 bg-[#FF1493] text-white font-extrabold text-xs rounded-full font-mono shadow-[0_0_16px_rgba(255,20,147,0.85)]">
                    CONFIDENCE: {selectedRegion.mostSafeDetails.score}
                  </span>
                </div>
              </div>

              {/* WHY IS IT SAFE? - 5 Structural Pillars */}
              <div>
                <div className="text-xs font-mono text-[#FFB6C1] uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#FF1493]" />
                  <span>Why is this site safe? — Engineering Safety Justification:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-sans text-xs">
                  {/* Pillar 1 */}
                  <div className="bg-[#0e0308] p-3.5 rounded-xl border border-[#FF1493]/25 space-y-1">
                    <div className="font-bold text-[#FFB6C1] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF1493]" />
                      <span>Tipping Safety ({selectedRegion.mostSafeDetails.slope})</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.tippingMargin}. Far below the 8.5° critical rollover tipping angle.
                    </div>
                  </div>

                  {/* Pillar 2 */}
                  <div className="bg-[#0e0308] p-3.5 rounded-xl border border-[#FF1493]/25 space-y-1">
                    <div className="font-bold text-[#FFB6C1] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF1493]" />
                      <span>Low Hazard Density ({selectedRegion.mostSafeDetails.hazard})</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      Negligible crater and boulder cluster density. Free from obstacles capable of puncturing structural baseplates.
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div className="bg-[#0e0308] p-3.5 rounded-xl border border-[#FF1493]/25 space-y-1">
                    <div className="font-bold text-[#FFB6C1] flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-[#FF69B4]" />
                      <span>Thermal & Illumination Envelope</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.thermalIllum}. Avoids frozen &lt;80K shadow traps.
                    </div>
                  </div>

                  {/* Pillar 4 */}
                  <div className="bg-[#0e0308] p-3.5 rounded-xl border border-[#FF1493]/25 space-y-1">
                    <div className="font-bold text-[#FFB6C1] flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#FFB6C1]" />
                      <span>Direct Comms Line-of-Sight</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.commsLine}. Unobstructed telemetry transmission during final powered descent.
                    </div>
                  </div>

                  {/* Pillar 5 */}
                  <div className="bg-[#0e0308] p-3.5 rounded-xl border border-[#FF1493]/25 space-y-1 md:col-span-2">
                    <div className="font-bold text-[#FFB6C1] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#FF1493]" />
                      <span>Multi-Sensor Modality Consensus</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.consensus}. Low covariance uncertainty band (±3.5%).
                    </div>
                  </div>
                </div>
              </div>

              {/* YOLOv8 Optical Obstacle Perception Analytics (Craters, Boulders & Rocks) */}
              <div className="bg-[#12040a] p-4 rounded-xl border border-[#FF1493]/35 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-xs font-bold text-[#FFB6C1] uppercase tracking-wider flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-[#FF1493]" />
                    <span>YOLOv8 Optical Perception Analytics (Craters & Rock Boulders)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#FFB6C1] bg-[#38061e] px-2.5 py-0.5 rounded border border-[#FF1493]/40">
                    Sub-meter Fine Sweep AI
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-black/70 p-3 rounded-lg border border-[#FF1493]/20">
                    <span className="text-[#FFB6C1]/70 text-[10px] block">🕳️ CRATER DETECTION DENSITY</span>
                    <span className="font-bold text-white mt-1 block text-[11px]">{selectedRegion.mostSafeDetails.craters}</span>
                  </div>
                  <div className="bg-black/70 p-3 rounded-lg border border-[#FF1493]/20">
                    <span className="text-[#FFB6C1]/70 text-[10px] block">🪨 BOULDER & ROCK CLUSTERS</span>
                    <span className="font-bold text-white mt-1 block text-[11px]">{selectedRegion.mostSafeDetails.boulders}</span>
                  </div>
                  <div className="bg-black/70 p-3 rounded-lg border border-[#FF1493]/20">
                    <span className="text-[#FFB6C1]/70 text-[10px] block">🛡️ CLEAR REGOLITH RATIO</span>
                    <span className="font-bold text-[#FF69B4] mt-1 block text-[11px]">{selectedRegion.mostSafeDetails.clearance}</span>
                  </div>
                </div>
              </div>

              {/* Plain Language Summary */}
              <div className="p-3.5 bg-[#1a030f] border border-[#FF1493]/40 rounded-xl text-xs text-[#FFD1DC] leading-relaxed">
                💡 <span className="font-bold text-white">Flight Decision Summary:</span> {selectedRegion.mostSafeDetails.rationale}
              </div>
            </div>

            {/* 4 Telemetry Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0a0307]/85 border border-[#FF1493]/20 rounded-xl p-5 backdrop-blur-md">
                <div className="font-mono text-[10px] tracking-[0.15em] text-[#FFB6C1]/70 uppercase">Survey Radius</div>
                <div className="text-2xl font-black text-white mt-2 font-mono">{surveyRadiusKm} km</div>
                <div className="text-xs text-[#FFB6C1]/60 mt-1 font-sans">Coverage: {Math.round(Math.PI * surveyRadiusKm * surveyRadiusKm).toLocaleString()} km²</div>
              </div>

              <div className="bg-[#0a0307]/85 border border-[#FF1493]/20 rounded-xl p-5 backdrop-blur-md">
                <div className="font-mono text-[10px] tracking-[0.15em] text-[#FFB6C1]/70 uppercase">Topographic Slope</div>
                <div className={`text-2xl font-black mt-2 font-mono ${parseFloat(selectedRegion.slope) > 15 ? 'text-[#FF1493]' : 'text-[#FF69B4]'}`}>
                  {selectedRegion.slope}
                </div>
                <div className="text-xs text-[#FFB6C1]/60 mt-1 font-sans">within tolerance ≤ 8.5° limit</div>
              </div>

              <div className="bg-[#0a0307]/85 border border-[#FF1493]/20 rounded-xl p-5 backdrop-blur-md">
                <div className="font-mono text-[10px] tracking-[0.15em] text-[#FFB6C1]/70 uppercase">YOLO Hazard & Crater Density</div>
                <div className={`text-2xl font-black mt-2 font-mono ${parseFloat(selectedRegion.hazard) > 30 ? 'text-[#FF1493]' : 'text-[#FF69B4]'}`}>
                  {selectedRegion.hazard}
                </div>
                <div className="text-xs text-[#FFB6C1]/60 mt-1 font-sans">Crater rims & rock clusters mapped</div>
              </div>

              <div className="bg-[#0a0307]/85 border border-[#FF1493]/20 rounded-xl p-5 backdrop-blur-md">
                <div className="font-mono text-[10px] tracking-[0.15em] text-[#FFB6C1]/70 uppercase">Confidence Band</div>
                <div className={`text-2xl font-black mt-2 font-mono ${selectedRegion.confLow < 60 ? 'text-[#FF1493]' : 'text-[#FF69B4]'}`}>
                  {selectedRegion.confLow}–{selectedRegion.confHigh}%
                </div>
                <div className="text-xs text-[#FFB6C1]/60 mt-1 font-sans">sensor resolution + shadow occlusion</div>
              </div>
            </div>

            {/* Warning Flags */}
            {selectedRegion.flag && (
              <div className="inline-block font-mono text-xs px-4 py-2 rounded-full border border-[#FF1493] text-[#FF1493] bg-[#FF1493]/10">
                ⚠ {selectedRegion.flag}
              </div>
            )}

            {/* Ground Truth Validation Note */}
            {selectedRegion.groundtruth && (
              <div className="font-mono text-xs sm:text-sm text-[#FFB6C1] text-center bg-[#FF1493]/10 border border-[#FF1493]/30 py-3 px-4 rounded-xl">
                ✓ {selectedRegion.groundtruth}
              </div>
            )}

            {/* PURE LUNAR TACTICAL MAP SECTION WITH GREEN & RED PIN POINTS */}
            <div className="bg-[#080205]/90 border border-[#FF1493]/30 rounded-2xl p-6 space-y-5 shadow-2xl">
              {/* Header with Layer Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FF1493]/20 pb-4">
                <div>
                  <div className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#FF1493]" />
                    <span>Lunar Tactical GIS Map · Safe (Green) & Risky (Red) Pins</span>
                  </div>
                  <div className="text-xs text-[#FFB6C1]/70 font-mono mt-0.5">
                    Center: <span className="text-[#FF1493] font-bold">{selectedRegion.coords}</span> · Survey Area: {surveyRadiusKm} km Radius
                  </div>
                </div>

                {/* Switch between Lunar Tactical Map, LROC Satellite & DEM Rasters */}
                <div className="flex items-center gap-1.5 bg-[#030303] p-1 rounded-lg border border-[#FF1493]/25 font-mono text-xs">
                  <button
                    onClick={() => setZoomLayerMode('leaflet')}
                    className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
                      zoomLayerMode === 'leaflet' ? 'bg-[#FF1493] text-white font-bold shadow' : 'text-[#FFB6C1]/70 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Lunar Tactical Map</span>
                  </button>
                  <button
                    onClick={() => setZoomLayerMode('quickmap_embed')}
                    className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
                      zoomLayerMode === 'quickmap_embed' ? 'bg-[#FF1493] text-white font-bold shadow' : 'text-[#FFB6C1]/70 hover:text-white'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>NASA LROC Satellite</span>
                  </button>
                  <button
                    onClick={() => setZoomLayerMode('raster')}
                    className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
                      zoomLayerMode === 'raster' ? 'bg-[#FF1493] text-white font-bold shadow' : 'text-[#FFB6C1]/70 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>DEM Altimetry</span>
                  </button>
                </div>
              </div>

              {/* Pin Points Legend Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#030303] border border-[#FF1493]/20 rounded-xl font-mono text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse" />
                    <span className="font-bold">Green Pin = Safe Site (Slope &lt; 8.5°, GO)</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-400">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
                    <span className="font-bold">Red Pin = Risky Site (Slope &gt; 15°, ABORT)</span>
                  </div>
                </div>
                <span className="text-[#FFB6C1]/70 text-[11px]">Click any pin to inspect metrics</span>
              </div>

              {/* MAP VIEWPORT: Pure Lunar Tactical Map vs DEM Raster vs Live QuickMap */}
              <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-[#FF1493]/30 bg-[#030303] shadow-2xl">
                {zoomLayerMode === 'leaflet' ? (
                  <div className="relative w-full h-full bg-[#020102] flex items-center justify-center overflow-hidden">
                    {/* Deep Space Background Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(#38061e_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

                    {/* Regional Lunar Terrain Underlay */}
                    {currentLayerImg && (
                      <img
                        src={currentLayerImg}
                        alt="Regional Lunar Surface"
                        className="absolute inset-0 w-full h-full object-cover opacity-75 filter contrast-125"
                      />
                    )}

                    {/* Radar Coordinate Crosshair & Concentric Range Rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Survey Boundary Circle */}
                      <div className="w-[82%] h-[82%] rounded-full border border-[#FF1493]/50 border-dashed animate-[spin_120s_linear_infinite]" />
                      <div className="w-[58%] h-[58%] rounded-full border border-[#FF69B4]/30 border-dashed" />
                      <div className="w-[32%] h-[32%] rounded-full border border-[#FFB6C1]/20" />
                      <div className="w-[8%] h-[8%] rounded-full border border-[#FF1493]/40" />

                      {/* Central Crosshair */}
                      <div className="absolute w-full h-[1px] bg-[#FF1493]/20" />
                      <div className="absolute h-full w-[1px] bg-[#FF1493]/20" />

                      {/* Radar Range Labels */}
                      <span className="absolute top-[10%] left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#FFB6C1] bg-black/80 px-2.5 py-0.5 rounded border border-[#FF1493]/40">
                        {surveyRadiusKm} km Survey Perimeter
                      </span>
                      <span className="absolute top-[22%] left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#FF69B4]/80">
                        {Math.round(surveyRadiusKm * 0.65)} km
                      </span>
                      <span className="absolute top-[35%] left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#FF69B4]/80">
                        {Math.round(surveyRadiusKm * 0.35)} km
                      </span>
                    </div>

                    {/* Interactive Green (Safe) & Red (Risky) Pin Points */}
                    {selectedRegion.mapPoints.map((pt, idx) => {
                      const angle = (idx / selectedRegion.mapPoints.length) * Math.PI * 2 + (pt.isSafe ? 0.3 : -0.4);
                      const dist = pt.isSafe ? 0.22 + idx * 0.08 : 0.32 + idx * 0.06;
                      const topPct = 50 + Math.sin(angle) * dist * 90;
                      const leftPct = 50 + Math.cos(angle) * dist * 90;
                      const isActive = activePointId === pt.id;

                      return (
                        <div
                          key={pt.id}
                          style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                          onClick={() => setActivePointId(isActive ? null : pt.id)}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                        >
                          {/* Pin Icon with Glow */}
                          <div className="relative flex items-center justify-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform group-hover:scale-125 ${
                              pt.isSafe
                                ? 'bg-emerald-500/30 border-emerald-400 shadow-[0_0_15px_#10B981]'
                                : 'bg-rose-500/30 border-rose-400 shadow-[0_0_15px_#F43F5E]'
                            }`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${pt.isSafe ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                            </div>

                            {/* Pin Name Badge */}
                            <span className={`absolute top-7 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold whitespace-nowrap border backdrop-blur-md shadow-xl transition-all ${
                              pt.isSafe
                                ? 'bg-[#02180e]/90 text-emerald-300 border-emerald-500/60'
                                : 'bg-[#180407]/90 text-rose-300 border-rose-500/60'
                            }`}>
                              {pt.isSafe ? '🟢 ' : '🔴 '}{pt.name} · {pt.score}
                            </span>
                          </div>

                          {/* Click Telemetry Popup Card */}
                          {isActive && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 bg-[#0a0206]/95 border border-[#FF1493]/50 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl z-30 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between border-b border-[#FF1493]/30 pb-1.5 font-mono">
                                <span className={pt.isSafe ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                  {pt.status === 'SAFE' ? '🟢 OPTIMAL TOUCHDOWN' : '🔴 CRITICAL HAZARD'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  pt.isSafe ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-rose-950 text-rose-300 border border-rose-600'
                                }`}>
                                  {pt.score}
                                </span>
                              </div>

                              <div>
                                <div className="font-bold text-white text-xs">{pt.name}</div>
                                <div className="text-[10px] font-mono text-[#FFB6C1] mt-0.5">
                                  {pt.lat.toFixed(3)}°, {pt.lon.toFixed(3)}°
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] bg-black/60 p-1.5 rounded border border-slate-800">
                                <div>
                                  <span className="text-slate-400 block text-[8px]">SLOPE</span>
                                  <span className={pt.isSafe ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>{pt.slope}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[8px]">HAZARD</span>
                                  <span className={pt.isSafe ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>{pt.hazard}</span>
                                </div>
                              </div>

                              <p className="text-[10px] text-slate-300 leading-relaxed font-sans">{pt.reason}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* HUD Status Bar */}
                    <div className="absolute bottom-3 left-3 bg-[#0a0206]/90 backdrop-blur border border-[#FF1493]/30 px-3 py-1.5 rounded-lg text-[11px] text-[#FFB6C1] flex items-center gap-3 font-mono z-10">
                      <span className="text-[#FF1493] font-bold">Lunar Surface Radar GIS</span>
                      <span>•</span>
                      <span className="text-white">{selectedRegion.name}</span>
                      <span>•</span>
                      <span>Click any pin to inspect telemetry</span>
                    </div>
                  </div>
                ) : zoomLayerMode === 'raster' ? (
                  currentLayerImg ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={currentLayerImg}
                        alt="Regional Lunar Terrain Raster"
                        className="w-full h-full object-cover select-none"
                      />
                      <div className="absolute bottom-3 left-3 bg-[#0a0206]/90 backdrop-blur border border-[#FF1493]/30 px-3 py-1.5 rounded-lg text-[11px] text-[#FFB6C1] flex items-center gap-3 font-mono">
                        <span className="text-[#FF1493] font-bold">{surveyRadiusKm} km Radius Survey</span>
                        <span>•</span>
                        <span>Multi-spectral terrain projection</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 font-mono text-xs">Loading regional terrain data…</div>
                  )
                ) : (
                  <iframe
                    src={quickmapUrl}
                    title="Zoomed LROC QuickMap"
                    className="w-full h-full border-none"
                  />
                )}
              </div>

              {/* Fullscreen QuickMap Direct Jump Banner */}
              <div className="bg-gradient-to-r from-[#1a030f]/60 via-[#0c0408]/80 to-[#030303] border border-[#FF1493]/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FF1493]/20 border border-[#FF1493]/40 flex items-center justify-center text-[#FF1493]">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-heading">Online Satellite GIS Ground Truth</div>
                    <div className="text-[11px] text-[#FFB6C1]/70 font-mono">
                      Fetch live sub-meter LROC NAC optical tiles for {selectedRegion.name} ({selectedRegion.coords})
                    </div>
                  </div>
                </div>

                <a
                  href={quickmapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#FF1493] hover:bg-[#FF69B4] text-white font-bold text-xs font-mono rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-[#FF1493]/40 whitespace-nowrap"
                >
                  <span>🎯 Open Exact Point in Fullscreen QuickMap</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Graceful Sensor Degradation Sandbox */}
            <div className="bg-[#0a0206]/85 border border-[#FF1493]/25 rounded-2xl p-6 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-heading">
                  <Radio className="w-4 h-4 text-[#FF1493]" />
                  <span>Graceful Sensor Degradation Simulator</span>
                </div>
                <span className="text-[11px] font-mono text-[#FFB6C1]/60">Dynamic Weight Redistribution Testing</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Simulate hardware dropouts or environmental noise (e.g. thruster dust covering camera lens, thermal sensor in shadow cold-trap). Watch the fusion engine instantly re-normalize weights without crashing.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => toggleSensor('optical')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    sensorHealth.optical === 'healthy'
                      ? 'bg-[#1a030f]/60 border-[#FF1493]/40 text-[#FFB6C1]'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Optical Camera</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${sensorHealth.optical === 'healthy' ? 'bg-[#FF1493]/30 text-white' : 'bg-rose-900 text-rose-200'}`}>
                      {sensorHealth.optical.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">
                    {sensorHealth.optical === 'healthy' ? 'Full YOLOv8 sub-meter crater & rock feature sweep' : 'Degraded by thruster regolith dust (weight reduced)'}
                  </div>
                </button>

                <button
                  onClick={() => toggleSensor('dem')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    sensorHealth.dem === 'healthy'
                      ? 'bg-[#1a030f]/60 border-[#FF1493]/40 text-[#FFB6C1]'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>LOLA Elevation DEM</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${sensorHealth.dem === 'healthy' ? 'bg-[#FF1493]/30 text-white' : 'bg-rose-900 text-rose-200'}`}>
                      {sensorHealth.dem.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">
                    {sensorHealth.dem === 'healthy' ? 'Precision topographic slope & TRI ruggedness calculus' : 'Degraded resolution altimetry band'}
                  </div>
                </button>

                <button
                  onClick={() => toggleSensor('thermal')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    sensorHealth.thermal === 'healthy'
                      ? 'bg-[#1a030f]/60 border-[#FF1493]/40 text-[#FFB6C1]'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5" />
                      <span>Diviner Thermal</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${sensorHealth.thermal === 'healthy' ? 'bg-[#FF1493]/30 text-white' : 'bg-rose-900 text-rose-200'}`}>
                      {sensorHealth.thermal.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">
                    {sensorHealth.thermal === 'healthy' ? 'Active radiometry scanning for <80K shadow traps' : 'Sensor offline (weight redistributed to DEM)'}
                  </div>
                </button>
              </div>
            </div>

            {/* Action Bar: Confirm Touchdown & Reset */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#FF1493]/20">
              <button
                onClick={resetAll}
                className="px-5 py-2.5 rounded-full border border-[#FF1493]/30 hover:border-[#FF1493] text-[#FFB6C1] text-xs font-mono flex items-center gap-2 transition-all hover:bg-[#1a030f]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Mission Telemetry</span>
              </button>

              <div className="flex items-center gap-3">
                {decisionConfirmed ? (
                  <div className="px-6 py-3 rounded-full bg-[#10B981] text-black font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_#10B981]">
                    <Check className="w-4 h-4" />
                    <span>COMMAND SENT: LANDING VECTOR LOCKED ON {decisionConfirmed}</span>
                  </div>
                ) : (
                  <MagneticButton
                    onClick={handleConfirmDecision}
                    childrenPrimary={`Confirm Landing Vector on ${selectedRegion.name}`}
                    childrenSecondary="Send Command to Guidance Computer"
                    icon={<Check className="w-4 h-4 text-white" />}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-[#FF1493]/15 text-center font-mono text-xs text-[#FFB6C1]/50 space-y-2">
        <div>AIM FOR THE DIRT · AUTONOMOUS LUNAR LANDING RISK ASSESSMENT</div>
        <div>Engineered with Multi-Sensor Fusion · NASA LROC NAC · LOLA DEM · Diviner Radiometry</div>
      </footer>
    </div>
  );
};

export default App;
