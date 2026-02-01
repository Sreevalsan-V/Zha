const db = require('../models');

/**
 * Migration Script: Add panelId to existing uploads
 * 
 * This script adds the panelId column to the uploads table for existing databases.
 * Run this if you have existing data and need to add the new panelId field.
 * 
 * Usage: node src/database/migrate-add-panelid.js
 */
const migratePanelId = async () => {
  try {
    console.log('Starting migration: Add panelId to uploads table...\n');
    
    // Get sequelize instance
    const sequelize = db.sequelize;
    
    // Check if panelId column already exists
    const [results] = await sequelize.query(`
      PRAGMA table_info(uploads);
    `);
    
    const columnExists = results.some(col => col.name === 'panelId');
    
    if (columnExists) {
      console.log('✓ panelId column already exists. No migration needed.');
      process.exit(0);
    }
    
    console.log('Adding panelId column to uploads table...');
    
    // Add panelId column (SQLite syntax)
    await sequelize.query(`
      ALTER TABLE uploads 
      ADD COLUMN panelId VARCHAR(50) DEFAULT 'DPHS-1';
    `);
    
    console.log('✓ Added panelId column with default value "DPHS-1"');
    
    // Update default value constraint
    console.log('\nUpdating existing records...');
    
    // For existing records, set panelId based on userId or set a default
    // You may want to customize this logic based on your data
    const [uploads] = await sequelize.query(`
      SELECT id, userId FROM uploads WHERE panelId = 'DPHS-1';
    `);
    
    console.log(`Found ${uploads.length} existing upload(s) to update`);
    
    // Example: Set panelId based on userId pattern or keep default
    // Customize this logic as needed
    for (const upload of uploads) {
      // Keep the default DPHS-1 or implement custom logic
      // Example: Set based on userId
      // const panelNumber = upload.userId.match(/\d+/) ? upload.userId.match(/\d+/)[0] : '1';
      // const newPanelId = `DPHS-${panelNumber}`;
      
      console.log(`  Upload ${upload.id}: panelId = DPHS-1 (using default)`);
    }
    
    // Create indexes for better query performance
    console.log('\nCreating indexes...');
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_uploads_panelId 
      ON uploads(panelId);
    `);
    console.log('✓ Created index: idx_uploads_panelId');
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_uploads_panelId_timestamp 
      ON uploads(panelId, uploadTimestamp);
    `);
    console.log('✓ Created index: idx_uploads_panelId_timestamp');
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_uploads_composite 
      ON uploads(panelId, userId, uploadTimestamp);
    `);
    console.log('✓ Created index: idx_uploads_composite');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNOTE: All existing uploads have been set to panelId="DPHS-1".');
    console.log('If you need different panelId values for existing records,');
    console.log('please update them manually or customize this migration script.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
};

// Run migration
migratePanelId();
