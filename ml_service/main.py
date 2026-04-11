"""
AINN SLA - ML Microservice (FastAPI + NumPy)
==============================================
Serves the custom NumPy-native neural network.

Endpoints:
  GET  /health        - liveness + model status
  POST /predict-all   - candidate vs all jobs (Batched)
"""

import os
import json
import time
import numpy as np
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- GLOBALS & NEURAL NETWORK CLASS ---
class NumPyInferenceNN:
    def __init__(self, weights_path, layers):
        self.layers = layers
        self.params = np.load(weights_path)
        print(f"[NumPy] Loaded weights: {list(self.params.keys())}")

    def relu(self, Z): return np.maximum(0, Z)
    def sigmoid(self, Z): return 1 / (1 + np.exp(-np.clip(Z, -500, 500)))

    def predict(self, X):
        # X shape: (InputSize, NumSamples)
        A = X
        for i in range(1, len(self.layers)):
            W = self.params[f'W{i}']
            b = self.params[f'b{i}']
            Z = np.dot(W, A) + b
            if i == len(self.layers) - 1:
                A = self.sigmoid(Z)
            else:
                A = self.relu(Z)
        return A

# --- APP SETUP ---
app = FastAPI(title="AINN SLA - Custom NumPy ML Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MODEL = None
SKILLS_VOCAB = []

@app.on_event("startup")
async def startup():
    global MODEL, SKILLS_VOCAB
    meta_path = "model/metadata.json"
    weights_path = "model/resume_matcher_weights.npz"
    
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            meta = json.load(f)
            SKILLS_VOCAB = meta["vocab"]
    
    if os.path.exists(weights_path):
        # Infer layers from weights
        layers = [len(SKILLS_VOCAB) * 2, 256, 128, 64, 1]
        MODEL = NumPyInferenceNN(weights_path, layers)
        print("NumPy Inference Model Ready.")

# --- UTILS ---
def normalize(skill: str) -> str:
    return (skill.lower().replace(" ", "").replace(".", "").replace("-", "")
            .replace("/", "").replace("_", "").replace("+", ""))

def skill_to_vector(skills: List[str]) -> np.ndarray:
    vec = np.zeros((len(SKILLS_VOCAB), 1), dtype=np.float32)
    norms = [normalize(s) for s in skills]
    for i, v in enumerate(SKILLS_VOCAB):
        if v in norms: vec[i] = 1.0
    return vec

# --- SCHEMAS ---
class JobInput(BaseModel):
    id: str
    title: str
    requiredSkills: List[str]

class PredictAllRequest(BaseModel):
    candidate_skills: List[str]
    jobs: List[JobInput]

# --- ROUTES ---
@app.get("/health")
def health():
    return {
        "status": "ok", 
        "engine": "numpy_native", 
        "model_loaded": MODEL is not None,
        "vocab_size": len(SKILLS_VOCAB)
    }

@app.post("/predict-all")
def predict_all(req: PredictAllRequest):
    t0 = time.time()
    if not MODEL: raise HTTPException(status_code=503, detail="Model not loaded")
    
    cv = skill_to_vector(req.candidate_skills).flatten()
    
    inputs = []
    for job in req.jobs:
        jv = skill_to_vector(job.requiredSkills).flatten()
        inputs.append(np.concatenate([cv, jv]))
    
    X = np.array(inputs).T # Shape: (InputSize, NumJobs)
    scores = MODEL.predict(X).flatten()
    
    results = [
        {"id": req.jobs[i].id, "title": req.jobs[i].title, "score": float(scores[i]), "scoring_method": "neural_network"}
        for i in range(len(req.jobs))
    ]
    
    results.sort(key=lambda r: r["score"], reverse=True)
    return {
        "results": results,
        "latency_ms": round((time.time() - t0) * 1000, 2),
        "scoring_method": "neural_network"
    }
