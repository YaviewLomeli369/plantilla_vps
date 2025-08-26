import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { SiteConfig } from "@shared/schema";

export function useTheme() {
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  useEffect(() => {
    if (config?.config && typeof config.config === 'object') {
      const configData = config.config as any;
      
      // Update CSS custom properties for appearance
      if (configData.appearance) {
        const root = document.documentElement;
        const appearance = configData.appearance;
        
        // Update color variables
        if (appearance.primaryColor) {
          // Convert hex to HSL for better CSS variable compatibility
          const hsl = hexToHsl(appearance.primaryColor);
          root.style.setProperty('--primary', hsl);
        }
        if (appearance.secondaryColor) {
          const hsl = hexToHsl(appearance.secondaryColor);
          root.style.setProperty('--secondary', hsl);
        }
        if (appearance.accentColor) {
          const hsl = hexToHsl(appearance.accentColor);
          root.style.setProperty('--accent', hsl);
        }
        if (appearance.backgroundColor) {
          const hsl = hexToHsl(appearance.backgroundColor);
          root.style.setProperty('--background', hsl);
        }
        if (appearance.textColor) {
          const hsl = hexToHsl(appearance.textColor);
          root.style.setProperty('--foreground', hsl);
        }
        if (appearance.linkColor) {
          const hsl = hexToHsl(appearance.linkColor);
          root.style.setProperty('--primary', hsl);
        }
        
        // Update typography
        if (appearance.fontFamily) {
          root.style.setProperty('--font-sans', `'${appearance.fontFamily}', sans-serif`);
        }
        if (appearance.fontSize) {
          root.style.setProperty('--base-font-size', appearance.fontSize + 'px');
        }
        if (appearance.lineHeight) {
          root.style.setProperty('--base-line-height', appearance.lineHeight);
        }
        if (appearance.headingFont) {
          root.style.setProperty('--font-heading', `'${appearance.headingFont}', serif`);
        }
        
        // Update layout variables
        if (appearance.containerWidth) {
          root.style.setProperty('--container-width', appearance.containerWidth + 'px');
        }
        if (appearance.headerHeight) {
          root.style.setProperty('--header-height', appearance.headerHeight + 'px');
        }
      }
    }
  }, [config]);

  return config;
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}