
import * as React from 'react';
import { Package } from 'lucide-react';
import { View } from '../types';

export const Footer = ({ contactAdmin, navigateTo }: any) => (
  <footer className="bg-[#050505] text-white pt-32 pb-12 px-6 md:px-12 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-maroon/50 to-transparent"></div>
    
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
      <div className="md:col-span-2 space-y-8 text-left">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-maroon rounded-2xl flex items-center justify-center text-white shadow-premium transform -rotate-6">
            <Package size={28} />
          </div>
          <h2 className="font-black text-3xl tracking-tighter uppercase leading-none">
            Tindahang<span className="text-gray-600 font-light ml-1">Envergista</span>
          </h2>
        </div>
        <p className="text-gray-400 text-lg font-medium max-w-md leading-relaxed">
          Empowering the next generation of student entrepreneurs at Manuel S. Enverga University Foundation. A premium stage for academic excellence and creative craftsmanship.
        </p>
        <div className="flex gap-4">
          {['Instagram', 'Facebook', 'Twitter', 'LinkedIn'].map(social => (
            <button key={social} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-maroon hover:text-white transition-all duration-500 border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest">{social[0]}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-8 text-left">
        <h4 className="text-white font-black text-xs uppercase tracking-[0.4em]">Quick Links</h4>
        <ul className="space-y-4">
          {[
            { name: 'Marketplace', view: 'shop' },
            { name: 'About Us', view: 'about' },
            { name: 'Success Stories', view: 'success-stories' },
            { name: 'Student Sellers', view: 'shop' }
          ].map(link => (
            <li key={link.name}>
              <button 
                onClick={() => navigateTo(link.view as View)}
                className="text-gray-500 hover:text-maroon transition-colors text-sm font-bold uppercase tracking-widest"
              >
                {link.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="space-y-8 text-left">
        <h4 className="text-white font-black text-xs uppercase tracking-[0.4em]">Support</h4>
        <ul className="space-y-4">
          {[
            { name: 'Help Center', view: 'help' },
            { name: 'Safety Rules', view: 'safety' },
            { name: 'Privacy Policy', view: 'privacy' },
            { name: 'Contact Admin', action: contactAdmin }
          ].map(link => (
            <li key={link.name}>
              <button 
                onClick={link.action ? link.action : () => navigateTo(link.view as View)}
                className="text-gray-500 hover:text-maroon transition-colors text-sm font-bold uppercase tracking-widest"
              >
                {link.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">
        © 2026 TINDAHANG ENVERGISTA • BUILT FOR EXCELLENCE
      </p>
      <div className="flex items-center gap-8">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">MSEUF CANDELARIA</span>
        <div className="w-2 h-2 bg-maroon rounded-full animate-pulse"></div>
      </div>
    </div>
  </footer>
);
