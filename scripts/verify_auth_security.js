// Authentication and Security Verification Script
const { AUTHORIZED_CREDENTIALS, DEFAULT_INSTITUTIONAL_PASSWORD, loginUser, resetUserPassword } = require('../lib/data/auth');

// Simple mock for browser localStorage in Node.js test environment
const store = {};
global.window = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
};

async function runTests() {
  console.log('=== [CAMPUSPULSE AUTHENTICATION & SECURITY VERIFICATION SUITE] ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Authorized student login with correct password
  try {
    const user = await loginUser('241fa18067@campus.edu.in', 'Password@123', 'student');
    assert(user.email === '241fa18067@campus.edu.in' && user.role === 'student', '1. Valid student credentials open the portal');
  } catch (e) {
    assert(false, `1. Valid student credentials open the portal: ${e.message}`);
  }

  // TEST 2: Student login with WRONG password
  try {
    await loginUser('241fa18067@campus.edu.in', 'WrongPass123', 'student');
    assert(false, '2. Student login with WRONG password must be BLOCKED');
  } catch (e) {
    assert(e.message.includes('Authentication Failed') || e.message.includes('Incorrect password'), '2. Student login with WRONG password is blocked');
  }

  // TEST 3: At-risk student login with correct password
  try {
    const user = await loginUser('241fa04070@campus.edu.in', 'Password@123', 'student');
    assert(user.email === '241fa04070@campus.edu.in' && user.role === 'student', '3. Valid at-risk student credentials open the portal');
  } catch (e) {
    assert(false, `3. Valid at-risk student credentials: ${e.message}`);
  }

  // TEST 4: Faculty login with correct password
  try {
    const user = await loginUser('ananya.sharma@campus.edu.in', 'Password@123', 'faculty');
    assert(user.email === 'ananya.sharma@campus.edu.in' && user.role === 'faculty', '4. Valid faculty credentials open the portal');
  } catch (e) {
    assert(false, `4. Valid faculty credentials: ${e.message}`);
  }

  // TEST 5: Alternate faculty login with correct password
  try {
    const user = await loginUser('k.v.krishna.kishore@campus.edu.in', 'Password@123', 'faculty');
    assert(user.email === 'k.v.krishna.kishore@campus.edu.in' && user.role === 'faculty', '5. Valid alternate faculty credentials open the portal');
  } catch (e) {
    assert(false, `5. Valid alternate faculty credentials: ${e.message}`);
  }

  // TEST 6: Admin login with correct password
  try {
    const user = await loginUser('admin@campus.edu.in', 'Password@123', 'admin');
    assert(user.email === 'admin@campus.edu.in' && user.role === 'admin', '6. Valid admin credentials open the portal');
  } catch (e) {
    assert(false, `6. Valid admin credentials: ${e.message}`);
  }

  // TEST 7: Admin login with WRONG password
  try {
    await loginUser('admin@campus.edu.in', 'hackerpassword!', 'admin');
    assert(false, '7. Admin login with WRONG password must be BLOCKED');
  } catch (e) {
    assert(e.message.includes('Authentication Failed') || e.message.includes('Incorrect password'), '7. Admin login with WRONG password is blocked');
  }

  // TEST 8: Unregistered email / attacker email
  try {
    await loginUser('hacker@attack.com', 'Password@123', 'student');
    assert(false, '8. Attacker email must be BLOCKED');
  } catch (e) {
    assert(e.message.includes('Access Denied') || e.message.includes('Unregistered email'), '8. Attacker email is strictly blocked');
  }

  // TEST 9: Attacker trying fake @campus.edu.in domain account
  try {
    await loginUser('fake_dean@campus.edu.in', 'Password@123', 'admin');
    assert(false, '9. Fake institutional account must be BLOCKED');
  } catch (e) {
    assert(e.message.includes('Access Denied') || e.message.includes('Unregistered email'), '9. Fake institutional account is blocked');
  }

  // TEST 10: Role mismatch attack (e.g. attempting to log in as student using admin email)
  try {
    await loginUser('admin@campus.edu.in', 'Password@123', 'student');
    assert(false, '10. Role mismatch must be BLOCKED');
  } catch (e) {
    assert(e.message.includes('Role Mismatch'), '10. Role mismatch is strictly blocked');
  }

  // TEST 11: Attacker trying to reset password for unregistered email
  try {
    await resetUserPassword('attacker@evil.org', 'NewPassword123');
    assert(false, '11. Resetting password for unregistered email must be BLOCKED');
  } catch (e) {
    assert(e.message.includes('Security Alert') || e.message.includes('unregistered'), '11. Resetting password for unregistered email is blocked');
  }

  // TEST 12: Legitimate password reset & login verification
  try {
    await resetUserPassword('241fa18067@campus.edu.in', 'CustomSecret#99');
    // Old password should now fail
    let oldFailed = false;
    try {
      await loginUser('241fa18067@campus.edu.in', 'Password@123', 'student');
    } catch {
      oldFailed = true;
    }
    // New password should succeed
    const updatedUser = await loginUser('241fa18067@campus.edu.in', 'CustomSecret#99', 'student');
    assert(oldFailed && updatedUser.reg_no === '241FA18067', '12. Custom updated password is required and verified');
  } catch (e) {
    assert(false, `12. Custom password flow: ${e.message}`);
  }

  console.log(`\n=== RESULTS: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
