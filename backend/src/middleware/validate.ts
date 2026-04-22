import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors: Record<string, string> = {};
      error.details.forEach((d) => {
        const key = d.path[0] as string;
        errors[key] = d.message.replace(/['"]/g, '');
      });
      res.status(422).json({ success: false, message: 'Date invalide', errors });
      return;
    }

    req.body = value;
    next();
  };
};
