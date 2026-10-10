import React from 'react';

export type IconName =
  | 'solar'
  | 'reactor'
  | 'battery'
  | 'recycler'
  | 'moxie'
  | 'shield'
  | 'shelter'
  | 'greenhouse'
  | 'spares'
  | 'medical'
  | 'comfort'
  | 'alert'
  | 'check'
  | 'info'
  | 'play'
  | 'pause'
  | 'fast_forward'
  | 'arrow_up'
  | 'arrow_down'
  | 'clock'
  | 'gauge'
  | 'cube';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = '', style }) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.5',
    strokeLinecap: 'square' as const,
    strokeLinejoin: 'miter' as const,
    className,
    style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style },
  };

  switch (name) {
    case 'solar':
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="12" />
          <line x1="9" y1="4" x2="9" y2="16" />
          <line x1="15" y1="4" x2="15" y2="16" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="12" y1="16" x2="12" y2="21" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <circle cx="12" cy="10" r="1.5" fill="var(--ember)" stroke="none" />
        </svg>
      );
    case 'reactor':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" fill="var(--oxide)" stroke="none" />
          <line x1="12" y1="3" x2="12" y2="9" />
          <line x1="12" y1="15" x2="12" y2="21" />
          <line x1="4.2" y1="7.5" x2="9.4" y2="10.5" />
          <line x1="14.6" y1="13.5" x2="19.8" y2="16.5" />
          <line x1="4.2" y1="16.5" x2="9.4" y2="13.5" />
          <line x1="14.6" y1="10.5" x2="19.8" y2="7.5" />
        </svg>
      );
    case 'battery':
      return (
        <svg {...commonProps}>
          <rect x="2" y="6" width="17" height="12" />
          <line x1="19" y1="10" x2="22" y2="10" />
          <line x1="19" y1="14" x2="22" y2="14" />
          <line x1="22" y1="10" x2="22" y2="14" />
          <rect x="5" y="9" width="4" height="6" fill="var(--ember)" stroke="none" />
          <line x1="12" y1="9" x2="12" y2="15" />
          <line x1="15" y1="9" x2="15" y2="15" />
        </svg>
      );
    case 'recycler':
      return (
        <svg {...commonProps}>
          <path d="M12 3v4M8 5l4 2 4-2" />
          <path d="M4 11a8 8 0 0 0 14.5 4.5" />
          <path d="M20 13a8 8 0 0 0-14.5-4.5" />
          <circle cx="12" cy="12" r="2" fill="var(--sage)" stroke="none" />
        </svg>
      );
    case 'moxie':
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="15" x2="16" y2="15" />
          <circle cx="12" cy="12" r="2.5" fill="var(--ember)" stroke="none" />
          <line x1="12" y1="4" x2="12" y2="7" />
          <line x1="12" y1="17" x2="12" y2="20" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...commonProps}>
          <polygon points="12,2 21,5 21,12 12,21 3,12 3,5" />
          <polygon points="12,6 17,8 17,12 12,17 7,12 7,8" fill="var(--oxide)" stroke="none" opacity="0.6" />
        </svg>
      );
    case 'shelter':
      return (
        <svg {...commonProps}>
          <rect x="3" y="8" width="18" height="13" />
          <polyline points="2,8 12,2 22,8" />
          <rect x="9" y="13" width="6" height="8" fill="var(--ember)" stroke="none" opacity="0.7" />
        </svg>
      );
    case 'greenhouse':
      return (
        <svg {...commonProps}>
          <path d="M12 21V9" />
          <path d="M12 13c-3-2-5-1-6 2 2 1 4 0 6-2z" fill="var(--sage)" stroke="none" />
          <path d="M12 10c3-2 5-1 6 2-2 1-4 0-6-2z" fill="var(--sage)" stroke="none" />
          <line x1="5" y1="21" x2="19" y2="21" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case 'spares':
      return (
        <svg {...commonProps}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          <circle cx="7" cy="17" r="1.5" fill="var(--ember)" stroke="none" />
        </svg>
      );
    case 'medical':
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="18" height="18" />
          <line x1="12" y1="7" x2="12" y2="17" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <rect x="10.5" y="10.5" width="3" height="3" fill="var(--alarm)" stroke="none" />
        </svg>
      );
    case 'comfort':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <circle cx="9" cy="9.5" r="1" fill="var(--ember)" stroke="none" />
          <circle cx="15" cy="9.5" r="1" fill="var(--ember)" stroke="none" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...commonProps}>
          <polygon points="12,2 22,20 2,20" />
          <line x1="12" y1="8" x2="12" y2="13" />
          <circle cx="12" cy="16.5" r="1" fill="var(--alarm)" stroke="none" />
        </svg>
      );
    case 'check':
      return (
        <svg {...commonProps}>
          <polyline points="20,6 9,17 4,12" />
        </svg>
      );
    case 'info':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <circle cx="12" cy="7.5" r="1" fill="var(--ember)" stroke="none" />
        </svg>
      );
    case 'play':
      return (
        <svg {...commonProps}>
          <polygon points="6,4 19,12 6,20" fill="var(--ember)" stroke="none" />
        </svg>
      );
    case 'pause':
      return (
        <svg {...commonProps}>
          <rect x="6" y="5" width="4" height="14" fill="var(--ember)" stroke="none" />
          <rect x="14" y="5" width="4" height="14" fill="var(--ember)" stroke="none" />
        </svg>
      );
    case 'fast_forward':
      return (
        <svg {...commonProps}>
          <polygon points="3,5 11,12 3,19" fill="var(--ember)" stroke="none" />
          <polygon points="13,5 21,12 13,19" fill="var(--ember)" stroke="none" />
        </svg>
      );
    case 'arrow_up':
      return (
        <svg {...commonProps}>
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5,12 12,5 19,12" />
        </svg>
      );
    case 'arrow_down':
      return (
        <svg {...commonProps}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19,12 12,19 5,12" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12,6 12,12 16,14" />
          <circle cx="12" cy="12" r="1.5" fill="var(--ember)" stroke="none" />
        </svg>
      );
    case 'gauge':
      return (
        <svg {...commonProps}>
          <path d="M4 16a8 8 0 1 1 16 0" />
          <line x1="12" y1="16" x2="15" y2="10" />
          <circle cx="12" cy="16" r="2" fill="var(--oxide)" stroke="none" />
        </svg>
      );
    case 'cube':
      return (
        <svg {...commonProps}>
          <polyline points="21,16 12,21 3,16" />
          <polyline points="21,8 12,13 3,8" />
          <polygon points="12,3 21,8 12,13 3,8" fill="var(--oxide)" stroke="none" opacity="0.4" />
          <line x1="12" y1="13" x2="12" y2="21" />
        </svg>
      );
    default:
      return null;
  }
};
