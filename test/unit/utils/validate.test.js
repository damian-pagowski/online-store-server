const validate = require('../../../middlewares/validate');
const Joi = require('joi');

describe('Validation Middleware', () => {
  const schema = Joi.object({
    name: Joi.string().required(),
  });

  const req = { body: { name: 'testname' } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  it('should call next if validation passes', () => {
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if validation fails', () => {
    const invalidReq = { body: {} };
    validate(schema)(invalidReq, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: expect.any(Array),
      message: expect.any(String),
      success: false,
    });
  });

});
