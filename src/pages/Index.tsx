import Layout from "@/components/layout/Layout";
import { HorseList } from "@/components/horses/HorseList";

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
    </Layout>
  );
};

export default Index;