import { Outlet, NavLink } from "react-router-dom";
import { Briefcase, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#2BC0E4] to-[#EAECC6] dark:from-[#163A43] dark:to-[#29434A] text-foreground font-inter">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-card/80 backdrop-blur-sm border-r border-border shadow-lg">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Briefcase size={24} />
          </div>
          <h1 className="font-poppins font-bold text-lg tracking-tight">Job Tracker</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/applications" icon={<Briefcase size={20} />} label="Applications" />
          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium",
          isActive 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
