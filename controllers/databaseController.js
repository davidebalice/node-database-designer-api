const moment = require('moment');
const { Op } = require('sequelize');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Database = require('../models/databaseModel');
const User = require('../models/userModel');
const AppError = require('../middlewares/error');
const catchAsync = require('../middlewares/catchAsync');
const fs = require('fs');
const path = require('path');
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
  const clients = await Client.find({}).sort({ companyName: 1 });
  res.status(200).json({
    title: 'Add database',
    owner: res.locals.user._id,
    clients: clients.map((client) => ({
      _id: client._id,
      companyName: client.companyName,
    })),
  });
});

exports.createDatabase = catchAsync(async (req, res, next) => {
  try {
    req.body._id = new mongoose.Types.ObjectId();
    req.body.owner = res.locals.user._id;
    await Database.create(req.body);

    res.status(200).json({
      title: 'Create database',
      create: 'success',
    });
  } catch (err) {
    res.status(200).json({
      title: 'Create database',
      formData: req.body,
      message: err.message,
    });
  }
});

exports.deleteDatabase = catchAsync(async (req, res, next) => {
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
  const database = await Database.findById(req.params.id);
  if (!database) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    title: 'Edit database',
    database,
  });
});

exports.updateDatabase = catchAsync(async (req, res, next) => {
  //console.log(global.database);

  if (global.database) {
    res.status(200).json({
      title: 'Demo mode',
      status: 'database',
    });
  } else {
    const doc = await Database.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      title: 'Update database',
      status: 'success',
    });
  }
});

exports.membersDatabase = catchAsync(async (req, res, next) => {
  const database = await Database.findById(req.params.id);

  if (!database) {
    return next(new AppError('No document found with that ID', 404));
  }

  const allUsers = await User.find().sort({ surname: 1 });
  const memberUserIds = database.members.map((member) => member._id.toString());
  const filteredUsers = allUsers.filter((user) => !memberUserIds.includes(user._id.toString()));

  res.status(200).json({
    title: 'Database members',
    database,
    users: filteredUsers,
  });
});

exports.AddMemberDatabase = catchAsync(async (req, res, next) => {
  const database = await Database.findById(req.body.database_id);
  const member = await User.findById(req.body.member_id);

  if (!database || !member) {
    return next(new AppError('No document found with that ID', 404));
  }

  const memberIds = database.members.map((member) => member._id.toString());
  if (!memberIds.includes(member._id)) {
    database.members.push(member);
    await database.save();
  }

  const allUsers = await User.find().sort({ surname: 1 });
  const memberUserIds = database.members.map((member) => member._id.toString());
  const filteredUsers = allUsers.filter((user) => !memberUserIds.includes(user._id.toString()));

  res.status(200).json({
    title: 'Database members',
    database,
    members: database.members,
    users: filteredUsers,
  });
});

exports.photoDatabase = catchAsync(async (req, res, next) => {
  let query = await Database.findById(req.params.id);
  const doc = await query;
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  let message = '';
  res.render('Databases/photo', {
    status: 200,
    title: 'Photo database',
    formData: doc,
    message: message,
  });
});

exports.updatePhoto = catchAsync(async (req, res, next) => {
  const doc = await Database.findByIdAndUpdate(req.params.id, req.body);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  //res.redirect('/database/photo/' + doc._id);
  res.status(200).json({
    title: 'Update photo',
    create: 'success',
  });
});

exports.updateGallery = catchAsync(async (req, res, next) => {
  const type = req.body.type;
  const field = type === 'backend' ? 'gallery_backend' : 'gallery_frontend';

  const update = { $push: { [field]: { $each: req.body.images } } };
  const doc = await Database.updateOne({ _id: req.params.id }, update);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    title: 'Update gallery',
    create: 'success',
  });
});

exports.deleteGallery = catchAsync(async (req, res, next) => {
  const id = req.body.id;
  const galleryImage = req.body.image;
  await Gallery.deleteOne({ file: galleryImage });

  await Database.updateOne({ _id: id }, { $pull: { gallery_frontend: galleryImage, gallery_backend: galleryImage } });

  try {
    fs.unlinkSync(`./public/img/database/${galleryImage}`);
  } catch (err) {
    console.error('Error:', err);
  }

  res.status(200).json({
    title: 'Delete photo',
    create: 'success',
  });
});

exports.activeDatabase = catchAsync(async (req, res, next) => {
  const doc = await Database.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
});

exports.updatePhoto = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.imageCover = req.body.filename;
  }

  const doc = await Database.findByIdAndUpdate(req.params.id, req.body);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    title: 'Photo database',
    status: 'success',
    imageCover: req.body.imageCover,
  });
});

exports.cover = catchAsync(async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(process.env.FILE_PATH, 'uploads/database', filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(err);
      return next(err);
    }
  });
});

exports.gallery = catchAsync(async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(process.env.FILE_PATH, 'public/img/database', filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(err);
      return next(err);
    }
  });
});
