import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-12 text-slate-650 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-100">
          {/* Brand */}
          <div className="space-y-4">
            <span className="font-sans font-extrabold text-xl tracking-tight text-emerald-950 block">
              IQRA <span className="text-amber-500 font-medium font-serif">Foundation</span>
            </span>
            <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
              Motivating and enabling students to achieve academic excellence across both standard secular boards and traditional Islamic courses.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="font-bold text-emerald-950 uppercase tracking-wider text-xs">Quick Links</h3>
            <ul className="space-y-1.5 text-xs font-semibold">
              <li>
                <Link to="/" className="text-slate-500 hover:text-emerald-900 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-500 hover:text-emerald-900 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-500 hover:text-emerald-900 transition-colors">Contact</Link>
              </li>
              <li>
                <Link to="/merit-list" className="text-slate-500 hover:text-emerald-900 transition-colors">Merit Toppers List</Link>
              </li>
            </ul>
          </div>

          {/* Philosophy Quote */}
          <div className="space-y-3">
            <h3 className="font-bold text-emerald-950 uppercase tracking-wider text-xs">Core Philosophy</h3>
            <p className="text-slate-500 text-xs italic font-serif leading-relaxed">
              "Read! In the name of your Lord who created... who taught by the pen."
            </p>
            <p className="text-slate-400 text-[10px] font-bold">— Surah Al-Alaq [96:1-4]</p>
          </div>
        </div>

        {/* Footer Bottom copyright */}
        <div className="pt-8 text-center text-slate-400 text-xs font-medium">
          <p>© 2026 IQRA Foundation. All Rights Reserved. Designed & Developed by Anash.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
export { Footer };
