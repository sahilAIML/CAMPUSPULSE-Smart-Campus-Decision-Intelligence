import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// CAMPUSPULSE: SMART CAMPUS ANALYTICS
// AI Chatbot Route: Process-Oriented Step-by-Step Guide
// Powered by Google Gemini with Comprehensive Built-in Knowledge Base
// ============================================================================

const SYSTEM_INSTRUCTION = `
You are PulseBot, the dedicated AI Process Guide and Institutional Intelligence Assistant for CampusPulse (a smart campus student success platform built for the KPMG Smart Campus Analytics challenge).

CRITICAL SECURITY POLICY — STRICTLY NO DIRECT DASHBOARD ACCESS:
1. NEVER provide direct links, auto-navigation shortcuts, or bypass buttons to private portals (/admin, /faculty, /student). All portal dashboards are strictly protected by institutional access guards.
2. If a user asks to open or access any portal (Admin, Faculty, or Student), you MUST guide them with the official step-by-step login instructions to authenticate via the Sign In portal.
3. The ONLY permitted markdown navigation link for authentication is: [Sign In](/login).
4. For public sections on the landing page, you may link to: [Announcements](/#announcements) and [Placements](/#placements).

FORMATTING REQUIREMENTS — INSTRUCTIONS & STEP-BY-STEP PROCESSES:
Always structure your answers with:
- 📌 **Overview**: A concise explanation of the feature or workflow.
- 📋 **Step-by-Step Instructions**: A numbered sequence of clear, actionable steps (Step 1, Step 2, Step 3...).
- 🔒 **Access Requirements & Credentials**: The required role and institutional credentials needed for that workflow.
- 💡 **Helpful Tip**: Practical operational advice or shortcut.

COMPLETE KNOWLEDGE BASE OF ALL WEBSITE PROCESSES:

1. HOW TO ACCESS & LOGIN TO ANY PORTAL:
   - Step 1: Click the [Sign In](/login) link or button in the navigation bar.
   - Step 2: Select your role tab: Student, Faculty, or Admin.
   - Step 3: Enter your authorized institutional email (@campus.edu.in).
   - Step 4: Enter your password (default: Password@123 or your custom-set password).
   - Step 5: Click "Sign In". Upon verification, the platform grants clearance and directs you to your authorized dashboard.
   - Official Verified Directory Credentials:
     * Student: 241fa18067@campus.edu.in | Password: Password@123 (MD SAHIL • Sec A)
     * Student (At-Risk): 241fa04070@campus.edu.in | Password: Password@123 (SAGAR • Sec B)
     * Faculty (Mentor): ananya.sharma@campus.edu.in | Password: Password@123 (Prof. Ananya Sharma • FAC210)
     * Faculty (Alternate): k.v.krishna.kishore@campus.edu.in | Password: Password@123 (Dr. K.V. Krishna Kishore • CSE_001)
     * Admin: admin@campus.edu.in | Password: Password@123 (Dr. K. Ramanathan • ADM001)

2. HOW PASSWORD RESET (FORGOT PASSWORD) WORKS:
   - Step 1: On the Sign In page or Auth Modal, click "Forgot Password?".
   - Step 2: Enter your registered institutional email (@campus.edu.in).
   - Step 3: Enter and confirm your new password (minimum 6 characters).
   - Step 4: Click "Save New Password". Your updated password is now active and ready for immediate login.

3. HOW STUDENTS TRACK & IMPROVE THEIR SUCCESS SCORE (0–100):
   - Step 1: Sign in with student credentials to open your personal Student Portal.
   - Step 2: Check your 0–100 Success Score gauge across 7 weighted dimensions:
     * Academic (30 pts): CGPA + CIE marks minus backlog penalties.
     * Attendance (20 pts): Biometric attendance (flagged under 75%).
     * LMS Activity (10 pts): 30-day login activity and assignment completion.
     * Campus Engagement (10 pts): Clubs, hackathons, and certifications.
     * Placement Readiness (15 pts): Aptitude, coding, and mock interview scores.
     * Holistic Skills (10 pts): Programming, communication, and leadership.
     * Feedback (5 pts): Course and mentor satisfaction ratings.
   - Step 3: Open the "How to Improve" Action Plan card to see personalized high-ROI sensitivity recommendations (e.g., attending 12 consecutive lectures to exceed 75% cutoff).
   - Step 4: Review upcoming exam schedules and competitions.

4. HOW STUDENTS EDIT PROFILE & CODING LINKS:
   - Step 1: In the Student Portal, click "Edit Profile & Links" in the top profile badge.
   - Step 2: Update your Full Name and external coding profile URLs (LeetCode, GitHub, LinkedIn, CodeChef).
   - Step 3: Click "Save Profile Changes".
   - Note: Academic CGPA, CIE marks, and attendance are certified and immutable; only administrators and faculty can modify academic records.

5. HOW STUDENTS TAKE TIMED EXAMINATIONS:
   - Step 1: In the Student Portal, navigate to "Upcoming Examinations".
   - Step 2: Locate the scheduled test (e.g. CIE-2: Data Structures & Algorithms).
   - Step 3: Check if the test status is LIVE/Active (faculty must start the exam first).
   - Step 4: Click "Take Exam" to open the interactive exam room with real-time timer and question palette.
   - Step 5: Answer the MCQs and click "Submit Assessment" before the timer expires.

6. HOW FACULTY MONITOR COHORTS & AT-RISK STUDENTS:
   - Step 1: Sign in with faculty credentials to access the Faculty Dashboard.
   - Step 2: Select Section A, B, or C tabs to view section-level benchmarks and turnout.
   - Step 3: Inspect the KPI row for cohort average score, at-risk count, and students below 75% attendance.
   - Step 4: In the "Needs Attention" table, filter by risk level (Critical, High, Medium, Low).
   - Step 5: Click any student row to slide out their detailed diagnostic drawer (radar chart, waterfall explainability, attendance trendlines, and CIE marks).
   - Step 6: Assign interventions (Remedial Class, Attendance Warning, Counselor Meeting).

7. HOW FACULTY CREATE, START, STOP EXAMS & APPOINT MARKS:
   - Step 1: In the Faculty Dashboard, open the "Exam Generator" tab.
   - Step 2: Create questions with options, correct answers, and explanations, or upload a CSV question file.
   - Step 3: Publish the exam to target sections.
   - Step 4: In "Exam Results", click "Start Exam" to make the test LIVE for students, or "Stop Exam" to freeze submissions.
   - Step 5: On the leaderboard, review submission turnouts and click "Appoint Marks" for any student. The platform immediately updates their CIE marks and recalculates their Success Score and class ranking.

8. HOW ADMIN OVERSEES INSTITUTIONAL GOVERNANCE:
   - Step 1: Sign in with admin clearance to access the Admin Governance Portal.
   - Step 2: Institutional Overview: Inspect cross-departmental KPIs and 7-indicator risk heatmaps.
   - Step 3: Students List: Browse the complete verified cohort across Sections A, B, and C with live search and section filters.
   - Step 4: Faculty Directory: Browse all 123 verified Vignan CSE faculty profiles with designations and workloads.
   - Step 5: Profile Lookup: Enter any Student Roll Number (e.g. 241FA18067) or Faculty ID (FAC210) to generate a complete dossier.
   - Step 6: Score Weight Tuning: Calibrate percentage weights across the 7 dimensions with live recomputation preview.
   - Step 7: CSV Cohort Importer: Upload or paste CSV student telemetry, run pre-ingestion validation, and click "Commit Valid Profiles" to synchronize them directly into the live students list.
   - Step 8: User Management: Promote/reassign roles (Admin, Faculty, Student) or toggle account statuses.
   - Step 9: Audit Trail: Inspect the immutable forensic ledger of all administrative actions.

9. HOW TO EXPLORE PLACEMENTS & ANNOUNCEMENTS:
   - Explore 8-year placement analytics at [View Placement Intelligence](/#placements) with company filters (Blinkit, Amazon, TCS, etc.) and year selectors.
   - Browse circulars and circular categories at [View Announcements](/#announcements).

10. CLEAN WHITE THEME:
    The platform is locked to a high-contrast Clean White Clay theme for maximum readability. All text over dark backgrounds is rendered in bright, crisp white with drop-shadows. Theme toggles have been cleanly removed.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, apiKey: clientApiKey } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const apiKey =
      clientApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    // 1. If Gemini API Key is available, call Google Gemini API with system instructions
    if (apiKey && apiKey.trim() !== '' && !apiKey.includes('placeholder')) {
      try {
        const contents = messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }));

        // Try gemini-1.5-flash with fallback
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }],
              },
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return NextResponse.json({
              reply: candidateText,
              provider: 'gemini',
            });
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn('[Gemini API Warning, falling back to built-in knowledge engine]', errData);
        }
      } catch (geminiError) {
        console.warn('[Gemini API Error, falling back to built-in knowledge engine]', geminiError);
      }
    }

    // 2. High-Fidelity Built-in Process Knowledge Engine (Guarantees zero downtime, strict security, and complete step-by-step instructions)
    const reply = generateSmartProcessReply(lastUserMessage);
    return NextResponse.json({
      reply,
      provider: 'institutional-engine',
    });
  } catch (error: any) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------------
// Built-in Knowledge Base Engine: Step-by-Step Instructions & Processes
// Strictly adheres to security rules (no direct dashboard bypass links)
// ----------------------------------------------------------------------------
function generateSmartProcessReply(query: string): string {
  const q = query.toLowerCase();

  // 1. DIRECT PORTAL ACCESS / LOGIN / CREDENTIALS
  if (
    q.includes('login') ||
    q.includes('credential') ||
    q.includes('password') ||
    q.includes('email') ||
    q.includes('sign in') ||
    q.includes('access') ||
    q.includes('open') ||
    q.includes('direct access') ||
    q.includes('enter')
  ) {
    if (q.includes('admin') || q.includes('governance')) {
      return `### 🏛️ Process: How to Access the Administrator Governance Portal

