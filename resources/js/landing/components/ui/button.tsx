import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/landing/lib/utils";

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "icon-sm";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md border text-sm transition-colors",
        variant === "ghost" && "border-transparent bg-transparent hover:bg-slate-100",
        variant === "outline" && "border-slate-200 bg-white hover:bg-slate-50",
        variant === "default" && "border-transparent bg-slate-900 text-white",
        size === "icon-sm" ? "h-8 w-8" : "px-3 py-2",
        className,
      )}
      {...props}
    />
  );
}
