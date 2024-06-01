import Joi from 'joi';

export const validateLoginData = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .label('email')
      .email({ minDomainSegments: 2 })
      .messages({
        'any.required': '{{#label}} is required',
        'any.email': '{{$label}} must be valid email address',
      }),
    password: Joi.string().required().label('password').messages({
      'any.required': '{{#label}} is required and cannot be empty',
    }),
  });

  return schema.validate(data);
};

export const validateSignupData = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .label('name')
      .messages({ 'any.required': '{{#label}} is required' }),
    email: Joi.string()
      .required()
      .label('email')
      .email({ minDomainSegments: 2 })
      .messages({
        'any.required': '{{#label}} is required',
        'any.email': '{{$label}} must be valid email address',
      }),
    password: Joi.string().required().label('password').messages({
      'any.required': '{{#label}} is required and cannot be empty',
    }),
    notificationType: Joi.string()
      .required()
      .label('notificationType')
      .valid('email', 'phone')
      .messages({
        'any.required': '{{#label}} is required',
        'any.valid': '{{#label}} must be email | phone',
      }),
    phone: Joi.string().required().label('phone').length(11).messages({
      'any.required': '{{#label}} is required and cannot be empty',
      'any.length': '{{#label}} length must be 11',
    }),
  });
  return schema.validate(data);
};
