export const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://uploadthing.com https://placehold.co;
  child-src 'self';
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  img-src 'self' https://placehold.co https://utfs.io blob: data:;
  media-src 'self';
  connect-src 'self' 
    https://api.openai.com 
    https://api.anthropic.com
    https://api.resend.com
    https://uploadthing.com
    https://utfs.io
    https://api.twilio.com
    ${process.env.NEXT_PUBLIC_URL}
    ${process.env.POSTGRES_URL}
    wss://*.uploadthing.com;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`

export const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()'
    ].join(', ')
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin'
  }
]