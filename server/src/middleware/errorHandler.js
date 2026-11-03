function errorHandler(err, req, res, next) {
  console.error('[ServerError]', err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: true,
    message: err.message || 'Internal Server Error',
    detail: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = { errorHandler };
