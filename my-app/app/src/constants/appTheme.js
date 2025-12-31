// Sleek & Sophisticated Red Theme
export const THEME = {
  // Primary Colors
  primary: '#D1435B',      // Rich Burgundy Red
  secondary: '#8B2E3B',    // Deep Maroon
  accent: '#D4AF37',       // Champagne Gold
  
  // Background Colors
  background: '#0F1419',   // Almost Black with slight warmth
  surface: '#1A1D26',      // Slightly lighter than background
  surfaceDark: '#2A2A34',  // Sophisticated Dark Gray
  
  // Text Colors
  text: {
    primary: '#F5F5F5',    // Off-white (softer on eyes)
    secondary: '#B8B8B8',  // Elegant Gray
    accent: '#D4AF37',     // Champagne Gold
    muted: '#808080',      // Sophisticated Muted
  },
  subtext: '#B8B8B8',      // Elegant Gray
  white: '#FFFFFF',        // Pure white
  
  // Border Colors
  border: '#4A4A52',       // Subtle Gray (changed from red for better UX)
  borderLight: '#4A4A52',  // Subtle Gray
  
  // Backdrop/Modal
  backdrop: 'rgba(0, 0, 0, 0.7)',  // Semi-transparent black
  
  // Button Colors
  button: {
    primary: '#D1435B',    // Rich Red
    secondary: '#C65D7B',  // Muted Rose Pink
    danger: '#C41E3A',     // Deep Crimson
  },
  
  // Category Colors (complementary sophisticated palette)
  categories: {
    spiritual: '#9B6B8D',
    mental: '#5B7C99',
    physical: '#B85C6F',
    disagreeables: '#D9915E',
    romantic: '#C76B6B',
    erotic: '#D17A7A',
    creative: '#8B9F6F',
  },
  
  // Shadow & Elevation
  shadow: {
    color: '#A00000',
    offset: { width: 0, height: 2 },
    opacity: 0.3,
    radius: 4,
  },
  
  // Common spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 10,
    xl: 16,
  },
};

// Common style utilities
export const COMMON_STYLES = {
  // Card styles - these are basic; use THEME inline in components
  card: {
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 12,
    elevation: 3,
  },
  
  // Button base styles
  buttonBase: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Text input styles
  textInputBase: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
};
