interface FooterColumnProps {
  title: string;
  links: string[];
}

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

export default FooterColumn;