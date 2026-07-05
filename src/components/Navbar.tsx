"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function DaisyMark() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "super", marginLeft: "1px" }}
    >
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse
          key={angle}
          cx="5"
          cy="2.1"
          rx="1.05"
          ry="1.75"
          fill="#F7F4EE"
          stroke="#2C2B27"
          strokeWidth="0.4"
          transform={`rotate(${angle} 5 5)`}
        />
      ))}
      <circle cx="5" cy="5" r="1.5" fill="#E8C8BE" stroke="#2C2B27" strokeWidth="0.4" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/shop", label: "Shop", comingSoon: false },
  { href: "/journal", label: "Journal", comingSoon: false },
  { href: "/calculator", label: "Calculator", comingSoon: true },
];

function ComingSoonLink({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      className="relative text-[13px] text-charcoal/30 cursor-default select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      <span
        className="absolute left-0 top-full mt-2 text-[10px] text-charcoal/40 tracking-wide whitespace-nowrap transition-opacity duration-150"
        style={{ opacity: hovered ? 1 : 0, pointerEvents: "none" }}
      >
        coming soon
      </span>
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 bg-cream"
      style={{ borderBottom: "1px solid #EDE8DC" }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-0 leading-none">
          <span
            className="font-display italic text-[22px] text-charcoal font-normal tracking-normal"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            rhenoy collective
          </span>
          <DaisyMark />
        </Link>

        <nav className="flex items-center gap-7">
          {NAV_LINKS.map(({ href, label, comingSoon }) =>
            comingSoon ? (
              <ComingSoonLink key={href} label={label} />
            ) : (
              <Link
                key={href}
                href={href}
                className={`text-[13px] transition-colors ${
                  pathname === href || pathname.startsWith(href)
                    ? "text-charcoal"
                    : "text-charcoal/50 hover:text-charcoal"
                }`}
              >
                {label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
