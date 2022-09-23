const createError = require("http-errors");

function handleError(code, error = new Error()) {
  const err = createError(code);
  return (req, res, next) => {
    console.log(code);
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.send(
      `${
        `${code} ${err.message}
    ${error?.stack}` || `ERROR ${code}`
      }`
    );
  };
}

module.exports = handleError;
