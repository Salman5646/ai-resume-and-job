import { NextRequest, NextResponse } from "next/server";
import { jobCatalog } from "@/lib/jobs";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/nn-match
 *
 * Sends candidate skills to the Python ML microservice and returns
 * neural-network similarity scores for every job in the catalog.
 *
 * Request  : { skills: string[] }
 * Response : { results: [{ id, title, score, scoring_method }], latency_ms, scoring_method }
 */
export async function POST(req: NextRequest) {
    try {
        const { skills } = await req.json();

        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return NextResponse.json(
                { error: "skills array is required" },
                { status: 400 }
            );
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);

        const mlRes = await fetch(`${ML_SERVICE_URL}/predict-all`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                candidate_skills: skills,
                jobs: jobCatalog.map((j) => ({
                    id: j.id,
                    title: j.title,
                    requiredSkills: j.requiredSkills,
                })),
            }),
            signal: controller.signal,
        }).finally(() => clearTimeout(timeout));

        if (!mlRes.ok) {
            const err = await mlRes.text();
            throw new Error(`ML service returned ${mlRes.status}: ${err}`);
        }

        const data = await mlRes.json();

        return NextResponse.json(data);
    } catch (error: any) {
        const msg = error?.name === "AbortError"
            ? "ML service timed out (>10s)"
            : error.message || "Failed to contact ML service";

        console.error("[nn-match] ❌", msg);
        return NextResponse.json({ error: msg }, { status: 503 });
    }
}

/** Health-check proxy — GET /api/nn-match */
export async function GET() {
    try {
        const res = await fetch(`${ML_SERVICE_URL}/health`, {
            signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined,
        } as any);
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { status: "unreachable", model_loaded: false },
            { status: 503 }
        );
    }
}
