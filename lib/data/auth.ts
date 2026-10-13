// ============================================================================
// CAMPUSPULSE: SMART CAMPUS ANALYTICS
// Data Access Layer: Strict Authentication & Security Access Control
// ============================================================================

import { AuthUser, UserRole } from './types';
import { MOCK_AUTH_USERS } from './mock-store';
import { getSupabaseClient, isSupabaseConfigured } from './supabase-client';

const AUTH_STORAGE_KEY = 'campuspulse_active_user';
const CUSTOM_PASSWORDS_KEY = 'campuspulse_custom_passwords';
const FAILED_ATTEMPTS_KEY = 'campuspulse_failed_attempts';
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

// Standard default institutional password
export const DEFAULT_INSTITUTIONAL_PASSWORD = 'Password@123';

// Strictly Authorized Institutional Accounts
export const AUTHORIZED_CREDENTIALS: Record<
  string,
  {
    role: UserRole;
    user: AuthUser;
  }
> = {
  // 1. Student: MD SAHIL (241FA18067)
  '241fa18067@campus.edu.in': {
    role: 'student',
    user: MOCK_AUTH_USERS.student_sahil,
  },
  // 2. Student (At-Risk): SAGAR (241FA04070)
  '241fa04070@campus.edu.in': {
    role: 'student',
    user: MOCK_AUTH_USERS.student_sagar,
  },
  // 3. Faculty (Mentor): Prof. Ananya Sharma (FAC210)
  'ananya.sharma@campus.edu.in': {
    role: 'faculty',
    user: {
      id: 'f0000000-0000-0000-0000-000000000002',
      email: 'ananya.sharma@campus.edu.in',
      full_name: 'Prof. Ananya Sharma',
      role: 'faculty',
      reg_no: 'FAC210',
      section: 'Section A (CSE Year 3)',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  },
  // 4. Faculty (Alternate): Dr. K.V. Krishna Kishore (CSE_001)
  'k.v.krishna.kishore@campus.edu.in': {
    role: 'faculty',
    user: {
      id: 'f0000000-0000-0000-0000-000000000001',
      email: 'k.v.krishna.kishore@campus.edu.in',
      full_name: 'Dr. K.V. Krishna Kishore',
      role: 'faculty',
      reg_no: 'CSE_001',
      section: 'Department of CSE',
      avatar_url: 'https://vignan.ac.in/Facultyprofiles/uploads/163/profilepic163.png',
    },
  },
  // 5. Admin: Dr. K. Ramanathan (ADM001)
  'admin@campus.edu.in': {
    role: 'admin',
    user: MOCK_AUTH_USERS.admin,
  },
};

// Brute-force & rate-limiting protection helper
function checkBruteForceLockout(normEmail: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    const attemptsMap: Record<string, { count: number; lockedUntil?: number }> = raw ? JSON.parse(raw) : {};
    const record = attemptsMap[normEmail];
    if (record && record.lockedUntil && Date.now() < record.lockedUntil) {
      const remainingSec = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      throw new Error(`Security Lockout: Too many failed login attempts. Access is locked for ${remainingSec}s to prevent unauthorized intrusion.`);
    }
  } catch (e: any) {
    if (e.message?.startsWith('Security Lockout:')) throw e;
  }
}

function recordFailedAttempt(normEmail: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    const attemptsMap: Record<string, { count: number; lockedUntil?: number }> = raw ? JSON.parse(raw) : {};
    const prev = attemptsMap[normEmail] || { count: 0 };
    const newCount = prev.count + 1;
    if (newCount >= LOCKOUT_THRESHOLD) {
      attemptsMap[normEmail] = {
        count: newCount,
        lockedUntil: Date.now() + LOCKOUT_DURATION_MS,
      };
    } else {
      attemptsMap[normEmail] = { count: newCount };
    }
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attemptsMap));
  } catch {}
}

function clearFailedAttempts(normEmail: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    if (!raw) return;
    const attemptsMap = JSON.parse(raw);
    delete attemptsMap[normEmail];
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attemptsMap));
  } catch {}
}

export async function loginUser(
  email: string,
  password?: string,
  role?: UserRole
): Promise<AuthUser> {
  const normEmail = email.toLowerCase().trim();

  if (!normEmail || !normEmail.includes('@')) {
    throw new Error('Please provide a valid institutional email address.');
  }

  if (!password || password.trim().length === 0) {
    throw new Error('Password is required. Please enter your institutional password.');
  }

  // 1. Check Anti-Brute-Force Lockout
  checkBruteForceLockout(normEmail);

  // 2. Strict Whitelist Check: Only authorized institutional accounts can log in
  const account = AUTHORIZED_CREDENTIALS[normEmail];
  if (!account) {
    recordFailedAttempt(normEmail);
    throw new Error('Access Denied: Unregistered email address. Only authorized institutional accounts are permitted to open the portal.');
  }

  // 3. Strict Role Matching Check
  if (role && role !== account.role) {
    throw new Error(`Role Mismatch: This account is registered as ${account.role.toUpperCase()}. Please select the ${account.role} role tab.`);
  }

  // 4. Strict Password Verification
  // Check if user set a custom password via Forgot Password
  let validPassword = DEFAULT_INSTITUTIONAL_PASSWORD;
  if (typeof window !== 'undefined') {
    try {
      const customPasswords = JSON.parse(localStorage.getItem(CUSTOM_PASSWORDS_KEY) || '{}');
      if (customPasswords[normEmail]) {
        validPassword = customPasswords[normEmail];
      }
    } catch {}
  }

  if (password !== validPassword) {
    recordFailedAttempt(normEmail);
    throw new Error('Authentication Failed: Incorrect password. Access is strictly denied.');
  }

  // 5. Successful login: Clear failed attempts and save session
  clearFailedAttempts(normEmail);
  saveSessionUser(account.user);
  return account.user;
}

export function saveSessionUser(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }
}

export function getSessionUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as AuthUser;
    // Anti-Tampering: Verify that session belongs to a legitimate authorized account
    if (!user || !user.email) return null;
    const normEmail = user.email.toLowerCase().trim();
    const authorized = AUTHORIZED_CREDENTIALS[normEmail];
    if (!authorized || authorized.role !== user.role) {
      // Forged or invalidated session -> scrub immediately
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  const supabase = getSupabaseClient();
  if (supabase) {
    supabase.auth.signOut().catch(() => {});
  }
}

export async function resetUserPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const normEmail = email.toLowerCase().trim();
  if (!normEmail || !normEmail.includes('@')) {
    throw new Error('Please enter a valid institutional email address.');
  }

  // Security Verification: Only registered accounts can reset password
  const account = AUTHORIZED_CREDENTIALS[normEmail];
  if (!account) {
    throw new Error('Security Alert: Cannot reset password for unregistered email address. Only authorized institutional accounts are permitted.');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('Security Policy: New password must contain at least 6 characters.');
  }

  // Persist custom password choice
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem(CUSTOM_PASSWORDS_KEY) || '{}');
      existing[normEmail] = newPassword;
      localStorage.setItem(CUSTOM_PASSWORDS_KEY, JSON.stringify(existing));
      clearFailedAttempts(normEmail);
    } catch (e) {
      console.warn('[Auth DAL] Could not persist custom password:', e);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.updateUser({ password: newPassword });
    } catch {}
  }

  return {
    success: true,
    message: 'Password successfully changed! You can now sign in with your chosen password.',
  };
}
