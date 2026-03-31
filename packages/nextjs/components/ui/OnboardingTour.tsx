"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AppLogo } from "~~/components/AppLogo";

// ───────────────────────────────────────────────────────────────
// Types & Constants
// ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "aeternum_onboarding_complete";

interface TourStep {
  /** CSS selector or element ID to spotlight */
  target: string;
  /** Tooltip headline */
  title: string;
  /** Tooltip body (end-user friendly) */
  description: string;
  /** Position of the tooltip relative to the target */
  placement: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "#hero-cta",
    title: "Welcome to Aeternum",
    description:
      "This is your gateway to the world's first private evidence vault. Click here anytime to access your encrypted workspace.",
    placement: "bottom",
  },
  {
    target: "#wallet-connect",
    title: "Connect Your Wallet",
    description:
      "Link your crypto wallet to start encrypting and uploading evidence. Everything is tied to your wallet. Only you hold the keys.",
    placement: "bottom",
  },
  {
    target: "#nav-vault",
    title: "Your Evidence Vault",
    description:
      "Upload files, organize evidence into folders, and manage all your encrypted proofs in one secure workspace.",
    placement: "bottom",
  },
  {
    target: "#nav-verify",
    title: "Verify Any Evidence",
    description:
      "Anyone can verify that a piece of evidence exists on-chain without ever seeing the content. That is zero-knowledge in action.",
    placement: "bottom",
  },
  {
    target: "#nav-manage",
    title: "Manage Your Workspace",
    description:
      "Organize your evidence, manage team access, and track documentation history from a centralized dashboard.",
    placement: "bottom",
  },
  {
    target: "#nav-settings",
    title: "Account Settings",
    description: "Customize your profile, manage API keys, and configure your security preferences here.",
    placement: "bottom",
  },
  {
    target: "#footer-billing",
    title: "Usage & Billing",
    description: "Track your storage usage and manage your subscription plan quickly from the footer.",
    placement: "top",
  },
  {
    target: "#footer-help",
    title: "Get Support",
    description:
      "Access our documentation or contact our support team if you ever need assistance. We are here to help.",
    placement: "top",
  },
];

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────

function getRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  return el ? el.getBoundingClientRect() : null;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// ───────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────

