const catchAsync = require('../middlewares/catchAsync');
const Database = require('../models/databaseModel');

exports.getDemoMode = catchAsync(async (req, res, next) => {
  res.status(200).json({
    demo: global.demo,
  });
});

exports.getConnection = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const totalDatabases = await Database.count();

  const databases = await Database.findAll();

  const totalPages = Math.ceil(totalDatabases / limit);

  let message = '';
  if (req.query.m) {
    if (req.query.m === '1') {
      message = 'Database added';
    } else if (req.query.m === '2') {
      message = 'Database deleted';
    }
  }

  res.status(200).json({
    databases: databases,
    currentPage: page,
    limit,
    totalPages,
    totalDatabases,
    message,
  });
});
