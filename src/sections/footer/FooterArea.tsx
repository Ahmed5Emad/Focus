import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

function FooterArea() {
  return (
    <footer aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <FinalCTA />
      <Footer />
    </footer>
  );
}

export default FooterArea;