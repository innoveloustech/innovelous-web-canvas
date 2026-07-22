"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface TransitionLinkProps extends Omit<LinkProps<React.ElementRef<"a">>, "href"> {
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
  const pathname = usePathname();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (onClick) onClick(e);

    if (pathname === href) return;
    
    document.body.style.pointerEvents = "none";

    window.dispatchEvent(
      new CustomEvent("start-3d-transition", { 
        detail: { href } 
      })
    );
  };

  return (
    <Link {...props} href={href} onClick={handleTransition} className={className}>
      {children}
    </Link>
  );
}