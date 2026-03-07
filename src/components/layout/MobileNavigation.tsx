import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  onAddHorse: () => void;
}

export const MobileNavigation = ({ onAddHorse }: MobileNavigationProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/search", label: "Search", icon: Search },
    { path: "/breeding", label: "Events", icon: Heart },
  ];

  const allNavItems = navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden safe-bottom">
      <div className="grid grid-cols-4 h-16">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onAddHorse}
          className="flex flex-col items-center justify-center gap-1 text-xs text-primary font-medium hover:bg-accent transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add</span>
        </button>
      </div>
    </nav>
  );
};
