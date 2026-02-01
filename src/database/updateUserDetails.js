const User = require('../models/User');
const db = require('../models');

/**
 * Update User Details Script
 * Updates existing users with complete location information
 * Run this to fix missing phcName, hubName, blockName, districtName fields
 */
const updateUserDetails = async () => {
  try {
    console.log('Updating user details with location information...\n');

    // User data with complete fields
    const userUpdates = [
      {
        username: 'healthworker1',
        updates: {
          phcName: 'Primary Health Center - Chennai North',
          hubName: 'Zone 3 Hub',
          blockName: 'Teynampet Block',
          districtName: 'Chennai',
          healthCenter: 'Primary Health Center - Chennai North',
          district: 'Chennai',
          state: 'Tamil Nadu',
        },
      },
      {
        username: 'labtech1',
        updates: {
          phcName: 'District Hospital - Coimbatore',
          hubName: 'Zone 2 Hub',
          blockName: 'Coimbatore South Block',
          districtName: 'Coimbatore',
          healthCenter: 'District Hospital - Coimbatore',
          district: 'Coimbatore',
          state: 'Tamil Nadu',
        },
      },
      {
        username: 'admin1',
        updates: {
          phcName: 'Directorate of Public Health',
          hubName: 'Central Hub',
          blockName: 'Chennai Central',
          districtName: 'Chennai',
          healthCenter: 'Directorate of Public Health',
          district: 'Chennai',
          state: 'Tamil Nadu',
        },
      },
    ];

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const { username, updates } of userUpdates) {
      const user = await User.findOne({ where: { username } });

      if (user) {
        await user.update(updates);
        console.log(`✓ Updated user: ${username}`);
        console.log(`  PHC Name: ${updates.phcName}`);
        console.log(`  Hub Name: ${updates.hubName}`);
        console.log(`  Block Name: ${updates.blockName}`);
        console.log(`  District Name: ${updates.districtName}\n`);
        updatedCount++;
      } else {
        console.log(`⚠ User not found: ${username}\n`);
        notFoundCount++;
      }
    }

    console.log('═══════════════════════════════════════');
    console.log(`Update Summary:`);
    console.log(`  ✓ Updated: ${updatedCount} users`);
    console.log(`  ⚠ Not found: ${notFoundCount} users`);
    console.log('═══════════════════════════════════════\n');

    console.log('✓ User details update complete!');
    console.log('Users can now upload successfully.\n');

  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  (async () => {
    try {
      await db.sequelize.authenticate();
      console.log('✓ Database connection established\n');
      
      await updateUserDetails();
      
      process.exit(0);
    } catch (error) {
      console.error('Failed to update user details:', error);
      process.exit(1);
    }
  })();
}

module.exports = updateUserDetails;
