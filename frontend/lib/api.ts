import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface VitalsInput {
  heart_rate_mean: number;
  heart_rate_std: number;
  heart_rate_min: number;
  heart_rate_max: number;
  spo2_mean: number;
  spo2_std: number;
  spo2_min: number;
  spo2_max: number;
  bp_systolic_mean: number;
  bp_systolic_std: number;
  bp_systolic_min: number;
  bp_systolic_max: number;
  bp_diastolic_mean: number;
  bp_diastolic_std: number;
  bp_diastolic_min: number;
  bp_diastolic_max: number;
  respiratory_rate_mean: number;
  respiratory_rate_std: number;
  respiratory_rate_min: number;
  respiratory_rate_max: number;
}

export interface PredictionResult {
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  top_factors: { feature: string; impact: number }[];
}

export async function predictRisk(vitals: VitalsInput): Promise<PredictionResult> {
  const response = await axios.post(`${API_BASE}/predict`, vitals);
  return response.data;
}
