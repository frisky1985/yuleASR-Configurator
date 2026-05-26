import { useState, useEffect } from 'react';
import { LayoutGrid, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { DailyCodeWidget } from '../components/DailyCodeWidget';
import { GitHubDashboard } from '../components/GitHubDashboard';
import { Stats } from '../components/Stats';
import { OpenSource } from '../components/OpenSource';
import { Community } from '../components/Community';
import { CTA } from '../components/CTA';
import { HomeSEOWrapper } from '../components/seo';

const MINIMAL_MODE_KEY = 'yule-minimal-mode';

export function HomePage() {
  const [isMinimalMode, setIsMinimalMode] = useState(() => {
    const saved = localStorage.getItem(MINIMAL_MODE_KEY);
    return saved === 'true';
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleMinimalMode = () => {
    const newMode = !isMinimalMode;
    setIsMinimalMode(newMode);
    localStorage.setItem(MINIMAL_MODE_KEY, String(newMode));
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HomeSEOWrapper>
      {/* Minimal Mode Toggle */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <button
          onClick={toggleMinimalMode}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
            transition-all duration-300 hover:scale-105
            ${isMinimalMode 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-card text-foreground border border-border hover:border-primary/50'
            }
          `}
          title={isMinimalMode ? '退出极简模式' : '进入极简模式'}
        >
          {isMinimalMode ? (
            <>
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-medium">完整模式</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-4 h-4" />
              <span className="text-sm font-medium">极简模式</span>
            </>
          )}
        </button>
      </motion.div>

      <Hero />
      <Features />
      
      {!isMinimalMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GitHubDashboard />
          <DailyCodeWidget />
          <Stats />
          <OpenSource />
          <Community />
          <CTA />
        </motion.div>
      )}
      </HomeSEOWrapper>
    </motion.div>
  );
}
