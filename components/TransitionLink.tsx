"use client";

import Link, { LinkProps } from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React from "react";

interface TransitionLinkProps extends Omit<LinkProps<unknown>, "href"> {
  children: React.ReactNode;
  href: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function TransitionLink({ 
  children, 
  href, 
  className, 
  onClick, 
  ...props 
}: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Fire any custom onClick handlers (like closing your mobile menu)
    if (onClick) onClick(e);

    // Abort if we are already on the target page
    if (pathname === href) return;
    
    // Lock interactions during the transition
    document.body.style.pointerEvents = "none";

    // Dispatch event to the 3D Canvas
    window.dispatchEvent(
      new CustomEvent("start-3d-transition", { 
        detail: { href, router } 
      })
    );
  };

  return (
    <Link {...props} href={href as any} onClick={handleTransition} className={className}>
      {children}
    </Link>
  );
}