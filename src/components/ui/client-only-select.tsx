"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientOnlySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  triggerProps?: {
    className?: string;
    placeholder?: string;
    children?: React.ReactNode;
  };
  contentProps?: {
    className?: string;
    position?: "item-aligned" | "popper";
  };
}

export const ClientOnlySelect: React.FC<ClientOnlySelectProps> = ({
  value,
  onValueChange,
  disabled,
  children,
  triggerProps,
  contentProps,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a similar-looking placeholder during SSR
    return (
      <div className="relative">
        <div
          className={`${
            triggerProps?.className ||
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          }`}
        >
          <span className="text-muted-foreground">
            {triggerProps?.placeholder || "Select..."}
          </span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 opacity-50"
            aria-hidden="true"
          >
            <path
              d="m4.93179 5.43179c.20264-.20264.53186-.20264.73451 0L7.5 7.26588l1.83392-1.83409c.20264-.20264.53186-.20264.73451 0 .20264.20264.20264.53186 0 .73451L8.23223 8c-.20264.20264-.53186.20264-.73451 0L5.66544 6.16631c-.20264-.20264-.20264-.53186 0-.73451Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={triggerProps?.className}>
        {triggerProps?.children || (
          <SelectValue placeholder={triggerProps?.placeholder} />
        )}
      </SelectTrigger>
      <SelectContent
        className={contentProps?.className}
        position={contentProps?.position}
      >
        {children}
      </SelectContent>
    </Select>
  );
};