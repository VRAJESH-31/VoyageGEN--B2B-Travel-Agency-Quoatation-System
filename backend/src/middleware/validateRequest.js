// Generic Zod Validation Middleware
const { ZodError } = require('zod');

const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                params: req.params,
                query: req.query
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(e => ({
                    path: e.path.join('.'),
                    message: e.message
                }));
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors
                });
            }
            next(error);
        }
    };
};

module.exports = { validateRequest };
