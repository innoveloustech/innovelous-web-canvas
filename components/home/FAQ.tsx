import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Flip);

interface BentoItem {
    id: string;
    q: string;
    a: string;
    defaultClass: string;
    expandedClass: string;
}

const bentoData: BentoItem[] = [
    {
        id: "01",
        q: "What is your typical development process for a project?",
        a: "We start with deep discovery and strategy alignment, followed by interactive UI/UX prototyping. We then move into rapid, iterative MVP development, rigorous quality assurance, and seamless deployment with continuous post-launch optimization.",
        defaultClass: "md:col-span-2 md:row-span-1",
        expandedClass: "md:col-span-3 md:row-span-2"
    },
    {
        id: "02",
        q: "How long does it take to build and launch an MVP?",
        a: "A typical high-performance MVP takes between 4 to 8 weeks. Thanks to our pre-built architectural modules and agile workflows, we bypass traditional development bottlenecks to ship fast.",
        defaultClass: "md:col-span-1 md:row-span-1",
        expandedClass: "md:col-span-3 md:row-span-2"
    },
    {
        id: "03",
        q: "How do you integrate AI automation into existing workflows?",
        a: "We analyze your operations to find manual bottlenecks, then design custom AI pipelines—ranging from intelligent chatbots and LLM-powered content agents to advanced data processing automation.",
        defaultClass: "md:col-span-1 md:row-span-2",
        expandedClass: "md:col-span-3 md:row-span-2"
    },
    {
        id: "04",
        q: "Do you provide long-term maintenance and scaling support?",
        a: "Yes, we partner with clients long-term through dedicated support agreements. This covers proactive security updates, performance monitoring, scaling infrastructure, and continuous feature updates.",
        defaultClass: "md:col-span-2 md:row-span-1",
        expandedClass: "md:col-span-3 md:row-span-2"
    }
];

export default function InteractiveBentoFAQ() {
    const containerRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef<any>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleCardClick = (id: string) => {
        // Snapshot layouts of the cards
        stateRef.current = Flip.getState(".bento-card");
        setActiveId(activeId === id ? null : id);
    };

    useGSAP(() => {
        if (!stateRef.current) return;

        // Tween the layout states fluidly
        Flip.from(stateRef.current, {
            duration: 0.65,
            ease: "power4.inOut",
            /* 
              CRITICAL FIX: 
              We remove 'absolute: true' so the container height doesn't collapse to 0px.
              By specifying 'width,height', GSAP smoothly alters structural dimensions 
              directly instead of using scale transforms, avoiding text skewing.
            */
            props: "width,height",
            stagger: 0.01,
            onComplete: () => {
                stateRef.current = null;
            }
        });
    }, { dependencies: [activeId], scope: containerRef });

    return (
        <section className="relative text-[#f3f3f3] min-h-screen py-24 px-6 font-sans selection:bg-purple-900/40 overflow-hidden bg-transparent border-t border-neutral-900/50">
            {/* Subtle, soft ambient glows to tie into the website's theme */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/10 blur-[130px] rounded-full pointer-events-none animate-pulse duration-[8000ms]" />
            <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[10000ms]" />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Top Header */}
                <div className="mb-16 pb-10 border-b border-purple-950/20">
                    <h2 className="text-4xl md:text-6xl font-extralight tracking-tight text-white">
                        Frequently Asked <span className="italic font-serif text-purple-400">Questions</span>
                    </h2>
                </div>

                {/* Bento Grid Container - Added relative positioning to anchor sizing changes */}
                <div
                    ref={containerRef}
                    className="relative grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto md:auto-rows-[220px]"
                >
                    {bentoData.map((card) => {
                        const isExpanded = activeId === card.id;
                        const cardLayoutClass = isExpanded ? card.expandedClass : card.defaultClass;

                        return (
                            <div
                                key={card.id}
                                data-flip-id={`card-${card.id}`}
                                className={`bento-card group relative rounded-2xl border p-8 flex flex-col justify-between overflow-hidden cursor-pointer transition-[background-color,border-color,box-shadow] duration-300 select-none backdrop-blur-md
                  ${cardLayoutClass}
                  ${isExpanded 
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)]' 
                    : 'bg-purple-950/8 border-purple-950/40 hover:bg-purple-950/15 hover:border-purple-500/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.06)]'
                  }
                `}
                                onClick={() => handleCardClick(card.id)}
                            >
                                {/* Low opacity background purple matrix pattern */}
                                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#a855f7_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                                {/* Question Info Box */}
                                <div className="relative z-10 max-w-2xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-xs font-mono text-purple-400/70">{card.id}</span>
                                        <div className={`h-1.5 w-1.5 rounded-full bg-purple-800/80 transition-all duration-300 ${isExpanded ? 'scale-150 bg-purple-300' : ''}`} />
                                    </div>

                                    <h3 className={`font-light tracking-tight transition-all duration-300 ${isExpanded ? 'text-2xl md:text-3xl mb-6 text-purple-100' : 'text-lg text-zinc-300 group-hover:text-purple-100'}`}>
                                        {card.q}
                                    </h3>

                                    {/* Clean Fade-In for the Answer text once card expands */}
                                    <div
                                        className={`overflow-hidden transition-opacity duration-300 ease-out ${isExpanded ? 'h-auto opacity-100 mt-4 delay-150' : 'h-0 opacity-0 mt-0 pointer-events-none'}`}
                                    >
                                        <p className="text-zinc-300 font-light leading-relaxed max-w-xl text-sm md:text-base">
                                            {card.a}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Card Footer Actions */}
                                <div className="card-footer relative z-10 flex items-center justify-between w-full border-t border-purple-950/40 pt-4 mt-4">
                                    <span className="text-[10px] font-mono tracking-widest text-purple-300/50 uppercase">
                                        {isExpanded ? "[ CLICK TO COLLAPSE ]" : "[ VIEW ANSWER ]"}
                                    </span>

                                    <div className="w-6 h-6 rounded-full flex items-center justify-center border border-purple-950/60 bg-purple-950/40 group-hover:border-purple-500/35 group-hover:bg-purple-900/30 transition-all duration-300">
                                        <svg
                                            className={`w-2.5 h-2.5 text-purple-300 transition-transform duration-500 ${isExpanded ? 'rotate-45 text-white' : ''}`}
                                            viewBox="0 0 10 10"
                                            fill="none"
                                        >
                                            <path d="M5 0V10M0 5H10" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}