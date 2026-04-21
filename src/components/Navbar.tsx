import { Activity, Zap, Sun, Moon, Settings, Bell, User } from "lucide-react";
import { useTheme } from "next-themes";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-1/95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-4">
        <div className="gradient-primary p-3 rounded-xl shadow-lg">
          <Activity className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            Flow<span className="text-primary text-glow-blue">Sync</span>{" "}
            <span className="text-secondary text-glow-purple">AI</span>
          </span>
          <span className="text-xs text-muted-foreground font-medium">Traffic Intelligence Platform</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          className="p-2 rounded-lg bg-surface-2 border border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 glow-hover animate-gentle-float"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-neon-amber rotate-subtle" />
          ) : (
            <Moon className="w-4 h-4 text-primary" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg bg-surface-2 border border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-red rounded-full border border-surface-1 animate-pulse"></span>
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg bg-surface-2 border border-border hover:border-primary/50 transition-all duration-200 hover:scale-105">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 border border-border hover:border-primary/50 transition-all duration-200 hover:scale-105">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">Admin</span>
        </button>

        <LiveBadge />
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono bg-surface-2 px-3 py-1 rounded-lg">
          <Zap className="w-4 h-4 text-neon-amber" />
          <span>v1.2.0</span>
        </div>
      </div>
    </nav>
  );
};

const LiveBadge = () => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 shadow-sm">
    <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse-neon shadow-neon-green" />
    <span className="text-sm font-semibold text-neon-green tracking-wider">LIVE</span>
  </div>
);

export default Navbar;
