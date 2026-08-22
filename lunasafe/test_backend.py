"""
Backend verification script for LUNA-SAFE
Tests DEM processing, Thermal analysis, YOLO detection, Fusion engine, and REST endpoints.
"""

import sys
import os
import numpy as np

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from dem_processor import DEMProcessor
from thermal_processor import ThermalProcessor
from yolo_detector import YOLOHazardDetector
from fusion_engine import LandingFusionEngine
from scenarios import ScenarioManager
from app import app


def test_components():
    print("[1/5] Testing DEMProcessor...")
    dem_proc = DEMProcessor(resolution_meters=5.0, max_safe_slope_deg=8.5)
    sample_dem = np.random.normal(0, 10, (100, 100))
    res_dem = dem_proc.analyze_region(sample_dem)
    assert "slope_map" in res_dem, "DEM analysis missing slope_map"
    assert "tri_map" in res_dem, "DEM analysis missing tri_map"
    print(f"  ✓ DEM Slope range: {res_dem['mean_slope']:.2f}° to {res_dem['max_slope']:.2f}°")

    print("[2/5] Testing ThermalProcessor...")
    therm_proc = ThermalProcessor()
    sample_thermal = np.full((100, 100), 220.0) + np.random.normal(0, 5, (100, 100))
    res_therm = therm_proc.analyze_region(sample_thermal)
    assert "thermal_risk" in res_therm, "Thermal analysis missing thermal_risk"
    print(f"  ✓ Thermal mean temp: {res_therm['mean_temp_k']:.1f} K")

    print("[3/5] Testing YOLOHazardDetector...")
    yolo_det = YOLOHazardDetector(model_path="yolov8n.pt")
    sample_img = np.random.randint(50, 200, (100, 100, 3), dtype=np.uint8)
    res_yolo = yolo_det.detect_hazards(sample_img)
    assert "detections" in res_yolo, "YOLO detector missing detections"
    assert "hazard_density_map" in res_yolo, "YOLO detector missing hazard density"
    print(f"  ✓ YOLO detected {res_yolo['total_hazard_count']} hazards, mean conf: {res_yolo['mean_confidence']:.2f}")

    print("[4/5] Testing ScenarioManager & Fusion Engine...")
    scenario_mgr = ScenarioManager()
    scenario = scenario_mgr.load_scenario_data("chandrayaan3")
    fusion_eng = LandingFusionEngine()

    pipeline_res = fusion_eng.run_full_pipeline(
        optical_image_bgr=scenario["optical_bgr"],
        dem_grid=scenario["dem_elevation"],
        thermal_grid=scenario["thermal_k"],
        yolo_detector=yolo_det,
        dem_processor=dem_proc,
        thermal_processor=therm_proc,
        sensor_health={"optical": "healthy", "dem": "healthy", "thermal": "healthy"},
    )
    assert pipeline_res["success"], "Pipeline failed"
    assert len(pipeline_res["candidate_zones"]) > 0, "No candidate zones generated"
    top_z = pipeline_res["recommended_zone"]
    print(f"  ✓ Pipeline recommended: {top_z['name']} with safety score {top_z['safety_score']} ± {top_z['confidence_interval']}%")
    print(f"  ✓ Rationale: {pipeline_res['rationale']['decision']}")

    print("[5/5] Testing Flask REST Endpoints via TestClient...")
    client = app.test_client()

    # Test /api/scenarios
    r1 = client.get('/api/scenarios')
    assert r1.status_code == 200, f"/api/scenarios failed with {r1.status_code}"
    print(f"  ✓ /api/scenarios: {len(r1.json['scenarios'])} scenarios available")

    # Test /api/analyze
    r2 = client.post('/api/analyze', json={"scenario_id": "chandrayaan3"})
    assert r2.status_code == 200, f"/api/analyze failed with {r2.status_code}"
    assert "layers" in r2.json, "Layers missing from /api/analyze"
    print(f"  ✓ /api/analyze: {len(r2.json['candidate_zones'])} candidate zones, layers: {list(r2.json['layers'].keys())}")

    # Test /api/simulate-degradation
    r3 = client.post('/api/simulate-degradation', json={"scenario_id": "chandrayaan3", "dropped_sensor": "thermal"})
    assert r3.status_code == 200, f"/api/simulate-degradation failed with {r3.status_code}"
    print(f"  ✓ /api/simulate-degradation: Confidence widening: +{r3.json['confidence_widening_pts']}%")

    # Test /api/override
    r4 = client.post('/api/override', json={"zone_id": "B", "action": "override", "rationale": "Manual pilot preference"})
    assert r4.status_code == 200, f"/api/override failed with {r4.status_code}"
    print(f"  ✓ /api/override: Success, message: {r4.json['message']}")

    # Test /api/benchmarks
    r5 = client.get('/api/benchmarks')
    assert r5.status_code == 200, f"/api/benchmarks failed with {r5.status_code}"
    print(f"  ✓ /api/benchmarks: {len(r5.json['baseline_comparison'])} baseline comparisons")

    print("\n==========================================")
    print("ALL BACKEND TESTS PASSED SUCCESSFULLY! (5/5)")
    print("==========================================")


if __name__ == '__main__':
    test_components()
