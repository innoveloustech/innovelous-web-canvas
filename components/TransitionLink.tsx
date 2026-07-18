"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
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
  const router = useTransitionRouter();
  const pathname = usePathname();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Fire any custom onClick handlers (like closing your mobile menu)
    if (onClick) onClick(e);

    // Abort if we are already on the target page
    if (pathname === href) return;
    
    // Lock interactions during the transition
    document.body.style.pointerEvents = "none";

    // Use the real browser View Transitions API via next-view-transitions.
    // `onTransitionReady` fires at the exact moment the browser has captured
    // the "before" screenshot — the ideal time to start the 3D WebGL shader.
    router.push(href, {
      onTransitionReady: () => {
        window.dispatchEvent(
          new CustomEvent("start-3d-transition", { 
            detail: { href, router } 
          })
        );
      }
    });
  };

  return (
    <Link {...props} href={href as any} onClick={handleTransition} className={className}>
      {children}
    </Link>
  );
}