const { validateStudentCSV, commitCSVStudentImport, getAdminUsers } = require('../lib/data/admin');
const { getCohort, getSectionStudents, getStudentDetail } = require('../lib/data/students');

async function run() {
  console.log('=== [TEST SUITE: CSV IMPORT & COHORT COMMIT VERIFICATION] ===\n');

  const sampleCSV = [
    'reg_no,full_name,section,cgpa,attendance_pct,backlogs',
    '"241FA18080","Kunal Deshmukh","A","8.4","82.0","0"',
    '"241FA18081","Priyanka Sharma","A","7.9","78.5","0"',
    '"241FA18082","Vikas Patel","B","11.5","64.0","1"',      // Error: CGPA > 10.0
    '"241FA18083","Rohan Joshi","B","6.8","105.0","2"',       // Error: Attendance > 100
    '"241FA18080","Duplicate Kunal","A","8.4","82.0","0"',     // Error: Duplicate reg_no
    '"241FA18084","Harsh Mehta","C","9.1","90.0","0"',
    '"241FA18085","Suhani Sen","C","5.9","45.0","-1"',        // Error: Backlogs negative
    '"241FA18086","Zoya Khan","C","8.7","85.0","0"',
  ].join('\n');

  // Step 1: Validate
  const report = validateStudentCSV(sampleCSV);
  console.log(`1. Evaluated: total=${report.total_rows}, valid=${report.valid_rows_count}, failed=${report.failed_rows_count}`);
  if (report.valid_rows_count !== 4 || report.failed_rows_count !== 4) {
    throw new Error(`Validation failed: expected 4 valid and 4 failed, got ${report.valid_rows_count} / ${report.failed_rows_count}`);
  }
  console.log('   [PASS] Pre-ingestion validation accurately separated 4 valid and 4 invalid records.');

  // Step 2: Commit
  console.log('\n2. Committing 4 valid student profiles...');
  const res = await commitCSVStudentImport(report.valid_records);
  if (res.imported_count !== 4) {
    throw new Error(`Expected 4 imported students, got ${res.imported_count}`);
  }
  console.log('   [PASS] commitCSVStudentImport returned 4 imported students.');

  // Step 3: Verify Cohort
  console.log('\n3. Verifying students exist in master cohort...');
  const cohort = getCohort();
  const regNos = ['241FA18080', '241FA18081', '241FA18084', '241FA18086'];
  for (const reg of regNos) {
    const found = cohort.find((s) => s.reg_no.toUpperCase() === reg);
    if (!found) {
      throw new Error(`Student ${reg} not found in master cohort!`);
    }
    console.log(`   [PASS] Found in cohort: ${found.full_name} (${found.reg_no}) - CGPA: ${found.cgpa}, Att: ${found.attendance_pct}%`);
  }

  // Step 4: Verify getSectionStudents
  console.log('\n4. Verifying students returned in getSectionStudents("all")...');
  const allStudents = await getSectionStudents('all');
  for (const reg of regNos) {
    const found = allStudents.find((s) => s.reg_no.toUpperCase() === reg);
    if (!found) {
      throw new Error(`Student ${reg} not found in getSectionStudents!`);
    }
    console.log(`   [PASS] Found in getSectionStudents: ${found.full_name} (${found.reg_no}) - Section: ${found.section_name}, Score: ${found.success_score}`);
  }

  // Step 5: Verify getStudentDetail
  console.log('\n5. Verifying student details dossier for Kunal Deshmukh (241FA18080)...');
  const detail = await getStudentDetail('241FA18080');
  if (!detail || detail.full_name !== 'Kunal Deshmukh') {
    throw new Error(`Failed to retrieve student detail for 241FA18080!`);
  }
  console.log(`   [PASS] Dossier successfully generated: ${detail.full_name}, Section: ${detail.section_name}, Risk: ${detail.risk_level}`);

  // Step 6: Verify getAdminUsers
  console.log('\n6. Verifying student appears in admin user management...');
  const users = await getAdminUsers();
  const userFound = users.find((u) => u.reg_no === '241FA18080');
  if (!userFound || userFound.role !== 'student') {
    throw new Error(`User 241FA18080 not found in admin users list with role student!`);
  }
  console.log(`   [PASS] User management profile active: ${userFound.full_name} (${userFound.email})`);

  console.log('\n=== ALL 6/6 CSV IMPORT & COMMIT VERIFICATION TESTS PASSED! ===');
}

run().catch((err) => {
  console.error('\n[TEST FAILED]:', err);
  process.exit(1);
});
