const express = require('express');

const userController = require('../controllers/user.controller');
const userMiddleware = require('./../middlewares/user.middleware');
const validationMiddleware = require('../middlewares/validations.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', userController.findAllUsers);

//router.use('/:id', userMiddleware.validUser)

//router.use(authMiddleware.restrictTo('admin', 'user'));

router
  .use('/:id', userMiddleware.validUser)
  .route('/:id')
  .get(userController.findOneUser)
  .patch(validationMiddleware.updateUserValidation, userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

/* buscar todos, buscar por id, actualizar, eliminar */
