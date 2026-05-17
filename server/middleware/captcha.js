const verifyCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ 
      success: false, 
      error: 'CAPTCHA token is required' 
    });
  }

  // For development/demo purposes, we'll accept a simple token
  // In production, replace this with actual reCAPTCHA v2 or Cloudflare Turnstile verification
  
  // Example for Google reCAPTCHA v2:
  /*
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
  
  try {
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${captchaToken}`
    });
    
    const data = await response.json();
    
    if (!data.success) {
      return res.status(400).json({ 
        success: false, 
        error: 'CAPTCHA verification failed' 
      });
    }
    
    next();
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'CAPTCHA verification error' 
    });
  }
  */

  // Demo mode - accept valid-looking tokens
  if (captchaToken.length > 10) {
    next();
  } else {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid CAPTCHA token' 
    });
  }
};

module.exports = verifyCaptcha;
