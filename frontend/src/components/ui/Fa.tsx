import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface FaProps {
  icon: IconDefinition;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Thin wrapper around FontAwesomeIcon that accepts a numeric pixel size,
 * matching the ergonomics of the Lucide icons it replaced.
 */
export function Fa({ icon, size = 16, className, style }: FaProps) {
  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0, ...style }}
    />
  );
}
