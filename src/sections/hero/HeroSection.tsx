import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex my-16 self-stretch flex-col items-center px-32">
      <div className="flex mb-4 flex-col w-1/2 items-center justify-center gap-2">
        <h1 className="text-8xl -tracking-wide text-center  font-black  ">
          Focus on work. <br />
          <p className="text-gray-400 -tracking-tight">Not on the app.</p>
        </h1>
        <p className="text-center mt-8 text-gray-500 " >
         A brutalist, distraction-free workspace designed for high-performance ,<br />
teams who value speed over decoration.
        </p>
        <div className="flex my-10 gap-2">
          <Button
            size="lg"
            className="shadow-2xl  px-8 font-bold text-1xl"
            onClick={() => navigate("/signup")}
          >
            Get Started Free <ArrowRight />
          </Button>
          <Button
          size="lg"
          variant="outline"
          className="shadow-2xl px-8"
          >
            View Documentation
          </Button>
        </div>
      </div>
      <div className="flex flex-col max-w-7xl w-7xl items-center content-start">
        <div className="flex flex-col self-stretch content-start max-w-7xl rounded-md h-270 gap-2 border shadow-xl"></div>
    </div>
      </div>
      
  );
}
