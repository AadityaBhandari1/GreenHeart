import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CONTACT } from '../Components/Footer';

// ====== EDIT THE TEXT OF EACH SERVICE PAGE HERE ======
const SERVICES = {
  'precision-farming': {
    title: 'Precision Farming & AI-Powered Insights',
    tagline: 'Data-driven decisions for every season',
    image: '/precision-farming.jpg',
    overview: [
      'Every field is different. Soil, rainfall, temperature and past crops all affect what will grow well. Precision farming uses data and AI to take these factors into account, so your decisions are based on your own land instead of guesswork.',
      'GreenHeart brings soil and climate information together and turns it into practical advice: which crops suit your land, how they are likely to perform, and which risks to watch for.',
    ],
    features: [
      {
        t: 'AI-Based Crop Selection',
        d: 'Our models compare your soil and local climate conditions with the needs of different crops and suggest the ones most likely to do well on your land.',
        points: [
          'Recommendations based on your soil type and location',
          'Takes local climate and season into account',
          'Helps you compare crop options before you sow',
        ],
      },
      {
        t: 'Yield Prediction & Risk Assessment',
        d: 'AI models estimate how a crop is likely to perform and highlight the risks that could affect it, so you can prepare early instead of reacting late.',
        points: [
          'Yield forecasts to support planning and budgeting',
          'Early warning of weather and soil-related risks',
          'Helps you decide on inputs such as seed, water and fertiliser',
        ],
      },
    ],
    steps: [
      { t: 'Share your land details', d: 'Tell us your location and soil information.' },
      { t: 'Conditions are analysed', d: 'We look at the soil and climate factors that affect crop growth.' },
      { t: 'Receive your recommendations', d: 'Get suggested crops together with a yield and risk outlook.' },
      { t: 'Plan your season', d: 'Use the results to plan sowing, inputs and budget, and revisit them as conditions change.' },
    ],
    whoFor: [
      'Farmers deciding what to grow next season',
      'Growers who want to reduce risk before they invest',
      'Landowners starting to farm a new plot',
      'Teams advising farmers',
    ],
    benefits: [
      'Choose crops that suit your soil and climate',
      'Plan with yield and risk estimates',
      'Reduce wasted seed, water and fertiliser',
      'Make decisions with data, not guesswork',
      'Keep your farm information in one place',
    ],
    explore: { label: 'Try the crop report', to: '/report' },
  },

  'gis-mapping': {
    title: 'GIS Mapping & Analysis',
    tagline: 'Know your land, down to the boundary',
    image: '/smart-soil.jpg',
    overview: [
      'A Geographic Information System (GIS) turns your land into an interactive map. You can find your location, mark the boundary of each field and study it using location-based data.',
      'Instead of estimates, you work with precise boundaries and spatial information, so it is easier to compare different parts of your farm and decide where to focus.',
    ],
    features: [
      {
        t: 'Spatial Data Collection',
        d: 'Advanced mapping techniques capture the exact boundaries and positions of your fields, so the data you work with matches what is actually on the ground.',
        points: [
          'Mark field boundaries directly on the map',
          'Keep your fields saved so they are ready when you return',
          'Precise locations instead of rough estimates',
        ],
      },
      {
        t: 'Geospatial Analysis',
        d: 'In-depth analysis of your spatial data reveals patterns across your farm, helping you make better decisions about where and when to act.',
        points: [
          'Compare different fields and areas of your farm',
          'Spot patterns and problem areas sooner',
          'Support planning with location-based insights',
        ],
      },
    ],
    steps: [
      { t: 'Find your location', d: 'Search for your village or farm on the map.' },
      { t: 'Mark your fields', d: 'Draw the boundary of each field.' },
      { t: 'Review the analysis', d: 'See the information and insights for each field.' },
      { t: 'Take action', d: 'Use what you learn to plan work, inputs and monitoring.' },
    ],
    whoFor: [
      'Farmers who want an accurate record of their land',
      'Landowners managing several plots',
      'Agri teams monitoring many farms',
      'Anyone planning crops field by field',
    ],
    benefits: [
      'Accurate boundaries stored in one place',
      'A clear picture of your whole farm',
      'Easier comparison between fields',
      'Problems spotted earlier',
      'Better planning with location data',
    ],
    explore: { label: 'Open Land Monitoring', to: '/gis' },
  },

  'drone-monitoring': {
    title: 'Automated Farm Monitoring & Drones',
    tagline: "A bird's-eye view of every acre",
    image: '/drone-services.jpg',
    overview: [
      'Walking every acre takes time and effort, and problems are often easier to see from above. Drone-based monitoring surveys your fields from the air so crop stress, gaps and uneven growth can be spotted early.',
      'Automated spraying then applies treatment precisely where it is needed, instead of across the whole field.',
    ],
    features: [
      {
        t: 'Drone-Based Surveillance',
        d: 'AI-enabled drones fly over your fields and capture images that are reviewed to find areas needing attention.',
        points: [
          'Cover large areas in a short time',
          'Identify crop stress and patchy growth early',
          'Spend less time walking the fields',
        ],
      },
      {
        t: 'Automated Crop Spraying',
        d: 'Precision pesticide distribution applies treatment only to the areas that need it, helping reduce waste and exposure.',
        points: [
          'Targeted application instead of blanket spraying',
          'Less pesticide used',
          'Less manual handling of chemicals',
        ],
      },
    ],
    steps: [
      { t: 'Request a survey', d: 'Tell us which fields you want monitored.' },
      { t: 'Drone flight', d: 'Drones fly over your fields and capture images.' },
      { t: 'AI review', d: 'The images are reviewed to find the areas that need attention.' },
      { t: 'Targeted action', d: 'Where required, spraying is applied precisely to the affected areas.' },
    ],
    whoFor: [
      'Farmers with large or hard-to-reach fields',
      'Growers who want early warning of crop problems',
      'Farms looking to cut down pesticide use',
      'Teams managing many plots',
    ],
    benefits: [
      'Save time and labour',
      'Catch problems before they spread',
      'Use less pesticide',
      'Cover big fields quickly',
      'Safer for the people working on the farm',
    ],
    explore: { label: 'Open Land Monitoring', to: '/gis' },
  },

  'farm-finance': {
    title: 'Farm Lease & Financial Assistance',
    tagline: 'Land, tools and support to help you grow',
    image: '/farm-lease.jpg',
    overview: [
      'Starting or growing a farm takes land, equipment and money, and all three can be hard to arrange. Our farm lease and financial assistance services are designed to make them easier to access and to protect you from the risks of farming.',
      'You can lease land that is set up with the right technology, and get guidance on insurance and financial planning.',
    ],
    features: [
      {
        t: 'Land Leasing & Management',
        d: 'Tech-equipped farm leasing gives you access to farmland that is ready to work, with support in managing it.',
        points: [
          'Lease land without having to buy it',
          'Land set up with modern farming technology',
          'Help managing the land day to day',
        ],
      },
      {
        t: 'Agri-Fintech Solutions',
        d: 'Insurance and financial advisory help you protect your crop and plan your spending with more confidence.',
        points: [
          'Insurance to protect against crop loss',
          'Guidance on financial planning for the season',
          'Support in understanding your options',
        ],
      },
    ],
    steps: [
      { t: 'Tell us what you need', d: 'Share whether you are looking for land, cover or financial advice.' },
      { t: 'We review your options', d: 'Our team looks at what fits your situation.' },
      { t: 'Choose your plan', d: 'Pick the lease or financial option that works for you.' },
      { t: 'Ongoing support', d: 'Get help as you manage your land and finances.' },
    ],
    whoFor: [
      'Farmers who want to expand without buying land',
      'New farmers getting started',
      'Growers who want protection against crop loss',
      'Anyone who wants clearer financial planning',
    ],
    benefits: [
      'Start or grow without a big upfront purchase',
      'Protection against crop loss',
      'Clearer financial planning',
      'Land that is ready with the right technology',
      'One place for land and financial support',
    ],
    explore: null,
  },
};
// =====================================================

