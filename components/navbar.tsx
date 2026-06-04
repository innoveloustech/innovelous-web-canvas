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
      { label: "Hardware & IoT", href: "/solutions/hardware" },
      { label: "Software Engineering", href: "/solutions/software" },
    ],
  },
  { label: "Projects", href: "/projects" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  
  const navRef = useRef<HTMLDivElement>(null);
  const hoverPillRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileSolutionsRef = useRef<HTMLDivElement>(null);

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

  // Mobile Menu Open/Close Animations
  useGSAP(
    () => {
      if (!mobileMenuRef.current) return;
      
      if (isMobileMenuOpen) {
        gsap.to(mobileMenuRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.3, ease: "power2.out" });
        gsap.fromTo(".mobile-nav-item", 
          { y: 40, opacity: 0 }, 
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: "power3.out", delay: 0.1, overwrite: true }
        );
        gsap.fromTo(".mobile-footer", 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", delay: 0.4, overwrite: true }
        );
      } else {
        gsap.to(mobileMenuRef.current, { opacity: 0, pointerEvents: "none", duration: 0.2, ease: "power2.in" });
        if (mobileSolutionsRef.current) {
          gsap.to(mobileSolutionsRef.current, { height: 0, opacity: 0, duration: 0.2 });
        }
        setMobileSolutionsOpen(false);
      }
    },
    { scope: mobileMenuRef, dependencies: [isMobileMenuOpen] }
  );

  // Mobile Solutions Accordion Animation
  const toggleMobileSolutions = () => {
    if (!mobileSolutionsRef.current) return;
    if (mobileSolutionsOpen) {
      gsap.to(mobileSolutionsRef.current, { height: 0, opacity: 0, duration: 0.3, ease: "power2.inOut" });
    } else {
      gsap.to(mobileSolutionsRef.current, { height: "auto", opacity: 1, duration: 0.4, ease: "power3.out" });
    }
    setMobileSolutionsOpen(!mobileSolutionsOpen);
  };

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
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="logo flex items-center gap-3 group relative z-50">
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
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white focus:outline-none transition-colors hover:bg-white/10"
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* PREMIUM MOBILE MENU OVERLAY */}
      <div 
        ref={mobileMenuRef} 
        className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl z-40 md:hidden flex flex-col opacity-0 pointer-events-none"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <a href="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <Image src="/logo.png" alt="Innovelous Logo" fill className="object-contain" />
            </div>
            <span className="text-base font-bold text-white tracking-wide">Innovelous</span>
          </a>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Mobile Nav Links */}
        <div className="flex-1 flex flex-col justify-center px-6 overflow-y-auto">
          <nav className="flex flex-col">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-nav-item text-5xl font-black tracking-tighter text-white py-4 border-b border-white/5 hover:text-purple-400 transition-colors"
            >
              Home
            </Link>
            
            <div className="mobile-nav-item border-b border-white/5">
              <button 
                onClick={toggleMobileSolutions}
                className="w-full flex items-center justify-between text-5xl font-black tracking-tighter text-white py-4 hover:text-purple-400 transition-colors"
              >
                <span>Solutions</span>
                <svg 
                  className={`w-6 h-6 text-neutral-500 transition-transform duration-300 ${mobileSolutionsOpen ? 'rotate-45' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              <div ref={mobileSolutionsRef} className="overflow-hidden h-0 opacity-0">
                <div className="flex flex-col gap-2 pb-4 pl-2">
                  <Link 
                    href="/solutions/hardware" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-xl font-light text-neutral-400 py-2 hover:text-white transition-colors"
                  >
                    <span className="w-8 h-[1px] bg-neutral-700" />
                    Hardware & IoT
                  </Link>
                  <Link 
                    href="/solutions/software" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-xl font-light text-neutral-400 py-2 hover:text-white transition-colors"
                  >
                    <span className="w-8 h-[1px] bg-neutral-700" />
                    Software Engineering
                  </Link>
                </div>
              </div>
            </div>

            <Link 
              href={"/projects" as any}
              onClick={() => setIsMobileMenuOpen(false)}
              className="mobile-nav-item text-5xl font-black tracking-tighter text-white py-4 border-b border-white/5 hover:text-purple-400 transition-colors"
            >
              Projects
            </Link>
          </nav>
        </div>

        {/* Mobile Footer / CTA */}
        <div className="mobile-footer p-6 border-t border-white/5 bg-black/40">
          <button className="mobile-cta-btn w-full bg-white text-black py-4 rounded-full font-semibold text-center shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:bg-purple-500 hover:text-white transition-colors duration-300">
            Get in Touch
          </button>
          <div className="flex justify-between mt-4 text-[10px] text-neutral-600 font-mono tracking-widest uppercase">
            <span>© 2026 Innovelous</span>
            <span>Karachi, PK</span>
          </div>
        </div>
      </div>
    </nav>
  );
}