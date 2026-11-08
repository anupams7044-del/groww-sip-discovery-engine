/**
 * Groww MINT Design System Tokens
 * Source: @groww-tech/mint-css (Official Groww Design Architecture)
 */

export const tokens = {
  colors: {
    // Brand & Accents
    primary: "#00D09C", // Groww signature mint green
    primaryDark: "#00B386",
    primaryLight: "rgba(0, 208, 156, 0.12)",
    accentBlue: "#5367FF", // Groww secondary purple-blue
    accentRed: "#ED5533", // Groww loss/alert red
    accentYellow: "#FFB61B", // Groww warning gold

    // Surfaces & Backgrounds (Dark Mode - Official #121212 base)
    background: "#121212", // --dangerouslySetPrimaryBg in dark mode
    backgroundSecondary: "#181B22",
    surfaceZ1: "#1C2028", // Cards & elevated panels
    surfaceZ2: "#232734", // Sub-cards, input boxes, dropdowns
    surfaceDocked: "#14171E",

    // Borders & Dividers
    borderPrimary: "#282D3D",
    borderSecondary: "#1E222D",
    borderSubtle: "#32384A",

    // Typography & Content
    textPrimary: "#FFFFFF",
    textSecondary: "#9EA0A8", // --gray700
    textMuted: "#696C7C", // --gray800
    textDisabled: "#4E5160",

    // Functional State Tints (Groww badge system)
    tagGreenBg: "rgba(0, 208, 156, 0.12)",
    tagGreenText: "#00D09C",
    tagGreenBorder: "rgba(0, 208, 156, 0.28)",

    tagRedBg: "rgba(237, 85, 51, 0.12)",
    tagRedText: "#ED5533",
    tagRedBorder: "rgba(237, 85, 51, 0.28)",

    tagYellowBg: "rgba(255, 182, 27, 0.12)",
    tagYellowText: "#FFB61B",
    tagYellowBorder: "rgba(255, 182, 27, 0.28)",

    tagBlueBg: "rgba(83, 103, 255, 0.12)",
    tagBlueText: "#5367FF",
    tagBlueBorder: "rgba(83, 103, 255, 0.28)"
  },
  typography: {
    fontFamily: 'GrowwSans, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
};

export const colors = tokens.colors;
