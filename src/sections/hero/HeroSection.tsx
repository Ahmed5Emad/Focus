import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex my-16 self-stretch flex-col items-center px-32">
      <div className="flex mb-4 flex-col w-1/2 items-center justify-center gap-2">
        <h1 className="text-7xl md:text-8xl -tracking-wide text-center font-black">
          One App to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cu-purple via-cu-pink to-cu-orange pb-2">Replace Them All.</span>
        </h1>
        <p className="text-center mt-8 text-gray-500 text-xl max-w-2xl">
         All your work in one place: Tasks, Docs, Chat, Goals, & more. <br />
         A vibrant workspace designed for high-performing teams who value speed and clarity.
        </p>
        <div className="flex mt-10 mb-12 gap-4">
          <Button
            size="lg"
            className="shadow-xl bg-cu-purple hover:bg-cu-purple/90 text-white px-8 h-14 font-bold text-lg rounded-xl"
            onClick={() => navigate("/signup")}
          >
            Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="shadow-sm px-8 h-14 font-bold text-lg rounded-xl border-2 hover:bg-gray-50"
          >
            View Features
          </Button>
        </div>
      </div>
      <div className="flex flex-col max-w-7xl w-full items-center content-start">
        <div className="flex flex-col self-stretch content-start w-full rounded-2xl h-[600px] gap-2 border border-gray-200 bg-white shadow-2xl overflow-hidden relative">
          {/* Faux App Header */}
          <div className="h-14 border-b border-gray-100 flex items-center px-6 gap-4 bg-gray-50/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-cu-red"></div>
              <div className="w-3 h-3 rounded-full bg-cu-yellow"></div>
              <div className="w-3 h-3 rounded-full bg-cu-green"></div>
            </div>
            <div className="h-8 w-64 bg-white border border-gray-200 rounded-md shadow-sm ml-4"></div>
          </div>
          {/* Faux Sidebar and Content */}
          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 border-r border-gray-100 bg-gray-50/30 p-4 flex flex-col gap-3">
              <div className="h-8 w-full bg-cu-purple/10 rounded-md"></div>
              <div className="h-6 w-3/4 bg-gray-200/50 rounded-md mt-4"></div>
              <div className="h-6 w-1/2 bg-gray-200/50 rounded-md"></div>
              <div className="h-6 w-5/6 bg-gray-200/50 rounded-md"></div>
            </div>
            <div className="flex-1 p-8 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                 <div className="h-10 w-1/3 bg-gray-200 rounded-lg"></div>
                 <div className="h-10 w-32 bg-cu-purple rounded-lg shadow-md"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-32 flex-1 bg-white border-t-4 border-cu-green rounded-xl shadow-sm border border-gray-100 p-4"></div>
                <div className="h-32 flex-1 bg-white border-t-4 border-cu-blue rounded-xl shadow-sm border border-gray-100 p-4"></div>
                <div className="h-32 flex-1 bg-white border-t-4 border-cu-orange rounded-xl shadow-sm border border-gray-100 p-4"></div>
              </div>
              <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col">
                <div className="h-12 border-b border-gray-50 flex items-center px-4 gap-4">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <div className="h-12 w-full bg-gray-50 rounded-lg border border-gray-100 flex items-center px-4 gap-4">
                    <div className="h-4 w-4 bg-cu-purple rounded-sm"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-cu-pink/20 rounded-full ml-auto"></div>
                  </div>
                  <div className="h-12 w-full bg-gray-50 rounded-lg border border-gray-100 flex items-center px-4 gap-4">
                    <div className="h-4 w-4 bg-cu-blue rounded-sm"></div>
                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-cu-yellow/40 rounded-full ml-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
