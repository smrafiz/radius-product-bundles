"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export function AnimatedTabPanel({
    tabKey,
    children,
}: {
    tabKey: string;
    children: ReactNode;
}) {
    return (
        <motion.div
            key={tabKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{
                duration: 0.22,
                ease: "easeOut",
            }}
        >
            {children}
        </motion.div>
    );
}
