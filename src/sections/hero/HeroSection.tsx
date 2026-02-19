import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import './HeroSection.css';
import { ButtonGroup } from "@/components/ui/ButtonGroup";


export function HeroSection() {
  return (
    <div className="flex mb-4 flex-col justify-center gap-2">
      <h1 className="text-4xl font-bold ">
        Software to <br />
        replace all software
      </h1>
      <p>
        <ul className="flex gap-2 font-semibold">
          {" "}
          <CheckIcon className="text-blue-500 " /> Save money.{" "}
          <p className="font-normal">
            All Apps, AI, Projects, Chat + 20 more.
          </p>{" "}
        </ul>
        <ul className="flex gap-2 font-semibold">
          {" "}
          <CheckIcon className="text-blue-500 " />
          Save time.{" "}
          <p className="font-normal">
            All humans working together with perfect context.
          </p>
        </ul>
        <ul className="flex gap-2 font-semibold">
          {" "}
          <CheckIcon className="text-blue-500 " />
          Create infinite productivity.{" "}
          <p className="font-normal">AI Agents & Workflows.</p>{" "}
        </ul>
      </p>
      <div className="flex my-6 gap-2">
        <Button size="lg" className="w-1/2 shadow-2xl font-bold text-1xl">
          Get Started
        </Button> 
        <p className="font-light text-gray-500 text-sm">free forever<br/> no credit card.</p>
      </div>
      <p className="newfont font-medium text-[14px]">Get 400% more done • Customize your workspace</p>
      <ButtonGroup></ButtonGroup>

    </div>
  );
}
