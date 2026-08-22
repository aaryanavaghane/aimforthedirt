"""
Multi-Sensor Fusion & Decision-Support Engine for LUNA-SAFE
Integrates Optical (YOLO), DEM Elevation, and Thermal sensors with
Uncertainty Quantification, Graceful Sensor Degradation, Coarse-to-Fine Sweeps,
and Human-AI Collaborative Explainability.
"""

import time
import numpy as np
from typing import Dict, List, Any, Optional


class LandingFusionEngine:
    """
    Multi-sensor fusion engine for autonomous planetary landing site selection.
    """

    DEFAULT_WEIGHTS = {
        "boulder_crater": 0.30,
        "slope": 0.30,
        "roughness": 0.15,
        "thermal": 0.15,
        "fuel_distance": 0.10,
        "science_value": 0.00,
    }

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or dict(self.DEFAULT_WEIGHTS)
        self.audit_log: List[Dict[str, Any]] = []

    def normalize_weights(self, active_weights: Dict[str, float]) -> Dict[str, float]:
        """Normalize weights to sum to 1.0"""
        total = sum(active_weights.values())
        if total <= 0:
            return {k: 1.0 / len(active_weights) for k in active_weights}
        return {k: round(v / total, 4) for k, v in active_weights.items()}

    def apply_sensor_health_reweighting(
        self,
        base_weights: Dict[str, float],
        optical_health: str = "healthy",
        dem_health: str = "healthy",
        thermal_health: str = "healthy",
    ) -> tuple:
        """
        Graceful Sensor Degradation:
        Dynamically adjusts sensor weights when sensors degrade or go offline.
        Returns: (reweighted_dict, degradation_flags, base_uncertainty_penalty)
        """
        flags = []
        uncertainty_penalty = 0.0

        opt_factor = 1.0 if optical_health == "healthy" else (0.45 if optical_health == "degraded" else 0.0)
        dem_factor = 1.0 if dem_health == "healthy" else (0.40 if dem_health == "degraded" else 0.05)
        therm_factor = 1.0 if thermal_health == "healthy" else 0.0

        if optical_health == "degraded":
            flags.append("Optical sensor degraded (dust/glare interference) — Optical weight scaled down by 55%")
            uncertainty_penalty += 0.12
        elif optical_health == "offline":
            flags.append("CRITICAL: Optical sensor offline — Visual hazard detection unavailable")
            uncertainty_penalty += 0.28

        if dem_health == "degraded":
            flags.append("DEM radar altimeter degraded — Elevation uncertainty increased")
            uncertainty_penalty += 0.10
        elif dem_health == "offline":
            flags.append("CRITICAL: DEM altimeter offline — Terrain gradient unmeasurable")
            uncertainty_penalty += 0.35

        if thermal_health == "offline":
            flags.append("Thermal radiometer offline — Subsurface cold-trap detection disabled, reweighting to Optical + DEM")
            uncertainty_penalty += 0.14

        adjusted_weights = {
            "boulder_crater": base_weights.get("boulder_crater", 0.30) * opt_factor,
            "slope": base_weights.get("slope", 0.30) * dem_factor,
            "roughness": base_weights.get("roughness", 0.15) * dem_factor,
            "thermal": base_weights.get("thermal", 0.15) * therm_factor,
            "fuel_distance": base_weights.get("fuel_distance", 0.10),
            "science_value": base_weights.get("science_value", 0.00),
        }

        reweighted = self.normalize_weights(adjusted_weights)
        return reweighted, flags, uncertainty_penalty

    def compute_spatial_uncertainty_map(
        self,
        h: int,
        w: int,
        lighting: dict,
        yolo_result: dict,
        base_uncertainty_penalty: float,
        dem_health: str,
        thermal_health: str,
    ) -> np.ndarray:
        """
        Quantifies spatial uncertainty across the entire terrain grid.
        """
        uncertainty = np.full((h, w), 0.05 + base_uncertainty_penalty, dtype=np.float32)

        if "shadow_mask" in lighting and lighting["shadow_mask"] is not None:
            shadow_mask = lighting["shadow_mask"]
            if shadow_mask.shape == (h, w):
                uncertainty += shadow_mask.astype(float) * 0.35

        if "glare_mask" in lighting and lighting["glare_mask"] is not None:
            glare_mask = lighting["glare_mask"]
            if glare_mask.shape == (h, w):
                uncertainty += glare_mask.astype(float) * 0.25

        if yolo_result.get("sensor_status") != "offline":
            conf_entropy = yolo_result.get("confidence_entropy", 0.15)
            uncertainty += float(conf_entropy) * 0.20

        return np.clip(uncertainty, 0.05, 0.95)

    def coarse_global_sweep(
        self,
        h: int,
        w: int,
        hazard_density_map: np.ndarray,
        slope_hazard_map: np.ndarray,
        roughness_map: np.ndarray,
        thermal_risk_map: np.ndarray,
        weights: Dict[str, float],
        target_center: tuple = (0.5, 0.5),
        grid_divisions: int = 8,
    ) -> List[Dict[str, Any]]:
        """
        Coarse global sweep across region to shortlist top candidate zones.
        """
        block_h = h // grid_divisions
        block_w = w // grid_divisions
        candidates = []

        tx, ty = target_center[0] * w, target_center[1] * h
        max_dist = np.sqrt(w**2 + h**2)

        for row in range(grid_divisions):
            for col in range(grid_divisions):
                y1 = row * block_h
                y2 = min(h, (row + 1) * block_h)
                x1 = col * block_w
                x2 = min(w, (col + 1) * block_w)

                cx = (x1 + x2) / 2.0
                cy = (y1 + y2) / 2.0

                h_slice = hazard_density_map[y1:y2, x1:x2]
                s_slice = slope_hazard_map[y1:y2, x1:x2]
                r_slice = roughness_map[y1:y2, x1:x2]
                t_slice = thermal_risk_map[y1:y2, x1:x2]

                mean_h = float(np.mean(h_slice)) if h_slice.size > 0 else 0.5
                mean_s = float(np.mean(s_slice)) if s_slice.size > 0 else 0.5
                mean_r = float(np.mean(r_slice)) if r_slice.size > 0 else 0.5
                mean_t = float(np.mean(t_slice)) if t_slice.size > 0 else 0.5

                dist = np.sqrt((cx - tx)**2 + (cy - ty)**2) / max_dist

                coarse_risk = (
                    weights.get("boulder_crater", 0.3) * mean_h +
                    weights.get("slope", 0.3) * mean_s +
                    weights.get("roughness", 0.15) * mean_r +
                    weights.get("thermal", 0.15) * mean_t +
                    weights.get("fuel_distance", 0.1) * dist
                )

                candidates.append({
                    "grid_pos": (row, col),
                    "box": [x1, y1, x2, y2],
                    "center": [cx, cy],
                    "center_norm": [round(cx / w, 3), round(cy / h, 3)],
                    "coarse_risk": round(float(coarse_risk), 4),
                    "mean_slope_hazard": round(mean_s, 3),
                    "mean_hazard_density": round(mean_h, 3),
                })

        candidates.sort(key=lambda c: c["coarse_risk"])
        return candidates[:8]

    def fine_grained_scoring(
        self,
        coarse_candidates: List[Dict[str, Any]],
        dem_analysis: dict,
        yolo_analysis: dict,
        thermal_analysis: dict,
        uncertainty_map: np.ndarray,
        weights: Dict[str, float],
        max_safe_slope_deg: float = 8.5,
        science_interest_map: Optional[np.ndarray] = None,
    ) -> List[Dict[str, Any]]:
        """
        Fine-grained multi-criteria evaluation of shortlisted candidate landing zones.
        """
        slope_deg_map = dem_analysis["slope_map"]
        tri_map = dem_analysis["tri_map"]
        hazard_density_map = yolo_analysis["hazard_density_map"]
        thermal_risk_map = thermal_analysis["thermal_risk"]
        lighting = yolo_analysis.get("lighting", {})

        h, w = slope_deg_map.shape
        zone_letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
        fine_results = []

        for idx, candidate in enumerate(coarse_candidates):
            letter = zone_letters[idx] if idx < len(zone_letters) else f"Z{idx+1}"
            x1, y1, x2, y2 = [int(v) for v in candidate["box"]]

            cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)
            radius = int(min(x2 - x1, y2 - y1) * 0.42)
            y_min, y_max = max(0, cy - radius), min(h, cy + radius)
            x_min, x_max = max(0, cx - radius), min(w, cx + radius)

            yy, xx = np.ogrid[y_min:y_max, x_min:x_max]
            dist_from_c = np.sqrt((xx - (cx - x_min))**2 + (yy - (cy - y_min))**2)
            circle_mask = dist_from_c <= radius

            z_slope = slope_deg_map[y_min:y_max, x_min:x_max]
            z_slope_vals = z_slope[circle_mask] if np.any(circle_mask) else z_slope.flatten()

            z_tri = tri_map[y_min:y_max, x_min:x_max]
            z_tri_vals = z_tri[circle_mask] if np.any(circle_mask) else z_tri.flatten()

            z_hden = hazard_density_map[y_min:y_max, x_min:x_max]
            z_hden_vals = z_hden[circle_mask] if np.any(circle_mask) else z_hden.flatten()

            z_therm = thermal_risk_map[y_min:y_max, x_min:x_max]
            z_therm_vals = z_therm[circle_mask] if np.any(circle_mask) else z_therm.flatten()

            z_unc = uncertainty_map[y_min:y_max, x_min:x_max]
            z_unc_vals = z_unc[circle_mask] if np.any(circle_mask) else z_unc.flatten()

            mean_slope = float(np.mean(z_slope_vals)) if len(z_slope_vals) > 0 else 5.0
            peak_slope = float(np.percentile(z_slope_vals, 95)) if len(z_slope_vals) > 0 else mean_slope
            mean_tri = float(np.mean(z_tri_vals)) if len(z_tri_vals) > 0 else 0.5
            mean_hden = float(np.mean(z_hden_vals)) if len(z_hden_vals) > 0 else 0.2
            mean_therm = float(np.mean(z_therm_vals)) if len(z_therm_vals) > 0 else 0.2
            mean_unc = float(np.mean(z_unc_vals)) if len(z_unc_vals) > 0 else 0.15

            zone_boulders = 0
            zone_craters = 0
            for det in yolo_analysis.get("detections", []):
                bx1, by1, bx2, by2 = det["bbox"]
                bcx, bcy = (bx1 + bx2) / 2.0, (by1 + by2) / 2.0
                if np.sqrt((bcx - cx)**2 + (bcy - cy)**2) <= radius * 1.1:
                    if det["class_name"] == "boulder":
                        zone_boulders += 1
                    else:
                        zone_craters += 1

            shadow_mask = lighting.get("shadow_mask")
            zone_shadow_ratio = 0.0
            if shadow_mask is not None and shadow_mask.shape == (h, w):
                z_shadow = shadow_mask[y_min:y_max, x_min:x_max]
                z_shadow_vals = z_shadow[circle_mask] if np.any(circle_mask) else z_shadow.flatten()
                zone_shadow_ratio = float(np.mean(z_shadow_vals)) if len(z_shadow_vals) > 0 else 0.0

            slope_hazard = min(1.0, (mean_slope / max_safe_slope_deg)**1.4)
            if peak_slope > max_safe_slope_deg * 1.5:
                slope_hazard = min(1.0, slope_hazard + 0.25)

            rough_hazard = min(1.0, mean_tri / 2.2)
            opt_hazard = min(1.0, mean_hden * 0.7 + (zone_boulders * 0.08 + zone_craters * 0.05))

            tx, ty = w * 0.5, h * 0.5
            dist_norm = np.sqrt((cx - tx)**2 + (cy - ty)**2) / np.sqrt(w**2 + h**2)
            fuel_cost = min(1.0, dist_norm * 1.5)

            science_score = 0.0
            if science_interest_map is not None and science_interest_map.shape == (h, w):
                z_sci = science_interest_map[y_min:y_max, x_min:x_max]
                science_score = float(np.mean(z_sci))
            else:
                science_score = min(1.0, mean_therm * 0.5 + zone_shadow_ratio * 0.5)

            composite_risk = (
                weights.get("boulder_crater", 0.30) * opt_hazard +
                weights.get("slope", 0.30) * slope_hazard +
                weights.get("roughness", 0.15) * rough_hazard +
                weights.get("thermal", 0.15) * mean_therm +
                weights.get("fuel_distance", 0.10) * fuel_cost -
                weights.get("science_value", 0.00) * science_score * 0.1
            )
            composite_risk = max(0.0, min(1.0, composite_risk))

            safety_score = round((1.0 - composite_risk) * 100.0, 1)
            confidence_interval = round(mean_unc * 20.0 + (zone_shadow_ratio * 12.0), 1)
            confidence_pct = round(max(10.0, min(98.0, (1.0 - mean_unc) * 100.0)), 1)

            # Safety violations
            is_critical = False
            violation_reasons = []

            if mean_slope > max_safe_slope_deg:
                is_critical = True
                violation_reasons.append(f"Mean slope ({round(mean_slope, 1)}°) exceeds lander limit ({max_safe_slope_deg}°)")
            elif peak_slope > max_safe_slope_deg * 1.7:
                is_critical = True
                violation_reasons.append(f"Peak localized slope ({round(peak_slope, 1)}°) exceeds landing gear tipping threshold")

            if zone_boulders >= 4:
                is_critical = True
                violation_reasons.append(f"High boulder density ({zone_boulders} boulders detected)")

            if zone_shadow_ratio > 0.70:
                is_critical = True
                violation_reasons.append("Severe shadow occlusion (>70% PSR) prevents optical verification")

            status = "Recommended" if idx == 0 and not is_critical else ("Safe" if safety_score >= 68 and not is_critical else ("Moderate" if safety_score >= 45 and not is_critical else "Hazardous"))

            fine_results.append({
                "zone_id": letter,
                "name": f"Zone {letter}",
                "center": [cx, cy],
                "center_norm": [round(cx / w, 3), round(cy / h, 3)],
                "radius": radius,
                "safety_score": safety_score,
                "risk_score": round(composite_risk * 100.0, 1),
                "confidence_interval": confidence_interval,
                "confidence_pct": confidence_pct,
                "score_lower": max(0.0, round(safety_score - confidence_interval, 1)),
                "score_upper": min(100.0, round(safety_score + confidence_interval, 1)),
                "status": status,
                "is_critical": is_critical,
                "violations": violation_reasons,
                "metrics": {
                    "mean_slope_deg": round(mean_slope, 1),
                    "max_slope_deg": round(peak_slope, 1),
                    "roughness_tri": round(mean_tri, 2),
                    "boulder_count": zone_boulders,
                    "crater_count": zone_craters,
                    "shadow_fraction_pct": round(zone_shadow_ratio * 100.0, 1),
                    "thermal_risk": round(mean_therm, 2),
                    "fuel_cost_norm": round(fuel_cost, 2),
                    "science_value": round(science_score, 2),
                    "spatial_uncertainty": round(mean_unc, 3),
                },
                "breakdown": {
                    "optical_risk_pct": round(opt_hazard * 100.0, 1),
                    "slope_risk_pct": round(slope_hazard * 100.0, 1),
                    "roughness_risk_pct": round(rough_hazard * 100.0, 1),
                    "thermal_risk_pct": round(mean_therm * 100.0, 1),
                    "fuel_penalty_pct": round(fuel_cost * 100.0, 1),
                }
            })

        fine_results.sort(key=lambda z: (not z["is_critical"], z["safety_score"]), reverse=True)

        for i, z in enumerate(fine_results):
            z["rank"] = i + 1
            if i == 0 and not z["is_critical"] and z["safety_score"] >= 45:
                z["status"] = "Recommended"

        return fine_results

    def generate_plain_language_rationale(
        self,
        top_zone: Optional[Dict[str, Any]],
        all_zones: List[Dict[str, Any]],
        degradation_flags: List[str],
        abort_recommended: bool,
    ) -> Dict[str, Any]:
        """
        Synthesizes plain-language engineering rationale.
        """
        if abort_recommended or not top_zone or top_zone["is_critical"] or top_zone["safety_score"] < 45:
            reasons = []
            for z in all_zones[:3]:
                if z["violations"]:
                    reasons.append(f"{z['name']}: {', '.join(z['violations'])}")
                else:
                    reasons.append(f"{z['name']}: Safety score {z['safety_score']}/100 below 45.0 threshold")

            return {
                "decision": "MISSION ABORT / HOLDING ORBIT RECOMMENDED",
                "summary": "No candidate landing zone satisfies the minimum safety threshold. Autonomous landing is NOT cleared.",
                "key_factors": [
                    "All candidate zones exhibit excessive slope tipping risk or boulder obstacle clusters.",
                    "High sensor uncertainty prevents confident terrain hazard verification.",
                ],
                "detailed_rationale": (
                    f"Safety analysis scanned {len(all_zones)} candidate zones across the target area. "
                    f"Every candidate failed mission safety criteria:\n• " + "\n• ".join(reasons) + "\n"
                    "Lander flight computer should execute holding orbit maneuver and request secondary target coordinates."
                ),
                "sensor_flags": degradation_flags,
            }

        m = top_zone["metrics"]
        zone_name = top_zone["name"]
        score = top_zone["safety_score"]
        ci = top_zone["confidence_interval"]

        factors = []
        if m["mean_slope_deg"] <= 5.0:
            factors.append(f"Optimal terrain grade: Mean slope is {m['mean_slope_deg']}° (well within 8.5° tipping limit).")
        else:
            factors.append(f"Manageable terrain grade: Mean slope is {m['mean_slope_deg']}°.")

        if m["boulder_count"] == 0 and m["crater_count"] == 0:
            factors.append("Clear landing field: Zero surface boulders or crater rims detected inside landing ellipse.")
        else:
            factors.append(f"Low obstacle density: {m['boulder_count']} boulders and {m['crater_count']} craters inside landing ellipse.")

        if m["shadow_fraction_pct"] > 15.0:
            factors.append(f"Partial shadow: {m['shadow_fraction_pct']}% shadow coverage expands confidence band to ±{ci}%.")
        else:
            factors.append(f"Clear illumination: Low shadow coverage ({m['shadow_fraction_pct']}%) provides high optical confidence.")

        alt_zones = [z for z in all_zones if z["zone_id"] != top_zone["zone_id"]]
        alt_summary = []
        for alt in alt_zones[:2]:
            diff = score - alt["safety_score"]
            alt_summary.append(f"{alt['name']} (Safety: {alt['safety_score']}/100, -{diff:.1f} pts due to {alt['breakdown']['slope_risk_pct']}% slope risk)")

        detailed = (
            f"{zone_name} is ranked #1 as the primary landing site with a Composite Safety Score of {score}/100 (Confidence Band: {score} ± {ci}%). "
            f"Key strengths: Terrain slope ({m['mean_slope_deg']}° avg, {m['max_slope_deg']}° peak) satisfies lander structural stability. "
            f"Optical hazard density is low ({m['boulder_count']} boulders). "
        )
        if degradation_flags:
            detailed += f"Note: Sensor degradation is active ({'; '.join(degradation_flags)}), which expanded the uncertainty interval by +{top_zone['confidence_interval']}%."
        if alt_summary:
            detailed += f" Alternative sites evaluated: {'; '.join(alt_summary)}."

        return {
            "decision": f"LANDING GO: {zone_name} Selected as Primary Landing Site",
            "summary": f"{zone_name} offers the lowest combined hazard risk ({top_zone['risk_score']}/100) with a {top_zone['confidence_pct']}% AI confidence rating.",
            "key_factors": factors,
            "detailed_rationale": detailed,
            "sensor_flags": degradation_flags,
        }

    def run_full_pipeline(
        self,
        optical_image_bgr: np.ndarray,
        dem_grid: np.ndarray,
        thermal_grid: np.ndarray,
        yolo_detector: Any,
        dem_processor: Any,
        thermal_processor: Any,
        sensor_health: Optional[Dict[str, str]] = None,
        custom_weights: Optional[Dict[str, float]] = None,
        target_center: tuple = (0.5, 0.5),
        science_map: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end multi-sensor landing site selection pipeline.
        """
        start_time = time.perf_counter()

        sensor_health = sensor_health or {"optical": "healthy", "dem": "healthy", "thermal": "healthy"}
        opt_health = sensor_health.get("optical", "healthy")
        dem_health = sensor_health.get("dem", "healthy")
        therm_health = sensor_health.get("thermal", "healthy")

        weights = custom_weights or self.weights
        reweighted, degradation_flags, base_penalty = self.apply_sensor_health_reweighting(
            weights, opt_health, dem_health, therm_health
        )

        h, w = dem_grid.shape[:2]

        # 1. Perception Layer (Optical / YOLO)
        t_opt_0 = time.perf_counter()
        yolo_result = yolo_detector.detect_hazards(optical_image_bgr, optical_health=opt_health)
        t_opt = (time.perf_counter() - t_opt_0) * 1000.0

        # 2. Elevation Analysis Layer (DEM)
        t_dem_0 = time.perf_counter()
        dem_result = dem_processor.analyze_region(dem_grid)
        t_dem = (time.perf_counter() - t_dem_0) * 1000.0

        # 3. Thermal Analysis Layer
        t_therm_0 = time.perf_counter()
        thermal_result = thermal_processor.analyze_region(thermal_grid)
        t_therm = (time.perf_counter() - t_therm_0) * 1000.0

        # 4. Uncertainty Quantification Map
        uncertainty_map = self.compute_spatial_uncertainty_map(
            h, w,
            yolo_result.get("lighting", {}),
            yolo_result,
            base_penalty,
            dem_health,
            therm_health,
        )

        # 5. Coarse Global Sweep
        t_coarse_0 = time.perf_counter()
        coarse_candidates = self.coarse_global_sweep(
            h, w,
            yolo_result["hazard_density_map"],
            dem_result["slope_hazard"],
            dem_result["roughness_hazard"],
            thermal_result["thermal_risk"],
            reweighted,
            target_center=target_center,
            grid_divisions=8,
        )
        t_coarse = (time.perf_counter() - t_coarse_0) * 1000.0

        # 6. Fine-Grained Candidate Scoring
        t_fine_0 = time.perf_counter()
        candidate_zones = self.fine_grained_scoring(
            coarse_candidates,
            dem_result,
            yolo_result,
            thermal_result,
            uncertainty_map,
            reweighted,
            max_safe_slope_deg=dem_processor.max_safe_slope_deg,
            science_interest_map=science_map,
        )
        t_fine = (time.perf_counter() - t_fine_0) * 1000.0

        total_latency_ms = (time.perf_counter() - start_time) * 1000.0

        # 7. Decision Check & Abort Logic
        top_zone = candidate_zones[0] if candidate_zones else None
        abort_recommended = bool(
            not top_zone or
            top_zone["is_critical"] or
            top_zone["safety_score"] < 45.0 or
            top_zone["confidence_pct"] < 25.0
        )

        # 8. Plain-Language Rationale Generator
        rationale = self.generate_plain_language_rationale(
            top_zone, candidate_zones, degradation_flags, abort_recommended
        )

        # 9. Audit Trail Record
        audit_entry = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "sensor_health": sensor_health,
            "applied_weights": reweighted,
            "top_zone": top_zone["name"] if top_zone and not abort_recommended else "ABORT",
            "safety_score": top_zone["safety_score"] if top_zone and not abort_recommended else 0.0,
            "confidence_band": f"±{top_zone['confidence_interval']}%" if top_zone and not abort_recommended else "±0%",
            "decision": rationale["decision"],
            "total_latency_ms": round(total_latency_ms, 2),
        }
        self.audit_log.append(audit_entry)

        area_km2 = round((h * dem_processor.resolution * w * dem_processor.resolution) / 1e6, 3)

        return {
            "success": True,
            "recommended_zone": top_zone if not abort_recommended else None,
            "abort_recommended": abort_recommended,
            "candidate_zones": candidate_zones,
            "coarse_count": len(coarse_candidates),
            "fine_count": len(candidate_zones),
            "rationale": rationale,
            "weights_applied": reweighted,
            "sensor_health": sensor_health,
            "degradation_flags": degradation_flags,
            "telemetry": {
                "total_latency_ms": round(total_latency_ms, 2),
                "optical_latency_ms": round(t_opt, 2),
                "dem_latency_ms": round(t_dem, 2),
                "thermal_latency_ms": round(t_therm, 2),
                "coarse_sweep_latency_ms": round(t_coarse, 2),
                "fine_scoring_latency_ms": round(t_fine, 2),
                "scanned_area_km2": area_km2,
                "throughput_km2_per_sec": round(area_km2 / max(0.001, total_latency_ms / 1000.0), 2),
                "boulder_count_total": yolo_result["boulder_count"],
                "crater_count_total": yolo_result["crater_count"],
                "mean_slope_deg": dem_result["mean_slope"],
                "max_slope_deg": dem_result["max_slope"],
                "mean_temp_k": thermal_result["mean_temp_k"],
            },
            "audit_log_tail": self.audit_log[-10:],
            "_maps": {
                "slope_deg": dem_result["slope_map"],
                "tri_roughness": dem_result["tri_map"],
                "hazard_density": yolo_result["hazard_density_map"],
                "thermal_risk": thermal_result["thermal_risk"],
                "spatial_uncertainty": uncertainty_map,
                "shadow_mask": yolo_result.get("lighting", {}).get("shadow_mask"),
                "detections": yolo_result.get("detections", []),
            }
        }
