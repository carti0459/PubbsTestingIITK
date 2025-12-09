"use client";

import React, { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface PWAInstallPromptProps {
  className?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className = "",
}) => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const fullscreen = window.matchMedia(
        "(display-mode: fullscreen)"
      ).matches;
      const minimalUI = window.matchMedia("(display-mode: minimal-ui)").matches;

      return (
        standalone ||
        fullscreen ||
        minimalUI ||
        (window.navigator as any).standalone
      );
    };

    const checkIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    };

    const installed = checkInstalled();
    const iOS = checkIOS();

    setIsInstalled(installed);
    setIsIOS(iOS);

    if (installed) {
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);

      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (iOS && !installed) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) {
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          setShowInstallPrompt(false);
          setIsInstalled(true);
        }

        setDeferredPrompt(null);
      } catch (error) {
        console.error("PWA: Error during installation:", error);
      }
    } else if (isIOS) {
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);

    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  useEffect(() => {
    const dismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      setShowInstallPrompt(false);
    }
  }, []);

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}
      >
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 mx-auto max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Install PUBBS App
              </h3>

              {isIOS ? (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Tap{" "}
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded">
                    ⎿
                  </span>{" "}
                  then &quot;Add to Home Screen&quot; to install
                </p>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Get quick access and offline features
                </p>
              )}

              <div className="flex items-center space-x-2 mt-3">
                {!isIOS && (
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1 h-7"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Install
                  </Button>
                )}

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs px-2 py-1 h-7"
                >
                  Not now
                </Button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
