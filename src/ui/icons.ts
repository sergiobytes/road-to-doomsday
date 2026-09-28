/** Iconos SVG propios, simples y sin dependencias. Heredan el color del texto. */
const svg = (paths: string, className: string) => `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
    stroke-linecap="round" stroke-linejoin="round" class="${className}" aria-hidden="true">
    ${paths}
  </svg>
`;

export const icons = {
  movie: (className = 'size-5') =>
    svg(
      '<rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 5v14M17 5v14M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4" />',
      className,
    ),
  series: (className = 'size-5') =>
    svg('<rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 3l4 4 4-4" />', className),
  check: (className = 'size-5') => svg('<path d="M5 12.5l4.5 4.5L19 7.5" />', className),
  circle: (className = 'size-5') => svg('<circle cx="12" cy="12" r="8" />', className),
  checkCircle: (className = 'size-5') =>
    svg('<circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.8 2.8L16 10" />', className),
};
