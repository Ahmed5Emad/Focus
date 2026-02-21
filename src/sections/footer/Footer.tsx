import FooterColumn from "./FooterColumn";
import logo from "../../assets/logo.svg";
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Footer Top */}
        <nav
          className="grid grid-cols-1 md:grid-cols-5 gap-10"
          aria-label="Footer navigation"
        >
          {/* Brand Column */}
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

        {/* Footer Bottom */}
        <div className="border-t mt-16 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>© {currentYear} Focus Technology Group. All rights reserved.</p>

          <div className="flex gap-4 mt-4 md:mt-0">
            {["🌐", "👥", "✉️"].map((icon, index) => (
              <button
                key={index}
                className="
                  w-8 h-8 rounded-full border
                  flex items-center justify-center
                  hover:bg-gray-100
                  focus:outline-none focus:ring-2 focus:ring-black
                  transition
                "
                aria-label="Footer action"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Footer;
