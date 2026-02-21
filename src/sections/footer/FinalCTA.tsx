function FinalCTA() {
  return (
    <section className="bg-black text-white" aria-labelledby="cta-heading">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
        {/* CTA Text */}
        <div className="max-w-xl">
          <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold mb-4">
            Ready to reclaim your focus?
          </h2>
          <p className="text-gray-300 text-lg">
            Join thousands of high-performing teams who have switched to a
            calmer way of working.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="flex gap-4">
          <button
            className="
              bg-white text-black px-6 py-3 rounded-md font-medium
              hover:bg-gray-200
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black
              transition
            "
            aria-label="Get started for free"
          >
            Get Started Free
          </button>

          <button
            className="
              border border-white/30 px-6 py-3 rounded-md font-medium
              hover:bg-white/10
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black
              transition
            "
            aria-label="Talk to sales team"
          >
            Talk to Sales
          </button>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;