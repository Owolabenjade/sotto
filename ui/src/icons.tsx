// SPDX-License-Identifier: Apache-2.0
// One icon family, one stroke weight. Path data from Lucide (ISC licence).
import type { ReactNode } from 'react';

const Svg = ({ children }: { children: ReactNode }) => (
  <svg
    className="icon"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

export const IconCopy = () => (
  <Svg>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Svg>
);

export const IconCheck = () => (
  <Svg>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const IconDownload = () => (
  <Svg>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </Svg>
);

export const IconLock = () => (
  <Svg>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

export const IconChevron = () => (
  <Svg>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const IconSend = () => (
  <Svg>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </Svg>
);
