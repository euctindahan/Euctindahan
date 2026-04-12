
import * as React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { View } from '../types';

export const InfoView = ({ view, contactAdmin, navigateTo }: { view: View, contactAdmin: () => void, navigateTo: (view: View) => void }) => {
  const content = {
    about: {
      title: "About Us",
      subtitle: "Empowering Student Entrepreneurs",
      text: "Tindahang Envergista is the official student marketplace of Manuel S. Enverga University Foundation. Our mission is to provide a premium digital stage for the exceptional craftsmanship and entrepreneurial spirit of our students. We believe in fostering a community where academic excellence meets real-world business experience."
    },
    'success-stories': {
      title: "Success Stories",
      subtitle: "From Classroom to Commerce",
      text: "Discover how MSEUF students are turning their creative projects into thriving small businesses. Our success stories highlight the journey of student sellers who have leveraged this platform to reach a wider audience and build their brands while pursuing their academic goals."
    },
    help: {
      title: "Help Center",
      subtitle: "How can we assist you?",
      text: "Welcome to the Tindahang Envergista Help Center. Whether you're a buyer looking for unique student-made items or a seller wanting to set up your shop, we're here to help. Find guides on account setup, order management, and secure transactions."
    },
    safety: {
      title: "Safety Rules",
      subtitle: "A Secure Marketplace for Everyone",
      text: "Your safety is our priority. We enforce strict guidelines to ensure all transactions are secure and all products meet our community standards. We recommend meeting in designated campus areas for item pickups and using our integrated chat for all communications."
    },
    privacy: {
      title: "Privacy Policy",
      subtitle: "Protecting Your Information",
      text: "We are committed to protecting your personal data. Our privacy policy outlines how we collect, use, and safeguard your information within the MSEUF ecosystem. We only share necessary details with sellers to facilitate your orders."
    }
  }[view as keyof typeof content] || { title: "Information", subtitle: "", text: "Content coming soon." };

  return (
    <div className="min-h-screen bg-surface dark:bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-3 text-gray-500 hover:text-maroon transition-colors group mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-maroon group-hover:text-white transition-all">
            <ChevronLeft size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Home</span>
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-px bg-maroon"></div>
            <span className="text-maroon font-black text-[10px] uppercase tracking-[0.5em]">{content.subtitle}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter dark:text-white leading-none">
            {content.title}
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-xl dark:prose-invert max-w-none"
        >
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
            {content.text}
          </p>
          
          <div className="mt-16 p-12 bg-gray-50 dark:bg-white/5 rounded-[3rem] border border-gray-100 dark:border-white/10">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-6 dark:text-white">Need more information?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Our team is always here to support the MSEUF community. If you have specific questions not covered here, please don't hesitate to reach out.
            </p>
            <button 
              onClick={contactAdmin}
              className="bg-maroon text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-premium hover:bg-black transition-all"
            >
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
