import React from 'react';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-teal-700 to-teal-800 text-white py-10 border-t border-gray-300 relative overflow-hidden">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 p-2 items-center text-center gap-4 sm:gap-6">
        {[
          { title: "MENU", links: ["Home", "Educational Resources", "Crop Vision"] },
          { title: "ABOUT", links: ["Our Company", "Our People", "FAQ's"] },
          { title: "LEGAL", links: ["Terms & Conditions", "Privacy Policy", "Cookies Policy"] },
          { title: "CONTACT US", contacts: ["+91 95328 08188", "alok953280@gmail.com"] }
        ].map((section, index) => (
          <div key={index} className="mb-6 md:mb-0 text- ">
            <h4 className="font-bold text-xl sm:text-2xl mb-3">{section.title}</h4>
            <ul>
              {section.links && section.links.map((link, i) => (
                <li key={i} className="text-base sm:text-lg py-1 hover:underline transition-transform transform hover:scale-110">
                  <a href="#" className="inline-block px-1">{link}</a>
                </li>
              ))}
              {section.contacts && section.contacts.map((contact, i) => (
                <li key={i} className="text-base sm:text-lg py-1">
                  {contact}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
        <div className="mb-6 md:mb-0 text-center">
          <h4 className="font-bold text-xl sm:text-2xl mb-3">FOLLOW US</h4>
          <nav aria-label="Social Media Links" className="flex justify-center space-x-4 sm:space-x-6">
            {[
              { href: "https://youtube.com", src: "https://agrimp.com/assets/icons/youtube-d50ddd3463fca6474d8f6208acfe7fb9b6df4fd0115c7236be8ac898ff2950ec.png", alt: "YouTube" },
              { href: "https://facebook.com", src: "https://agrimp.com/assets/icons/facebook-095327a666a198711f2d886aca1aa54bc94eab123b47eb21143ca6371903c101.png", alt: "Facebook" },
              { href: "https://www.instagram.com/kapil.gngwr/", src: "https://agrimp.com/assets/icons/instagram-9be5bfed286b4ddea96d55630886df1171ce5b0373e678223fb985ba42b2962b.png", alt: "Instagram" },
              { href: "https://x.com/kplgngwr", src: "https://agrimp.com/assets/icons/twitter-decee6f4cc18e3928008dc9752990a79882421798c13b7a05add80724dcdde7b.png", alt: "Twitter" },
              { href: "https://www.linkedin.com/in/kplgngwr/", src: "https://agrimp.com/assets/icons/linkedin-86c3b329b493ce57e613118b55c8ddb281948e9953d386bb4e475ce04c7d24ab.png", alt: "LinkedIn" }
            ].map((social, i) => (
              <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="p-1">
                <img src={social.src} alt={social.alt} className="w-10 sm:w-12 transition-transform transform hover:scale-125" />
              </a>
            ))}
          </nav>
        </div>
      <div className="mt-8 text-center text-base">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
