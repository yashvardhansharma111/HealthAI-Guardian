import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white text-black py-8 mt-10 border-t border-gray-300">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left section */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold">Your Company</h3>
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>

        {/* Navigation links */}
        <nav className="flex gap-6 text-sm">
          <a href="#" className="hover:text-gray-600 transition">Home</a>
          <a href="#" className="hover:text-gray-600 transition">About</a>
          <a href="#" className="hover:text-gray-600 transition">Contact</a>
        </nav>

        {/* Socials */}
        <div className="flex gap-4 text-sm">
          <a href="#" className="hover:text-gray-600 transition">Twitter</a>
          <a href="#" className="hover:text-gray-600 transition">GitHub</a>
          <a href="#" className="hover:text-gray-600 transition">LinkedIn</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
