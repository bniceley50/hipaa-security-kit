/**
 * @hipaa-security-kit/csp-strict
 * Content Security Policy enforcement
 */

export interface CSPConfig {
  nonce?: string;
  reportUri?: string;
  directives?: Record<string, string[]>;
}

export function generateCSP(config: CSPConfig = {}): string {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", config.nonce ? `'nonce-${config.nonce}'` : "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    ...config.directives
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.filter(Boolean).join(' ')}`)
    .join('; ');
}

export function vitePlugin(config: CSPConfig = {}) {
  return {
    name: 'csp-strict',
    transformIndexHtml(html: string) {
      const csp = generateCSP(config);
      return html.replace(
        '<head>',
        `<head>\n  <meta http-equiv="Content-Security-Policy" content="${csp}">`
      );
    }
  };
}
