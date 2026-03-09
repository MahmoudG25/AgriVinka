import React from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AuthShell — Layout route wrapper for Login / Register / Reset-Password.
 *
 * This component stays MOUNTED while child routes swap.
 * AnimatePresence lives here so it can properly animate exit + enter
 * when navigating between /login ↔ /register ↔ /reset-password.
 *
 * Usage in routes: <Route element={<AuthShell />}> ... child routes ... </Route>
 */

/* ─── prefers-reduced-motion hook ─── */
const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
};

/* ─── Animation variants ─── */
const pageVariants = {
  initial: { opacity: 0, x: 30, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -30, filter: 'blur(4px)' },
};


const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1], // ease-out-expo
};

const AuthShell = () => {
  const location = useLocation();
  const currentOutlet = useOutlet();
  const prefersReduced = usePrefersReducedMotion();
  const variants = prefersReduced ? reducedVariants : pageVariants;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-display"
    >
      {/* ─── Card Container ─── */}
      <div className="w-full max-w-[1100px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row-reverse min-h-[600px] lg:min-h-[680px]">

        {/* ─── Left Side: Decorative Image (stays static) ─── */}
        <div className="relative lg:w-[48%] h-48 sm:h-56 lg:h-auto shrink-0 overflow-hidden">
          <img
            src="/auth-hero.png"
            alt="AgriVinka — تعليم زراعي"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Logo badge on desktop */}
          <Link to="/" className="absolute top-6 right-6 hidden lg:flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-black/30 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-lg">eco</span>
            </div>
            <span className="text-lg font-black text-white drop-shadow-lg tracking-wide">AgriVinka</span>
          </Link>

          {/* Bottom tagline on desktop */}
          <div className="absolute bottom-8 right-8 left-8 hidden lg:block">
            <p className="text-white/90 text-sm font-medium leading-relaxed">
              منصة رائدة في التعليم الزراعي التقني — أكثر من 10,000 طالب يثقون بنا
            </p>
          </div>
        </div>

        {/* ─── Right Side: Form (animated) ─── */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12 relative overflow-hidden">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-lg">eco</span>
              </div>
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-wide">AgriVinka</span>
            </Link>
          </div>

          {/* ─── AnimatePresence: exit old form, enter new form ─── */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {currentOutlet}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-[11px] text-gray-400 mt-8">
            © {new Date().getFullYear()} AgriVinka — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
