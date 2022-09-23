const createError = require("http-errors");

function handleError(code) {
  const err = createError(code);
  return (req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.send(`ERROR ${err.status}: ${err.message}`);
  };
}

module.exports = handleError;
