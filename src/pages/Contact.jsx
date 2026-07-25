import React, { useState } from 'react';
import PageHero from '../components/PageHero';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    // Simulate submit
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 500);
  };

  const phone = '+91 9685244563';
  const email = 'info@iqrafoundation.org';
  const address = 'Station Road Amdara District Maihar';
  const workingHours = 'Mon - Sat: 9:00 AM - 5:00 PM';
  const socialLinks = { facebook: '#', instagram: '#', youtube: '#' };

  return (
    <div className="min-h-screen bg-slate-50/40 pb-20 font-sans">
      <PageHero 
        title="Contact Us" 
        subtitle="For student registrations, academic reviews, or sponsorship queries, reach out using the form below." 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Details Info */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-emerald-950">Reach Out Directly</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              If you have any questions or would like to partner with the IQRA Foundation, send us a message or contact us directly.
            </p>

            <div className="space-y-4 pt-2">
              {/* Phone */}
              <div className="flex gap-3.5 items-start">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Helpline Contacts</h4>
                  <p className="text-slate-500 text-sm mt-0.5">{phone}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-3.5 items-start">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Email Support</h4>
                  <a href={`mailto:${email}`} className="text-emerald-800 hover:text-emerald-950 text-sm font-semibold mt-0.5 block hover:underline">
                    {email}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-3.5 items-start">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Office Address</h4>
                  <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{address}</p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex gap-3.5 items-start">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Office Hours</h4>
                  <p className="text-slate-500 text-sm mt-0.5">{workingHours}</p>
                </div>
              </div>
            </div>

            {/* Social media connections */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider mb-2.5">Follow Us</h4>
              <div className="flex gap-2">
                <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="h-8 w-8 bg-slate-100 hover:bg-emerald-950 hover:text-white rounded-full flex items-center justify-center text-slate-600 transition-all text-xs font-bold">
                  Fb
                </a>
                <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="h-8 w-8 bg-slate-100 hover:bg-emerald-950 hover:text-white rounded-full flex items-center justify-center text-slate-600 transition-all text-xs font-bold">
                  Ig
                </a>
                <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="h-8 w-8 bg-slate-100 hover:bg-emerald-950 hover:text-white rounded-full flex items-center justify-center text-slate-600 transition-all text-xs font-bold">
                  Yt
                </a>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-150 shadow-sm">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mx-auto text-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-800" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-emerald-950">Thank You!</h3>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto">
                    Your message has been sent successfully. We will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)} 
                    className="btn bg-emerald-950 hover:bg-emerald-900 text-white text-xs py-2 px-6 rounded-lg font-bold shadow-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-serif font-bold text-xl text-emerald-950 mb-1">Send a Message</h3>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Your Name</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="form-control text-sm" 
                      placeholder="e.g. Abdullah" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="form-control text-sm" 
                      placeholder="name@email.com" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="message">Your Message</label>
                    <textarea 
                      id="message"
                      name="message" 
                      value={formData.message} 
                      onChange={handleChange} 
                      className="form-control text-sm h-28 resize-none" 
                      placeholder="Write your suggestions or questions here..." 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    Submit Form
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Embedded Map */}
        <div className="mt-12 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-150/80 h-96">
          <iframe 
            title="Location Map"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy"
          ></iframe>
        </div>

      </div>
    </div>
  );
};

export default Contact;
export { Contact };
