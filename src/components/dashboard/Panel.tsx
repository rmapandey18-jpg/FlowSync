import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelProps = {
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
};

const Panel = ({ title, subtitle, badge, className, headerExtra, children }: PanelProps) => {
  return (
    <section className={cn("panel-shell", className)}>
      {(title || subtitle || badge || headerExtra) && (
        <header className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="space-y-1">
            {badge ? <span className="section-kicker">{badge}</span> : null}
            {title ? <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2> : null}
            {subtitle ? <p className="max-w-2xl text-sm text-slate-300">{subtitle}</p> : null}
          </div>
          {headerExtra ? <div className="shrink-0">{headerExtra}</div> : null}
        </header>
      )}
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
};

export default Panel;
