import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to the watch page specifically
        source: '/watch/:path*',
        headers: [
          {
            // Content-Security-Policy: prevent 3rd-party iframes from navigating the parent
            // frame-ancestors: who can embed US (keeps our page safe from being embedded in ad sites)
            // The key directives for ad blocking are handled at the iframe sandbox level;
            // CSP here provides defense-in-depth at the HTTP response layer.
            key: 'Content-Security-Policy',
            value: [
              // Prevent our page from being embedded in external ad frames
              "frame-ancestors 'self'",
            ].join('; '),
          },
          {
            // X-Frame-Options: legacy fallback for older browsers (same as frame-ancestors 'self')
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Prevent MIME type sniffing (stops some ad injection vectors)
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Referrer policy: don't leak our URL to ad networks via iframe referrers
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Permissions policy: revoke access to sensitive APIs that ad scripts abuse
            // Disabling geolocation, camera, microphone, payment — common ad tracking vectors
            key: 'Permissions-Policy',
            value: [
              'geolocation=()',
              'camera=()',
              'microphone=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'accelerometer=(self)',
              'gyroscope=(self)',
            ].join(', '),
          },
        ],
      },
      {
        // Apply security headers to all pages
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: [
              'geolocation=()',
              'camera=()',
              'microphone=()',
              'payment=()',
            ].join(', '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
