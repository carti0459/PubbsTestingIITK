"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useOperator } from "@/contexts/OperatorContext";
import OperatorSelection from "@/components/common/OperatorSelection";

export default function WelcomePage() {
  const { isOperatorSelected } = useOperator();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showOperatorSelection, setShowOperatorSelection] = useState(false);

  useEffect(() => {
    if (isOperatorSelected) {
      window.location.href = "/minDashboard";
      return;
    }

    const timer = setTimeout(() => {
      setShowWelcome(false);

      setTimeout(() => {
        setShowOperatorSelection(true);
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isOperatorSelected]);

  return (
    <div className="min-h-screen bg-[#0B111A] overflow-hidden">
      {/* Welcome Screen with Animations */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="min-h-screen flex flex-col items-center justify-center px-6 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo with entrance animation */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 1.1 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                bounce: 0.4,
              }}
            >
              <Image
                src="/assets/logo.svg"
                alt="Pubbs Logo"
                width={120}
                height={60}
                className="mx-auto"
              />
            </motion.div>

            {/* Success Icon with bounce */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0, rotate: 180 }}
              transition={{
                duration: 1,
                delay: 0.6,
                type: "spring",
                bounce: 0.6,
              }}
            >
              <div className="w-20 h-20 rounded-full bg-opacity-10 flex items-center justify-center">
                <Image
                  src="/assets/done.png"
                  alt="Success"
                  width={100}
                  height={100}
                />
              </div>
            </motion.div>

            {/* Welcome Text with slide up */}
            <motion.div
              className="text-center space-y-3 max-w-xs"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <h2 className="text-white text-2xl font-semibold">
                Welcome to Pubbs.
              </h2>
              <p className="text-gray-400 text-base">
                You have successfully registered!
              </p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <div className="flex space-x-2">
                <motion.div
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0,
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.4,
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operator Selection Screen */}
      <OperatorSelection isVisible={showOperatorSelection} />
    </div>
  );
}
