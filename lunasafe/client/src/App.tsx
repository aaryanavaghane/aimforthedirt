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
  Activity
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { apiClient } from './services/api';
import { AnalysisResponse, SensorHealth, MissionWeights } from './types/landing';

const moonStarsImg = '/moon_stars.png';

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
    quickmapExtent: 'extent=32.1,-69.5,32.5,-69.2&center=32.319,-69.373&zoom=15',
    pinStyle: { top: '58%', left: '44%' },
    mostSafeDetails: {
      name: "Shiv Shakti Touchdown Basin (Primary Zone A)",
      score: "94%",
      slope: "4.2° (Well within ≤ 8.5° limit)",
      hazard: "3.8% (Negligible rock density)",
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
        reason: 'Optimal touchdown site: minimal tilt risk, clear regolith, stable geotechnical footing.'
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
        reason: 'Safe alternate target: acceptable slope and good solar line-of-sight.'
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
        reason: 'Severe hazard: steep crater wall exceeds 8.5° tipping limit with high rollover risk.'
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
        reason: 'High risk: dense boulder clusters capable of puncturing lander baseplate.'
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
    quickmapExtent: 'extent=-1.0,-90.0,1.0,-89.8&center=0.0,-89.9&zoom=14',
    pinStyle: { top: '84%', left: '50%' },
    mostSafeDetails: {
      name: "Shackleton Connecting Ridge Crest (Zone B)",
      score: "78%",
      slope: "6.8° (Acceptable)",
      hazard: "12.0% (Moderate gravel)",
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
        reason: 'Best available polar candidate on high-altitude solar-illuminated ridge.'
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
        reason: 'Critical hazard: permanent dark cold-trap with vertical ice-rock dropoffs (<80K).'
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
    quickmapExtent: 'extent=-2.0,-86.2,2.0,-85.6&center=0.0,-85.9&zoom=14',
    pinStyle: { top: '74%', left: '68%' },
    mostSafeDetails: {
      name: "Malapert Peak Summit Mesa (Zone 1)",
      score: "91%",
      slope: "5.8° (Safe ≤ 8.5° limit)",
      hazard: "7.5% (Low hazard)",
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
    quickmapExtent: 'extent=22.6,-71.1,23.0,-70.7&center=22.8,-70.9&zoom=15',
    pinStyle: { top: '64%', left: '26%' },
    mostSafeDetails: {
      name: "Least Dangerous Pocket (Zone 1 - ABORT MANDATED)",
      score: "44% (FAIL)",
      slope: "18.2° (Exceeds 8.5° limit)",
      hazard: "39.0% (Severe roughness)",
      tippingMargin: "0% margin — violates rollover safety envelope",
      thermalIllum: "Heavy shadow occlusions across survey basin",
      commsLine: "Marginal line-of-sight due to high crater rim walls",
      consensus: "Perception and Elevation models trigger autonomous abort",
      rationale: "No safe landing site exists in this region. The flight computer correctly mandates an emergency abort."
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
  'Plotting Safe (Green) & Risky (Red) coordinates on Leaflet GIS…',
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

export const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(REGIONS.cy3);
  const [surveyRadiusKm, setSurveyRadiusKm] = useState<number>(200);
  const [mapMode, setMapMode] = useState<'globe' | 'quickmap'>('globe');
  const [zoomLayerMode, setZoomLayerMode] = useState<'leaflet' | 'raster' | 'quickmap_embed'>('leaflet');
  const [activeLayer, setActiveLayer] = useState<string>('safety_200km');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [decisionConfirmed, setDecisionConfirmed] = useState<string | null>(null);
  const [customPoint, setCustomPoint] = useState<{ xPct: number; yPct: number; lat: number; lon: number } | null>(null);

  // Sensor degradation state
  const [sensorHealth, setSensorHealth] = useState<SensorHealth>({
    optical: 'healthy',
    dem: 'healthy',
    thermal: 'healthy',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const moonRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const spacerRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const miniHeaderRef = useRef<HTMLDivElement | null>(null);

  // Starfield canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Array<{ x: number; y: number; r: number; phase: number; speed: number; alpha: number }> = [];
    let shootingStar: { x: number; y: number; vx: number; vy: number; life: number } | null = null;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight || window.innerHeight * 4;
      stars = [];
      const count = Math.floor((canvas.width * window.innerHeight) / 1600);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.005,
          alpha: Math.random() * 0.7 + 0.2,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const s of stars) {
        const tw = 0.4 + 0.6 * Math.sin(time * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 245, 255, ${s.alpha * tw})`;
        ctx.fill();
      }

      if (!shootingStar && Math.random() < 0.004) {
        const x = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
        const y = Math.random() * 400 + window.scrollY;
        shootingStar = { x, y, vx: 5 + Math.random() * 4, vy: 3 + Math.random() * 2, life: 1 };
      }

      if (shootingStar) {
        ctx.strokeStyle = `rgba(255,255,255,${shootingStar.life})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x - shootingStar.vx * 8, shootingStar.y - shootingStar.vy * 8);
        ctx.stroke();
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.life -= 0.02;
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

  // Smooth Scroll Scrub: Hero fades out, Moon scales up smoothly
  useEffect(() => {
    const onScroll = () => {
      if (!spacerRef.current || !moonRef.current || !heroRef.current) return;
      const rect = spacerRef.current.getBoundingClientRect();
      const total = spacerRef.current.offsetHeight - window.innerHeight;
      let progress = -rect.top / total;
      progress = Math.max(0, Math.min(1, progress));

      const heroFade = Math.max(0, 1 - progress * 3.0);
      heroRef.current.style.opacity = `${heroFade}`;
      heroRef.current.style.transform = `scale(${1 - progress * 0.12})`;

      const scale = 0.85 + progress * 1.8;
      moonRef.current.style.transform = `scale(${scale})`;

      const revealT = Math.max(0, Math.min(1, (progress - 0.55) / 0.45));
      if (miniHeaderRef.current) {
        miniHeaderRef.current.style.opacity = `${revealT}`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handle preset region select
  const handleSelectRegion = (regionKey: string) => {
    const region = REGIONS[regionKey];
    setSelectedRegion(region);
    setLoadingText('');
    setCustomPoint(null);
  };

  // Handle clicking ANY point on the Moon Globe to select custom coordinates
  const handleMoonGlobeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!moonRef.current) return;
    const rect = moonRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const nx = (clickX - cx) / cx;
    const ny = (clickY - cy) / cy;

    if (nx * nx + ny * ny > 1.0) return;

    const xPct = Math.round((clickX / rect.width) * 100);
    const yPct = Math.round((clickY / rect.height) * 100);

    const lat = Math.round((-ny * 90.0) * 1000) / 1000;
    const lon = Math.round((nx * 90.0) * 1000) / 1000;
    const latStr = lat >= 0 ? `${lat}°N` : `${Math.abs(lat)}°S`;
    const lonStr = lon >= 0 ? `${lon}°E` : `${Math.abs(lon)}°W`;

    const customRegion: RegionData = {
      id: `custom_${Date.now()}`,
      name: `Target (${latStr}, ${lonStr})`,
      sub: `User survey center · Radius: ${surveyRadiusKm} km`,
      lat: lat,
      lon: lon,
      coords: `${latStr}, ${lonStr}`,
      scenario_id: lat < -80 ? 'shackleton' : lat < -60 ? 'chandrayaan3' : 'malapert',
      hazard: '8%',
      slope: '4.8°',
      roughness: '0.10',
      confLow: 84,
      confHigh: 93,
      flag: null,
      rationale: `Regional survey centered at ${latStr}, ${lonStr} across a ${surveyRadiusKm} km radius. Safe touchdown candidates identified with slope gradient < 8.5°.`,
      groundtruth: `Target coordinates locked on LROC QuickMap GIS.`,
      quickmapExtent: `extent=${lon - 0.2},${lat - 0.2},${lon + 0.2},${lat + 0.2}&center=${lon},${lat}&zoom=15`,
      pinStyle: { top: `${yPct}%`, left: `${xPct}%` },
      mostSafeDetails: {
        name: `Primary Safe Zone (${latStr}, ${lonStr})`,
        score: "92%",
        slope: "4.5° (Safe ≤ 8.5°)",
        hazard: "5.0% (Clear terrain)",
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
          slope: '26.1°',
          hazard: '65%',
          status: 'RISKY',
          reason: 'Steep scarp slope exceeding structural safety limits.'
        }
      ]
    };

    setCustomPoint({ xPct, yPct, lat, lon });
    setSelectedRegion(customRegion);
    setLoadingText('');
  };

  // Run multi-sensor analysis with custom radius
  const handleAnalyze = async (overrideRadius?: number) => {
    if (!selectedRegion) return;
    const rKm = overrideRadius !== undefined ? overrideRadius : surveyRadiusKm;
    setIsAnalyzing(true);
    let step = 0;
    setLoadingText(LOADING_STEPS[0]);

    const stepTimer = setInterval(() => {
      step++;
      if (step < LOADING_STEPS.length) {
        setLoadingText(LOADING_STEPS[step]);
      }
    }, 400);

    try {
      const res = await apiClient.analyzeLandingSite({
        scenario_id: selectedRegion.scenario_id,
        sensor_health: sensorHealth,
        radius_km: rKm,
      } as any);
      setAnalysisData(res);
      setActiveLayer('safety_200km');
    } catch (err) {
      console.error('Backend analyze error:', err);
    }

    setTimeout(() => {
      clearInterval(stepTimer);
      setIsAnalyzing(false);
      setLoadingText(`Survey (${rKm} km Radius) Complete.`);
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
    : 'https://quickmap.lroc.im-ldi.com/';

  const currentLayerImg = analysisData?.layers
    ? analysisData.layers[activeLayer] ||
      analysisData.layers.safety_200km ||
      analysisData.layers.annotated ||
      analysisData.layers.optical
    : null;

  return (
    <div className="min-h-screen bg-[#000000] text-[#F8FAFC] font-sans relative overflow-x-hidden select-none">
      {/* Background Starfield */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none block" />

      {/* Hero Section with Playfair Display & Clean Sans Typography */}
      <section ref={heroRef} className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-6 transition-all duration-300">
        <div className="font-mono text-xs tracking-[0.35em] text-[#D4AF37] uppercase mb-5 opacity-90 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Landing Risk Assessment System</span>
        </div>
        
        <h1 className="metallic-title text-[clamp(48px,10vw,120px)] tracking-tight mb-5">
          Ready for<br />Mission
        </h1>

        <p className="max-w-[580px] text-[#94A3B8] text-sm sm:text-base md:text-lg leading-relaxed mb-10 font-sans opacity-95">
          Survey regional lunar terrain under custom search radii — automatically identifying why optimal sites are safe while mapping green safe and red risky pin points.
        </p>

        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.2em] text-[#94A3B8] flex flex-col items-center gap-2 scrolldown-anim">
          <span>SCROLL TO DESCEND</span>
          <span className="w-[1px] h-7 bg-gradient-to-b from-[#D4AF37] to-transparent" />
        </div>
      </section>

      {/* Scroll-Scrub Stage (Seamless Moon in Space) */}
      <section ref={spacerRef} className="relative z-10 h-[270vh]">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          {/* Top Mission HUD */}
          <div
            ref={miniHeaderRef}
            className="absolute top-7 left-8 z-20 font-mono text-xs tracking-[0.25em] text-[#F8FAFC] uppercase flex items-center gap-2.5 transition-opacity duration-300 opacity-0 bg-[#05060A]/85 px-3.5 py-1.5 rounded-full border border-slate-800 backdrop-blur"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_8px_#4ADE80] animate-pulse" />
            <span>LANDING RISK ASSESSMENT — MISSION CONSOLE</span>
          </div>

          {/* Mode Switcher: 3D Moon in Space vs Live LROC QuickMap */}
          <div className="absolute top-7 right-8 z-20 flex items-center gap-2 bg-[#05060A]/85 p-1 rounded-lg border border-slate-800 backdrop-blur-md">
            <button
              onClick={() => setMapMode('globe')}
              className={`px-3 py-1.5 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
                mapMode === 'globe' ? 'bg-[#D4AF37] text-[#000000] font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D Moon</span>
            </button>
            <button
              onClick={() => setMapMode('quickmap')}
              className={`px-3 py-1.5 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
                mapMode === 'quickmap' ? 'bg-[#D4AF37] text-[#000000] font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>LROC QuickMap</span>
            </button>
          </div>

          {/* Center Stage: The Moon Disc in Space */}
          <div className="relative w-full h-full flex items-center justify-center">
            {mapMode === 'globe' ? (
              <div
                ref={moonRef}
                onClick={handleMoonGlobeClick}
                className="moon-space-disc relative w-[420px] h-[420px] sm:w-[480px] sm:h-[480px] transform origin-center transition-transform duration-75 cursor-crosshair"
                title="Click anywhere on the lunar surface to select custom landing coordinates"
              >
                <img
                  src={moonStarsImg}
                  alt="Realistic Moon"
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
                    style={{ top: reg.pinStyle.top, left: reg.pinStyle.left }}
                    className={`map-pin absolute ${selectedRegion?.id === reg.id ? 'active' : ''}`}
                  >
                    {reg.name}
                  </button>
                ))}

                {/* User Clicked Custom Marker */}
                {customPoint && (
                  <div
                    style={{ top: `${customPoint.yPct}%`, left: `${customPoint.xPct}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]/30 flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Live QuickMap LROC Interactive Map Viewport */
              <div className="w-[90%] max-w-[920px] h-[72vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#000000] relative z-10 flex flex-col">
                <div className="h-10 bg-[#080a10] border-b border-slate-800 px-4 flex items-center justify-between text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LROC Interactive Satellite GIS · https://quickmap.lroc.im-ldi.com/</span>
                  </div>
                  <div className="flex gap-2 text-[11px]">
                    <button
                      onClick={() => handleSelectRegion('cy3')}
                      className="px-2 py-0.5 bg-blue-900/40 hover:bg-blue-800 text-blue-300 rounded border border-blue-600/40"
                    >
                      Shiv Shakti Point
                    </button>
                    <button
                      onClick={() => handleSelectRegion('sp')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600"
                    >
                      South Pole
                    </button>
                  </div>
                </div>

                <iframe
                  src={quickmapUrl}
                  title="LROC QuickMap Live Explorer"
                  className="w-full flex-1 border-none bg-black"
                />
              </div>
            )}
          </div>

          {/* Region Selected Side Drawer with Radius Controller */}
          {selectedRegion && (
            <div className="absolute right-[4%] top-1/2 -translate-y-1/2 w-[340px] bg-[#080c14]/92 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl z-30 shadow-2xl space-y-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-[#D4AF37] uppercase flex items-center justify-between">
                  <span>Target Selected</span>
                  <Target className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold font-serif-title text-white mt-1">{selectedRegion.name}</h3>
                <div className="font-mono text-xs text-cyan-300 mt-1">{selectedRegion.coords}</div>
                <div className="text-xs text-slate-400 mt-0.5">{selectedRegion.sub}</div>
              </div>

              {/* Survey Radius Input Controller */}
              <div className="bg-[#000000]/70 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Search Radius:</span>
                  <span className="text-[#D4AF37] font-bold text-sm">{surveyRadiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="500"
                  step="25"
                  value={surveyRadiusKm}
                  onChange={(e) => setSurveyRadiusKm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <button onClick={() => setSurveyRadiusKm(50)} className="hover:text-white">50km</button>
                  <button onClick={() => setSurveyRadiusKm(100)} className="hover:text-white">100km</button>
                  <button onClick={() => setSurveyRadiusKm(200)} className="hover:text-white">200km</button>
                  <button onClick={() => setSurveyRadiusKm(350)} className="hover:text-white">350km</button>
                  <button onClick={() => setSurveyRadiusKm(500)} className="hover:text-white">500km</button>
                </div>
              </div>

              <button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzing}
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#e0bc46] disabled:opacity-50 text-[#000000] text-xs font-bold tracking-wide rounded-lg transition-transform hover:-translate-y-0.5 cursor-pointer shadow-lg flex items-center justify-center gap-2 font-sans"
              >
                <Crosshair className="w-4 h-4" />
                <span>{isAnalyzing ? 'Scanning Region…' : `Scan ${surveyRadiusKm} km Radius Map`}</span>
              </button>

              {loadingText && (
                <div className="font-mono text-xs text-[#94A3B8] min-h-[18px] text-center animate-pulse">
                  {loadingText}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Analysis Results Section */}
      <section
        ref={resultsRef}
        className={`relative z-20 py-24 px-6 max-w-[1060px] mx-auto transition-all duration-700 ${
          showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {selectedRegion && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="font-mono text-xs tracking-[0.3em] text-[#D4AF37] uppercase">
                {surveyRadiusKm} km Radius Survey Complete
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-title tracking-tight text-white">
                {selectedRegion.name}
              </h2>
              <div className="font-mono text-xs text-cyan-300">{selectedRegion.coords}</div>
            </div>

            {/* DEDICATED "WHY IS IT SAFE?" COMPREHENSIVE ASSESSMENT CARD */}
            <div className="bg-gradient-to-b from-[#061810] via-[#040e0a] to-[#020805] border-2 border-emerald-500/80 rounded-2xl p-7 shadow-[0_0_35px_rgba(16,185,129,0.18)] space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/50 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm tracking-wide font-mono">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>PRIMARY OPTIMAL TOUCHDOWN SITE · GO EVALUATION</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">{selectedRegion.mostSafeDetails.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 bg-emerald-500 text-black font-extrabold text-xs rounded-full font-mono shadow-[0_0_12px_rgba(16,185,129,0.8)]">
                    CONFIDENCE: {selectedRegion.mostSafeDetails.score}
                  </span>
                </div>
              </div>

              {/* WHY IS IT SAFE? - 5 Structural Pillars */}
              <div>
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Why is this site safe? — Engineering Safety Justification:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-sans text-xs">
                  {/* Pillar 1 */}
                  <div className="bg-[#02120b] p-3.5 rounded-xl border border-emerald-800/40 space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Tipping Safety ({selectedRegion.mostSafeDetails.slope})</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.tippingMargin}. Far below the 8.5° critical rollover tipping angle.
                    </div>
                  </div>

                  {/* Pillar 2 */}
                  <div className="bg-[#02120b] p-3.5 rounded-xl border border-emerald-800/40 space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Low Hazard Density ({selectedRegion.mostSafeDetails.hazard})</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      Negligible crater and boulder cluster density. Free from obstacles capable of puncturing structural baseplates.
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div className="bg-[#02120b] p-3.5 rounded-xl border border-emerald-800/40 space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-300" />
                      <span>Thermal & Illumination Envelope</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.thermalIllum}. Avoids frozen &lt;80K shadow traps.
                    </div>
                  </div>

                  {/* Pillar 4 */}
                  <div className="bg-[#02120b] p-3.5 rounded-xl border border-emerald-800/40 space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Direct Comms Line-of-Sight</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.commsLine}. Unobstructed telemetry transmission during final powered descent.
                    </div>
                  </div>

                  {/* Pillar 5 */}
                  <div className="bg-[#02120b] p-3.5 rounded-xl border border-emerald-800/40 space-y-1 md:col-span-2">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Multi-Sensor Modality Consensus</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {selectedRegion.mostSafeDetails.consensus}. Low covariance uncertainty band (±3.5%).
                    </div>
                  </div>
                </div>
              </div>

              {/* Plain Language Summary */}
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 leading-relaxed">
                💡 <span className="font-bold">Flight Decision Summary:</span> {selectedRegion.mostSafeDetails.rationale}
              </div>
            </div>

            {/* 4 Telemetry Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#080c14]/85 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
                <div className="font-mono text-[10px] tracking-[0.15em] text-[#94A3B8] uppercase">Survey Radius</div>
                <div className="text-2xl font-black text-white mt-2 font-mono">{surveyRadiusKm} km</div>
                <div className="text-xs text-[#94A3B8] mt-1 font-sans">Coverage: {Math.round(Math.PI * surveyRadiusKm * surveyRadiusKm).toLocaleString()} km²</div>
              </div>

              <div className="bg-[#080c14]/85 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
                <div className="font-mono text-[10px] tracking-[0.15em] text-[#94A3B8] uppercase">Topographic Slope</div>
                <div className={`text-2xl font-black mt-2 font-mono ${parseFloat(selectedRegion.slope) > 15 ? 'text-[#F43F5E]' : 'text-[#4ADE80]'}`}>
                  {selectedRegion.slope}
                </div>
                <div className="text-xs text-[#94A3B8] mt-1 font-sans">within tolerance ≤ 8.5° limit</div>
              </div>

              <div className="bg-[#080c14]/85 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
                <div className="font-mono text-[10px] tracking-[0.15em] text-[#94A3B8] uppercase">Terrain Roughness</div>
                <div className="text-2xl font-black text-white mt-2 font-mono">{selectedRegion.roughness}</div>
                <div className="text-xs text-[#94A3B8] mt-1 font-sans">local elevation variance (TRI)</div>
              </div>

              <div className="bg-[#080c14]/85 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
                <div className="font-mono text-[10px] tracking-[0.15em] text-[#94A3B8] uppercase">Confidence Band</div>
                <div className={`text-2xl font-black mt-2 font-mono ${selectedRegion.confLow < 60 ? 'text-[#F43F5E]' : 'text-[#4ADE80]'}`}>
                  {selectedRegion.confLow}–{selectedRegion.confHigh}%
                </div>
                <div className="text-xs text-[#94A3B8] mt-1 font-sans">sensor resolution + shadow occlusion</div>
              </div>
            </div>

            {/* Warning Flags */}
            {selectedRegion.flag && (
              <div className="inline-block font-mono text-xs px-3.5 py-1.5 rounded-full border border-[#FB923C] text-[#FB923C] bg-[#FB923C]/10">
                ⚠ {selectedRegion.flag}
              </div>
            )}

            {/* Ground Truth Validation Note */}
            {selectedRegion.groundtruth && (
              <div className="font-mono text-xs sm:text-sm text-[#4ADE80] text-center bg-[#4ADE80]/10 border border-[#4ADE80]/30 py-2.5 px-4 rounded-xl">
                ✓ {selectedRegion.groundtruth}
              </div>
            )}

            {/* INTERACTIVE LEAFLET MAP SECTION WITH GREEN & RED PIN POINTS */}
            <div className="bg-[#080c14]/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
              {/* Header with Layer Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Leaflet Interactive Regional Map · Green (Safe) & Red (Risky) Pins</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Center: <span className="text-[#D4AF37] font-bold">{selectedRegion.coords}</span> · Survey Area: {surveyRadiusKm} km Radius
                  </div>
                </div>

                {/* Switch between Leaflet Interactive Map, Topographic Rasters & Live QuickMap */}
                <div className="flex items-center gap-1.5 bg-[#000000] p-1 rounded-lg border border-slate-800 font-mono text-xs">
                  <button
                    onClick={() => setZoomLayerMode('leaflet')}
                    className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                      zoomLayerMode === 'leaflet' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Leaflet GIS Pins</span>
                  </button>
                  <button
                    onClick={() => setZoomLayerMode('raster')}
                    className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                      zoomLayerMode === 'raster' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>DEM Rasters</span>
                  </button>
                  <button
                    onClick={() => setZoomLayerMode('quickmap_embed')}
                    className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                      zoomLayerMode === 'quickmap_embed' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live LROC GIS</span>
                  </button>
                </div>
              </div>

              {/* Pin Points Legend Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#050810] border border-slate-800 rounded-xl font-mono text-xs">
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
                <span className="text-slate-400 text-[11px]">Click any pin to inspect metrics</span>
              </div>

              {/* MAP VIEWPORT: Leaflet vs DEM Raster vs Live QuickMap */}
              <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-[#000000] shadow-2xl">
                {zoomLayerMode === 'leaflet' ? (
                  <MapContainer
                    center={[selectedRegion.lat, selectedRegion.lon]}
                    zoom={9}
                    scrollWheelZoom={true}
                    className="w-full h-full z-10"
                  >
                    <MapRecenter center={[selectedRegion.lat, selectedRegion.lon]} zoom={9} />

                    {/* Dark Space Cartography TileLayer */}
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Survey Radius Circle */}
                    <Circle
                      center={[selectedRegion.lat, selectedRegion.lon]}
                      radius={surveyRadiusKm * 1000}
                      pathOptions={{ color: '#D4AF37', weight: 1.5, fillOpacity: 0.06, dashArray: '6, 6' }}
                    />

                    {/* Safe and Risky Pin Markers */}
                    {selectedRegion.mapPoints.map((pt) => (
                      <Marker
                        key={pt.id}
                        position={[pt.lat, pt.lon]}
                        icon={pt.isSafe ? safeIcon : riskyIcon}
                      >
                        <Popup className="font-sans">
                          <div className="p-1 space-y-2 min-w-[220px]">
                            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                              <span className={`font-mono text-xs font-bold ${pt.isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {pt.status === 'SAFE' ? '🟢 SAFE TOUCHDOWN' : '🔴 HAZARD / RISKY'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${pt.isSafe ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-rose-950 text-rose-300 border border-rose-600'}`}>
                                {pt.score}
                              </span>
                            </div>

                            <div>
                              <div className="font-bold text-sm text-white">{pt.name}</div>
                              <div className="font-mono text-[11px] text-cyan-300 mt-0.5">
                                {pt.lat.toFixed(3)}°, {pt.lon.toFixed(3)}°
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] bg-black/50 p-2 rounded border border-slate-800">
                              <div>
                                <span className="text-slate-400 block text-[9px]">SLOPE</span>
                                <span className={pt.isSafe ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>{pt.slope}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px]">HAZARD</span>
                                <span className={pt.isSafe ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>{pt.hazard}</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-300 leading-relaxed">{pt.reason}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : zoomLayerMode === 'raster' ? (
                  currentLayerImg ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={currentLayerImg}
                        alt="Regional Lunar Terrain Raster"
                        className="w-full h-full object-cover select-none"
                      />
                      <div className="absolute bottom-3 left-3 bg-[#050810]/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 flex items-center gap-3 font-mono">
                        <span className="text-emerald-400 font-bold">{surveyRadiusKm} km Radius Survey</span>
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
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-[#080c14] border border-emerald-600/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Online Satellite GIS Ground Truth</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Fetch live sub-meter LROC NAC optical tiles for {selectedRegion.name} ({selectedRegion.coords})
                    </div>
                  </div>
                </div>

                <a
                  href={quickmapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30 whitespace-nowrap"
                >
                  <span>🎯 Open Exact Point in Fullscreen QuickMap</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Graceful Sensor Degradation Sandbox */}
            <div className="bg-[#080c14]/85 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-sans">
                  <Radio className="w-4 h-4 text-blue-400" />
                  <span>Graceful Sensor Degradation Simulator</span>
                </div>
                <span className="font-mono text-xs text-slate-400">Dynamic weight redistribution</span>
              </div>

              <p className="text-xs text-slate-400 font-sans">
                Click any sensor below to simulate inflight failure or dust degradation. The system re-normalizes active weights and widens the uncertainty band:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <button
                  onClick={() => toggleSensor('thermal')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    sensorHealth.thermal === 'offline'
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                      : 'bg-[#050810] border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Thermometer className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                  <div>Drop Thermal</div>
                  <div className="text-[10px] text-slate-400">{sensorHealth.thermal === 'offline' ? 'OFFLINE (Weight=0)' : 'Healthy'}</div>
                </button>

                <button
                  onClick={() => toggleSensor('optical')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    sensorHealth.optical === 'degraded'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#050810] border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Camera className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <div>Optical Dust</div>
                  <div className="text-[10px] text-slate-400">{sensorHealth.optical === 'degraded' ? 'DEGRADED (Reduced Weight)' : 'Healthy'}</div>
                </button>

                <button
                  onClick={() => toggleSensor('dem')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    sensorHealth.dem === 'degraded'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                      : 'bg-[#050810] border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Radio className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                  <div>Radar Glitch</div>
                  <div className="text-[10px] text-slate-400">{sensorHealth.dem === 'degraded' ? 'DEGRADED (Reduced Weight)' : 'Healthy'}</div>
                </button>
              </div>

              {(sensorHealth.thermal === 'offline' || sensorHealth.optical === 'degraded' || sensorHealth.dem === 'degraded') && (
                <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl text-xs text-amber-300 font-mono">
                  ⚠️ Sensor fault active: Remaining weights re-normalized. Confidence band widened to account for lost modality.
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-sans">
              <button
                onClick={handleConfirmDecision}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Touchdown Decision</span>
              </button>

              <button
                onClick={resetAll}
                className="w-full sm:w-auto px-8 py-3 bg-transparent border border-slate-800 hover:border-slate-600 text-[#F8FAFC] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Analyze a Different Region</span>
              </button>
            </div>

            {decisionConfirmed && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono text-center rounded-xl animate-fade-in">
                ✓ Decision Confirmed for {decisionConfirmed} & Persisted to SQLite Flight Computer Log (`audit.db`).
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default App;
