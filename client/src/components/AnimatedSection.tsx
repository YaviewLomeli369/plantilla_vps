import React from "react";
import { motion } from "framer-motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSection({ 
  children, 
  className = "",
  delay = 0 
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut",
        delay: delay 
      }}
      viewport={{ 
        once: true, 
        amount: 0.1,
        margin: "0px 0px -100px 0px"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}