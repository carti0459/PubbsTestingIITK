// Service Worker Registration for PUBBS PWA
// Handles service worker lifecycle and provides offline capabilities

// Type declarations
declare global {
  interface Window {
    pwaManager: PWAManager;
    gtag?: (...args: unknown[]) => void;
  }
}

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

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private isSupported = false;

  constructor() {
    this.init();
  }

  private async init() {
    this.checkPWASupport();
    await this.registerServiceWorker();
    this.setupInstallPrompt();
    this.handleAppInstall();
  }

  private checkPWASupport() {
    this.isSupported = "serviceWorker" in navigator;

    if (!this.isSupported) {
      console.warn("PWA features not supported in this browser");
      return;
    }

    // Check if app is already installed
    this.isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }

  private async registerServiceWorker() {
    if (!this.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // Handle service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New update available
                this.notifyUpdate();
              } else {
                // App is ready for offline use
                this.notifyReady();
              }
            }
          });
        }
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  private setupInstallPrompt() {
    if (!this.isSupported) return;

    window.addEventListener("beforeinstallprompt", (event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();

      // Store the event for later use
      this.deferredPrompt = event;

      // Show custom install prompt
      this.showInstallPrompt();
    });
  }

  private handleAppInstall() {
    if (!this.isSupported) return;

    window.addEventListener("appinstalled", () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.hideInstallPrompt();

      // Track installation
      this.trackInstallation();
    });
  }

  private showInstallPrompt() {
    if (this.isInstalled) return;

    // Create install prompt UI
    const installPrompt = document.createElement("div");
    installPrompt.id = "pwa-install-prompt";
    installPrompt.className = `
      fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50
      transform transition-transform duration-300 translate-y-full
    `;

    installPrompt.innerHTML = `
      <div class="flex items-center space-x-3">
        <img src="/assets/pubbs_logo.png" alt="PUBBS" class="w-12 h-12 rounded-lg">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900">Install PUBBS App</h3>
          <p class="text-sm text-gray-600">Get the full app experience with offline access</p>
        </div>
        <div class="flex space-x-2">
          <button id="install-dismiss" class="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
            Later
          </button>
          <button id="install-accept" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            Install
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(installPrompt);

    // Animate in
    setTimeout(() => {
      installPrompt.style.transform = "translateY(0)";
    }, 100);

    // Handle install actions
    const dismissBtn = installPrompt.querySelector("#install-dismiss");
    const acceptBtn = installPrompt.querySelector("#install-accept");

    dismissBtn?.addEventListener("click", () => {
      this.hideInstallPrompt();
    });

    acceptBtn?.addEventListener("click", () => {
      this.triggerInstall();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideInstallPrompt();
    }, 10000);
  }

  private hideInstallPrompt() {
    const prompt = document.getElementById("pwa-install-prompt");
    if (prompt) {
      prompt.style.transform = "translateY(100%)";
      setTimeout(() => {
        prompt.remove();
      }, 300);
    }
  }

  private async triggerInstall() {
    if (!this.deferredPrompt) return;

    try {
      // Show the install prompt
      await this.deferredPrompt.prompt();

      // Wait for the user's choice
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === "accepted") {
      } else {
      }

      this.deferredPrompt = null;
      this.hideInstallPrompt();
    } catch (error) {
      console.error("Install prompt failed:", error);
    }
  }

  private notifyUpdate() {
    // Show update notification
    const updateNotification = document.createElement("div");
    updateNotification.className = `
      fixed top-4 left-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50
      transform transition-transform duration-300 -translate-y-full
    `;

    updateNotification.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold">App Update Available</h3>
          <p class="text-sm opacity-90">Refresh to get the latest features</p>
        </div>
        <button id="update-refresh" class="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium">
          Refresh
        </button>
      </div>
    `;

    document.body.appendChild(updateNotification);

    // Animate in
    setTimeout(() => {
      updateNotification.style.transform = "translateY(0)";
    }, 100);

    // Handle refresh
    const refreshBtn = updateNotification.querySelector("#update-refresh");
    refreshBtn?.addEventListener("click", () => {
      window.location.reload();
    });

    // Auto-hide after 8 seconds
    setTimeout(() => {
      updateNotification.style.transform = "translateY(-100%)";
      setTimeout(() => {
        updateNotification.remove();
      }, 300);
    }, 8000);
  }

  private notifyReady() {
    // Optional: Show offline ready notification
    const readyNotification = document.createElement("div");
    readyNotification.className = `
      fixed top-4 left-4 right-4 bg-green-600 text-white rounded-lg shadow-lg p-3 z-50
      transform transition-all duration-300 -translate-y-full opacity-0
    `;

    readyNotification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        <span class="text-sm font-medium">App is ready for offline use</span>
      </div>
    `;

    document.body.appendChild(readyNotification);

    // Animate in
    setTimeout(() => {
      readyNotification.style.transform = "translateY(0)";
      readyNotification.style.opacity = "1";
    }, 100);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      readyNotification.style.transform = "translateY(-100%)";
      readyNotification.style.opacity = "0";
      setTimeout(() => {
        readyNotification.remove();
      }, 300);
    }, 3000);
  }

  private handleServiceWorkerMessage(data: { type: string; [key: string]: unknown }) {
    switch (data.type) {
      case "CACHE_UPDATED":
        break;
      case "SYNC_COMPLETE":
        break;
      default:
    }
  }

  private trackInstallation() {
    // Track PWA installation for analytics
    try {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pwa_install", {
          event_category: "engagement",
          event_label: "PWA Installation",
        });
      }
    } catch (error) {
      console.warn("Analytics tracking failed:", error);
    }
  }

  // Public methods
  public async requestPersistentStorage() {
    if ("storage" in navigator && "persist" in navigator.storage) {
      try {
        const persistent = await navigator.storage.persist();

        return persistent;
      } catch (error) {
        console.error("Persistent storage request failed:", error);
        return false;
      }
    }
    return false;
  }

  public async getStorageEstimate() {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();

        return estimate;
      } catch (error) {
        console.error("Storage estimate failed:", error);
        return null;
      }
    }
    return null;
  }

  public getInstallationStatus() {
    return {
      isSupported: this.isSupported,
      isInstalled: this.isInstalled,
      canInstall: this.deferredPrompt !== null,
    };
  }
}

// Initialize PWA manager when DOM is loaded
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    window.pwaManager = new PWAManager();
  });
}

export default PWAManager;
