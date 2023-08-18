const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/user.model');

exports.validUser = catchAsync(async (req, res, next) => {
  // 1. traer ek ud de ka req.params
  const { id } = req.params;
  // 2. Buscar el usuario con status active y el id recibido
  const user = await User.findOne({
    where: {
      id,
      status: 'active',
    },
  });

  // 3. valido que si no existe envio el error
  if (!user) {
    return next(new AppError(`User with id: ${id} not found`, 404));
  }

  // adjunto el usuario
  req.user = user;
  next();
});


