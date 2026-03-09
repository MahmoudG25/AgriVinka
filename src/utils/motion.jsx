/**
 * motion.js — Centralized animation system for AgriVinka
 *
 * Single source of truth for animation tokens, a reduced-motion hook,
 * and reusable Framer Motion wrapper components.
 *
 * Usage:
 *   import { FadeIn, SlideUp, ScaleCard, StaggerList, StaggerItem, PageTransition } from '@/utils/motion';
 */
import React from 'react';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════
   TOKENS
   ═══════════════════════════════════════════ */
export const tokens = {
  duration: {
    fast: 0.2,
    normal: 0.35,
    slow: 0.5,
    page: 0.4,
  },
  ease: {
    out: [0.22, 1, 0.36, 1],       // expo-out — snappy deceleration
    inOut: [0.4, 0, 0.2, 1],       // material standard
    spring: { type: 'spring', stiffness: 260, damping: 20 },
  },
  distance: {
    sm: 8,   // subtle nudge
    md: 16,  // default reveal
    lg: 28,  // hero-level entrance
  },
};

/* ═══════════════════════════════════════════
   REDUCED MOTION HOOK
   ═══════════════════════════════════════════ */
/**
 * Returns `true` when the user has enabled "Reduce motion" in OS settings.
 * All wrapper components use this automatically.
 */
export const useReducedMotion = () => {
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

/* ═══════════════════════════════════════════
   REUSABLE WRAPPER COMPONENTS
   ═══════════════════════════════════════════ */

/**
 * FadeIn — Fades in (+ optional translateY) when the element enters the viewport.
 *
 * Props:
 *   delay      — extra delay in seconds (default 0)
 *   y          — vertical offset in px (default tokens.distance.md)
 *   duration   — animation duration (default tokens.duration.normal)
 *   once       — animate only the first time (default true)
 *   className  — passthrough
 *   as         — HTML tag name (default 'div')
 *   children
 */
export const FadeIn = ({
  children,
  delay = 0,
  y = tokens.distance.md,
  duration = tokens.duration.normal,
  once = true,
  className = '',
  as = 'div',
  ...rest
}) => {
  const reduced = useReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{ duration, delay, ease: tokens.ease.out }}
      className={className}
      {...rest}
    >
      {children}
    </Component>
  );
};

/**
 * SlideUp — Stronger vertical entrance for hero sections and headings.
 */
export const SlideUp = ({
  children,
  delay = 0,
  duration = tokens.duration.slow,
  className = '',
  ...rest
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : tokens.distance.lg }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: tokens.ease.out }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScaleCard — Interactive card wrapper with hover lift + tap press.
 * Also reveals with a whileInView fade.
 *
 * Props:
 *   hoverY   — vertical lift on hover in px (default -4)
 *   className
 */
export const ScaleCard = ({
  children,
  hoverY = -4,
  className = '',
  ...rest
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : tokens.distance.md }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={reduced ? {} : { y: hoverY, transition: { duration: tokens.duration.fast } }}
      whileTap={reduced ? {} : { scale: 0.985 }}
      transition={{ duration: tokens.duration.normal, ease: tokens.ease.out }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerList + StaggerItem — Parent/child stagger pattern.
 *
 *   <StaggerList>
 *     <StaggerItem>Card 1</StaggerItem>
 *     <StaggerItem>Card 2</StaggerItem>
 *   </StaggerList>
 */
export const StaggerList = ({
  children,
  staggerDelay = 0.06,
  className = '',
  ...rest
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-40px' }}
    variants={{
      visible: { transition: { staggerChildren: staggerDelay } },
    }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({
  children,
  className = '',
  ...rest
}) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : tokens.distance.sm },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: tokens.duration.normal, ease: tokens.ease.out },
        },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/**
 * PageTransition — Lightweight fade for page-level enters.
 * Wraps the entire page content inside PageShell.
 */
export const PageTransition = ({ children, className = '' }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : tokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: tokens.duration.page, ease: tokens.ease.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
