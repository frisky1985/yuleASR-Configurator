/**
 * BrandContext — Loads OEM branding config from API and applies CSS variables.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { api } from '@/services/api';

export interface BrandSettings {
  id: number;
  name: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  companyName: string | null;
  supportEmail: string | null;
  termsUrl: string | null;
  privacyUrl: string | null;
  customDomain: string | null;
  emailTemplateHeader: string | null;
  emailTemplateFooter: string | null;
  allowedDomains: string[];
  updatedAt: string;
}

interface BrandContextValue {
  brand: BrandSettings | null;
  loading: boolean;
  error: string | null;
}

const BrandContext = createContext<BrandContextValue>({
  brand: null,
  loading: true,
  error: null,
});

export function useBrand() {
  return useContext(BrandContext);
}

interface BrandProviderProps {
  children: ReactNode;
}

export function BrandProvider({ children }: BrandProviderProps) {
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBrand() {
      try {
        const data = await api.get<BrandSettings>('/api/branding');
        if (cancelled) return;
        setBrand(data);
        applyBrandToCSS(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.warn('[Brand] Failed to load brand settings:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBrand();

    // Reload brand settings on visibility change (tab refocus)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadBrand();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <BrandContext.Provider value={{ brand, loading, error }}>{children}</BrandContext.Provider>
  );
}

/**
 * Apply brand settings as CSS custom properties on :root
 */
function applyBrandToCSS(settings: BrandSettings) {
  const root = document.documentElement;

  const cssVars: Record<string, string> = {
    '--brand-primary': settings.primaryColor || '#2563EB',
    '--brand-secondary': settings.secondaryColor || '#6366F1',
    '--brand-accent': settings.accentColor || '#06B6D4',
    '--brand-logo-url': settings.logoUrl ? `url(${settings.logoUrl})` : 'none',
    '--brand-company-name': `"${settings.companyName || settings.name}"`,
    '--brand-support-email': settings.supportEmail ? `"${settings.supportEmail}"` : '',
    '--brand-terms-url': settings.termsUrl ? `"${settings.termsUrl}"` : '',
    '--brand-privacy-url': settings.privacyUrl ? `"${settings.privacyUrl}"` : '',
  };

  for (const [key, value] of Object.entries(cssVars)) {
    root.style.setProperty(key, value);
  }

  // Update favicon if provided
  if (settings.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }

  // Update document title
  if (settings.companyName || settings.name) {
    document.title = `${settings.companyName || settings.name} - BSW Configurator`;
  }
}
