import { FeaturesSection } from "@/sections/features/FeaturesSection";
import { HeroSection } from "@/sections/hero/HeroSection";
import Footer from "@/sections/footer/Footer";
import { Header } from "@/components/layout/Header";

function Home() {
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
