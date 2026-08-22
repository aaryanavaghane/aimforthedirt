# AimForTheDirt (LunaSafe) 🚀🌕
### AI-Powered Multi-Sensor Autonomous Lunar Landing Risk Assessment System

AimForTheDirt is an advanced landing risk evaluation and site selection engine engineered for lunar landers (Chandrayaan, Artemis, and commercial landers). It integrates multi-spectral optical perception, LOLA elevation altimetry, and Diviner thermal radiometry into a real-time explainable decision support console.

---

## 🌟 Key Features

1. **Custom Radius Regional Terrain Survey**:
   - Interactive survey radius scanner ($25\text{ km}$ to $500\text{ km}$) measuring regional topography, slope tipping safety, and roughness variance.

2. **Autonomous Safety Justification ("Why is it Safe?")**:
   - Structural landing gear tipping margin ($\le 8.5^\circ$ slope limit).
   - Sub-meter boulder and crater hazard density evaluation.
   - Thermal stability and continuous solar line-of-sight analysis.
   - Line-of-sight communication path validation for deep-space telemetry.

3. **Interactive Leaflet Lunar GIS Cartography**:
   - **🟢 Green Pins**: Safe Touchdown Sites with high geotechnical stability and $\ge 85\%$ multi-sensor confidence.
   - **🔴 Red Pins**: Hazardous / Risky Zones with steep scarp dropoffs, boulder fields, and permanent shadow traps.
   - Interactive telemetry popups on pin selection.

4. **Multi-Spectral Sensor Layers**:
   - 🗺️ **Regional Safety Map**: Calibrated safe (green) vs unsafe (red) landing zones.
   - 📐 **DEM Slope Gradient**: Direct slope inclination analysis.
   - 🌡️ **Diviner Thermal Radiometry**: Temperature anomaly & PSR cold-trap detection.
   - 🏔️ **LOLA Elevation Altimetry**: High-resolution topographic surface contours.
   - 📷 **Optical Surface**: Sub-meter lunar regolith reconnaissance.
   - 🎯 **LROC QuickMap Integration**: Sub-meter NASA/LROC NAC satellite GIS ground-truth verification.

5. **Graceful Sensor Degradation Simulation**:
   - Dynamic weight re-normalization and covariance uncertainty expansion under in-flight camera dust occlusion, radar altimeter glitch, or thermal sensor failure.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT + VITE FRONTEND                    │
│   Leaflet GIS Pins · Multi-Layer Rasters · Sensor Dropout   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / WebSocket
┌──────────────────────────────▼──────────────────────────────┐
│                    FASTAPI BACKEND CORE                     │
│  - Perception Engine (Multi-scale Optical Sweep)            │
│  - Elevation Processor (LOLA DEM Slope / TRI Roughness)     │
│  - Thermal Radiometry Engine (Diviner Anomaly Detection)    │
│  - Sensor Fusion & Decision Ranking Engine                  │
│  - SQLite Flight Computer Audit Logger                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Install & Run Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:5000`*

### 2. Install & Run Frontend
```bash
cd lunasafe/client
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

### 3. Production Build
```bash
cd lunasafe/client
npm run build
```
*Static production bundle generated in `lunasafe/client/dist/`.*

---

## 🛰️ Supported Scenarios & Benchmark Ground Truth
- **Shiv Shakti Point (Chandrayaan-3)**: Flat basalt plain, $4.2^\circ$ slope, $94\%$ confidence.
- **South Pole Shackleton Crater**: Polar ridge illumination with PSR cold trap boundaries.
- **Malapert Mountain Plateau**: Artemis Peak of Eternal Light ($85\%+$ annual illumination).
- **Tiranga Point (Chandrayaan-2 Reference)**: High slope/roughness terrain correctly triggering emergency autonomous abort.

---

## 📜 License
MIT License. Built for Autonomous Space Exploration.
