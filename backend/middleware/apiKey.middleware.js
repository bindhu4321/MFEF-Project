// API Key Validation Middleware
const validateApiKey = (req, res, next) => {
  const configuredKey = process.env.API_SECRET_KEY || 'sbfms-secure-api-key-2026-v1';
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  const isRequired = process.env.REQUIRE_API_KEY === 'true';

  if (isRequired) {
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing x-api-key header.'
      });
    }
    if (apiKey !== configuredKey) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid API Key provided.'
      });
    }
  } else {
    // If provided, validate it; if not provided and not strictly required, allow request to proceed to JWT auth
    if (apiKey && apiKey !== configuredKey) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Invalid API Key provided.'
      });
    }
  }

  next();
};

// Strict check for routes that strictly mandate an API key
const requireApiKey = (req, res, next) => {
  const configuredKey = process.env.API_SECRET_KEY || 'sbfms-secure-api-key-2026-v1';
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing required x-api-key header.'
    });
  }

  if (apiKey !== configuredKey) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid API key.'
    });
  }

  next();
};

module.exports = {
  validateApiKey,
  requireApiKey
};

