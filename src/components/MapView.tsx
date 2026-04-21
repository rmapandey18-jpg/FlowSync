import { useTrafficStore } from "@/store/trafficStore";
import { Map, MapPin, Plus, Minus } from "lucide-react";

const MapView = () => {
  const { intersections } = useTrafficStore((s) => s.currentSnapshot);
  const selectedIntersection = useTrafficStore((s) => s.selectedIntersection);
  const selectIntersection = useTrafficStore((s) => s.selectIntersection);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl bg-surface-1 border border-border overflow-hidden shadow-lg">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-surface-1/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Traffic Network Map</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neon-green"></span>
              <span className="text-muted-foreground">Green</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neon-amber"></span>
              <span className="text-muted-foreground">Amber</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neon-red"></span>
              <span className="text-muted-foreground">Red</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 pt-16 opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(217 91% 60%)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Roads */}
      <svg className="absolute inset-0 pt-16 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Horizontal roads */}
        <line x1="5" y1="25" x2="95" y2="25" stroke="hsl(222 30% 25%)" strokeWidth="2" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="hsl(222 30% 25%)" strokeWidth="2" />
        <line x1="5" y1="75" x2="95" y2="75" stroke="hsl(222 30% 25%)" strokeWidth="2" />
        {/* Vertical roads */}
        <line x1="25" y1="5" x2="25" y2="95" stroke="hsl(222 30% 25%)" strokeWidth="2" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="hsl(222 30% 25%)" strokeWidth="2" />
        <line x1="75" y1="5" x2="75" y2="95" stroke="hsl(222 30% 25%)" strokeWidth="2" />
      </svg>

      {/* Intersections */}
      {intersections.map((int) => {
        const isSelected = selectedIntersection === int.id;
        const signalColor =
          int.signal === "green" ? "bg-neon-green" : int.signal === "red" ? "bg-neon-red" : "bg-neon-amber";
        const glowColor =
          int.signal === "green"
            ? "shadow-[0_0_20px_hsl(142_70%_50%/0.8)]"
            : int.signal === "red"
            ? "shadow-[0_0_20px_hsl(0_84%_60%/0.8)]"
            : "shadow-[0_0_20px_hsl(38_92%_55%/0.8)]";

        return (
          <button
            key={int.id}
            onClick={() => selectIntersection(isSelected ? null : int.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group pt-16 ${
              isSelected ? "z-20 scale-125" : "z-10 hover:scale-110"
            }`}
            style={{ left: `${int.x}%`, top: `${int.y}%` }}
          >
            {/* Congestion ring */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                isSelected ? "border-primary glow-blue bg-primary/5" : "border-border bg-surface-2"
              }`}
            >
              <div className={`w-5 h-5 rounded-full ${signalColor} ${glowColor}`} />
            </div>

            {/* Vehicle count badge */}
            <span className="absolute -top-2 -right-2 text-xs font-bold bg-surface-3 border border-border rounded-full w-6 h-6 flex items-center justify-center text-foreground shadow-lg">
              {int.vehicles > 99 ? "99+" : int.vehicles}
            </span>

            {/* Enhanced tooltip */}
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 ${
              isSelected ? "opacity-100" : ""
            }`}>
              <div className="bg-surface-2/95 backdrop-blur-sm border border-border rounded-xl px-4 py-3 shadow-xl">
                <p className="font-semibold text-foreground text-sm">{int.name}</p>
                <div className="flex items-center gap-4 mt-1 text-xs">
                  <span className="text-muted-foreground">{int.vehicles} vehicles</span>
                  <span className="text-muted-foreground">{int.avgSpeed} km/h</span>
                  <span className={`capitalize font-medium ${
                    int.signal === "green" ? "text-neon-green" :
                    int.signal === "red" ? "text-neon-red" : "text-neon-amber"
                  }`}>
                    {int.signal}
                  </span>
                </div>
              </div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface-2/95 mx-auto"></div>
            </div>
          </button>
        );
      })}

      {/* Mini-map overlay */}
      <div className="absolute top-4 right-4 w-32 h-24 bg-surface-1/90 backdrop-blur-sm border border-border rounded-lg overflow-hidden shadow-lg">
        <div className="p-2 text-xs font-medium text-foreground border-b border-border">Overview</div>
        <div className="p-2">
          <svg viewBox="0 0 100 60" className="w-full h-full">
            {/* Mini roads */}
            <line x1="10" y1="20" x2="90" y2="20" stroke="hsl(222 30% 25%)" strokeWidth="1" />
            <line x1="10" y1="40" x2="90" y2="40" stroke="hsl(222 30% 25%)" strokeWidth="1" />
            <line x1="30" y1="5" x2="30" y2="55" stroke="hsl(222 30% 25%)" strokeWidth="1" />
            <line x1="70" y1="5" x2="70" y2="55" stroke="hsl(222 30% 25%)" strokeWidth="1" />
            {/* Mini intersections */}
            {intersections.map((int) => (
              <circle
                key={int.id}
                cx={int.x}
                cy={int.y * 0.6 + 5}
                r="2"
                fill={int.signal === "green" ? "hsl(142 70% 50%)" : int.signal === "red" ? "hsl(0 84% 60%)" : "hsl(38 92% 55%)"}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button className="w-8 h-8 bg-surface-1/90 backdrop-blur-sm border border-border rounded-lg flex items-center justify-center hover:bg-surface-2 transition-colors">
          <Plus className="w-4 h-4 text-foreground" />
        </button>
        <button className="w-8 h-8 bg-surface-1/90 backdrop-blur-sm border border-border rounded-lg flex items-center justify-center hover:bg-surface-2 transition-colors">
          <Minus className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default MapView;
