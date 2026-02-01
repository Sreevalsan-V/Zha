const db = require('../models');
const config = require('../config/config');
const seedUsers = require('./seedUsers');

/**
 * Initialize database
 * This script creates all tables and sets up the database schema
 */
const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Test connection
    await db.sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Sync all models
    // force: true will drop existing tables and recreate them
    // Set to false in production to preserve data
    await db.sequelize.sync({ force: true });
    console.log('✓ Database tables created successfully');
    
    // Seed users
    await seedUsers();
    
    console.log('\nDatabase initialization complete!');
    console.log('\nCreated tables:');
    console.log('  - uploads');
    console.log('  - test_records');
    console.log('  - users');
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
