"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ScaleLogo from "@/components/ui/ScaleLogo";

export type AuthShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scale-950 via-scale-900 to-scale-800 p-6">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <ScaleLogo size="lg" showText />
          </div>
          <CardTitle className="text-white mt-2">{title}</CardTitle>
          {description && (
            <CardDescription className="text-silver-300">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="flex flex-wrap justify-between gap-2 text-silver-300 text-sm">
            {footer}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export function AuthInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id?: string }
) {
  const { label, id, className, ...rest } = props;
  const inputId = id || rest.name || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm text-silver-200">
        {label}
      </label>
      <input
        id={inputId}
        className={[
          "w-full rounded px-3 py-2",
          "bg-white/5 border border-white/20",
          "text-white placeholder-silver-400",
          "focus:outline-none focus:ring-2 focus:ring-scale-600 focus:border-scale-600",
          className || "",
        ].join(" ")}
        {...rest}
      />
    </div>
  );
}

