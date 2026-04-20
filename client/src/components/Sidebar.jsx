import { NavLink } from "react-router-dom";
import { useFilters } from "../context/FilterContext";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  ShieldAlert, 
  Cpu, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X
} from "lucide-react";

const nav = [
  { to: "/",         label: "Dashboard",       icon: LayoutDashboard },
  { to: "/states",   label: "State Analysis",  icon: Map },
  { to: "/trends",   label: "Crime Trends",    icon: TrendingUp },
  { to: "/women",    label: "Women Safety",    icon: ShieldAlert },
  { to: "/predict",  label: "Prediction",      icon: Cpu },
];

export default function Sidebar() {
  const { darkMode, setDarkMode } = useFilters();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Logo Area */}
      <div className={`flex flex-col gap-1 px-5 pt-8 pb-6 border-b border-[var(--border-subtle)] ${collapsed ? "items-center" : ""}`}>
        {!collapsed ? (
          <div className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight leading-[1.2]">
            Crime Pattern<br/>Prediction System
          </div>
        ) : (
          <div className="p-2 bg-[var(--accent-primary)] rounded-lg">
            <ShieldAlert size={18} className="text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? "sidebar-link-active" : "sidebar-link"
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {!collapsed && <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={`px-3 pb-8 border-t border-[var(--border-subtle)] pt-6 space-y-3 ${collapsed ? "flex flex-col items-center" : ""}`}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn-secondary w-full flex items-center justify-center gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-secondary w-full items-center justify-center gap-3 py-2.5 text-[10px] font-black uppercase tracking-widest hidden lg:flex transition-all"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full z-50 w-72 bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] shadow-2xl transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-6 right-6 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] transition-all duration-300 ${
          collapsed ? "w-[80px]" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
