const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * HTTPS / TLS Production Configuration Helper
 * Loads SSL/TLS certificates when ENABLE_HTTPS is set to 'true'.
 * In production environments (such as AWS, Heroku, Render, Nginx, or Docker),
 * TLS is typically terminated at the reverse proxy or load balancer.
 */
function createSecureServer(app) {
  const useHttps = process.env.ENABLE_HTTPS === 'true';
  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '..', 'certs', 'privkey.pem');
  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '..', 'certs', 'fullchain.pem');

  if (useHttps && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const credentials = {
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8')
    };
    return https.createServer(credentials, app);
  }

  return null;
}

module.exports = {
  createSecureServer
};

