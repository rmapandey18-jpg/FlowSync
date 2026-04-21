import { useEffect } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import NetworkMapPanel from "@/components/dashboard/NetworkMapPanel";
import OperationsPanel from "@/components/dashboard/OperationsPanel";
import OverviewHero from "@/components/dashboard/OverviewHero";
import PredictionPanel from "@/components/dashboard/PredictionPanel";
import SignalControlPanel from "@/components/dashboard/SignalControlPanel";
import TrafficInsightsPanel from "@/components/dashboard/TrafficInsightsPanel";
import { useTrafficStore } from "@/store/trafficStore";

const Index = () => {
  const tick = useTrafficStore((state) => state.tick);
  const snapshot = useTrafficStore((state) => state.currentSnapshot);
  const history = useTrafficStore((state) => state.history);
  const predictions = useTrafficStore((state) => state.predictions);
  const aiAutoControl = useTrafficStore((state) => state.aiAutoControl);
  const selectedIntersection = useTrafficStore((state) => state.selectedIntersection);
  const setAiAutoControl = useTrafficStore((state) => state.setAiAutoControl);
  const selectIntersection = useTrafficStore((state) => state.selectIntersection);
  const toggleSignal = useTrafficStore((state) => state.toggleSignal);

  useEffect(() => {
    for (let index = 0; index < 18; index += 1) tick();

    const interval = setInterval(tick, 2000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(251,146,60,0.12),transparent_24%),linear-gradient(180deg,transparent,rgba(5,10,18,0.58)_72%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
        <DashboardHeader
          snapshot={snapshot}
          aiAutoControl={aiAutoControl}
          nextPrediction={predictions[0]?.predicted}
        />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_420px]">
          <OverviewHero snapshot={snapshot} predictions={predictions} />
          <OperationsPanel snapshot={snapshot} aiAutoControl={aiAutoControl} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_430px]">
          <NetworkMapPanel
            intersections={snapshot.intersections}
            selectedIntersection={selectedIntersection}
            selectIntersection={selectIntersection}
          />
          <SignalControlPanel
            intersections={snapshot.intersections}
            selectedIntersection={selectedIntersection}
            aiAutoControl={aiAutoControl}
            setAiAutoControl={setAiAutoControl}
            selectIntersection={selectIntersection}
            toggleSignal={toggleSignal}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[480px_minmax(0,1fr)]">
          <TrafficInsightsPanel snapshot={snapshot} history={history} />
          <PredictionPanel history={history} predictions={predictions} />
        </section>
      </div>
    </main>
  );
};

export default Index;
