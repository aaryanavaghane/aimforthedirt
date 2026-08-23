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
  ArrowDownRight,
  Volume2,
  VolumeX
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { AtmosWebGLScene } from './components/AtmosWebGLScene';
import { AtmosHUD } from './components/AtmosHUD';
import { MagneticButton } from './components/MagneticButton';
import { apiClient } from './services/api';
import { AnalysisResponse, SensorHealth } from './types/landing';

gsap.registerPlugin(ScrollTrigger);

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
    sub: 'Chandrayaan-3 Touchdown Plain',
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
    rationale: "Zone A selected — low boulder/crater density, slope well within 8.5° landing gear tipping limit, and minimal shadow occlusion. The scoring engine independently ranks this zone highest using multi-sensor fusion.",
    groundtruth: "Top-ranked zone falls 1.3 km from the real Shiv Shakti Point — independently recovered using multi-sensor fusion.",
    quickmapExtent: 'prjExtent=-4658894.0053051%2C-2032529.978284%2C5293105.9946949%2C2375470.021716&center=32.319,-69.373&zoom=15&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg',
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
    sub: 'Permanently Shadowed Volatiles Survey',
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
    sub: 'Artemis Peak of Eternal Light',
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
    sub: 'Chandrayaan-2 Impact Site (Reference Abort Case)',
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

const DEFAULT_QUICKMAP_URL = 'https://quickmap.lroc.im-ldi.com/?prjExtent=-4658894.0053051%2C-2032529.978284%2C5293105.9946949%2C2375470.021716&earthShadowEnabled=true&proj=10&stack=3314&defs=N4IgzGCMAsIFygPYAcCGBjAlgFwJ70gF9Cg';

