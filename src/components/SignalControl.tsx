import { useTrafficStore } from "@/store/trafficStore";
import { Settings, Cpu, ToggleLeft, ToggleRight } from "lucide-react";

const SignalControl = () => {
  const intersections = useTrafficStore((s) => s.currentSnapshot.intersections);
  const selectedIntersection = useTrafficStore((s) => s.selectedIntersection);
  const toggleSignal = useTrafficStore((s) => s.toggleSignal);
  const aiAutoControl = useTrafficStore((s) => s.aiAutoControl);
  const setAiAutoControl = useTrafficStore((s) => s.setAiAutoControl);

  const selected = intersections.find((i) => i.id === selectedIntersection);

  return (
    <div className="rounded-xl glass-card hover-lift p-6 space-y-6 animate-float border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary animate-pulse-slow" />
          <h3 className="text-lg font-semibold text-foreground tracking-wide holographic">Signal Control</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium neon-border animate-pulse ${
          aiAutoControl
            ? "bg-primary/10 text-primary border border-primary/30"
            : "bg-surface-2 text-muted-foreground border border-border"
        }`}>
          {aiAutoControl ? "AI Active" : "Manual"}
        </div>
      </div>

      {/* AI Auto-Control Toggle */}
      <button
        onClick={() => setAiAutoControl(!aiAutoControl)}
        className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all duration-300 hover-lift hover:scale-[1.02] group ${
          aiAutoControl
            ? "glass-card border-primary/30 glow-blue hover:bg-primary/15 neon-glow-blue"
            : "glass-card border-border hover:border-primary/50 hover:bg-surface-3"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface-2/50 group-hover:bg-primary/10 transition-colors">
            <Cpu className={`w-5 h-5 ${aiAutoControl ? "text-primary animate-spin" : "text-muted-foreground"}`} />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-foreground block group-hover:text-primary transition-colors">AI Auto-Control</span>
            <span className="text-xs text-muted-foreground">Smart traffic optimization</span>
          </div>
        </div>
        {aiAutoControl ? (
          <ToggleRight className="w-6 h-6 text-primary animate-bounce" />
        ) : (
          <ToggleLeft className="w-6 h-6 text-muted-foreground" />
        )}
      </button>

      {/* Selected intersection control */}
      {selected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl glass-card border-0 hover-lift animate-scale-in">
            {/* Signal indicator */}
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 animate-pulse ${
                selected.signal === "green"
                  ? "bg-neon-green/10 border-neon-green/30 neon-glow-green"
                  : selected.signal === "red"
                  ? "bg-neon-red/10 border-neon-red/30 neon-glow-red"
                  : "bg-neon-amber/10 border-neon-amber/30 neon-glow-amber"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full animate-bounce ${
                  selected.signal === "green" ? "bg-neon-green shadow-[0_0_15px_hsl(142_70%_50%/0.6)]"
                  : selected.signal === "red" ? "bg-neon-red shadow-[0_0_15px_hsl(0_84%_60%/0.6)]"
                  : "bg-neon-amber shadow-[0_0_15px_hsl(38_92%_55%/0.6)]"
                }`}
              />
            </div>

            <div className="flex-1">
              <p className="text-lg font-semibold text-foreground capitalize holographic">{selected.signal} Signal</p>
              <p className="text-sm text-muted-foreground">{selected.vehicles} vehicles waiting</p>
              <p className="text-xs text-muted-foreground font-mono">{selected.name}</p>
            </div>

            {!aiAutoControl && (
              <button
                onClick={() => toggleSignal(selected.id)}
                className="px-4 py-2 text-sm font-semibold rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 hover-lift hover:scale-105 neon-border"
              >
                Toggle
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 glass-card border-0 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-surface-2/50 border border-border flex items-center justify-center mx-auto mb-3 animate-float">
            <Settings className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Click an intersection on the map to control its signal
          </p>
        </div>
      )}

      {/* Quick overview of all signals */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground holographic">All Intersections</h4>
        <div className="grid grid-cols-2 gap-3">
          {intersections.map((int) => (
            <button
              key={int.id}
              onClick={() => useTrafficStore.getState().selectIntersection(int.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 hover-lift hover:scale-105 group ${
                selectedIntersection === int.id
                  ? "glass-card border-primary/50 bg-primary/5 shadow-lg neon-glow-blue"
                  : "glass-card border-border hover:border-primary/30 hover:bg-surface-3"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full animate-pulse ${
                  int.signal === "green" ? "bg-neon-green shadow-[0_0_8px_hsl(142_70%_50%/0.5)] neon-glow-green"
                  : int.signal === "red" ? "bg-neon-red shadow-[0_0_8px_hsl(0_84%_60%/0.5)] neon-glow-red"
                  : "bg-neon-amber shadow-[0_0_8px_hsl(38_92%_55%/0.5)] neon-glow-amber"
                }`}
              />
              <span className="text-xs text-foreground font-medium leading-tight text-center group-hover:text-primary transition-colors">{int.name.split("&")[0].trim()}</span>
              <span className="text-[10px] text-muted-foreground">{int.vehicles} vehicles</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignalControl;
