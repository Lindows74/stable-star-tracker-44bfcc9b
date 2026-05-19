import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import HorseSearch from "./pages/HorseSearch";
import LiveEvents from "./pages/LiveEvents";
import BreedingSuggestions from "./pages/BreedingSuggestions";
import NotFound from "./pages/NotFound";

console.log('App.tsx: Component loading...');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache horse data so returning to the app (e.g. after switching apps on mobile)
      // shows results instantly instead of refetching from scratch.
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

// Use Vite base path so routing always matches the deployed repo path
const basename = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");

const App = () => {
  console.log('App.tsx: App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={basename}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<HorseSearch />} />
              <Route path="/breeding" element={<LiveEvents />} />
              <Route path="/pairs" element={<BreedingSuggestions />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

console.log('App.tsx: App component defined');

export default App;