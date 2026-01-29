
const checkAdmin = (req, res, next) => {
  const token = req.headers['x-admin-access-token'];
  // Default to 'admin123' if not set in .env for immediate testing
  const secret = process.env.ADMIN_ACCESS_CODE || 'admin123';
  
  if (token !== secret) {
    return res.status(403).json({ message: 'Unauthorized: Invalid Access Code' });
  }
  next();
};

module.exports = checkAdmin;
