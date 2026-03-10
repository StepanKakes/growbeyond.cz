"use client";

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FadeUpProps {
    children: ReactNode;
    delay?: number;
    translateY?: number;
    className?: string;
}

export const FadeUp = ({ children, delay = 0, translateY = 50, className = "" }: FadeUpProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: translateY }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
                duration: 0.4,
                ease: [0.21, 0.47, 0.32, 0.98],
                delay
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