export const App: React.FC = () => {
  // Master Scroll Progress State (0.0 to 1.0)
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [titleRevealed, setTitleRevealed] = useState<boolean>(false);

  // Selected Moon Target & Telemetry State
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(REGIONS.cy3);
  const [surveyRadiusKm, setSurveyRadiusKm] = useState<number>(200);
  const [zoomLayerMode, setZoomLayerMode] = useState<'leaflet' | 'quickmap_embed' | 'raster'>('leaflet');
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [decisionConfirmed, setDecisionConfirmed] = useState<string | null>(null);

  // Custom Awwwards Blended Cursor State
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [auraPos, setAuraPos] = useState({ x: -100, y: -100 });
  const [isCursorHover, setIsCursorHover] = useState(false);

  // Audio Ambience Synthesizer State
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sensor degradation state
  const [sensorHealth, setSensorHealth] = useState<SensorHealth>({
    optical: 'healthy',
    dem: 'healthy',
    thermal: 'healthy',
  });

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const resultsSectionRef = useRef<HTMLElement | null>(null);

  // SplitText Entrance Animation Trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setTitleRevealed(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Web Audio API Ambient Space Hum
  const toggleAudio = () => {
    if (isMuted) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setIsMuted(false);
      } catch (e) {
        console.warn('AudioContext not supported', e);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      setIsMuted(true);
    }
  };

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
          target.closest('.moon-option-card'))
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

  // Lenis Smooth Scroll & GSAP ScrollTrigger Master Timeline
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    if (scrollContainerRef.current) {
      ScrollTrigger.create({
        trigger: scrollContainerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          setScrollProgress(p);

          if (p < 0.22) setCurrentPhase(1);
          else if (p < 0.48) setCurrentPhase(2);
          else if (p < 0.72) setCurrentPhase(3);
          else if (p < 0.90) setCurrentPhase(4);
          else setCurrentPhase(5);
        },
      });
    }

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  const handleSelectRegion = (regionId: string) => {
    const reg = REGIONS[regionId];
    if (reg) {
      setSelectedRegion(reg);
      setActivePointId(null);
    }
  };

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
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }, 2000);
  };

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
    setSensorHealth({ optical: 'healthy', dem: 'healthy', thermal: 'healthy' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className={`min-h-screen bg-[#020408] text-[#F1F5F9] font-sans relative select-none ${isCursorHover ? 'cursor-hover' : ''}`}>
      {/* Custom Awwwards Blended Cursor */}
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

      {/* 3D WebGL Canvas Engine (Midnight Blue Sky & Starlight) */}
      <AtmosWebGLScene scrollProgress={scrollProgress} currentPhase={currentPhase} />

      {/* Telemetry Flight HUD Overlay */}
      <AtmosHUD scrollProgress={scrollProgress} currentPhase={currentPhase} />

      {/* Sound Toggle Button */}
      <button
        onClick={toggleAudio}
        className="fixed bottom-6 left-6 z-40 bg-[#050D24]/85 backdrop-blur-xl p-3 rounded-full border border-[#00F5FF]/30 text-[#38BDF8] hover:text-white transition-all hover:scale-110 shadow-[0_0_15px_rgba(0,245,255,0.3)]"
        title={isMuted ? 'Enable Ambient Space Hum' : 'Mute Audio'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00F5FF] animate-pulse" />}
      </button>

      {/* MASTER SCROLL SCRUBBING TRACK (500vh for Cinematic Pacing) */}
      <div ref={scrollContainerRef} className="relative z-10 h-[520vh]">
        {/* Sticky Viewport Stage */}
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden px-6">
          
          {/* PHASE 1 & 2: ATMOS HERO SCREEN (Matches uploaded screenshot perfectly) */}
          <div
            className="relative flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto transition-all duration-300 pointer-events-auto"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 3.2),
              transform: `scale(${Math.max(0.8, 1 - scrollProgress * 0.3)}) translateY(${-scrollProgress * 90}px)`,
              filter: `blur(${scrollProgress * 22}px)`,
              pointerEvents: scrollProgress > 0.25 ? 'none' : 'auto',
            }}
          >
            {/* Rotating Circular Badge "THE SURREALIST FLIGHT EXPERIMENT" */}
            <div className="absolute -top-12 sm:-top-8 right-4 sm:right-12 z-20 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-28 h-28 sm:w-36 sm:h-36 rotating-badge opacity-90">
                <path
                  id="badgePath"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text fill="#FFFFFF" fontSize="8.2" fontFamily="Space Grotesk" fontWeight="600" letterSpacing="2.2">
                  <textPath href="#badgePath">THE SURREALIST FLIGHT EXPERIMENT — </textPath>
                </text>
              </svg>
            </div>

            {/* Massive Pure Serif Title: ATMOS */}
            <h1 className="atmos-hero-title mb-8 select-none">
              ATMOS
            </h1>

            {/* Pill EXPLORE Button */}
            <div className="flex items-center justify-center">
              <MagneticButton
                onClick={() => window.scrollTo({ top: window.innerHeight * 4.2, behavior: 'smooth' })}
                childrenPrimary="EXPLORE"
                childrenSecondary="ASCEND"
                variant="pill"
              />
            </div>

            {/* Subtle Scroll Prompt */}
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.25em] text-[#38BDF8]/80 flex flex-col items-center gap-2">
              <span>SCROLL TO ASCEND</span>
              <span className="w-[1px] h-7 bg-gradient-to-b from-[#00F5FF] to-transparent animate-pulse" />
            </div>
          </div>

          {/* PHASE 3: DEEP SPACE TRANS-LUNAR NARRATIVE CARD (Visible at p: 0.40 -> 0.70) */}
          <div
            className="absolute max-w-xl text-center transition-all duration-300 pointer-events-none"
            style={{
              opacity: scrollProgress > 0.35 && scrollProgress < 0.72 
                ? Math.sin(((scrollProgress - 0.35) / 0.37) * Math.PI) 
                : 0,
              transform: `translateY(${Math.sin(scrollProgress * Math.PI) * 20}px)`,
            }}
          >
            <div className="bg-[#050D24]/90 backdrop-blur-2xl border border-[#00F5FF]/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,245,255,0.25)] space-y-4">
              <span className="px-3.5 py-1 rounded-full font-mono text-[10px] text-[#00F5FF] bg-[#081B4B] border border-[#00F5FF]/40 uppercase tracking-widest">
                Trans-Lunar Traversal · Velocity Mach 32.4
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Deep Midnight Void Traversal
              </h2>
              <p className="text-xs sm:text-sm text-[#E2E8F0]/80 leading-relaxed font-sans">
                Navigating the vacuum between Earth and Moon under shimmering silver starlight. Multi-spectral sensors calibration underway. Preparing deceleration burn for lunar orbit insertion.
              </p>
            </div>
          </div>

          {/* PHASE 4 & 5: MOON ARRIVAL & INTERACTIVE "MOON OPTIONS" REVEAL (Visible at p: 0.88 -> 1.0) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6 transition-all duration-700 pointer-events-auto"
            style={{
              opacity: scrollProgress > 0.85 ? Math.min(1, (scrollProgress - 0.85) / 0.12) : 0,
              transform: `translateY(${scrollProgress > 0.85 ? 0 : 40}px)`,
              pointerEvents: scrollProgress > 0.85 ? 'auto' : 'none',
            }}
          >
            <div className="w-full max-w-5xl bg-[#050D24]/95 backdrop-blur-2xl border border-[#00F5FF]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,245,255,0.35)] space-y-6">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#00F5FF]/20 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-bold">
                    <Sparkles className="w-4 h-4 text-[#00F5FF]" />
                    <span>Phase 5: Orbital Insertion Complete · Lunar Hover Lock</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-heading">
                    Select Target Lunar Landing Vector
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <MagneticButton
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    childrenPrimary={isAnalyzing ? 'Fusing Telemetry…' : `Scan ${surveyRadiusKm} km Area`}
                    childrenSecondary={isAnalyzing ? 'Processing AI Models…' : 'Execute Risk Analysis'}
                    icon={<Zap className="w-4 h-4 text-[#081B4B]" />}
                    variant="pill"
                  />
                </div>
              </div>

              {/* 4 Interactive Moon Option Cards with Magnetic Hover */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {Object.values(REGIONS).map((reg) => {
                  const isSelected = selectedRegion?.id === reg.id;
                  return (
                    <div
                      key={reg.id}
                      onClick={() => handleSelectRegion(reg.id)}
                      className={`moon-option-card p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left space-y-2.5 relative group ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#081B4B] to-[#030A1D] border-[#00F5FF] shadow-[0_0_25px_rgba(0,245,255,0.45)] scale-[1.02]'
                          : 'bg-[#060E22]/80 border-[#00F5FF]/20 hover:border-[#00F5FF]/60 hover:bg-[#0B1D47]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className={isSelected ? 'text-[#00F5FF] font-bold' : 'text-[#94A3B8]'}>
                          {reg.id === 'cy3' ? 'TARGET A' : reg.id === 'sp' ? 'TARGET B' : reg.id === 'malapert' ? 'TARGET C' : 'TARGET D'}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          reg.id === 'tir' ? 'bg-rose-950 text-rose-300 border border-rose-600' : 'bg-[#00F5FF]/20 text-[#38BDF8] border border-[#00F5FF]/40'
                        }`}>
                          {reg.mostSafeDetails.score}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-white font-heading">{reg.name}</h4>
                        <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">{reg.coords}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-1 font-mono text-[9px] bg-black/60 p-2 rounded-lg border border-[#00F5FF]/15">
                        <div>
                          <span className="text-[#94A3B8] block">SLOPE</span>
                          <span className="text-white font-bold">{reg.slope}</span>
                        </div>
                        <div>
                          <span className="text-[#94A3B8] block">HAZARD</span>
                          <span className="text-white font-bold">{reg.hazard}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Survey Radius Slider */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/60 p-3.5 rounded-2xl border border-[#00F5FF]/20">
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 text-[#00F5FF]" />
                  <span className="text-xs font-mono text-[#E2E8F0]">Regional Survey Radius:</span>
                  <span className="text-sm font-bold font-mono text-[#00F5FF]">{surveyRadiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="500"
                  step="25"
                  value={surveyRadiusKm}
                  onChange={(e) => setSurveyRadiusKm(parseInt(e.target.value))}
                  className="w-full sm:w-64 accent-[#00F5FF] cursor-pointer"
                />
              </div>

              {/* Loading Status Progress Bar */}
              {isAnalyzing && (
                <div className="p-3 bg-[#081B4B]/90 rounded-xl border border-[#00F5FF]/50 text-xs font-mono text-[#38BDF8] flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-[#00F5FF] border-t-transparent animate-spin" />
                  <span>{loadingText}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* PHASE 5: COMPREHENSIVE TELEMETRY & TACTICAL GIS RADAR SECTION */}
      <section
        ref={resultsSectionRef}
        className={`relative z-20 py-24 px-6 max-w-[1080px] mx-auto transition-all duration-700 ${
          showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {selectedRegion && (
          <div className="space-y-8">
            {/* Results Title */}
            <div className="text-center space-y-2">
              <div className="font-mono text-xs tracking-[0.3em] text-[#38BDF8] uppercase">
                {surveyRadiusKm} km Radius Mission Analysis
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight text-white">
                {selectedRegion.name}
              </h2>
              <div className="font-mono text-xs text-[#00F5FF]">{selectedRegion.coords}</div>
            </div>

            {/* DEDICATED "WHY IS IT SAFE?" 5-PILLAR ASSESSMENT CARD */}
            <div className="bg-gradient-to-b from-[#081B4B] via-[#050D24] to-[#020614] border-2 border-[#00F5FF]/70 rounded-3xl p-7 sm:p-8 shadow-[0_0_45px_rgba(0,245,255,0.25)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#00F5FF]/30 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-sm tracking-wide font-mono">
                    <CheckCircle2 className="w-5 h-5 text-[#00F5FF]" />
                    <span>PRIMARY OPTIMAL TOUCHDOWN SITE · GO EVALUATION</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1 font-heading">{selectedRegion.mostSafeDetails.name}</h3>
                </div>
                <div>
                  <span className="px-4 py-1.5 bg-[#00F5FF] text-black font-extrabold text-xs rounded-full font-mono shadow-[0_0_16px_rgba(0,245,255,0.85)]">
                    CONFIDENCE: {selectedRegion.mostSafeDetails.score}
                  </span>
                </div>
              </div>

              {/* 5 Structural Pillars */}
              <div>
                <div className="text-xs font-mono text-[#E2E8F0] uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00F5FF]" />
                  <span>Why is this site safe? — Engineering Safety Justification:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-sans text-xs">
                  <div className="bg-[#040A1A] p-3.5 rounded-xl border border-[#00F5FF]/25 space-y-1">
                    <div className="font-bold text-[#38BDF8] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00F5FF]" />
                      <span>Tipping Safety ({selectedRegion.mostSafeDetails.slope})</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.tippingMargin}. Far below the 8.5° critical rollover tipping angle.
                    </div>
                  </div>

                  <div className="bg-[#040A1A] p-3.5 rounded-xl border border-[#00F5FF]/25 space-y-1">
                    <div className="font-bold text-[#38BDF8] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00F5FF]" />
                      <span>Low Hazard Density ({selectedRegion.mostSafeDetails.hazard})</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      Negligible crater and boulder cluster density. Free from obstacles capable of puncturing structural baseplates.
                    </div>
                  </div>

                  <div className="bg-[#040A1A] p-3.5 rounded-xl border border-[#00F5FF]/25 space-y-1">
                    <div className="font-bold text-[#38BDF8] flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Thermal & Illumination Envelope</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.thermalIllum}. Avoids frozen &lt;80K shadow traps.
                    </div>
                  </div>

                  <div className="bg-[#040A1A] p-3.5 rounded-xl border border-[#00F5FF]/25 space-y-1">
                    <div className="font-bold text-[#38BDF8] flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Direct Comms Line-of-Sight</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.commsLine}. Unobstructed telemetry transmission during final powered descent.
                    </div>
                  </div>

                  <div className="bg-[#040A1A] p-3.5 rounded-xl border border-[#00F5FF]/25 space-y-1 md:col-span-2">
                    <div className="font-bold text-[#38BDF8] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#00F5FF]" />
                      <span>Multi-Sensor Modality Consensus</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.consensus}. Low covariance uncertainty band (±3.5%).
                    </div>
                  </div>
                </div>
              </div>

              {/* YOLOv8 Optical Obstacle Analytics */}
              <div className="bg-[#040E24] p-4 rounded-xl border border-[#00F5FF]/35 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-[#00F5FF]" />
                    <span>YOLOv8 Optical Perception Analytics (Craters & Rock Boulders)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#00F5FF] bg-[#081B4B] px-2.5 py-0.5 rounded border border-[#00F5FF]/40">
                    Sub-meter Fine Sweep AI
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-black/70 p-3 rounded-lg border border-[#00F5FF]/20">
                    <span className="text-[#94A3B8] text-[10px] block">🕳️ CRATER DETECTION DENSITY</span>
                    <span className="font-bold text-white mt-1 block text-[11px]">{selectedRegion.mostSafeDetails.craters}</span>
                  </div>
                  <div className="bg-black/70 p-3 rounded-lg border border-[#00F5FF]/20">
                    <span className="text-[#94A3B8] text-[10px] block">🪨 BOULDER & ROCK CLUSTERS</span>
                    <span className="font-bold text-white mt-1 block text-[11px]">{selectedRegion.mostSafeDetails.boulders}</span>
                  </div>
                  <div className="bg-black/70 p-3 rounded-lg border border-[#00F5FF]/20">
                    <span className="text-[#94A3B8] text-[10px] block">🛡️ CLEAR REGOLITH RATIO</span>
                    <span className="font-bold text-[#00F5FF] mt-1 block text-[11px]">{selectedRegion.mostSafeDetails.clearance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PURE LUNAR TACTICAL GIS MAP WITH GREEN & RED PIN POINTS */}
            <div className="bg-[#050D24]/90 border border-[#00F5FF]/30 rounded-3xl p-6 space-y-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#00F5FF]/20 pb-4">
                <div>
                  <div className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#00F5FF]" />
                    <span>Lunar Tactical GIS Map · Safe (Green) & Risky (Red) Pins</span>
                  </div>
                  <div className="text-xs text-[#94A3B8] font-mono mt-0.5">
                    Center: <span className="text-[#00F5FF] font-bold">{selectedRegion.coords}</span> · Survey Area: {surveyRadiusKm} km Radius
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-[#020408] p-1 rounded-lg border border-[#00F5FF]/25 font-mono text-xs">
                  <button
                    onClick={() => setZoomLayerMode('leaflet')}
                    className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
                      zoomLayerMode === 'leaflet' ? 'bg-[#00F5FF] text-black font-bold shadow' : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Lunar Tactical Map</span>
                  </button>
                  <button
                    onClick={() => setZoomLayerMode('quickmap_embed')}
                    className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-all ${
                      zoomLayerMode === 'quickmap_embed' ? 'bg-[#00F5FF] text-black font-bold shadow' : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>NASA LROC Satellite</span>
                  </button>
                </div>
              </div>

              {/* Pin Points Map Viewport */}
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-[#00F5FF]/30 bg-[#020408] shadow-2xl">
                {zoomLayerMode === 'leaflet' ? (
                  <div className="relative w-full h-full bg-[#020408] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#081b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none" />

                    {/* Concentric Radar Range Rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[82%] h-[82%] rounded-full border border-[#00F5FF]/50 border-dashed animate-[spin_120s_linear_infinite]" />
                      <div className="w-[58%] h-[58%] rounded-full border border-[#38BDF8]/30 border-dashed" />
                      <div className="w-[32%] h-[32%] rounded-full border border-[#E2E8F0]/20" />
                      <div className="absolute w-full h-[1px] bg-[#00F5FF]/20" />
                      <div className="absolute h-full w-[1px] bg-[#00F5FF]/20" />
                    </div>

                    {/* Safe & Risky Pins */}
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
                          <div className="relative flex items-center justify-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform group-hover:scale-125 ${
                              pt.isSafe
                                ? 'bg-emerald-500/30 border-emerald-400 shadow-[0_0_15px_#10B981]'
                                : 'bg-rose-500/30 border-rose-400 shadow-[0_0_15px_#EF4444]'
                            }`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${pt.isSafe ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                            </div>

                            <span className={`absolute top-7 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold whitespace-nowrap border backdrop-blur-md shadow-xl transition-all ${
                              pt.isSafe
                                ? 'bg-[#02180e]/90 text-emerald-300 border-emerald-500/60'
                                : 'bg-[#180407]/90 text-rose-300 border-rose-500/60'
                            }`}>
                              {pt.isSafe ? '🟢 ' : '🔴 '}{pt.name} · {pt.score}
                            </span>
                          </div>

                          {isActive && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 bg-[#050D24]/95 border border-[#00F5FF]/50 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl z-30 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between border-b border-[#00F5FF]/30 pb-1.5 font-mono">
                                <span className={pt.isSafe ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                  {pt.status === 'SAFE' ? '🟢 OPTIMAL TOUCHDOWN' : '🔴 CRITICAL HAZARD'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  pt.isSafe ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-rose-950 text-rose-300 border border-rose-600'
                                }`}>
                                  {pt.score}
                                </span>
                              </div>
                              <div className="font-bold text-white text-xs">{pt.name}</div>
                              <p className="text-[10px] text-slate-300 leading-relaxed font-sans">{pt.reason}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <iframe
                    src={quickmapUrl}
                    title="NASA LROC Satellite"
                    className="w-full h-full border-none"
                  />
                )}
              </div>
            </div>

            {/* Action Bar: Confirm Touchdown Vector & Reset */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#00F5FF]/20">
              <button
                onClick={resetAll}
                className="px-6 py-3 rounded-full border border-[#00F5FF]/30 hover:border-[#00F5FF] text-[#38BDF8] text-xs font-mono flex items-center gap-2 transition-all hover:bg-[#050D24]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Atmospheric Ascent</span>
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
                    childrenPrimary={`Lock Touchdown Vector: ${selectedRegion.name}`}
                    childrenSecondary="Transmit Guidance Coordinates"
                    icon={<Check className="w-4 h-4 text-black" />}
                    variant="pill"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Atmospheric Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-[#00F5FF]/15 text-center font-mono text-xs text-[#94A3B8]/60 space-y-2">
        <div>ATMOS LUNAR MISSION COMMAND · SCROLL-DRIVEN TRANSLUNAR JOURNEY</div>
        <div>Engineered with Three.js WebGL · GSAP ScrollTrigger · Lenis Smooth Scroll · NASA Multi-Sensor Telemetry</div>
      </footer>
    </div>
  );
};

export default App;
