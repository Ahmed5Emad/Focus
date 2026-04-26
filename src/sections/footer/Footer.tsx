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

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      {/* Main Footer Content */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <nav
            className="grid grid-cols-1 md:grid-cols-5 gap-10"
            aria-label="Footer navigation"
          >
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6 font-bold text-lg">
                <img src={logo} alt="logo" className="w-10" /> Focus
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
              <div className="gap-6 flex flex-row items-center">
                {icons.map((Icon, index) => (
                  <a key={index} href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
                    <Icon className="w-6 h-6" />
                    <span className="sr-only">Social Link</span>
                  </a>
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
