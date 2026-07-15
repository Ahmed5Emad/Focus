import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef } from "react";
import logo from "../../assets/logo.svg";

let pendingHash: string | null = null;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }
  return false;
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (to.includes("#")) {
        const [path, hash] = to.split("#");
        pendingHash = hash;
        navigate(path);
      } else {
        navigate(to);
      }
    },
    [navigate, to]
  );

  return (
    <a href={to} onClick={handleClick} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </a>
  );
}

const footerLinks: Record<string, { name: string; to: string }[]> = {
  Product: [
    { name: "Features", to: "/features" },
    { name: "Dashboard", to: "/features#dashboard" },
    { name: "Focus Timer", to: "/features#focus-timer" },
    { name: "Tasks", to: "/features#tasks" },
  ],
  Resources: [
    { name: "Documents", to: "/features#documents" },
    { name: "Chat", to: "/features#chat" },
    { name: "Workflows", to: "/features#workflows" },
  ],
  Company: [
    { name: "About Us", to: "/about" },
    { name: "Our Story", to: "/about#story" },
    { name: "Principles", to: "/about#principles" },
    { name: "Team", to: "/about#team" },
  ],
  Support: [
    { name: "Pricing", to: "/pricing" },
    { name: "Compare Plans", to: "/pricing#compare" },
    { name: "FAQ", to: "/pricing#faq" },
  ],
};

function Footer() {
  const currentYear = new Date().getFullYear();
  const attempted = useRef(false);

  useEffect(() => {
    if (!pendingHash || attempted.current) return;
    attempted.current = true;
    const id = pendingHash;
    pendingHash = null;
    const tryScroll = () => {
      if (scrollToId(id)) return;
      const t1 = setTimeout(tryScroll, 100);
      const t2 = setTimeout(tryScroll, 300);
      const t3 = setTimeout(tryScroll, 600);
      const t4 = setTimeout(tryScroll, 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    };
    tryScroll();
  }, []);

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shadow-sm">
                  <img src={logo} alt="logo" className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">Focus</span>
              </Link>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Built for high-performance teams and focused individuals who
              demand the best from their tools.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map(({ name, to }) => (
                  <li key={name}>
                    <FooterLink to={to}>{name}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-16 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {currentYear} Focus Technology Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
