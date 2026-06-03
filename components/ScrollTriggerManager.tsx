"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollTriggerManager() {
  const pathname = usePathname();

  useEffect(() => {
    // When the route changes, the DOM updates. 
    // We tell ScrollTrigger to recalculate all element positions.
    // A slight timeout ensures the new page's layout has fully painted.
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}