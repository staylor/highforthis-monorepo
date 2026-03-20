const wpPattern = /^\/(?:wp-|xmlrpc\.php|\.env)/i;

/** @type {import('express').RequestHandler} */
export default function rejectWordPress(req, res, next) {
  if (wpPattern.test(req.path)) {
    res.status(403).end();
    return;
  }
  next();
}
