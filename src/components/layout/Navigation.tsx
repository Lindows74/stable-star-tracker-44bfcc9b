import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Search, Heart, Plus, Lock, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MasterKeyDialog } from "@/components/auth/MasterKeyDialog";
import { HorseForm } from "@/components/horses/HorseForm";
import { MobileNavigation } from "./MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const [showForm, setShowForm] = useState(false);
  const [showMasterKeyDialog, setShowMasterKeyDialog] = useState(false);

  const handleAddHorse = () => {
    if (isAuthenticated) {
      setShowForm(true);
    } else {
      setShowMasterKeyDialog(true);
    }
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/search", label: "Search Horses", icon: Search },
    { path: "/breeding", label: "Live Events", icon: Heart },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 md:h-16">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-base md:text-xl">Stable Star</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link to={item.path} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </nav>

            {/* Desktop Add Button */}
            <Button 
              onClick={handleAddHorse} 
              size="sm"
              className="hidden md:flex items-center gap-2"
            >
              {!isAuthenticated && <Lock className="h-3 w-3" />}
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">Add Horse</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col gap-4 mt-8">
                  <h2 className="font-semibold mb-4">Menu</h2>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNavigation onAddHorse={handleAddHorse} />}

      {/* Add Horse Sheet (Mobile) / Dialog (Desktop) */}
      {isMobile ? (
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <div className="pb-20">
              <h2 className="text-lg font-semibold mb-4">Add New Horse</h2>
              <HorseForm onSuccess={() => setShowForm(false)} />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-6">Add New Horse</h2>
              <HorseForm onSuccess={() => setShowForm(false)} />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Master Key Dialog */}
      <MasterKeyDialog
        isOpen={showMasterKeyDialog}
        onClose={() => setShowMasterKeyDialog(false)}
        onSuccess={() => setShowForm(true)}
      />
    </>
  );
};

export default Navigation;