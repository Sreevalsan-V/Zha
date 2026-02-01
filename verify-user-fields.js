#!/usr/bin/env node
/**
 * Verification Script: Test User Login and Fields
 * 
 * This script tests that login returns all required fields for Android app.
 * Run this to verify the fix before Android team tests.
 * 
 * Usage: node verify-user-fields.js
 */

const http = require('http');

const testLogin = (username, password) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ username, password });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
};

const verifyUserFields = (user) => {
  const requiredFields = [
    'id',
    'username',
    'name',
    'phcName',
    'hubName',
    'blockName',
    'districtName'
  ];
  
  const results = {
    allPresent: true,
    missing: [],
    empty: [],
    details: {}
  };
  
  for (const field of requiredFields) {
    const value = user[field];
    results.details[field] = value || 'MISSING';
    
    if (value === undefined || value === null) {
      results.allPresent = false;
      results.missing.push(field);
    } else if (typeof value === 'string' && value.trim() === '') {
      results.allPresent = false;
      results.empty.push(field);
    }
  }
  
  return results;
};

const runTests = async () => {
  console.log('🧪 User Fields Verification Test\n');
  console.log('Testing backend login endpoint...\n');
  
  const testUsers = [
    { username: 'healthworker1', password: 'password123', role: 'Health Worker' },
    { username: 'labtech1', password: 'labtech123', role: 'Lab Technician' },
    { username: 'admin1', password: 'admin123', role: 'Administrator' }
  ];
  
  let allPassed = true;
  
  for (const testUser of testUsers) {
    console.log(`\n📋 Testing: ${testUser.username} (${testUser.role})`);
    console.log('─'.repeat(60));
    
    try {
      const response = await testLogin(testUser.username, testUser.password);
      
      if (response.success && response.data && response.data.user) {
        const user = response.data.user;
        const verification = verifyUserFields(user);
        
        if (verification.allPresent) {
          console.log('✅ PASS - All required fields present\n');
          
          console.log('User Details:');
          console.log(`  ID:           ${user.id}`);
          console.log(`  Name:         ${user.name}`);
          console.log(`  PHC Name:     ${user.phcName}`);
          console.log(`  Hub Name:     ${user.hubName}`);
          console.log(`  Block Name:   ${user.blockName}`);
          console.log(`  District:     ${user.districtName}`);
          console.log(`  State:        ${user.state}`);
        } else {
          console.log('❌ FAIL - Missing or empty fields\n');
          
          if (verification.missing.length > 0) {
            console.log('Missing fields:', verification.missing.join(', '));
          }
          if (verification.empty.length > 0) {
            console.log('Empty fields:', verification.empty.join(', '));
          }
          
          console.log('\nField Details:');
          for (const [field, value] of Object.entries(verification.details)) {
            const status = (value && value !== 'MISSING') ? '✅' : '❌';
            console.log(`  ${status} ${field}: ${value}`);
          }
          
          allPassed = false;
        }
      } else {
        console.log('❌ FAIL - Login failed or invalid response');
        console.log('Response:', JSON.stringify(response, null, 2));
        allPassed = false;
      }
    } catch (error) {
      console.log('❌ ERROR - Request failed');
      console.log('Error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('\n⚠️  Server is not running!');
        console.log('   Please start the server with: npm run dev');
        return;
      }
      
      allPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED');
    console.log('\n✨ Backend is ready for Android integration!');
    console.log('   All users have complete profile data.');
    console.log('\n📱 Android Team: Logout and re-login to get fresh data.\n');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('\n⚠️  Please fix the issues above before Android testing.\n');
  }
};

// Check if server is running first
const checkServer = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.end();
  });
};

(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('⚠️  Server is not running!');
    console.log('   Please start the server with: npm run dev\n');
    process.exit(1);
  }
  
  await runTests();
})();
