import Joi from 'joi';

export const validateUserProfile = (data) => {
  const schema = Joi.object({
    notificationType: Joi.string()
      .label('notificationType')
      .valid('email', 'phone')
      .messages({
        'any.valid': '{{#label}} must be email | phone',
      }),
    phone: Joi.string().label('phone').length(11).messages({
      'any.length': '{{#label}} length must be 11',
    }),
    name: Joi.string().label('name'),
  });
  return schema.validate(data);
};
