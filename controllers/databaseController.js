const moment = require('moment');
const { Op } = require('sequelize');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Database = require('../models/databaseModel');
const User = require('../models/userModel');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');
const { format } = require('date-fns');

exports.getDatabases = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const userId = req.user.id;

  if (isNaN(userId)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid user_id parameter',
    });
  }

  const nameFilter = req.query.name ? { name: { [Op.like]: `%${req.query.name}%` } } : {};

  const totalDatabases = await Database.count({
    where: { user_id: userId },
  });

  const databases = await Database.findAll({
    where: {
      user_id: userId,
      ...nameFilter,
    },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  const totalPages = Math.ceil(totalDatabases / limit);

  const formattedDatabases = databases.map((database) => {
    const formattedDate = format(new Date(database.createdAt), 'dd/MM/yyyy');
    return { ...database.toJSON(), formattedDate };
  });

  let message = '';
  if (req.query.m) {
    if (req.query.m === '1') {
      message = 'Database added';
    } else if (req.query.m === '2') {
      message = 'Database deleted';
    }
  }

  res.status(200).json({
    databases: formattedDatabases,
    currentPage: page,
    limit,
    totalPages,
    totalDatabases,
    message,
  });
});

exports.addDatabase = catchAsync(async (req, res, next) => {
  res.status(200).json({
    title: 'Add database',
  });
});

exports.createDatabase = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  console.log('userId');
  console.log(userId);

  try {
    req.body.user_id = userId;

    await Database.create(req.body);

    res.status(200).json({
      title: 'Create database',
      create: 'success',
    });
  } catch (err) {
    res.status(500).json({
      title: 'Create database',
      formData: req.body,
      message: err.message,
    });
  }
});

exports.deleteDatabase = catchAsync(async (req, res, next) => {
  if (global.demo) {
    return res.status(200).json({
      title: 'Demo mode',
      status: 'demo',
    });
  }
  const doc = await Database.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    title: 'Delete database',
    create: 'success',
  });
});

exports.getDatabase = catchAsync(async (req, res, next) => {
  const database = await Database.findOne({ slug: req.params.slug });

  if (!database) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    database,
  });
});

exports.editDatabase = catchAsync(async (req, res, next) => {
  const database = await Database.findByPk(req.params.id);

  if (!database) {
    return next(new AppError('No record found with that ID', 404));
  }

  res.status(200).json({
    title: 'Edit database',
    database,
  });
});

exports.updateDatabase = catchAsync(async (req, res, next) => {
  if (global.demo) {
    return res.status(200).json({
      title: 'Demo mode',
      status: 'demo',
    });
  }

  const [updatedRows] = await Database.update(req.body, {
    where: { id: req.params.id },
    returning: true
  });

  if (updatedRows === 0) {
    return next(new AppError('No record found with that ID', 404));
  }

  const updatedRecord = await Database.findByPk(req.params.id);

  res.status(200).json({
    title: 'Update database',
    status: 'success',
    updatedRecord,
  });
});