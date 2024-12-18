const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      const { role } = req.currentUser || {};
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      next();
    };
  };
  
  module.exports = { authorizeRoles };