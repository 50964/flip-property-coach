import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flip Property Coach',
    short_name: 'Flip Coach',
    description: 'Build your property flipping empire. Find suppliers, manage projects, track cashflow, and learn from the best.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#D4AF37',
    icons: [
      {
        src: '/icons/logos/logo-gold-512.jpg',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/logos/logo-gold-512.jpg',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['business', 'productivity', 'finance'],
    orientation: 'portrait',
    scope: '/',
  };
}
