
import * as React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, User, Bell, Moon, Sun, ShieldCheck, RefreshCw, Package } from 'lucide-react';
import { ADMIN_EMAILS } from '../constants';
import { View } from '../types';

export const Header = ({ navigateTo, isDarkMode, setIsDarkMode, currentUser, userProfile, notifications, wishlist, cart, handleGoogleLogin, isAuthReady }: any) => (
  <header className="sticky top-0 z-50 glass px-4 md:px-12 py-4 md:py-5 flex justify-between items-center shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] transition-all duration-500">
    <div className="flex items-center gap-3 md:gap-4 cursor-pointer group" onClick={() => navigateTo(currentUser ? 'shop' : 'landing')}>
      <div className="w-10 h-10 md:w-12 md:h-12 bg-maroon rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-[0_15px_30px_-5px_rgba(128,0,0,0.4)] transform -rotate-6 group-hover:rotate-0 transition-all duration-700 ease-[0.16, 1, 0.3, 1]">
        <Package size={24} className="md:w-7 md:h-7" />
      </div>
      <div className="flex flex-col">
        <h1 className="font-black text-lg md:text-2xl tracking-tighter text-maroon dark:text-white uppercase leading-none">
          Tindahang<span className="text-gray-400 font-light ml-1">Envergista</span>
        </h1>
        <div className="flex items-center gap-2 mt-1 md:mt-1.5">
          <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-maroon rounded-full animate-pulse"></span>
          <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 leading-none">Student Marketplace</span>
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-4">
      <nav className="hidden lg:flex items-center gap-2 mr-8">
        {[
          { label: 'Marketplace', view: 'shop' },
          { label: 'About', view: 'landing' },
          { label: 'Community', view: 'landing' }
        ].map(item => (
          <button 
            key={item.label}
            onClick={() => navigateTo(item.view as View)} 
            className="relative px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-maroon transition-all group"
          >
            {item.label}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-maroon transition-all duration-500 group-hover:w-1/2"></span>
          </button>
        ))}
        {userProfile?.role === 'admin' && ADMIN_EMAILS.includes(currentUser?.email) && (
          <button 
            onClick={() => navigateTo('admin-dashboard')} 
            className="ml-4 px-6 py-2.5 bg-maroon/5 text-maroon rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-maroon hover:text-white transition-all duration-500 flex items-center gap-3 border border-maroon/10"
          >
            <ShieldCheck size={16} />
            Admin Panel
          </button>
        )}
      </nav>
      
      <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200/50 dark:border-white/5">
        <button 
          onClick={() => window.location.reload()} 
          className="p-3 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:text-maroon transition-all duration-500 shadow-sm group"
          title="Refresh Page"
        >
          <RefreshCw size={20} className="group-active:rotate-180 transition-transform duration-500" />
        </button>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className="p-3 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:text-maroon transition-all duration-500 shadow-sm"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {userProfile?.role === 'admin' && ADMIN_EMAILS.includes(currentUser?.email) && (
          <button 
            onClick={() => navigateTo('admin-dashboard')} 
            className="p-3 rounded-xl text-maroon hover:bg-white dark:hover:bg-gray-800 transition-all duration-500 shadow-sm"
            title="Admin Dashboard"
          >
            <ShieldCheck size={20} />
          </button>
        )}
        
        {currentUser && !userProfile?.isVerified && userProfile?.verificationStatus !== 'pending' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('verification-request')}
            className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-yellow-500/20 transition-all duration-500 shadow-sm"
          >
            <ShieldCheck size={14} />
            Get Verified
          </motion.button>
        )}
        
        {currentUser && (
          <>
            <button 
              onClick={() => navigateTo('notifications')} 
              className="relative p-3 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:text-maroon transition-all duration-500 shadow-sm"
            >
              <Bell size={20} />
              {notifications.some((n: any) => !n.isRead) && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
              )}
            </button>
            <button 
              onClick={() => navigateTo('cart')} 
              className="relative p-3 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:text-maroon transition-all duration-500 shadow-sm"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-maroon text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-black shadow-xl">
                  {cart.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {!isAuthReady ? (
        <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse"></div>
      ) : currentUser ? (
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="ml-2 w-12 h-12 rounded-2xl overflow-hidden border-2 border-maroon/10 hover:border-maroon cursor-pointer transition-all p-1 bg-white dark:bg-gray-900 shadow-premium" 
          onClick={() => navigateTo('profile')}
        >
          <img 
            className="w-full h-full object-cover rounded-xl" 
            src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}`} 
            alt="Profile" 
          />
        </motion.div>
      ) : (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleGoogleLogin()}
          className="ml-2 bg-maroon text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_15px_30px_-5px_rgba(128,0,0,0.4)] flex items-center gap-3 hover:bg-black transition-all duration-500"
        >
          <User size={16} />
          Sign In
        </motion.button>
      )}
    </div>
  </header>
);
