import React from 'react';
import PageHero from '../components/PageHero';
import { Target, Eye, BookOpen, Users } from 'lucide-react';

const About = () => {
  const title = 'About Our Foundation';
  const mission = 'To recognize, encourage and support toppers across schools, madrasas, and traditional Islamic curricula. We strive to inspire double excellence in both standard academic disciplines and Quranic studies, empowering students to become balanced intellectual leaders.';
  const vision = 'A future generation where academic capability and moral values are celebrated side-by-side, motivating student bodies to pursue comprehensive knowledge without limits.';
  const history = 'The IQRA Foundation was founded by a team of dedicated scholars and educators with a vision to encourage high achievement. Recognizing a gap in traditional reward systems, the foundation established its annual reviews and awards ceremony to celebrate the highest achievers in standard school boards (CBSE, MP Board) alongside traditional religious tracks (Hifz memorization, Madrasa qualifications). We believe that both secular and spiritual intelligence are critical, and our annual support functions help keep students motivated, providing scholarships and recognitions.';

  const team = [
    { name: 'Ahmad Anash', role: 'Founder & Chief Patron', photo: '' },
    { name: 'Anash Khan', role: 'Director of Academic Reviews', photo: '' },
    { name: 'Anash', role: 'Administrative Executive', photo: '' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/40 pb-20 font-sans">
      <PageHero 
        title={title} 
        subtitle="Discover our origins, core mission, and the administrative board guiding the IQRA Foundation." 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12 animate-fade-in-up">
        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-950 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-800" />
              </div>
              <h2 className="font-serif font-bold text-xl text-emerald-950">Our Mission</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                {mission}
              </p>
            </div>
            <div className="w-10 h-0.5 bg-amber-500 rounded-full mt-6"></div>
          </div>

          {/* Vision Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Eye className="w-5 h-5 text-amber-605" />
              </div>
              <h2 className="font-serif font-bold text-xl text-emerald-950">Our Vision</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                {vision}
              </p>
            </div>
            <div className="w-10 h-0.5 bg-amber-500 rounded-full mt-6"></div>
          </div>
        </div>

        {/* History Section */}
        <section className="bg-white p-6 md:p-10 rounded-2xl border border-slate-150 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-6 bg-amber-500 rounded"></span>
              <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">Origin Story</span>
            </div>
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-emerald-950 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-900" />
              Foundation History
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              {history}
            </p>
          </div>
        </section>

        {/* Board Members Section */}
        {team.length > 0 && (
          <section className="space-y-8 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="flex justify-center items-center gap-2">
                <span className="h-0.5 w-6 bg-amber-500 rounded"></span>
                <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">Leadership Board</span>
                <span className="h-0.5 w-6 bg-amber-500 rounded"></span>
              </div>
              <h2 className="font-serif font-bold text-2xl md:text-3xl text-emerald-950 flex items-center justify-center gap-2">
                <Users className="w-6 h-6 text-emerald-900" />
                Our Administrators
              </h2>
              <p className="text-slate-500 text-xs">
                Governing board responsible for organizing the merit reviews and ceremonies.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {team.map((member, i) => (
                <div 
                  key={i} 
                  className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center w-60 hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-950 flex items-center justify-center text-2xl font-bold border border-slate-150 mb-4 font-serif">
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="font-sans font-bold text-emerald-950 text-sm">{member.name}</h3>
                  <p className="text-amber-600 text-[10px] font-bold uppercase tracking-wider mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default About;
export { About };
