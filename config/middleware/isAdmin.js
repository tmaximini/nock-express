
module.exports = function isAdmin (req, res, next) {
  if (process.env.NODE_ENV != 'test') {
    if (!(req.session && req.session.user && req.session.admin)) {
      req.flash('info', 'You are not allowed to do that!');
      return res.redirect('/login');
    }
  }
  next();
}
