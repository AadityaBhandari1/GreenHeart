import React from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn } from 'react-icons/fa6';

// ====== EDIT THESE ======
const COMPANY_NAME = 'GreenHeart';

const CONTACT = {
  phone: '+91 9797140756',
  email: 'freemindlabs.org@gmail.com',
};

// Leave an href as '' to hide that icon.
const SOCIALS = [
  { label: 'YouTube', href: 'https://youtube.com', Icon: FaYoutube },
  { label: 'Facebook', href: 'https://facebook.com', Icon: FaFacebookF },
  { label: 'Instagram', href: 'https://www.instagram.com/freemind_labs/', Icon: FaInstagram },
  { label: 'X (Twitter)', href: 'https://x.com/FreeMind_Labs', Icon: FaXTwitter },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/freemind-labs-pvt-ltd/', Icon: FaLinkedinIn },
];
// ========================

const SECTIONS = [
  {
    title: 'MENU',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Educational Resources', to: '/education' },
      { label: 'Crop Vision', to: '/gis' },
    ],
  },
  {
    title: 'ABOUT',
    links: [
      { label: 'Our Company', to: '/aboutus' },
      { label: 'Our People', to: '/aboutus' },
      { label: "FAQ's", to: '/faq' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Cookies Policy', to: '/cookies' },
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-teal-700 to-teal-800 text-white py-10 border-t border-gray-300 relative overflow-hidden">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 p-2 items-center text-center gap-4 sm:gap-6">
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-6 md:mb-0">
            <h4 className="font-bold text-xl sm:text-2xl mb-3">{section.title}</h4>
            <ul>
              {section.links.map((link) => (
                <li
                  key={link.label}
                  className="text-base sm:text-lg py-1 hover:underline transition-transform transform hover:scale-110"
                >
                  <Link to={link.to} className="inline-block px-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mb-6 md:mb-0">
          <h4 className="font-bold text-xl sm:text-2xl mb-3">CONTACT US</h4>
          <ul>
            <li className="text-base sm:text-lg py-1">
              <a href={`tel:${CONTACT.phone.replace(/\s+/g, '')}`} className="hover:underline">
                {CONTACT.phone}
              </a>
            </li>
            <li className="text-base sm:text-lg py-1 break-all">
              <a href={`mailto:${CONTACT.email}`} className="hover:underline">
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mb-6 md:mb-0 text-center">
        <h4 className="font-bold text-xl sm:text-2xl mb-3">FOLLOW US</h4>
        <nav aria-label="Social Media Links" className="flex justify-center gap-4 sm:gap-6">
          {SOCIALS.filter((s) => s.href).map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="p-2 text-3xl sm:text-4xl transition-transform transform hover:scale-125"
            >
              <Icon />
            </a>
          ))}
        </nav>
      </div>

      <div className="mt-8 text-center text-base">
        <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;