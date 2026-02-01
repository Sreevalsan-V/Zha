const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Seed Users Script
 * Creates the three test users with hashed passwords
 */
const seedUsers = async () => {
  try {
    console.log('Seeding users...');

    const users = [
      {
        id: 'user-001',
        username: 'healthworker1',
        password: 'password123',
        name: 'Dr. Rajesh Kumar',
        role: 'Health Worker',
        email: 'rajesh.kumar@dpha.tn.gov.in',
        phoneNumber: '+91 9876543210',
        phcName: 'Primary Health Center - Chennai North',
        hubName: 'Zone 3 Hub',
        blockName: 'Teynampet Block',
        districtName: 'Chennai',
        healthCenter: 'Primary Health Center - Chennai North',
        district: 'Chennai',
        state: 'Tamil Nadu',
      },
      {
        id: 'user-002',
        username: 'labtech1',
        password: 'labtech123',
        name: 'Ms. Priya Sharma',
        role: 'Lab Technician',
        email: 'priya.sharma@dpha.tn.gov.in',
        phoneNumber: '+91 9876543211',
        phcName: 'District Hospital - Coimbatore',
        hubName: 'Zone 2 Hub',
        blockName: 'Coimbatore South Block',
        districtName: 'Coimbatore',
        healthCenter: 'District Hospital - Coimbatore',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
      },
      {
        id: 'user-003',
        username: 'admin1',
        password: 'admin123',
        name: 'Dr. Suresh Babu',
        role: 'Administrator',
        email: 'suresh.babu@dpha.tn.gov.in',
        phoneNumber: '+91 9876543212',
        phcName: 'Directorate of Public Health',
        hubName: 'Central Hub',
        blockName: 'Chennai Central',
        districtName: 'Chennai',
        healthCenter: 'Directorate of Public Health',
        district: 'Chennai',
        state: 'Tamil Nadu',
      },
    ];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { username: userData.username },
      });

      if (existingUser) {
        console.log(`  ✓ User '${userData.username}' already exists`);
      } else {
        // Create user (password will be hashed by beforeCreate hook)
        await User.create(userData);
        console.log(`  ✓ Created user '${userData.username}'`);
      }
    }

    console.log('\nUser seeding complete!');
    console.log('\nTest credentials:');
    console.log('  - Username: healthworker1, Password: password123');
    console.log('  - Username: labtech1, Password: labtech123');
    console.log('  - Username: admin1, Password: admin123');

  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers;
