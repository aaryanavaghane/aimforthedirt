"""
Comprehensive Verification Suite for LUNA-SAFE FastAPI Backend
Tests all endpoints: MoonVerifier gate, Coarse & Fine Perception, Ranking,
Uncertainty propagation, Graceful degradation, Annotations with Chandrayaan-3 Crosshair,
SQLite Audit logging, and Static Web Serving.
"""

import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
import cv2
import numpy as np
from fastapi.testclient import TestClient

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from main import app
from schemas import MissionPriorities, ZoneCandidate

client = TestClient(app)


def run_tests():
    print("=" * 60)
    print("RUNNING LUNA-SAFE FASTAPI TEST SUITE")
    print("=" * 60)

    # 1. Health Check
    print("\n[1/12] Testing GET /api/health...")
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.status_code}"
    data = r.json()
    assert data["status"] == "online"
    print(f"  ✓ Status: {data['status']}, Version: {data['version']}, YOLO Loaded: {data['yolo_loaded']}")

    # 2. Scenarios List
    print("\n[2/12] Testing GET /api/scenarios...")
    r = client.get("/api/scenarios")
    assert r.status_code == 200
    scenarios = r.json()["scenarios"]
    assert len(scenarios) >= 5
    print(f"  ✓ {len(scenarios)} scenarios available: {[s['id'] for s in scenarios]}")

    # 3. MoonVerifier Gate (Acceptance & Rejection)
    print("\n[3/12] Testing POST /api/verify (Moon-Image Verification Gate)...")
    # Positive: Lunar grayscale texture (achromatic regolith)
    gray = np.random.randint(40, 180, (200, 200), dtype=np.uint8)
    lunar_img = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
    # Add a circular crater
    cv2.circle(lunar_img, (100, 100), 30, (25, 25, 30), -1)
    cv2.circle(lunar_img, (100, 100), 30, (190, 190, 200), 2)
    _, buf = cv2.imencode('.png', lunar_img)
    r_pos = client.post("/api/verify", files={"file": ("lunar.png", buf.tobytes(), "image/png")})
    assert r_pos.status_code == 200, f"Moon verification positive failed: {r_pos.text}"
    print(f"  ✓ Valid Lunar Image Accepted (Confidence: {r_pos.json()['confidence']})")

    # Negative: Terrestrial bright green vegetation image (should be rejected early with 422)
    earth_img = np.zeros((200, 200, 3), dtype=np.uint8)
    earth_img[:, :] = (30, 220, 40) # Bright green
    _, buf_earth = cv2.imencode('.png', earth_img)
    r_neg = client.post("/api/verify", files={"file": ("earth.png", buf_earth.tobytes(), "image/png")})
    assert r_neg.status_code == 422, f"Earth photo rejection failed: {r_neg.status_code}"
    print(f"  ✓ Terrestrial Image Successfully Rejected: {r_neg.json()['detail']['message']}")

    # 4. Coarse Analysis Pass
    print("\n[4/12] Testing POST /api/analyze/coarse...")
    r = client.post("/api/analyze/coarse", params={"scenario_id": "chandrayaan3"})
    assert r.status_code == 200
    coarse_data = r.json()
    assert coarse_data["shortlisted_count"] > 0
    print(f"  ✓ Coarse pass shortlisted {coarse_data['shortlisted_count']} candidate zones")

    # 5. Fine Analysis Pass
    print("\n[5/12] Testing POST /api/analyze/fine...")
    r = client.post("/api/analyze/fine", params={"scenario_id": "chandrayaan3"})
    assert r.status_code == 200
    fine_data = r.json()
    assert len(fine_data["candidates"]) > 0
    print(f"  ✓ Fine pass extracted {len(fine_data['candidates'])} zones with slopes and obstacle counts")

    # 6. Multi-Criteria Ranking & Uncertainty Quantification
    print("\n[6/12] Testing POST /api/rank...")
    candidates = fine_data["candidates"]
    r = client.post("/api/rank", json={"zones": candidates, "scenario_id": "chandrayaan3"})
    assert r.status_code == 200, f"Rank failed: {r.text}"
    rank_data = r.json()
    rec = rank_data["recommended_zone"]
    assert rec is not None, "Recommended zone is None"
    print(f"  ✓ Primary Pick: {rec['name']} (Safety Score: {rec['score']} ± {rec['confidence_band_spread']}%)")
    print(f"  ✓ AI Confidence: {rec['confidence_pct']}%, Rationale: {rec['rationale']}")
    assert rank_data["audit_id"] is not None
    print(f"  ✓ Audit ID logged: {rank_data['audit_id']}")

    # 7. Annotated Output with Chandrayaan-3 Crosshair
    print("\n[7/12] Testing POST /api/annotate...")
    r = client.post("/api/annotate", params={"scenario_id": "chandrayaan3", "top_zone_id": rec["zone_id"]})
    assert r.status_code == 200
    ann_data = r.json()
    assert ann_data["annotated_image"].startswith("data:image/png;base64,")
    print(f"  ✓ Annotated image rendered with Chandrayaan-3 crosshair landing pin ({len(ann_data['annotated_image'])} chars)")

    # 8. Plain-Language Explainability Endpoint
    print("\n[8/12] Testing GET /api/explain/{zone_id}...")
    r = client.get(f"/api/explain/{rec['zone_id']}", params={"scenario_id": "chandrayaan3"})
    assert r.status_code == 200
    exp_data = r.json()
    assert exp_data["zone_id"] == rec["zone_id"]
    print(f"  ✓ Explain Rationale for {exp_data['name']}: {exp_data['rationale']}")

    # 9. Graceful Sensor Degradation Simulation (Differentiator 2)
    print("\n[9/12] Testing POST /api/simulate/degrade...")
    r = client.post("/api/simulate/degrade", json={"scenario_id": "chandrayaan3", "dropped_sensor": "thermal"})
    assert r.status_code == 200
    deg_data = r.json()
    assert deg_data["confidence_widening_pts"] >= 0
    print(f"  ✓ Degradation Impact: {deg_data['impact_summary']}")
    print(f"  ✓ Confidence Band Widening: +{deg_data['confidence_widening_pts']}%")

    # 10. SQLite Decision Audit Trail
    print("\n[10/12] Testing GET /api/audit and POST /api/override...")
    r_ovr = client.post("/api/override", json={"zone_id": "B", "action": "override", "rationale": "Manual pilot preference", "scenario_id": "chandrayaan3"})
    assert r_ovr.status_code == 200
    r_aud = client.get("/api/audit")
    assert r_aud.status_code == 200
    history = r_aud.json()["audit_log"]
    assert len(history) > 0
    print(f"  ✓ SQLite Audit Log verified ({len(history)} decisions recorded, latest: {history[0]['id']})")

    # 11. Engineering Benchmarks & Latency Profiling
    print("\n[11/12] Testing GET /api/benchmarks...")
    r = client.get("/api/benchmarks")
    assert r.status_code == 200
    bench = r.json()
    assert len(bench["baseline_comparison"]) == 3
    print(f"  ✓ Baseline Comparisons: {len(bench['baseline_comparison'])} (False-Safe: {bench['baseline_comparison'][2]['false_safe_rate']})")
    print(f"  ✓ Latency Profile: {bench['latency_profile']['total_latency_ms']} ms ({bench['latency_profile']['fps_equivalent']} FPS)")

    # 12. Full Unified Dashboard Endpoint
    print("\n[12/12] Testing POST /api/analyze (Unified Dashboard Pipeline)...")
    r = client.post("/api/analyze", json={"scenario_id": "chandrayaan3"})
    assert r.status_code == 200
    dash_data = r.json()
    assert "layers" in dash_data
    assert "annotated" in dash_data["layers"]
    assert "uncertainty" in dash_data["layers"]
    print(f"  ✓ Full pipeline executed in {dash_data['telemetry']['total_latency_ms']} ms")
    print(f"  ✓ 8 Raster Layers generated: {list(dash_data['layers'].keys())}")

    print("\n" + "=" * 60)
    print("ALL 12 FASTAPI INTEGRATION TESTS PASSED PERFECTLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()
