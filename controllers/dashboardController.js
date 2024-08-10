const catchAsync = require('../middlewares/catchAsync');


exports.getDemoMode = catchAsync(async (req, res, next) => {
  res.status(200).json({
    demo: global.demo,
  });
});
