import type { RequestHandler } from 'express';

const wpPattern = /^\/(?:wp-|xmlrpc\.php|\.env)/i;

const rejectWordPress: RequestHandler = (req, res, next) => {
  if (wpPattern.test(req.path)) {
    res.status(403).end();
    return;
  }
  next();
};

export default rejectWordPress;
