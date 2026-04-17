import { Button } from "@/components/ui/button";
import logo from "../../assets/logo.svg";
import { Globe, SquareTerminal } from "lucide-react";

interface FooterColumnProps {
  title: string;
  links: string[];
}

const icons = [Globe, SquareTerminal];

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-semibold mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="
                text-gray-600
                hover:text-black
                focus:outline-none focus:ring-2 focus:ring-black rounded
                transition
              "
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FinalCTA() {
  return (
    <section className="bg-slate-950 text-white" aria-labelledby="cta-heading">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
        <div className="max-w-xl">
          <h2 id="cta-heading" className="text-4xl md:text-5xl font-black mb-4">
            Ready to reclaim your focus?
          </h2>
          <p className="text-slate-300 text-lg">
            Join thousands of high-performing teams who have switched to a
            more productive, colorful way of working.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="
              bg-cu-purple text-white px-8 py-4 rounded-xl font-bold
              hover:bg-cu-purple/90 shadow-lg shadow-cu-purple/20
              focus:outline-none focus:ring-2 focus:ring-cu-purple focus:ring-offset-2 focus:ring-offset-slate-950
              transition
            "
            aria-label="Get started for free"
          >
            Get Started Free
          </button>

          <button
            className="
              border-2 border-slate-700 px-8 py-4 rounded-xl font-bold
              hover:bg-slate-800 text-white
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950
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

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      {/* CTA Section */}
      <FinalCTA />

      {/* Main Footer Content */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <nav
            className="grid grid-cols-1 md:grid-cols-5 gap-10"
            aria-label="Footer navigation"
          >
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6 font-bold text-lg">
                <img src={logo} alt="logo" className="w-10" /> FOCUS
              </div>
              <p className="text-gray-600 max-w-sm">
                Built for high-performance teams and focused individuals who
                demand the best from their tools.
              </p>
            </div>

            <FooterColumn
              title="Product"
              links={["Features", "Security", "Desktop App", "Changelog"]}
            />

            <FooterColumn
              title="Support"
              links={["Help Center", "API Docs", "Status", "Community"]}
            />

            <FooterColumn
              title="Company"
              links={[
                "About Us",
                "Privacy Policy",
                "Terms of Service",
                "Contact",
              ]}
            />
          </nav>

          <div className="border-t mt-16 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <p>© {currentYear} Focus Technology Group. All rights reserved.</p>

            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="gap-2 flex flex-row">
                {icons.map((Icon, index) => (
                  <Button key={index} size={"lg"} className="h-10 w-10">
                    <Icon className="text-2xl" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

export default Footer;