export const OnboardingTour = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Check localStorage on mount — only launch if user hasn't completed
  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so the page paints first
      const timer = setTimeout(() => setShowWelcome(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Track the target element position whenever step changes
  useEffect(() => {
    if (currentStep < 0 || currentStep >= TOUR_STEPS.length) return;

    const step = TOUR_STEPS[currentStep];
    const updateRect = () => {
      const rect = getRect(step.target);
      if (rect) {
        setTargetRect(rect);
        // Scroll the target into view
        const el = document.querySelector(step.target);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [currentStep]);

  const completeTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setCurrentStep(-1);
    setShowWelcome(false);
    setTargetRect(null);
  }, []);

  const startTour = useCallback(() => {
    setShowWelcome(false);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      completeTour();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, completeTour]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  // ─── Welcome Dialog ────────────────────────────────────────
  if (showWelcome) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Dialog */}
        <div className="relative bg-base-100 border border-base-300 rounded-3xl shadow-2xl shadow-primary/20 p-8 sm:p-12 max-w-lg w-full text-center animate-in zoom-in-95 fade-in duration-500">
          {/* Decorative glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <AppLogo className="h-16 w-16" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content mb-3">
              Welcome to Aeternum
            </h2>
            <p className="text-sm sm:text-base text-base-content/60 font-medium leading-relaxed mb-8 max-w-sm mx-auto">
              Your private evidence vault. Let us show you around in 30 seconds. See how to encrypt, store, and prove
              ownership of any file.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={startTour}
                className="btn btn-primary btn-lg rounded-2xl px-10 gap-2 shadow-xl shadow-primary/20 group w-full sm:w-auto"
              >
                <span>Take the Tour</span>
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={completeTour}
                className="btn btn-ghost btn-lg rounded-2xl px-10 text-base-content/40 hover:text-base-content/70 w-full sm:w-auto"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Tour Overlay ──────────────────────────────────────────
  if (currentStep < 0 || currentStep >= TOUR_STEPS.length || !targetRect) {
    return null;
  }

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  // Spotlight cutout dimensions (add padding around the target)
  const PAD = 8;
  const spot = {
    x: targetRect.left - PAD + window.scrollX,
    y: targetRect.top - PAD + window.scrollY,
    w: targetRect.width + PAD * 2,
    h: targetRect.height + PAD * 2,
  };

  // Tooltip position
  const TOOLTIP_W = 360;
  const TOOLTIP_GAP = 16;
  let tooltipStyle: React.CSSProperties = {};

  switch (step.placement) {
    case "bottom":
      tooltipStyle = {
        position: "fixed",
        top: clamp(targetRect.bottom + TOOLTIP_GAP, 8, window.innerHeight - 260),
        left: clamp(targetRect.left + targetRect.width / 2 - TOOLTIP_W / 2, 8, window.innerWidth - TOOLTIP_W - 8),
        width: TOOLTIP_W,
      };
      break;
    case "top":
      tooltipStyle = {
        position: "fixed",
        bottom: window.innerHeight - targetRect.top + TOOLTIP_GAP,
        left: clamp(targetRect.left + targetRect.width / 2 - TOOLTIP_W / 2, 8, window.innerWidth - TOOLTIP_W - 8),
        width: TOOLTIP_W,
      };
      break;
    case "left":
      tooltipStyle = {
        position: "fixed",
        top: clamp(targetRect.top, 8, window.innerHeight - 260),
        right: window.innerWidth - targetRect.left + TOOLTIP_GAP,
        width: TOOLTIP_W,
      };
      break;
    case "right":
      tooltipStyle = {
        position: "fixed",
        top: clamp(targetRect.top, 8, window.innerHeight - 260),
        left: targetRect.right + TOOLTIP_GAP,
        width: TOOLTIP_W,
      };
      break;
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with spotlight cutout via SVG mask */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={spot.x - window.scrollX}
              y={spot.y - window.scrollY}
              width={spot.w}
              height={spot.h}
              rx={12}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#spotlight-mask)"
          style={{ pointerEvents: "auto" }}
          onClick={nextStep}
        />
      </svg>

      {/* Spotlight ring around the target */}
      <div
        className="absolute border-2 border-primary rounded-xl pointer-events-none animate-pulse"
        style={{
          left: spot.x - window.scrollX,
          top: spot.y - window.scrollY,
          width: spot.w,
          height: spot.h,
          boxShadow: "0 0 0 4px rgba(var(--color-primary-rgb), 0.15), 0 0 30px rgba(var(--color-primary-rgb), 0.1)",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="bg-base-100 border border-base-300 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={tooltipStyle}
      >
        {/* Progress bar */}
        <div className="h-1 bg-base-200">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-5 sm:p-6">
          {/* Step counter */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={completeTour}
              className="btn btn-ghost btn-xs btn-circle text-base-content/30 hover:text-error"
              aria-label="Close tour"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          <h3 className="text-lg font-black tracking-tight text-base-content mb-2">{step.title}</h3>
          <p className="text-sm text-base-content/60 leading-relaxed mb-5">{step.description}</p>

          {/* Step indicators */}
          <div className="flex items-center gap-1.5 mb-4">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? "w-6 bg-primary" : i < currentStep ? "w-3 bg-primary/30" : "w-3 bg-base-300"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={completeTour}
              className="text-xs font-bold text-base-content/30 hover:text-base-content/60 transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button onClick={prevStep} className="btn btn-ghost btn-sm rounded-xl text-base-content/60">
                  Back
                </button>
              )}
              <button
                onClick={nextStep}
                className="btn btn-primary btn-sm rounded-xl px-6 gap-1.5 shadow-lg shadow-primary/20"
              >
                <span>{isLast ? "Got it!" : "Next"}</span>
                {!isLast && <ArrowRightIcon className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Reset the onboarding tour so it will show again on next visit.
 * Call this from Settings page.
 */
export function resetOnboardingTour() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
