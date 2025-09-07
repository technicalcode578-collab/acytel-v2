// frontend/acytel_frontend/src/core/motion.ts

// Define a local type for variants as 'solid-motion' doesn't export one.
type AnimationVariants = {
  [key: string]: {
    [key: string]: any;
  };
};

export const fadeIn: AnimationVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideInFromBottom: AnimationVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { y: 50, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

export const staggerContainer: AnimationVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem: AnimationVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const pageTransition: AnimationVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: 'easeInOut' } }
};