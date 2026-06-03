"use client";
import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";

interface DropdownItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Solutions",
    dropdown: [
      { label: "Social Media Expert", href: "/solutions/social-media" },
      { label: "IoT Solutions", href: "/solutions/iot" },
      { label: "Machine Learning", href: "/solutions/machine-learning" },
      { label: "AI Integration", href: "/solutions/ai-integration" },
      { label: "Web Development", href: "/solutions/web-development" },
      { label: "App Development", href: "/solutions/app-development" },
      { label: "Custom Software Development", href: "/solutions/custom-software" },
      { label: "UI & UX Design", href: "/solutions/ui-ux" },
    ],
  },
  { label: "Projects", href: "/projects" },
];

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navRef = useRef<HTMLDivElement>(null);
  const hoverPillRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Desktop Initial Load Entrance Animations
  useGSAP(
    () => {
      gsap.from(".nav-item-wrapper", { y: -20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
      gsap.from(".logo", { x: -30, opacity: 0, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(".desktop-cta", { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: "power3.out", immediateRender: false });
    },
    { scope: navRef }
  );

  // Mobile Drawer Open/Close Timeline
  useGSAP(
    () => {
      gsap.set(mobileMenuRef.current, { xPercent: 100 });
      mobileTimelineRef.current = gsap.timeline({ paused: true });
      mobileTimelineRef.current
        .to(mobileMenuRef.current, { xPercent: 0, duration: 0.5, ease: "power4.out" })
        .from(".mobile-nav-link", { x: 50, opacity: 0, stagger: 0.08, duration: 0.4, ease: "power3.out" }, "-=0.2")
        .from(".mobile-cta-btn", { y: 20, opacity: 0, duration: 0.4, ease: "power3.out" }, "-=0.2");
    },
    { scope: navRef }
  );

  useEffect(() => {
    if (mobileTimelineRef.current) {
      isMobileMenuOpen ? mobileTimelineRef.current.play() : mobileTimelineRef.current.reverse();
    }
  }, [isMobileMenuOpen]);

  // Desktop Sliding Background Pill logic
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, label: string) => {
    const targetWrapper = e.currentTarget;
    const pill = hoverPillRef.current;
    const container = menuContainerRef.current;
    
    if (pill && container) {
      const targetRect = targetWrapper.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      gsap.to(pill, {
        left: targetRect.left - containerRect.left,
        width: targetRect.width,
        height: targetRect.height,
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
      });
    }

    if (navItems.find((item) => item.label === label)?.dropdown) {
      setActiveDropdown(label);
      const dropdown = dropdownRefs.current[label];
      if (dropdown) {
        gsap.to(dropdown, { height: "auto", opacity: 1, y: 0, duration: 0.3, ease: "power3.out", overwrite: "auto" });
      }
    }
  };

  const handleMouseLeave = (label: string) => {
    const dropdown = dropdownRefs.current[label];
    if (dropdown) {
      gsap.to(dropdown, {
        height: 0, opacity: 0, y: 10, duration: 0.25, ease: "power3.in", overwrite: "auto",
        onComplete: () => setActiveDropdown(null),
      });
    }
  };

  const handleMenuMouseLeave = () => {
    if (hoverPillRef.current) {
      gsap.to(hoverPillRef.current, { opacity: 0, scale: 0.8, duration: 0.3, ease: "power3.inOut" });
    }
  };

  // CTA Button hover animation handlers
  const handleCtaMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    gsap.to(btn.querySelector(".cta-bg-fill"), { width: "100%", duration: 0.45, ease: "power3.out" });
    gsap.to(btn.querySelector(".cta-text"), { color: "#ffffff", duration: 0.35, ease: "power3.out", delay: 0.08 });
    gsap.to(btn.querySelector(".cta-icon-bg"), { backgroundColor: "#ffffff", duration: 0.35, ease: "power3.out", delay: 0.08 });
    gsap.to(btn.querySelector(".cta-icon-svg"), { color: "#9333ea", x: 2, duration: 0.35, ease: "power3.out", delay: 0.08 });
  };

  const handleCtaMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    gsap.to(btn.querySelector(".cta-bg-fill"), { width: "0%", duration: 0.3, ease: "power3.in" });
    gsap.to(btn.querySelector(".cta-text"), { color: "#000000", duration: 0.25, ease: "power3.in" });
    gsap.to(btn.querySelector(".cta-icon-bg"), { backgroundColor: "#000000", duration: 0.25, ease: "power3.in" });
    gsap.to(btn.querySelector(".cta-icon-svg"), { color: "#ffffff", x: 0, duration: 0.25, ease: "power3.in" });
  };

  return (
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md border-b border-purple-500/10" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="logo flex items-center gap-3 group relative z-55">
            <div className="relative w-11 h-11">
              <Image src="/logo.png" alt="Innovelous Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-tight tracking-wide">Innovelous</span>
              <span className="text-xs text-purple-400 tracking-wider">Tech</span>
            </div>
          </a>

          {/* Navigation Bar - Desktop Middle Bar */}
          <div ref={menuContainerRef} onMouseLeave={handleMenuMouseLeave} className="hidden md:flex items-center relative bg-neutral-900/60 border border-neutral-800 backdrop-blur-md rounded-full p-1.5">
            <div ref={hoverPillRef} className="absolute top-1.5 left-0 rounded-full bg-purple-600 pointer-events-none opacity-0 z-0 shadow-[0_0_20px_rgba(147,51,234,0.4)]" />
            
            {navItems.map((item) => (
              <div key={item.label} className="nav-item-wrapper relative z-10" onMouseEnter={(e) => handleMouseEnter(e, item.label)} onMouseLeave={() => handleMouseLeave(item.label)}>
                {item.href ? (
                  <Link href={item.href as any} className="nav-item block px-5 py-2.5 rounded-full text-sm font-medium text-neutral-300 hover:text-white transition-colors duration-200">{item.label}</Link>
                ) : (
                  <div className="nav-item px-5 py-2.5 rounded-full text-sm font-medium text-neutral-300 hover:text-white cursor-pointer transition-colors duration-200">{item.label}</div>
                )}
                
                {item.dropdown && (
                  <div ref={(el) => (dropdownRefs.current[item.label] = el as any)} className="absolute top-full left-0 mt-2 w-72 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden opacity-0 z-50 pointer-events-auto" style={{ height: 0 }}>
                    <div className="absolute top-0 left-0 right-0 h-2 -mt-2 bg-transparent pointer-events-auto" />
                    <div className="py-2 px-1.5">
                      {item.dropdown.map((dropdownItem) => (
                        <Link key={dropdownItem.label} href={dropdownItem.href as any} className="dropdown-item block px-4 py-2.5 text-sm text-neutral-400 rounded-xl hover:bg-purple-600/20 hover:text-purple-300 transition-all duration-150">{dropdownItem.label}</Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <button className="desktop-cta hidden md:flex items-center gap-2.5 relative rounded-full px-5 py-2.5 font-medium text-sm overflow-hidden cursor-pointer bg-white" onMouseEnter={handleCtaMouseEnter} onMouseLeave={handleCtaMouseLeave}>
            <span className="cta-bg-fill absolute inset-y-0 left-0 w-0 bg-purple-600 rounded-full pointer-events-none z-0" />
            <span className="cta-text relative z-10 text-black transition-none">Get in Touch</span>
            <div className="cta-icon-bg relative z-10 w-5 h-5 bg-black rounded-full flex items-center justify-center transition-none">
              <svg className="cta-icon-svg w-3 h-3 text-white transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>

          {/* Mobile Toggle Trigger */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden relative z-55 p-2 text-white focus:outline-none">
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Screen Full Drawer Takeover */}
      <div ref={mobileMenuRef} className="fixed inset-0 w-full h-screen bg-gradient-to-b from-purple-950 via-neutral-950 to-black z-50 md:hidden flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-h-[85vh] overflow-y-auto px-4 w-full">
          {navItems.map((item) => (
            <div key={item.label} className="mobile-nav-link flex flex-col items-center w-full">
              {item.href ? (
                <Link href={item.href as any} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-semibold text-neutral-200 hover:text-purple-400 transition-colors">{item.label}</Link>
              ) : (
                <div className="flex flex-col items-center w-full max-w-xs">
                  <span className="text-2xl font-semibold text-neutral-400 mb-2">{item.label}</span>
                  <div className="flex flex-col gap-2 mt-1 bg-white/5 p-3 rounded-2xl border border-white/10 w-full">
                    {item.dropdown?.map((sub) => (
                      <Link key={sub.label} href={sub.href as any} onClick={() => setIsMobileMenuOpen(false)} className="text-base text-purple-300 hover:text-white block py-1">{sub.label}</Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <button className="mobile-cta-btn mt-4 bg-white text-black px-8 py-3.5 rounded-full font-semibold shadow-[0_0_30px_rgba(168,85,247,0.4)]">Get in Touch</button>
        </div>
      </div>
    </nav>
  );
}