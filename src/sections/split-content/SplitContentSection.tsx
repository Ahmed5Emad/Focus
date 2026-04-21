import { Button } from "@/components/ui/button";

export function SplitContentSection() {
  return (
    <section className="bg-black py-24 px-6 md:px-12 w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex flex-col gap-6 max-w-xl">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to reclaim your <br />
            focus?
          </h2>
          <p className="text-lg text-white opacity-80 leading-relaxed">
            Join thousands of high-performing teams who have switched to a <br />
            calmer way of working.
          </p>
        </div>
        <div className="flex gap-4">
          <Button className="h-14 px-8 rounded-sm font-bold bg-white text-black hover:bg-gray-200">
            Get Started Free
          </Button>
          <Button variant="outline" className="h-14 px-8 rounded-sm font-bold border-2 border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent">
            Talk to Sales
          </Button>
        </div>
      </div>
    </section>
  );
}
