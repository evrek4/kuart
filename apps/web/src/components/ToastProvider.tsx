"use client";

import { Toaster } from "sonner";

/**
 * ToastProvider
 * Uygulamanın tamamında Sonner toast bildirimlerini aktif eder.
 * apps/web/src/app/layout.tsx içine eklenir.
 *
 * Kullanım:
 *   import { toast } from "sonner";
 *   toast.error("Mesaj");
 *   toast.success("Mesaj");
 *   toast.warning("Mesaj");
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: "inherit",
          fontSize: "0.875rem",
          borderRadius: "12px",
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-neutral-900 group-[.toaster]:border group-[.toaster]:border-neutral-200 group-[.toaster]:dark:border-neutral-800 group-[.toaster]:shadow-lg",
          error:
            "group-[.toaster]:text-red-600 group-[.toaster]:dark:text-red-400",
          success:
            "group-[.toaster]:text-emerald-600 group-[.toaster]:dark:text-emerald-400",
          warning:
            "group-[.toaster]:text-amber-600 group-[.toaster]:dark:text-amber-400",
          description:
            "group-[.toaster]:text-neutral-500 group-[.toaster]:dark:text-neutral-400",
        },
        duration: 5000,
      }}
    />
  );
}
