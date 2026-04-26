import { FeaturesSection } from "@/sections/features/FeaturesSection";
import { HeroSection } from "@/sections/hero/HeroSection";
import Footer from "@/sections/footer/Footer";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

function Home() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
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
