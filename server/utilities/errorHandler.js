const createError = require("http-errors");

function handleError(code, error = new Error()) {
  const err = createError(code);
  return (req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    console.log(error);
    res.status(err.status || 500);
    res.send(
      `${`${code} ${err.message}
    ${error?.cause ? error.cause + "\nAt: " + error.stack : ""}`}`
    );
  };
}

module.exports = handleError;
