import type {Request, Response, NextFunction} from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {

  if (req.originalUrl !== '/api/health') {

    const start = performance.now();

    res.on('finish', () => {
      const duration = performance.now() - start;
      console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration.toFixed(2)} ms)`)
    });
  }
  next(); // sinon : on passe la main
}
