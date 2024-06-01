import Joi from 'joi';

export const amountValidation = (data) => {
  const schema = Joi.object({
    amount: Joi.number()
      .required()
      .label('amount')
      .min(50)
      .messages({ 'any.required': '{{#label}} is required' }),
  });
  return schema.validate(data);
};
