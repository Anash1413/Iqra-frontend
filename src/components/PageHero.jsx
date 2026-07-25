import React from 'react';

const PageHero = ({ title, subtitle }) => {
  return (
    <section className="bg-slate-50 border-b border-slate-200/60 py-16 text-center relative overflow-hidden">
      {/* Subtle decorative dot pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <h1 className="font-serif font-bold text-3xl md:text-5xl text-emerald-950 tracking-tight mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 font-sans text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="w-12 h-1 bg-amber-500 mx-auto mt-5 rounded-full"></div>
      </div>
    </section>
  );
};

export default PageHero;
export { PageHero };