const ORDER = ['precision-farming', 'gis-mapping', 'drone-monitoring', 'farm-finance'];

export default function ServiceDetail() {
  const { slug } = useParams();
  const s = SERVICES[slug];
  if (!s) return <Navigate to="/services" replace />;

  const heroBg = `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.55)), url(${s.image}), linear-gradient(to right, #15803d, #34d399)`;

  const mailto =
    `mailto:${CONTACT.email}` +
    `?subject=${encodeURIComponent('Service request: ' + s.title)}` +
    `&body=${encodeURIComponent(
      `Hello,\n\nI would like to know more about "${s.title}".\n\nName:\nLocation:\nPhone:\n\nThank you.`
    )}`;

  return (
    <main className="pt-20 lg:pt-16 text-gray-800">
      {/* Banner */}
      <section
        className="h-64 sm:h-80 flex items-center justify-center px-4"
        style={{ background: heroBg, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="text-center text-white max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-bold mb-3">{s.title}</h1>
          <p className="text-lg sm:text-xl">{s.tagline}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link to="/services" className="text-green-700 hover:underline text-sm">
          &larr; All services
        </Link>

        {/* Overview */}
        <section className="mt-4 mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-3">Overview</h2>
          {s.overview.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-3 text-lg">{p}</p>
          ))}
        </section>

        {/* What's included */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">What's included</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {s.features.map((f) => (
              <div key={f.t} className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h3 className="text-xl font-semibold text-green-700 mb-2">{f.t}</h3>
                <p className="text-gray-700 mb-3">{f.d}</p>
                <ul className="space-y-1">
                  {f.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-gray-700">
                      <span className="text-green-600 font-bold">&#10003;</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">How it works</h2>
          <ol className="grid gap-4 sm:grid-cols-2">
            {s.steps.map((st, i) => (
              <li key={st.t} className="flex gap-4 bg-green-50 rounded-xl p-5">
                <span className="flex-none w-9 h-9 rounded-full bg-green-600 text-white font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">{st.t}</h3>
                  <p className="text-gray-700">{st.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Who it's for */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Who it's for</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {s.whoFor.map((w) => (
              <div key={w} className="rounded-xl border border-green-200 px-4 py-3 text-gray-700 bg-white">
                {w}
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Benefits for you</h2>
          <ul className="space-y-2">
            {s.benefits.map((b) => (
              <li key={b} className="flex gap-3 text-lg text-gray-700">
                <span className="text-green-600 font-bold">&#10003;</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Call to action */}
        <section className="bg-gradient-to-r from-green-100 to-emerald-50 rounded-2xl p-6 sm:p-8 text-center mb-12">
          <h2 className="text-2xl font-bold text-green-700 mb-2">Interested in this service?</h2>
          <p className="text-gray-700 mb-5">
            Send us a message or call {CONTACT.phone}, and we'll get back to you.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={mailto}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-full font-medium hover:from-green-700 hover:to-green-500 transition-all"
            >
              Request this service
            </a>
            {s.explore && (
              <Link
                to={s.explore.to}
                className="px-6 py-3 border border-green-600 text-green-700 rounded-full font-medium hover:bg-white transition-colors"
              >
                {s.explore.label}
              </Link>
            )}
          </div>
        </section>

        {/* Other services */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Other services</h2>
          <div className="flex flex-wrap gap-2">
            {ORDER.filter((k) => k !== slug).map((k) => (
              <Link
                key={k}
                to={`/services/${k}`}
                className="px-4 py-2 rounded-full border border-green-200 text-green-700 text-sm hover:bg-green-50"
              >
                {SERVICES[k].title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}