from __future__ import annotations

import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")
DB_PATH = Path(os.getenv("CRYSTAL_DB_PATH", ROOT / "crystal.db"))


class BirthRecordIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    calendar: Literal["solar", "lunar"]
    year: str
    month: str
    day: str
    hour: str = ""
    minute: str = ""
    unknownTime: bool = False
    gender: Literal["男", "女"]


class AnalysisRequest(BaseModel):
    record_id: str


def connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with connect() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS birth_records (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                calendar TEXT NOT NULL,
                year TEXT NOT NULL,
                month TEXT NOT NULL,
                day TEXT NOT NULL,
                hour TEXT,
                minute TEXT,
                unknown_time INTEGER NOT NULL,
                gender TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS analyses (
                id TEXT PRIMARY KEY,
                record_id TEXT NOT NULL,
                provider TEXT NOT NULL,
                status TEXT NOT NULL,
                payload TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


app = FastAPI(title="水晶定制 API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:3001", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "database": str(DB_PATH)}


@app.post("/v1/records", status_code=201)
def create_record(payload: BirthRecordIn) -> dict:
    record_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    with connect() as connection:
        connection.execute(
            "INSERT INTO birth_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (record_id, payload.name.strip(), payload.calendar, payload.year, payload.month, payload.day, payload.hour, payload.minute, int(payload.unknownTime), payload.gender, now),
        )
    return {"id": record_id, "created_at": now}


@app.get("/v1/admin/records")
def list_records(limit: int = 100) -> list[dict]:
    safe_limit = min(max(limit, 1), 500)
    with connect() as connection:
        rows = connection.execute("SELECT * FROM birth_records ORDER BY created_at DESC LIMIT ?", (safe_limit,)).fetchall()
    return [dict(row) for row in rows]


@app.post("/v1/analyses", status_code=202)
async def create_analysis(payload: AnalysisRequest) -> dict:
    with connect() as connection:
        record = connection.execute("SELECT * FROM birth_records WHERE id = ?", (payload.record_id,)).fetchone()
    if not record:
        raise HTTPException(status_code=404, detail="找不到出生信息记录")

    analysis_id = str(uuid.uuid4())
    api_key = os.getenv("DEEPSEEK_API_KEY", "")
    model = os.getenv("DEEPSEEK_MODEL", "")
    bazi_engine_ready = os.getenv("BAZI_ENGINE_READY", "false").lower() == "true"
    if api_key and model and bazi_engine_ready:
        provider = "deepseek"
        result = await call_deepseek(dict(record), api_key, model)
        status = "completed"
    else:
        provider = "demo"
        status = "demo_pending_bazi_standard"
        result = {
            "notice": "当前为开发演示结果，未作为正式命理解读。",
            "deepseek_blocked_reason": "确定性排盘引擎未标记为就绪，未向 DeepSeek 发送不完整的排盘事实。",
            "required_dimensions": ["八字格局", "日主旺衰", "月令", "五行流通", "生克制化", "调候", "大运", "流年", "喜用神", "喜神", "忌神"],
            "recommendation_policy": "不得采用缺什么补什么的简化规则",
        }
    now = datetime.now(timezone.utc).isoformat()
    with connect() as connection:
        connection.execute("INSERT INTO analyses VALUES (?, ?, ?, ?, ?, ?)", (analysis_id, payload.record_id, provider, status, json.dumps(result, ensure_ascii=False), now))
    return {"id": analysis_id, "provider": provider, "status": status, "result": result}


async def call_deepseek(record: dict, api_key: str, model: str) -> dict:
    prompt = {
        "task": "基于已经由确定性排盘引擎计算并校验的八字事实进行分析，不得自行改写四柱。必须综合分析八字格局、日主旺衰、月令、五行流通、生克制化、调候、大运与当前流年，给出喜用神、喜神、忌神及论证。水晶推荐必须结合水晶五行特性，不得使用缺什么补什么的简化逻辑。",
        "record": record,
        "output": "仅输出 JSON，字段包含 summary, pattern, day_master_strength, month_command, circulation, climate, luck_cycle, favorable_elements, avoid_elements, evidence, crystal_strategy。",
    }
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{os.getenv('DEEPSEEK_BASE_URL', 'https://api.deepseek.com').rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": model, "temperature": 0.2, "response_format": {"type": "json_object"}, "messages": [{"role": "system", "content": "你是命理分析模块。只能基于输入的确定性排盘事实分析。"}, {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)}]},
        )
        response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    return json.loads(content)
