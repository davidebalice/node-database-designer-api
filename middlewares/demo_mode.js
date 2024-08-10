const demoMode = (req, res, next) => {
  if (req.user && typeof req.user.demo !== 'undefined') {
    if (req.user.demo === false) {
      global.demo = false;
    } else {
      global.demo = true;
    }
  } else {
    if (process.env.DEMO_MODE === 'true') {
      global.demo = true;
    } else {
      global.demo = false;
    }
  }

  next();

  console.log('global.demo');
  console.log(global.demo);
};

module.exports = demoMode;
