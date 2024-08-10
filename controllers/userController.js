const User = require('../models/userModel');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../middlewares/catchAsync');
const AppError = require('../middlewares/error');
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const sharp = require('sharp');
const path = require('path');
const bcrypt = require('bcryptjs');

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhotoUser = upload.single('photo');

exports.resizePhotoUser = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`${process.env.FILE_PATH}/uploads/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getUserByToken = catchAsync(async (req, res, next) => {
  let token = req.cookies.jwt || res.locals.token;

  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['passwordChangedAt', 'passwordResetExpires', 'passwordResetToken', 'passwordConfirm'] },
      });

      if (!user) {
        return res.status(400).json({ status: 'error', message: 'User not found' });
      }

      if (user.changedPasswordAfter(decoded.iat)) {
        return res.status(400).json({ status: 'error', message: 'Password changed after token issued' });
      }

      res.status(200).json({ user, demo: process.env.DEMO_MODE });
    } catch (err) {
      res.status(400).json({ status: 'error', message: 'Error: ' + err.message });
    }
  } else {
    next(new AppError('No token provided', 401));
  }
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let filterData = {};

  if (req.query.key) {
    const regex = new RegExp(req.query.key, 'i');
    filterData = { name: { [Op.iLike]: `%${req.query.key}%` } };
  }

  const limit = req.query.limit * 1 || 10;
  const page = req.query.page * 1 || 1;
  const skip = (page - 1) * limit;
  const users = await User.findAll({
    where: filterData,
    limit,
    offset: skip,
    order: [['role', 'ASC'], ['createdAt', 'DESC']],
  });
  const count = await User.count();
  const totalPages = Math.ceil(count / limit);

  res.status(200).json({
    users,
    currentPage: page,
    limit,
    totalPages,
  });
});

exports.userImg = catchAsync(async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(process.env.FILE_PATH, 'uploads/users', filename);
  res.sendFile(filePath);
});

exports.userEmail = catchAsync(async (req, res, next) => {
  const Email = require('../middlewares/email');

  const { text, subject, emailTo } = req.body.data;
  const email = new Email(text, subject, emailTo);

  try {
    await email.send();
    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email' });
  }
});

exports.createUser = catchAsync(async (req, res, next) => {
  try {
    const { password, passwordConfirm, name, surname, role, email } = req.body;

    if (password !== passwordConfirm) {
      return res.status(400).json({ status: 'error', message: 'Passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({ name, surname, role, email, password: hashedPassword });

    res.status(201).json({ status: 'success', message: 'User created' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

exports.editUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({ title: 'Edit user', status: 'success', user });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  try {
    const user = await User.update(req.body, {
      where: { id: req.params.id },
      returning: true,
      plain: true,
    });

    if (!user[0]) {
      return next(new AppError('No user found with that ID', 404));
    }
    
    res.status(200).json({ status: 'success', message: 'User updated', user: user[1] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  try {
    const { password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
      return res.status(400).json({ status: 'error', message: 'Passwords do not match' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.update(
      { password: hashedPassword },
      { where: { id: req.params.id }, returning: true, plain: true }
    );

    res.status(200).json({ status: 'success', message: 'Password updated', user: user[1] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

exports.editPassword = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({ title: 'Edit password', status: 'success', user });
});

exports.photoUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, { attributes: ['photo'] });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({ title: 'Photo user', status: 'success', user });
});

exports.updatePhotoUser = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.photo = req.file.filename;
  }

  const [affectedRows, [updatedUser]] = await User.update(req.body, {
    where: { id: req.params.id },
    returning: true,
    plain: true,
  });

  if (affectedRows === 0) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({ title: 'Photo updated', status: 'success', photo: updatedUser.photo });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.destroy({ where: { id: req.params.id } });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({ status: 'success', message: 'User deleted' });
});

exports.profileUpdate = catchAsync(async (req, res, next) => {
  let token = req.cookies.jwt || res.locals.token;

  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      const updatedUser = await User.update(req.body, {
        where: { id: decoded.id },
        returning: true,
        plain: true,
      });

      res.status(200).json({ status: 'success', user: updatedUser[1] });
    } catch (err) {
      res.status(400).json({ status: 'error', message: 'Error: ' + err.message });
    }
  } else {
    next(new AppError('No token provided', 401));
  }
});

exports.profilePassword = catchAsync(async (req, res, next) => {
  let token = req.cookies.jwt || res.locals.token;

  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const { password, passwordConfirm } = req.body;

      if (password !== passwordConfirm) {
        return res.status(400).json({ status: 'error', message: 'Passwords do not match' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.update(
        { password: hashedPassword },
        { where: { id: decoded.id }, returning: true, plain: true }
      );

      res.status(200).json({ status: 'success', message: 'Password updated', user: user[1] });
    } catch (err) {
      res.status(400).json({ status: 'error', message: 'Error: ' + err.message });
    }
  } else {
    next(new AppError('No token provided', 401));
  }
});

exports.updatePhotoUser = catchAsync(async (req, res, next) => {
  let token = req.cookies.jwt || res.locals.token;

  if (token) {
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      if (req.file) {
        req.body.photo = req.file.filename;
      }

      const [affectedRows, [updatedUser]] = await User.update(
        { photo: req.body.photo },
        { where: { id: decoded.id }, returning: true, plain: true }
      );

      if (affectedRows === 0) {
        return next(new AppError('No user found with that ID', 404));
      }

      res.status(200).json({ status: 'success', photo: updatedUser.photo });
    } catch (err) {
      res.status(400).json({ status: 'error', message: 'Error: ' + err.message });
    }
  } else {
    next(new AppError('No token provided', 401));
  }
});
