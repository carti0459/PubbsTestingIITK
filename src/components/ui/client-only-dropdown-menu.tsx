"use client";

import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientOnlyDropdownMenuProps {
  children: React.ReactNode;
  triggerChildren: React.ReactNode;
  contentProps?: {
    className?: string;
    align?: "start" | "center" | "end";
    side?: "top" | "right" | "bottom" | "left";
  };
}

export const ClientOnlyDropdownMenu: React.FC<ClientOnlyDropdownMenuProps> = ({
  children,
  triggerChildren,
  contentProps,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="relative">
        {triggerChildren}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerChildren}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={contentProps?.align}
        side={contentProps?.side}
        className={contentProps?.className}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Export the individual components for convenience
export { DropdownMenuItem, DropdownMenuSeparator };