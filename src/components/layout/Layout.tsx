import { ReactNode } from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-3 py-4 md:px-4 md:py-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;