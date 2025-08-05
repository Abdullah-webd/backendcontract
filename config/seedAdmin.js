const Admin = require('../models/Admin');

async function seedAdmin() {
  try {
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!adminExists) {
      const admin = new Admin({
        email: process.env.ADMIN_EMAIL || 'admin@petrotech.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        name: 'System Administrator'
      });
      
      await admin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

module.exports = seedAdmin;