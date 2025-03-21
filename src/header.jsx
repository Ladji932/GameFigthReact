import React from 'react';
import { ArrowLeftCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ location }) => {
  return (
    <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 px-4 py-3">
      <nav className="container mx-auto">
        <motion.button
          onClick={location}
          className="group flex items-center gap-2 px-4 py-2 rounded-lg 
            bg-gradient-to-r from-indigo-600 to-purple-600 
            hover:from-indigo-500 hover:to-purple-500
            text-white font-medium shadow-lg 
            transition-all duration-300
            hover:shadow-indigo-500/25
            active:scale-95"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeftCircle className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Retour à la sélection</span>
        </motion.button>
      </nav>
    </header>
  );
};

export default Header;