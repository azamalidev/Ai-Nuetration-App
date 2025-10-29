import Joi from "joi";

const validate = (schema, property = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(d => d.message).join(", ");
    console.log("Validation error:", errorMessage);
    return res.status(400).json({ error: errorMessage });
  }

  req[property] = value;
  next();
};

export default validate;
