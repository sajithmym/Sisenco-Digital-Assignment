"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastVariant, { icon: React.ElementType; className: string }> = {
  success: { icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-950" },
  error: { icon: XCircle, className: "border-rose-200 bg-rose-50 text-rose-950" },
  info: { icon: Info, className: "border-sky-200 bg-sky-50 text-sky-950" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((item: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { ...item, id }]);
  }, []);

  const dismiss = React.useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider duration={5000} swipeDirection="right">
        {children}
        {toasts.map((item) => {
          const style = toastStyles[item.variant];
          const Icon = style.icon;
          return (
            <ToastPrimitive.Root
              key={item.id}
              open
              onOpenChange={(open) => !open && dismiss(item.id)}
              className={cn(
                "group pointer-events-auto relative flex w-full items-start gap-3 rounded-xl border p-4 pr-10 shadow-lg",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-right-full",
                style.className,
              )}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="grid gap-1">
                <ToastPrimitive.Title className="text-sm font-semibold">{item.title}</ToastPrimitive.Title>
                {item.description && <ToastPrimitive.Description className="text-sm opacity-80">{item.description}</ToastPrimitive.Description>}
              </div>
              <ToastPrimitive.Close className="absolute right-3 top-3 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss notification</span>
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed right-0 top-0 z-[100] flex max-h-screen w-full flex-col gap-3 p-4 sm:max-w-md" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
