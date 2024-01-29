import { RequestHandler } from "express";
import { body, param, validationResult } from "express-validator";

const validationMiddleware: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(406).json({
      reason: Array.from(
        new Set(
          errors.array().map((e) => `${(e as any).location}:${(e as any).path}`)
        )
      ),
    });
  }
  next();
};

export const create = [
  body("tag").exists().isString(),
  body("title").exists().isString(),
  body("desc").exists().isString(),
  body("url").exists().isString(),
  body("requestType").optional().isString(),
  body("queries").exists().isArray(),
  body("queries.*.field").exists().isString(),
  body("queries.*.desc").optional().isString(),
  body("method").exists().isString(),
  body("parameters").optional().isArray(),
  body("parameters.*.field").exists().isString(),
  body("parameters.*.type").exists().isString(),
  body("parameters.*.desc").optional().isString(),
  body("parameters.*.isRequired").optional().isBoolean(),
  body("headers")
    .exists()
    .customSanitizer((val) => JSON.stringify(val)), //.isString(),
  body("success").exists().isObject(),
  body("success.status").exists().isInt(),
  body("success.response")
    .optional()
    .customSanitizer((val) => JSON.stringify(val)), //.isString(),
  body("errors").exists().isArray(),
  body("errors.*.status").exists().isInt(),
  body("errors.*.response")
    .exists()
    .customSanitizer((val) => JSON.stringify(val)), //.isString(),
  validationMiddleware,
];

export const update = [
  body("tag").optional().isString(),
  body("title").optional().isString(),
  body("desc").optional().isString(),
  body("url").optional().isString(),
  body("requestType").optional().isString(),
  body("queries").optional().isArray(),
  body("queries.*.field").exists().isString(),
  body("queries.*.desc").optional().isString(),
  body("method").optional().isString(),
  body("parameters").optional().isArray(),
  body("parameters.*.field").exists().isString(),
  body("parameters.*.type").exists().isString(),
  body("parameters.*.desc").optional().isString(),
  body("parameters.*.isRequired").optional().isBoolean(),
  body("headers")
    .optional()
    .customSanitizer((val) => JSON.stringify(val)), //.isString(),
  body("success").optional().isObject(),
  body("success.status").optional().isInt(),
  body("success.response")
    .optional()
    .customSanitizer((val) => JSON.stringify(val)), //.isString(),
  body("errors").optional().isArray(),
  body("errors.*.status").exists().isInt(),
  body("errors.*.response")
    .exists()
    .customSanitizer((val) => JSON.stringify(val)), //.isString(),
  validationMiddleware,
];

export const docId = [param("docId").isMongoId(), validationMiddleware];
