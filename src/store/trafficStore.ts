import { create } from "zustand";

// --- Types ---

export interface Intersection {
  id: string;
  name: string;
  x: number; // percentage position on map
  y: number;
  signal: "red" | "green" | "yellow";
  vehicles: number;
  congestion: "Low" | "Medium" | "High";
  avgSpeed: number; // km/h
  density: number; // vehicles per km
}

export interface TrafficSnapshot {
  timestamp: string;
  totalVehicles: number;
  avgSpeed: number;
  congestionLevel: "Low" | "Medium" | "High";
  intersections: Intersection[];
}

export interface PredictionPoint {
  time: string;
  actual: number;
  predicted: number;
}

interface TrafficState {
  // Current data
  currentSnapshot: TrafficSnapshot;
  predictions: PredictionPoint[];
  history: PredictionPoint[];
  isLive: boolean;
  aiAutoControl: boolean;
  selectedIntersection: string | null;
  tickCount: number;

  // Actions
  tick: () => void;
  toggleSignal: (intersectionId: string) => void;
  setAiAutoControl: (enabled: boolean) => void;
  selectIntersection: (id: string | null) => void;
}

// --- Simulation helpers ---

/** Generate a realistic vehicle count based on time-of-day pattern */
function generateVehicles(tick: number): number {
  // Simulate rush hour pattern (sine wave with noise)
  const hourOfDay = (tick * 2) % 24; // each tick = ~2 seconds, speed up time
  const rushHourFactor = Math.sin((hourOfDay / 24) * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5;
  const base = 40 + rushHourFactor * 120;
  const noise = (Math.random() - 0.5) * 30;
  return Math.max(5, Math.round(base + noise));
}

function getCongestion(vehicles: number): "Low" | "Medium" | "High" {
  if (vehicles < 60) return "Low";
  if (vehicles < 120) return "Medium";
  return "High";
}

function getAvgSpeed(vehicles: number): number {
  // More vehicles → slower speed
  const base = 60 - (vehicles / 200) * 45;
  return Math.max(5, Math.round(base + (Math.random() - 0.5) * 10));
}

/** Simple Random Forest-like prediction (weighted average of recent + pattern) */
function predictTraffic(history: PredictionPoint[], tickCount: number): number {
  if (history.length < 3) return generateVehicles(tickCount + 5);

  // Use weighted moving average of last 5 points + trend
  const recent = history.slice(-5);
  const weights = [0.1, 0.15, 0.2, 0.25, 0.3];
  let weightedSum = 0;
  let weightTotal = 0;
  recent.forEach((p, i) => {
    const w = weights[Math.max(0, i - (recent.length - weights.length))] || 0.1;
    weightedSum += p.actual * w;
    weightTotal += w;
  });

  const trend = recent.length >= 2
    ? (recent[recent.length - 1].actual - recent[recent.length - 2].actual) * 0.5
    : 0;

  const prediction = weightedSum / weightTotal + trend + (Math.random() - 0.5) * 15;
  return Math.max(5, Math.round(prediction));
}

/** Q-learning inspired signal optimization */
function optimizeSignal(intersection: Intersection): "red" | "green" {
  // Simple rule-based optimization mimicking Q-learning policy
  // High congestion → prefer green to let traffic flow
  // Low congestion → can be red (give other directions priority)
  if (intersection.congestion === "High" && intersection.vehicles > 100) return "green";
  if (intersection.congestion === "Low" && intersection.vehicles < 40) return "red";

  // Medium: use a probabilistic approach (exploration vs exploitation)
  return Math.random() > 0.4 ? "green" : "red";
}

// --- Initial intersections ---
const initialIntersections: Intersection[] = [
  { id: "int-1", name: "Main St & 1st Ave", x: 25, y: 30, signal: "green", vehicles: 45, congestion: "Low", avgSpeed: 42, density: 15 },
  { id: "int-2", name: "Broadway & 5th", x: 55, y: 20, signal: "red", vehicles: 89, congestion: "Medium", avgSpeed: 28, density: 32 },
  { id: "int-3", name: "Park Blvd & Oak", x: 40, y: 55, signal: "green", vehicles: 132, congestion: "High", avgSpeed: 15, density: 48 },
  { id: "int-4", name: "Central & Market", x: 70, y: 45, signal: "green", vehicles: 67, congestion: "Medium", avgSpeed: 35, density: 24 },
  { id: "int-5", name: "River Rd & Elm", x: 20, y: 70, signal: "red", vehicles: 23, congestion: "Low", avgSpeed: 52, density: 8 },
  { id: "int-6", name: "Tech Park Dr", x: 75, y: 75, signal: "green", vehicles: 98, congestion: "Medium", avgSpeed: 22, density: 38 },
];

function formatTime(tick: number): string {
  const h = Math.floor((tick * 2) % 24);
  const m = Math.floor(((tick * 2) % 1) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export const useTrafficStore = create<TrafficState>((set, get) => ({
  currentSnapshot: {
    timestamp: new Date().toISOString(),
    totalVehicles: initialIntersections.reduce((s, i) => s + i.vehicles, 0),
    avgSpeed: Math.round(initialIntersections.reduce((s, i) => s + i.avgSpeed, 0) / initialIntersections.length),
    congestionLevel: "Medium",
    intersections: initialIntersections,
  },
  predictions: [],
  history: [],
  isLive: true,
  aiAutoControl: false,
  selectedIntersection: null,
  tickCount: 0,

  tick: () => {
    const state = get();
    const newTick = state.tickCount + 1;

    // Update each intersection
    const updatedIntersections = state.currentSnapshot.intersections.map((int) => {
      const vehicles = generateVehicles(newTick + parseInt(int.id.split("-")[1]) * 7);
      const congestion = getCongestion(vehicles);
      const avgSpeed = getAvgSpeed(vehicles);
      let signal = int.signal;

      // AI auto-control: use optimization
      if (state.aiAutoControl) {
        signal = optimizeSignal({ ...int, vehicles, congestion, avgSpeed, density: Math.round(vehicles / 3) });
      }

      return { ...int, vehicles, congestion, avgSpeed, density: Math.round(vehicles / 3), signal };
    });

    const totalVehicles = updatedIntersections.reduce((s, i) => s + i.vehicles, 0);
    const avgSpeed = Math.round(updatedIntersections.reduce((s, i) => s + i.avgSpeed, 0) / updatedIntersections.length);
    const congestionLevel = totalVehicles > 500 ? "High" : totalVehicles > 300 ? "Medium" : "Low";

    // Update history
    const timeLabel = formatTime(newTick);
    const newHistoryPoint: PredictionPoint = {
      time: timeLabel,
      actual: totalVehicles,
      predicted: predictTraffic(state.history, newTick),
    };
    const newHistory = [...state.history.slice(-29), newHistoryPoint];

    // Generate future predictions
    const futurePredictions: PredictionPoint[] = [];
    for (let i = 1; i <= 10; i++) {
      futurePredictions.push({
        time: formatTime(newTick + i),
        actual: 0,
        predicted: predictTraffic(newHistory, newTick + i),
      });
    }

    set({
      tickCount: newTick,
      currentSnapshot: {
        timestamp: new Date().toISOString(),
        totalVehicles,
        avgSpeed,
        congestionLevel,
        intersections: updatedIntersections,
      },
      history: newHistory,
      predictions: futurePredictions,
    });
  },

  toggleSignal: (intersectionId) => {
    set((state) => ({
      currentSnapshot: {
        ...state.currentSnapshot,
        intersections: state.currentSnapshot.intersections.map((int) =>
          int.id === intersectionId
            ? { ...int, signal: int.signal === "green" ? "red" : int.signal === "red" ? "green" : int.signal }
            : int
        ),
      },
    }));
  },

  setAiAutoControl: (enabled) => set({ aiAutoControl: enabled }),
  selectIntersection: (id) => set({ selectedIntersection: id }),
}));
