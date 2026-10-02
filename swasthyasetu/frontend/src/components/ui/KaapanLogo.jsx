import React from 'react';

/**
 * KaapanLogo — Clean vector SVG logo with transparent background.
 * Renders the exact "Kaapan" wordmark with teal 'K' accent and configurable text color.
 * No white box or background rectangle.
 */
const KaapanLogo = ({ variant = 'light', height = 32, className = '' }) => {
  // Teal accent for the letter 'K'
  const tealAccent = '#14B8A6'; // Vibrant healthcare teal
  // Text color for 'aapan'
  const textColor = variant === 'dark' ? '#102A43' : '#FFFFFF';

  return (
    <svg
      viewBox="0 0 160 40"
      height={height}
      className={`inline-block select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kaapan"
    >
      <text
        x="0"
        y="31"
        fontFamily="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="800"
        fontSize="34"
        letterSpacing="-0.5px"
      >
        <tspan fill={tealAccent} fontWeight="900">K</tspan>
        <tspan fill={textColor}>aapan</tspan>
      </text>
    </svg>
  );
};

export default KaapanLogo;
