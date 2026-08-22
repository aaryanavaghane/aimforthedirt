"""
Decision Audit Logger for LUNA-SAFE
Persists flight decisions, applied weights, and sensor degradation logs to an auditable SQLite database.
"""

import os
import sqlite3
import json
import time
from typing import Dict, Any, List, Optional

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "audit.db"))


def init_db():
    """Ensure audit database and table exist."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS decisions (
            id TEXT PRIMARY KEY,
            ts REAL,
            timestamp_str TEXT,
            scenario_id TEXT,
            top_zone TEXT,
            score REAL,
            confidence_band TEXT,
            abort_flag INTEGER,
            payload TEXT
        )
    """)
    conn.commit()
    conn.close()


def log_decision(decision_dict: Dict[str, Any], scenario_id: str = "custom") -> str:
    """
    Persists a flight computer landing decision to SQLite.
    Returns: audit_id
    """
    init_db()
    audit_id = f"AUD-{int(time.time() * 1000) % 1000000:06d}"
    ts = time.time()
    ts_str = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime(ts))

    top_zone = "NONE"
    score = 0.0
    conf_band = "±0%"
    abort_flag = 1 if decision_dict.get("abort_recommended", False) else 0

    if decision_dict.get("recommended_zone"):
        rec = decision_dict["recommended_zone"]
        if hasattr(rec, "name"):
            top_zone = rec.name
            score = float(getattr(rec, "score", 0.0))
            conf_band = f"±{getattr(rec, 'confidence_band_spread', 0.0)}%"
        elif isinstance(rec, dict):
            top_zone = rec.get("name", rec.get("zone_id", "Zone"))
            score = float(rec.get("score", 0.0))
            conf_band = f"±{rec.get('confidence_band_spread', 0.0)}%"

    # Serializer helper for Pydantic objects inside decision_dict
    def json_serial(obj):
        if hasattr(obj, "model_dump"):
            return obj.model_dump()
        if hasattr(obj, "__dict__"):
            return obj.__dict__
        return str(obj)

    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO decisions (id, ts, timestamp_str, scenario_id, top_zone, score, confidence_band, abort_flag, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (audit_id, ts, ts_str, scenario_id, top_zone, score, conf_band, abort_flag, json.dumps(decision_dict, default=json_serial))
    )
    conn.commit()
    conn.close()

    return audit_id


def get_audit_history(limit: int = 25) -> List[Dict[str, Any]]:
    """
    Retrieves recent decision log entries.
    """
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, ts, timestamp_str, scenario_id, top_zone, score, confidence_band, abort_flag, payload FROM decisions ORDER BY ts DESC LIMIT ?",
        (limit,)
    )
    rows = cursor.fetchall()
    conn.close()

    history = []
    for r in rows:
        history.append({
            "id": r[0],
            "ts": r[1],
            "timestamp": r[2],
            "scenario_id": r[3],
            "top_zone": r[4],
            "safety_score": r[5],
            "confidence_band": r[6],
            "abort_flag": bool(r[7]),
            "decision": "MISSION ABORT" if r[7] else f"LANDING GO: {r[4]}",
        })
    return history
