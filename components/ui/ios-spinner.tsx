import React from 'react';

export function IosSpinner({ className = 'w-5 h-5 text-current' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animationTimingFunction: 'steps(8, end)', animationDuration: '0.8s' }}
    >
      <g fill="currentColor">
        <rect x="11" y="2" width="2" height="5" rx="1" transform="rotate(0 12 12)" opacity="1" />
        <rect x="11" y="2" width="2" height="5" rx="1" transform="rotate(45 12 12)" opacity="0.875" />
        <rect x="11" y="2" width="2" height="5" rx="1" transform="rotate(90 12 12)" opacity="0.75" />
        <rect x="11" y="2" width="2" height="5" rx="1" transform="rotate(135 12 12)" opacity="0.625" />
        <rect x="11" y="2" width="2" height="5" rx="1" transform="rotate(180 12 12)" opacity="0.5" />
        <rect x="11" y="2" width="2" height="5" rx="1" transform="rotate(225 12 12)" opacity="0.375" />
        <rect x="11" y="2" width="2" height="5" rx="1" transform="rotate(270 12 12)" opacity="0.25" />
        <rect x="11" y="2" width="2" height="5" rx="1" transform="rotate(315 12 12)" opacity="0.125" />
      </g>
    </svg>
  );
}
