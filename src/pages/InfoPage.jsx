import React from 'react';

const PAGES = {
  faq: {
    title: "Frequently Asked Questions",
    sections: [
      { h: 'What is GreenHeart?', p: 'GreenHeart is a farming platform that helps you monitor your land, check weather and crop prices, read market information and generate crop reports in one place.' },
      { h: 'Do I need an account?', p: 'You can browse several pages without one. Features such as daily crop prices, the government price chart and weather need you to sign in.' },
      { h: 'How do I monitor my land?', p: 'Open Land Monitoring, search for your location on the map and draw your field boundary. Select it to see its details.' },
      { h: 'How can I contact you?', p: 'Use the phone number or email address in the footer at the bottom of any page.' },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      { h: 'Using the service', p: 'By using GreenHeart you agree to use it lawfully and not to misuse, disrupt or attempt to gain unauthorised access to the service.' },
      { h: 'Your account', p: 'You are responsible for keeping your login details secure and for the activity under your account.' },
      { h: 'Information provided', p: 'Weather, prices, satellite-based insights and AI-generated reports are provided for general guidance only. Please verify important decisions with local experts and official sources.' },
      { h: 'Changes', p: 'We may update the service or these terms from time to time. Continued use means you accept the updated terms.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      { h: 'What we collect', p: 'When you create an account we collect your name, email and sign-in details. We also store the land information you add, such as field boundaries.' },
      { h: 'How we use it', p: 'We use your information to run your account, show your land data and provide features such as reports and weather.' },
      { h: 'Third-party services', p: 'GreenHeart uses services such as Firebase, Google Maps and weather and market-price providers. Their own privacy policies apply to data they handle.' },
      { h: 'Your choices', p: 'You can ask us to correct or delete your data by using the contact details in the footer.' },
    ],
  },
  cookies: {
    title: 'Cookies Policy',
    sections: [
      { h: 'What we use', p: 'We use browser storage and cookies to keep you signed in and to make the site work properly.' },
      { h: 'Third-party cookies', p: 'Services such as Google Maps may set their own cookies when their content is loaded on a page.' },
      { h: 'Managing cookies', p: 'You can clear or block cookies in your browser settings. Some features, such as staying signed in, may stop working if you do.' },
    ],
  },
};

export default function InfoPage({ page }) {
  const data = PAGES[page];
  if (!data) return null;
  return (
    <main className="max-w-3xl mx-auto px-4 pt-28 pb-16 text-gray-800">
      <h1 className="text-3xl sm:text-4xl font-bold text-teal-800 mb-8">{data.title}</h1>
      {data.sections.map((s) => (
        <section key={s.h} className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-2">{s.h}</h2>
          <p className="leading-relaxed">{s.p}</p>
        </section>
      ))}
      <p className="text-sm text-gray-500 mt-10">Last updated: October 2026</p>
    </main>
  );
}