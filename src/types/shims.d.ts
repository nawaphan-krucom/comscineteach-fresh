// Local shims for modules that don't ship complete type declarations
// (prevents TS2307 'Cannot find module' diagnostics in editor)

declare module 'xlsx';

declare module 'firebase/compat/*';

// Ensure JSX runtime module is recognized by TS when @types/react is present
declare module 'react/jsx-runtime';
