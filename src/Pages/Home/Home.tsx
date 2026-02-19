import { FeaturesSection } from "@/sections/features/FeaturesSection"
import { HeroSection } from "@/sections/hero/HeroSection"

function Home() {

  return (
    <div className="flex flex-col mt-10 min-h-screen">
      <HeroSection />
      <FeaturesSection />
    </div>
  )
}

export default Home