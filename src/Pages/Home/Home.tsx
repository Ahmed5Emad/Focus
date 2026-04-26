import { FeaturesSection } from "@/sections/features/FeaturesSection";
import { HeroSection } from "@/sections/hero/HeroSection";
import Footer from "@/sections/footer/Footer";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";

function Home() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (       
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}

export default Home;
