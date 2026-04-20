import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ML_BASE  = import.meta.env.VITE_ML_URL  || "http://localhost:5001";

const api = axios.create({ baseURL: API_BASE, timeout: 20000 });
const mlApi = axios.create({ baseURL: ML_BASE, timeout: 30000 });

/* ── Crime Data ─────────────────────────────────────────────── */
export const fetchCrimes = (params = {}) =>
  api.get("/crimes", { params }).then((r) => r.data);

export const fetchOverview = (params = {}) =>
  api.get("/overview", { params }).then((r) => r.data);

export const fetchStates = (params = {}) =>
  api.get("/states", { params }).then((r) => r.data);

export const fetchTrends = (params = {}) =>
  api.get("/trends", { params }).then((r) => r.data);

export const fetchWomenSafety = (params = {}) =>
  api.get("/women", { params }).then((r) => r.data);

export const fetchFilters = () =>
  api.get("/filters").then((r) => r.data);

/* ── Predictions ────────────────────────────────────────────── */
export const postPredict = (body) =>
  api.post("/predict", body).then((r) => r.data);

export const postForecast = (body) =>
  api.post("/predict/forecast", body).then((r) => r.data);

export const fetchModelMetrics = () =>
  api.get("/predict/metrics").then((r) => r.data);

/* ── ML Health ──────────────────────────────────────────────── */
export const fetchMLHealth = () =>
  mlApi.get("/health").then((r) => r.data);
