
module.exports = function isLoggedIn (req, res, next) {
  if (process.env.NODE_ENV != 'test') {
    if (!(req.session && req.session.user)) {
      return res.redirect('/login');
    }
  }
  next();
}
