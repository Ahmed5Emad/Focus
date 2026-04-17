import { FeaturesSection } from "@/sections/features/FeaturesSection";
import { HeroSection } from "@/sections/hero/HeroSection";
import Footer from "@/sections/footer/Footer";

function Home() {
  return (       
    <div className="flex flex-col mt-10 min-h-screen bg-">
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
    
  );
}

export default Home;
