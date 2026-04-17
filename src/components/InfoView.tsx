
import * as React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShoppingCart, ShoppingBag, ShieldCheck, MapPin, MessageSquare } from 'lucide-react';
import { View } from '../types';

export const InfoView = ({ view, contactAdmin, navigateTo }: { view: View, contactAdmin: () => void, navigateTo: (view: View) => void }) => {
  const content = {
    about: {
      title: "Marketplace Roles",
      subtitle: "Who Makes Tindahang Envergista Possible?",
      text: "Tindahang Envergista is a collaborative ecosystem designed specifically for the Manuel S. Enverga University Foundation community. Our platform caters to three primary users, each playing a vital role in our student-led economy:",
      extraContent: (
        <div className="space-y-12 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <ShoppingCart size={24} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight dark:text-white">The Customer</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                As a student or faculty member, you can browse unique handcrafted items made by your peers. Verified customers enjoy secure payments via GCash or COD and a direct line to student makers.
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-4">
              <div className="w-12 h-12 bg-maroon/10 rounded-2xl flex items-center justify-center text-maroon">
                <ShoppingBag size={24} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight dark:text-white">The Seller</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Student entrepreneurs gain access to a dedicated dashboard to manage products, track orders, and communicate with buyers. Verification ensures trust within the Enverga community.
              </p>
            </div>
            <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight dark:text-white">The Admin</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Support staff and system administrators oversee verification requests, ensure safety compliance, and provide assistance to both buyers and sellers whenever needed.
              </p>
            </div>
          </div>
        </div>
      )
    },
    'success-stories': {
      title: "Success Stories",
      subtitle: "From Classroom to Commerce",
      text: "Discover how MSEUF students are turning their creative projects into thriving small businesses. Our success stories highlight the journey of student sellers who have leveraged this platform to reach a wider audience and build their brands while pursuing their academic goals."
    },
    help: {
      title: "Help Center",
      subtitle: "How can we assist you?",
      text: "Our dedicated support team is here to ensure your Tindahang Envergista experience is seamless. We assist with a variety of administrative and technical tasks:",
      extraContent: (
        <div className="mt-12 space-y-8 bg-gray-50 dark:bg-white/5 p-12 rounded-[3.5rem] border border-gray-100 dark:border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h5 className="text-sm font-black uppercase tracking-tight dark:text-white">Seller Verification</h5>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Administrators manually review all seller applications to ensure all merchants are enrolled MSEUF students. This process typically takes 1-2 business days.
              </p>
            </div>
            <div className="space-y-4">
              <h5 className="text-sm font-black uppercase tracking-tight dark:text-white">Dispute Resolution</h5>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                If a transaction doesn't go as planned, our admins can review chat history and order details to facilitate a fair resolution for both parties.
              </p>
            </div>
          </div>
        </div>
      )
    },
    safety: {
      title: "Safety Rules",
      subtitle: "A Secure Marketplace for Everyone",
      text: "Tindahang Envergista is built on mutual trust and community responsibility. To ensure a safe experience for every Envergista, we enforce the following guidelines:",
      extraContent: (
        <div className="space-y-8 mt-12">
          <div className="space-y-4">
            <h4 className="text-xl font-black uppercase tracking-tight dark:text-white flex items-center gap-3">
              <ShieldCheck className="text-maroon" size={20} />
              Identity Verification
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
              Every seller must be a verified MSEUF student. This process involves a manual review of student IDs by our administrators. Buying is restricted but accessible to all log-in users, while selling requires full verification.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xl font-black uppercase tracking-tight dark:text-white flex items-center gap-3">
              <MapPin className="text-maroon" size={20} />
              Safe Meetup Zones
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
              For item pickups and COD transactions, we strongly advise meeting in well-lit, high-traffic campus areas such as the Student Lounge, University Library, or designated college foyers.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xl font-black uppercase tracking-tight dark:text-white flex items-center gap-3">
              <MessageSquare className="text-maroon" size={20} />
              Communication
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
              Keep all conversations within the platform's chat system. This allows us to provide evidence in case of disputes and protects your personal phone number and social media accounts.
            </p>
          </div>
        </div>
      )
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
          
          {(content as any).extraContent}
          
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