📌 **Overview**: The Administrator Portal provides institution-wide oversight including risk heatmaps, student cohort lists, faculty rosters, score weight calibration, CSV bulk ingestion, and compliance audit logs. Direct URL bypass without verified clearance is strictly prohibited by security guards.

📋 **Step-by-Step Instructions**:
1. Click [Sign In](/login) in the navigation bar or top header.
2. On the authentication screen, select the **Admin** role tab.
3. Enter your authorized administrator email: \`admin@campus.edu.in\`
4. Enter your institutional password: \`Password@123\`
5. Click **"Sign In with Administrator Clearance"**. Upon verification, you will be automatically routed to the Admin Governance Dashboard.

🔒 **Authorized Administrator Account**:
- **Name**: Dr. K. Ramanathan (ADM001)
- **Email**: \`admin@campus.edu.in\`
- **Password**: \`Password@123\`

💡 **Pro Tip**: If you ever need to update your password, use the self-service **"Forgot Password?"** link on the Sign In page.`;
    }

    if (q.includes('faculty') || q.includes('teacher') || q.includes('mentor')) {
      return `### 👩‍🏫 Process: How to Access the Faculty Portal

📌 **Overview**: The Faculty Portal gives professors and mentors cohort-level visibility into Year 3 Sections A, B, and C, with early-warning indicators, student inspection drawers, intervention dispatches, MCQ exam generation, and leaderboard marks appointment.

📋 **Step-by-Step Instructions**:
1. Click [Sign In](/login) to open the authentication page.
2. Select the **Faculty** role tab.
3. Enter your registered institutional faculty email (e.g. \`ananya.sharma@campus.edu.in\`).
4. Enter your password: \`Password@123\`
5. Click **"Sign In with Faculty Credentials"**. Once verified, you will be taken directly to your Section Cohort Dashboard.

🔒 **Verified Faculty Credentials**:
- **Mentor**: Prof. Ananya Sharma (\`FAC210\`) — \`ananya.sharma@campus.edu.in\` | \`Password@123\`
- **Professor**: Dr. K.V. Krishna Kishore (\`CSE_001\`) — \`k.v.krishna.kishore@campus.edu.in\` | \`Password@123\`

💡 **Pro Tip**: Students cannot access the Faculty Portal. The system strictly validates institutional role matching to maintain student privacy.`;
    }

    if (q.includes('student')) {
      return `### 🎓 Process: How to Access the Student Portal

📌 **Overview**: The Student Portal displays personal 0–100 Success Scores, 7-indicator breakdowns, "How to Improve" sensitivity recommendations, upcoming exams, competition standings, and external coding profile handles.

📋 **Step-by-Step Instructions**:
1. Click [Sign In](/login) to reach the institutional access portal.
2. Select the **Student** role tab.
3. Enter your registered institutional student email (e.g. \`241fa18067@campus.edu.in\`).
4. Enter your password: \`Password@123\`
5. Click **"Sign In to CampusPulse"**. The system validates your session and opens your personal student dossier.

🔒 **Verified Student Accounts**:
- **MD SAHIL (Section A)**: \`241fa18067@campus.edu.in\` | \`Password@123\` (Roll No: \`241FA18067\`)
- **SAGAR (Section B • At-Risk Demo)**: \`241fa04070@campus.edu.in\` | \`Password@123\` (Roll No: \`241FA04070\`)

💡 **Pro Tip**: You can customize your password at any time using the "Forgot Password?" option on the Sign In page.`;
    }

    return `### 🔑 Process: Official Portal Authentication & Login Directory

📌 **Overview**: CampusPulse strictly enforces whitelist-only role-based access control. All protected dashboards require authenticated institutional clearance.

📋 **Step-by-Step Login Instructions**:
1. Go to the official [Sign In](/login) portal.
2. Click the tab corresponding to your role: **Student**, **Faculty**, or **Admin**.
3. Input your registered \`@campus.edu.in\` institutional email address.
4. Input your password (\`Password@123\` or your custom-chosen password).
5. Click the sign-in button. The security layer will verify your credentials and launch your personalized workspace.

📋 **Directory of Authorized Credentials**:
| Role | Full Name & Identifier | Institutional Email | Default Password |
|---|---|---|---|
| **Student** | MD SAHIL (\`241FA18067\`) | \`241fa18067@campus.edu.in\` | \`Password@123\` |
| **Student (At-Risk)** | SAGAR (\`241FA04070\`) | \`241fa04070@campus.edu.in\` | \`Password@123\` |
| **Faculty (Mentor)** | Prof. Ananya Sharma (\`FAC210\`) | \`ananya.sharma@campus.edu.in\` | \`Password@123\` |
| **Faculty (Alternate)** | Dr. K.V. Krishna Kishore (\`CSE_001\`) | \`k.v.krishna.kishore@campus.edu.in\` | \`Password@123\` |
| **Administrator** | Dr. K. Ramanathan (\`ADM001\`) | \`admin@campus.edu.in\` | \`Password@123\` |

👉 [Proceed to Sign In](/login)`;
  }

  // 2. PASSWORD RESET / FORGOT PASSWORD
  if (q.includes('forgot') || q.includes('reset') || q.includes('change password')) {
    return `### 🔐 Process: How to Reset or Customize Your Password

📌 **Overview**: CampusPulse provides a self-service password reset flow allowing students, faculty, and administrators to set their own custom password with immediate local verification.

📋 **Step-by-Step Instructions**:
1. Navigate to the [Sign In](/login) page or open the landing page Sign In modal.
2. Click the **"Forgot Password?"** link located underneath the password field.
3. Enter your registered institutional email address (\`@campus.edu.in\`).
4. Type your desired **New Password** (must contain at least 6 characters).
5. Type your password again in the **Confirm New Password** field to verify accuracy.
6. Click **"Save New Password"**.
7. The system activates your new password immediately. Click **"Sign In with New Password"** to enter your workspace.

🔒 **Security Policy**:
- Only registered institutional accounts in the directory can reset passwords; unregistered external emails will trigger an immediate security alert.`;
  }

  // 3. STUDENT SUCCESS SCORE & IMPROVEMENT
  if (q.includes('score') || q.includes('improve') || q.includes('gauge') || q.includes('formula') || q.includes('calculate')) {
    return `### 📊 Process: How Student Success Scores are Calculated & Improved

📌 **Overview**: The Student Success Score is an explainable composite index (0 to 100) combining 7 normalized student dimensions into a single decision intelligence metric.

📋 **The 7 Core Indicators & Weights**:
1. **Academic (30% weight)**: CGPA (50%) + Avg CIE marks (35%) - Backlog penalty (15%).
2. **Attendance (20% weight)**: Biometric RFID attendance (mandatory 75% threshold; scores decrease steeply below cutoff).
3. **LMS Activity (10% weight)**: 30-day login regularity and assignment submission completion rate.
4. **Campus Engagement (10% weight)**: Participation in clubs, hackathons, and certifications.
5. **Placement Readiness (15% weight)**: Aptitude benchmark, technical coding, and mock interview ratings.
6. **Holistic Skills (10% weight)**: Communication, programming, and leadership metrics.
7. **Feedback (5% weight)**: Academic survey feedback and mentor ratings.

📋 **Step-by-Step: How Students Improve Their Score**:
1. Sign in via [Sign In](/login) with student credentials to view your personal gauge.
2. Locate the **"How to Improve" Action Plan** section on your dashboard.
3. Review high-ROI sensitivity recommendations (e.g. *"Attend 12 consecutive lectures to cross 75% attendance cutoff (+2.4 pts)"* or *"Complete 2 pending lab assignments (+1.8 pts)"*).
4. Take faculty-published MCQ assessments when active to boost your CIE average.`;
  }

  // 4. STUDENT PROFILE EDITING
  if (q.includes('edit') && (q.includes('profile') || q.includes('link') || q.includes('github') || q.includes('leetcode'))) {
    return `### ✏️ Process: How Students Edit Profile Information & Coding Handles

📌 **Overview**: Students can customize their display name and connect external verified technical profiles (LeetCode, GitHub, LinkedIn, CodeChef). Certified academic metrics remain tamper-proof.

📋 **Step-by-Step Instructions**:
1. Go to [Sign In](/login) and log in with student credentials.
2. In the top profile card of the Student Portal, click **"Edit Profile & Links"**.
3. Update your **Full Name** or external handles:
   - **LeetCode Username**: Connects problem-solving statistics.
   - **GitHub Profile**: Highlights repository activity.
   - **LinkedIn URL**: Links professional networking.
   - **CodeChef Handle**: Connects contest rating.
4. Click **"Save Profile Changes"**.

🔒 **Certified Immutability Policy**:
- CGPA, CIE examination marks, and attendance percentages are certified institutional telemetry and cannot be edited by students.`;
  }

  // 5. STUDENT EXAM TAKING
  if (q.includes('take exam') || (q.includes('student') && q.includes('exam'))) {
    return `### 📝 Process: How Students Take Timed MCQ Examinations

📌 **Overview**: Students can participate in online MCQ examinations published by faculty members. Tests include live timers, question palettes, and automatic score calculation.

📋 **Step-by-Step Instructions**:
1. Sign in via [Sign In](/login) with your student credentials.
2. In the Student Portal, scroll down to **"Upcoming Examinations & Competitions"**.
3. Find your scheduled examination (e.g., *CIE-2: Data Structures & Algorithms*).
4. Verify the exam status:
   - **LIVE / Active**: The test is open; click **"Take Exam"**.
   - **Scheduled / Stopped**: The exam is not currently in session; contact your course faculty.
5. In the assessment room, navigate through questions using the question palette.
6. Review your answers and click **"Submit Assessment"** before the countdown timer expires.`;
  }

  // 6. FACULTY COHORT MONITORING & INTERVENTIONS
  if (q.includes('needs attention') || q.includes('cohort') || q.includes('intervention') || (q.includes('faculty') && q.includes('monitor'))) {
    return `### 👩‍🏫 Process: How Faculty Monitor Cohorts & Assign Interventions

📌 **Overview**: Faculty members monitor Section A, B, and C students with early-warning risk scores and can dispatch structured academic interventions before semester finals.

📋 **Step-by-Step Instructions**:
1. Sign in via [Sign In](/login) using your faculty credentials.
2. In the Faculty Dashboard header, select **Section A**, **Section B**, or **Section C**.
3. Check the KPI row: Cohort Average Score, Total At-Risk Count, and Turnout.
4. In the **"Needs Attention" Priority Table**, sort by Risk Level or filter students below 75% attendance.
5. Click on any student row to open the **Slide-Out Inspection Drawer**:
   - Inspect the 7-dimension spider radar chart.
   - Review the "Why This Score" waterfall explainability diagram.
   - Check month-by-month attendance and CIE mark progression trends.
6. Scroll down to **"Assign Academic Intervention"**:
   - Select an intervention type (*Remedial Class*, *Attendance Warning*, or *Counselor Meeting*).
   - Enter guidance notes and target dates.
   - Click **"Dispatch Intervention"** to log the record.`;
  }

  // 7. FACULTY EXAMS (CREATE, START/STOP, APPOINT MARKS)
  if (q.includes('exam generator') || q.includes('appoint') || q.includes('start exam') || q.includes('stop exam') || (q.includes('faculty') && q.includes('exam'))) {
    return `### 🎓 Process: How Faculty Create, Control, & Grade Exams

📌 **Overview**: Faculty have full lifecycle control over online assessments, from question generation to real-time session controls and leaderboard mark appointment.

📋 **Step-by-Step Instructions**:
1. Sign in via [Sign In](/login) using faculty credentials.
2. **Creating an Exam**:
   - Open the **Exam Generator** tab.
   - Select the target subject and section.
   - Build questions manually (with question prompt, 4 options, correct answer, and explanation) or upload questions in bulk via CSV.
   - Click **"Publish Assessment"**.
3. **Controlling the Exam Lifecycle**:
   - Open the **Exam Results** tab.
   - Click **"Start Exam"**: Sets the exam status to LIVE, allowing students to access and submit answers.
   - Click **"Stop Exam"**: Concludes the test session and freezes submissions.
4. **Appointing Marks & Recalculating Standings**:
   - In the Exam Results leaderboard, review student submissions.
   - Click **"Appoint Marks"** on any student row.
   - Enter adjusted marks and confirm. The platform immediately updates the student's CIE marks, class rank, and overall Success Score.`;
  }

  // 8. ADMIN CSV IMPORT & COMMIT PROCESS
  if (q.includes('csv') || q.includes('import') || q.includes('commit') || q.includes('ingest')) {
    return `### 📥 Process: How Administrators Validate & Commit CSV Student Telemetry

📌 **Overview**: Administrators can ingest batch student records into the institutional database with automated row-level constraint audits, anomaly reports, and real-time cohort synchronization.

📋 **Step-by-Step Instructions**:
1. Sign in via [Sign In](/login) with administrator credentials.
2. In the Admin sidebar, click **"CSV Importer"**.
3. Upload a \`.csv\` file using **"Upload & Validate CSV"**, or paste CSV rows into the text tray, or click **"Load Sample Test Data"**.
4. The Pre-Ingestion Validator immediately audits all rows across constraints:
   - Evaluates: Total Rows, Valid Rows (OK), and Rejected Rows (Failed).
   - Anomaly Report flags row violations (e.g., CGPA > 10.0, Attendance > 100%, Duplicate Reg No, Negative Backlogs).
5. Scroll to **"Valid Telemetry Records Ready to Commit"** to inspect clean records.
6. Click **"Commit Valid Profiles"**:
   - The engine commits verified records directly into the master cohort.
   - Generates registered institutional accounts (\`@campus.edu.in\`).
   - Logs an official entry in the compliance audit ledger.
   - Updates the button to **"✓ Committed & Added to Students List"**.
7. Scroll down to the **Institutional Students List** section to view the newly committed student profiles marked with green **"✓ Newly Ingested"** badges.`;
  }

  // 9. ADMIN STUDENTS LIST & FACULTY DIRECTORY
  if (q.includes('students list') || q.includes('student roster') || q.includes('directory')) {
    return `### 👥 Process: How Administrators Inspect the Students List & Faculty Directory

📌 **Overview**: Administrators have full directory inspection tools to search, filter, and audit verified students and faculty members.

📋 **Step-by-Step Instructions**:
1. Sign in via [Sign In](/login) with administrator clearance.
2. **Viewing the Students List**:
   - Click **"Students List"** in the sidebar.
   - Filter by section (Section A, B, C) or by risk levels (Critical, High, Medium, Low).
   - Use the real-time search bar to search any student by name or registration number.
3. **Viewing the Faculty Directory**:
   - Click **"Faculty Directory"** in the sidebar.
   - Browse 123 verified Vignan CSE faculty profiles.
   - Filter by designation (Professor, Associate Professor, Assistant Professor) or research interest tags.
   - Click on any faculty card to view cabin hours, courses taught, and official profile links.
4. **Dossier Lookup**:
   - Click **"Profile Lookup"** to inspect a full dossier by entering any Student Roll Number (e.g. \`241FA18067\`) or Faculty ID (\`FAC210\`).`;
  }

  // 10. ADMIN SCORE WEIGHT TUNER
  if (q.includes('weight') || q.includes('tune') || q.includes('calibrate')) {
    return `### ⚖️ Process: How Administrators Tune Global Score Weights

📌 **Overview**: Administrators can calibrate the global percentage weights assigned to the 7 success score dimensions. A live simulation calculates campus-wide impact across the cohort.

📋 **Step-by-Step Instructions**:
1. Sign in via [Sign In](/login) with administrator credentials.
2. In the Admin sidebar, click **"Score Weight Tuning"**.
3. Adjust the percentage sliders across the 7 dimensions:
   - Academic Weight (default: 30%)
   - Attendance Weight (default: 20%)
   - LMS Activity Weight (default: 10%)
   - Engagement Weight (default: 10%)
   - Placement Weight (default: 15%)
   - Holistic Skills Weight (default: 10%)
   - Feedback Weight (default: 5%)
4. Ensure the total sum equals **100%**.
5. Click **"Save & Recompute Campus Scores"** to apply weights campus-wide.
6. The audit ledger logs the recalibration for compliance verification.`;
  }

  // 11. PLACEMENT INTELLIGENCE
  if (q.includes('placement') || q.includes('recruit') || q.includes('package') || q.includes('company') || q.includes('blinkit')) {
    return `### 🏢 Process: How to Explore Campus Placement Trends & Recruiter Benchmarks

📌 **Overview**: The public landing page features an 8-year historical placement analytics dashboard (2019–2026) showcasing conversion trends and corporate recruiter benchmarks.

📋 **Step-by-Step Instructions**:
1. Navigate to the [Placement Intelligence](/#placements) section on the landing page.
2. **Filter by Academic Year**: Click year pills (\`2026\`, \`2025\`, \`2024\`, or \`All Years\`) to observe conversion curves.
3. **Filter by Recruiter**: Click any corporate partner card to inspect their dedicated hiring trend:
   - **Blinkit**: Quick-commerce hiring partner (packages up to 20 LPA).
   - **Amazon**: Cloud and SDE roles (packages up to 38 LPA).
   - **TCS, Cognizant, Infosys, HCL, Capgemini**: Mass and enterprise recruiters.
4. Hover over chart bars to view tactile tooltips showing Placed Offers, Unplaced Runway, and Average LPA.`;
  }

  // 12. ANNOUNCEMENTS
  if (q.includes('announcement') || q.includes('circular') || q.includes('fest') || q.includes('notice')) {
    return `### 📢 Process: How to Browse Official Campus Announcements

📌 **Overview**: The announcements bulletin broadcasts verified academic circulars, exam notices, and event updates from the dean's office.

📋 **Step-by-Step Instructions**:
1. Scroll to the [Announcements Section](/#announcements) on the landing page.
2. Use the **Category Filter Chips** to isolate notices:
   - **Exams**: Mid-term timetables and hall ticket guidelines.
   - **Extra Classes**: Special remedial sessions.
   - **Time Change & Reschedule**: Classroom and laboratory timing adjustments.
   - **Fests & Tech**: Technical symposia and hackathon registrations.
   - **Sports**: Annual tournament fixtures.
3. Use the **Search Circulars** box to find notices by keyword.`;
  }

  // DEFAULT / GENERAL ASSISTANCE
  return `### 👋 Welcome to PulseBot — CampusPulse Process Guide!

I provide step-by-step instructions for every process and feature across the CampusPulse platform.

📋 **Common Processes You Can Ask Me About**:
1. **How to Access Portals**: Step-by-step sign-in process and verified credentials.
2. **Password Reset Process**: How to set a custom password via self-service reset.
3. **Student Success Score Tracking**: How scores (0–100) are calculated and improved.
4. **Student Exam Workflow**: How students take timed assessments when live.
5. **Faculty Cohort Monitoring**: How professors track Sections A, B, and C and assign interventions.
6. **Faculty Exam Operations**: How to build MCQs, start/stop test sessions, and appoint marks.
7. **Admin CSV Ingestion**: How administrators validate and commit telemetry into the student list.
8. **Admin Weight Tuning**: How global percentage weights are calibrated and recomputed.
9. **Placements & Announcements**: How to explore recruiter metrics and campus circulars.

🔒 **Security Reminder**: Direct URL bypass to dashboards is strictly disabled. To access your portal, follow the sign-in steps at [Sign In](/login).

What process or feature would you like me to explain?`;
}
