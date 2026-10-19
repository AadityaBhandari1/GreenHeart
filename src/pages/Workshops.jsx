import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACT } from '../Components/Footer';


const WORKSHOP_IMAGE = '//Users/adityabhandari/Downloads/GreenHeart-main/public/Ramu_Farmer.jpeg';

export default function Workshops() {
  const notify =
    `mailto:${CONTACT.email}` +
    `?subject=${encodeURIComponent('Notify me about GreenHeart workshops')}` +
    `&body=${encodeURIComponent('Hello,\n\nPlease let me know when the workshops start.\n\nName:\nPhone:\n')}`;

  return (
    <main className="pt-20 lg:pt-16 min-h-screen bg-gradient-to-b from-green-50 to-white">
      <style>{`
        @keyframes gh-float { 0%,100% { transform: translateY(0);x} 50% { transform: translateY(-10px); } }
        .gh-float { animation: gh-float 4s ease-in-out infinite; }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-center">
        <div className="gh-float order-1 md:order-2">
          <img
            src={WORKSHOP_IMAGE}
            alt="A smiling farmer"
            className="w-full max-w-md mx-auto rounded-3xl shadow-xl"
          />
        </div>

        <div className="order-2 md:order-1 text-center md:text-left">
          <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold tracking-wide mb-4">
            COMING SOON
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-green-700 mb-4">
            Workshops are on the way
          </h1>
          <p className="text-lg text-gray-700 mb-3">
            We're preparing hands-on sessions to help farmers use digital tools with confidence,
            from reading crop prices to mapping your fields.
          </p>
          <p className="text-lg text-gray-700 mb-8">
            Want to be the first to know when they start? Send us a message and we'll keep you posted.
          </p>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <a
              href={notify}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-full font-medium hover:from-green-700 hover:to-green-500 transition-all"
            >
              Notify me
            </a>
            <Link
              to="/services"
              className="px-6 py-3 border border-green-600 text-green-700 rounded-full font-medium hover:bg-green-50 transition-colors"
            >
              Back to Services
            </Link>
          </div>

          <p className="mt-6 text-gray-600">
            Meanwhile, explore our{' '}
            <Link to="/education" className="text-green-700 underline">educational resources</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}