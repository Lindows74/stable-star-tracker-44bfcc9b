import Layout from "@/components/layout/Layout";
import { HorseList } from "@/components/horses/HorseList";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-4 md:space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">My Horses</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your horse collection and track their stats and traits.
          </p>
        </div>

        <div className="bg-card rounded-lg border p-3 md:p-6">
          <HorseList />
        </div>
      </div>

      <Button
        variant="default"
        size="icon"
        className="fixed bottom-32 right-4 z-[110] rounded-full shadow-xl"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </Layout>
  );
};

export default Index;