"use client";

import { useEffect } from "react";
import MouseFollower from "mouse-follower";
import gsap from "gsap";
import "mouse-follower/dist/mouse-follower.min.css";

export default function Cursor() {
  useEffect(() => {
    MouseFollower.registerGSAP(gsap);

    const cursor = new MouseFollower({
      stateDetection: {
        "-pointer": "button, [data-cursor-pointer]",
      },
      skewing: 3, // Premium modern fluid stretching on fast track speeds
      speed: 0.4,
    });

    // Save instance to global window context safely
    (window as any).mouseFollower = cursor;

    return () => {
      cursor.destroy();
    };
  }, []);

  return null;
}
