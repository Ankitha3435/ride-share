const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message, pathPrefix) => rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip health check and OPTIONS requests
    skip: (req) => {
        return req.path === '/api/health' || 
               req.method === 'OPTIONS' ||
               !req.path.startsWith(pathPrefix);
    }
});

// General API rate limiter (more permissive)
const apiLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per windowMs
    'Too many requests from this IP, please try again later.',
    '/api'
);

// Strict rate limiter for sensitive operations
const authLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    20, // 20 requests per windowMs
    'Too many authentication attempts, please try again later.',
    '/api/auth'
);

// Medium rate limiter for bug reports
const bugReportLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    10, // 10 requests per windowMs
    'Too many bug reports submitted. Please wait before submitting more.',
    '/api/bug-reports'
);

// Security middleware
const security = {
    // Helmet for various security headers
    helmet: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    }),

    // HPP protection
    hpp: hpp(),

    // Rate limiters
    apiLimiter,
    authLimiter,
    bugReportLimiter,
};

module.exports = security;
