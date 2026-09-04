"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
  loading = false,
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl focus:outline-none">
          <div className="flex gap-3">
            <div className="rounded-full bg-amber-50 p-2 text-amber-700"><AlertTriangle className="h-5 w-5" /></div>
            <div className="space-y-2">
              <AlertDialog.Title className="text-lg font-semibold text-slate-950">{title}</AlertDialog.Title>
              <AlertDialog.Description className="text-sm leading-6 text-slate-600">{description}</AlertDialog.Description>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild><Button variant="outline" disabled={loading}>Cancel</Button></AlertDialog.Cancel>
            <Button variant={variant} disabled={loading} onClick={onConfirm}>{loading ? "Working..." : confirmLabel}</Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
