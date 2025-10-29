import Joi from "joi";

const validate = (schema) => (req, res, next) => {
  const validSchema = {
    params: req.params,
    query: req.query,
    body: req.body,
  };

  const { value, error } = Joi.compile(schema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(validSchema);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    
    console.log("Validation error:", errorMessage);
    return res.status(400).json({ error: errorMessage });  // Changed from 401 to 400
  }

  Object.assign(req, value);
  return next();
};

export default validate;