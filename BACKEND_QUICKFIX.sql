-- ========================================
-- BACKEND QUICK FIX: Update User Details
-- ========================================
-- Problem: Users table has NULL values for phcName, hubName, blockName, districtName
-- Solution: Update all test users with complete profile data
-- 
-- Run this script to fix the "Missing user details" error
-- ========================================

-- Check if columns exist (SQLite will ignore if they don't)
-- If columns are missing, uncomment these lines:
-- ALTER TABLE users ADD COLUMN phcName VARCHAR(255);
-- ALTER TABLE users ADD COLUMN hubName VARCHAR(255);
-- ALTER TABLE users ADD COLUMN blockName VARCHAR(255);
-- ALTER TABLE users ADD COLUMN districtName VARCHAR(255);

-- ========================================
-- OPTION 1: Update All Test Users at Once
-- ========================================

UPDATE users 
SET phcName = CASE username
        WHEN 'healthworker1' THEN 'Primary Health Center - Chennai North'
        WHEN 'labtech1' THEN 'District Hospital - Coimbatore'
        WHEN 'admin1' THEN 'Directorate of Public Health'
        ELSE phcName
    END,
    hubName = CASE username
        WHEN 'healthworker1' THEN 'Zone 3 Hub'
        WHEN 'labtech1' THEN 'Zone 2 Hub'
        WHEN 'admin1' THEN 'Central Hub'
        ELSE hubName
    END,
    blockName = CASE username
        WHEN 'healthworker1' THEN 'Teynampet Block'
        WHEN 'labtech1' THEN 'Coimbatore South Block'
        WHEN 'admin1' THEN 'Chennai Central'
        ELSE blockName
    END,
    districtName = CASE username
        WHEN 'healthworker1' THEN 'Chennai'
        WHEN 'labtech1' THEN 'Coimbatore'
        WHEN 'admin1' THEN 'Chennai'
        ELSE districtName
    END
WHERE username IN ('healthworker1', 'labtech1', 'admin1');

-- ========================================
-- OPTION 2: Update Individual Users
-- ========================================

-- Uncomment these if you prefer individual updates:

-- UPDATE users 
-- SET phcName = 'Primary Health Center - Chennai North',
--     hubName = 'Zone 3 Hub',
--     blockName = 'Teynampet Block',
--     districtName = 'Chennai'
-- WHERE username = 'healthworker1';

-- UPDATE users 
-- SET phcName = 'District Hospital - Coimbatore',
--     hubName = 'Zone 2 Hub',
--     blockName = 'Coimbatore South Block',
--     districtName = 'Coimbatore'
-- WHERE username = 'labtech1';

-- UPDATE users 
-- SET phcName = 'Directorate of Public Health',
--     hubName = 'Central Hub',
--     blockName = 'Chennai Central',
--     districtName = 'Chennai'
-- WHERE username = 'admin1';

-- ========================================
-- VERIFICATION: Check if fix worked
-- ========================================

SELECT 
    id,
    username,
    name,
    phcName,
    hubName,
    blockName,
    districtName,
    state
FROM users 
WHERE username IN ('healthworker1', 'labtech1', 'admin1')
ORDER BY username;

-- Expected output:
-- healthworker1: Primary Health Center - Chennai North | Zone 3 Hub | Teynampet Block | Chennai
-- labtech1: District Hospital - Coimbatore | Zone 2 Hub | Coimbatore South Block | Coimbatore
-- admin1: Directorate of Public Health | Central Hub | Chennai Central | Chennai

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- If updates didn't work, check if columns exist:
-- PRAGMA table_info(users);

-- If columns are missing, create them:
-- ALTER TABLE users ADD COLUMN phcName VARCHAR(255);
-- ALTER TABLE users ADD COLUMN hubName VARCHAR(255);
-- ALTER TABLE users ADD COLUMN blockName VARCHAR(255);
-- ALTER TABLE users ADD COLUMN districtName VARCHAR(255);

-- Then run the UPDATE statements again
