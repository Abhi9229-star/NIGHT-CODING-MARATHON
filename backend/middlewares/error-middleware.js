import mongoose from "mongoose";

import { HttpError } from "../utils/http-error.js";

export const notFound = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, _next) => {
  console.error(error);

  if (res.headersSent) {
    return;
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: error.details,
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path}`,
      error: error.value,
    });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message || "Unexpected error",
  });
};
