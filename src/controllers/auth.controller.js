const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const generateJWT = require('./../utils/jwt');
const AppError = require('../utils/appError');
const storage = require('../utils/firebase');

const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, description } = req.body;

  if (!req.file) {
    return next(new AppError('Please upload file', 400));
  }

  const imgRef = ref(storage, `users/${Date.now()}-${req.file.originalname}`);
  const imgUpload = await uploadBytes(imgRef, req.file.buffer);

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password: encryptedPassword,
    description,
    profileImgUrl: imgUpload.metadata.fullPath,
  });

  /* 4. generar el token */
  const tokenPromise = generateJWT(user.id);

  /* Resolver URL */

  const imgRefToDownload = ref(storage, user.profileImgUrl);
  const urlPromise = getDownloadURL(imgRefToDownload);

  const [token, url] = await Promise.all([tokenPromise, urlPromise]);

  user.profileImgUrl = url;

  res.status(200).json({
    status: 'success',
    message: 'The user has been created',
    token,
    //esto se agrego
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      description: user.description,
      profileImgUrl: user.profileImgUrl,
    },
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  /* 1. traernos email y password */
  const { email, password } = req.body;

  const user = await User.findOne({
    where: {
      email: email.toLowerCase().trim(),
      status: 'active',
    },
  });

  /* 2. Validar el usuario es correcto*/
  if (!user) {
    return next(new AppError(`User with email: ${email} not found`, 404));
  }

  /* 3. Validar si la contraseña es correcta */
  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }

  /* 4. generar el token */
  const tokenPromise = generateJWT(user.id);

  /* Resolver URL */

  const imgRef = ref(storage, user.profileImgUrl);
  const urlPromise = getDownloadURL(imgRef);

  const [token, url] = await Promise.all([tokenPromise, urlPromise]);

  user.profileImgUrl = url;

  res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      description: user.description,
      profileImgUrl: user.profileImgUrl,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. traerme el usuario que viene de la req del middleware
  const { user } = req;

  // 2. Traerme los datos de la req.body
  const { currentPassword, newPassword } = req.body;

  // 3. Validar si la contraseña actual y nueva son iguales enviar un error
  if (currentPassword === newPassword) {
    return next(new AppError('The password cannot be equals', 400));
  }

  // 4. Validar si la contraseña actual es igual a la de la BD
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }

  // 5. encriptar la nueva contraseña
  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(newPassword, salt);

  // 6. actualizar el usuario que viene de la req
  await user.update({
    password: encryptedPassword,
    passwordChangeAt: new Date(),
  });

  // 7. Enviar el mensaje al cliente
  return res.status(200).json({
    status: 'success',
    message: 'The user password was updated successfully',
  });
});
