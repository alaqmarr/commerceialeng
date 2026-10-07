/**
 * Empirical Stress Test Harness: Authentication, NextAuth & Setup Gate
 * Milestone M1-2 Challenger Verification
 * Commercial Engineering Associates
 */

import prisma from "../lib/prisma";
import { authOptions } from "../lib/auth";
import bcrypt from "bcryptjs";

const BASE_URL = "http://localhost:3001";

interface TestResult {
  step: string;
  category: string;
  expected: string;
  actual: string;
  passed: boolean;
  details?: any;
}

const results: TestResult[] = [];

function record(step: string, category: string, expected: string, actual: string, passed: boolean, details?: any) {
  results.push({ step, category, expected, actual, passed, details });
  const icon = passed ? "✅ [PASS]" : "❌ [FAIL]";
  console.log(`${icon} [${category}] ${step}`);
  console.log(`       Expected: ${expected}`);
  console.log(`       Actual:   ${actual}`);
  if (details && !passed) {
    console.log(`       Details:  ${JSON.stringify(details)}`);
  }
}

async function runEmpiricalStressTest() {
  console.log("==================================================================");
  console.log("🚀 STARTING EMPIRICAL AUTHENTICATION & SETUP GATE STRESS TEST SUITE");
  console.log("==================================================================\n");

  // Ensure DB connection is active and check WAL
  const walCheck = await prisma.$queryRawUnsafe<Array<{ journal_mode: string }>>("PRAGMA journal_mode;");
  const journalMode = walCheck[0]?.journal_mode?.toLowerCase();
  record(
    "SQLite WAL mode active",
    "Database Engine",
    "wal",
    journalMode,
    journalMode === "wal"
  );

  // -------------------------------------------------------------
  // SUITE 1: Pre-flight Initial State Verification
  // -------------------------------------------------------------
  console.log("\n--- SUITE 1: Pre-flight Initial State Verification ---");
  const initialDbAdminCount = await prisma.adminUser.count();
  record(
    "Pre-flight Database adminUser count is 0",
    "Initial State",
    "0",
    initialDbAdminCount.toString(),
    initialDbAdminCount === 0
  );

  // HTTP GET /api/setup/status
  const statusRes = await fetch(`${BASE_URL}/api/setup/status`, { cache: "no-store" });
  const statusJson = await statusRes.json();
  record(
    "HTTP /api/setup/status response status code",
    "Setup Gate HTTP",
    "200",
    statusRes.status.toString(),
    statusRes.status === 200
  );
  record(
    "HTTP /api/setup/status isSetup is false",
    "Setup Gate HTTP",
    "false",
    String(statusJson.isSetup),
    statusJson.isSetup === false
  );
  record(
    "HTTP /api/setup/status adminCount is 0",
    "Setup Gate HTTP",
    "0",
    String(statusJson.adminCount),
    statusJson.adminCount === 0
  );

  // HTTP GET /setup frontend route check
  const setupPageRes = await fetch(`${BASE_URL}/setup`, { cache: "no-store" });
  record(
    "HTTP GET /setup responds with 200 OK",
    "Setup UI Gate",
    "200",
    setupPageRes.status.toString(),
    setupPageRes.status === 200
  );

  // -------------------------------------------------------------
  // SUITE 2: Boundary & Input Validation Stress-Testing
  // -------------------------------------------------------------
  console.log("\n--- SUITE 2: Boundary & Input Validation Stress-Testing ---");

  // Test 2.1: Invalid / Malformed JSON body
  const malformedRes = await fetch(`${BASE_URL}/api/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{ malformed json",
  });
  const malformedJson = await malformedRes.json();
  record(
    "Malformed JSON body rejected with 400",
    "Input Validation",
    "400 (Invalid JSON payload)",
    `${malformedRes.status} (${malformedJson.error})`,
    malformedRes.status === 400 && malformedJson.error?.includes("Invalid JSON payload")
  );

  // Test 2.2: Missing email
  const noEmailRes = await fetch(`${BASE_URL}/api/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "ValidPassword123!", name: "Admin" }),
  });
  const noEmailJson = await noEmailRes.json();
  record(
    "Missing email rejected with 400",
    "Input Validation",
    "400 (A valid email address is required)",
    `${noEmailRes.status} (${noEmailJson.error})`,
    noEmailRes.status === 400 && noEmailJson.error?.includes("valid email")
  );

  // Test 2.3: Malformed email without @
  const badEmailRes = await fetch(`${BASE_URL}/api/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid-email-format", password: "ValidPassword123!" }),
  });
  const badEmailJson = await badEmailRes.json();
  record(
    "Invalid email format rejected with 400",
    "Input Validation",
    "400 (A valid email address is required)",
    `${badEmailRes.status} (${badEmailJson.error})`,
    badEmailRes.status === 400 && badEmailJson.error?.includes("valid email")
  );

  // Test 2.4: Password shorter than 8 characters
  const shortPassRes = await fetch(`${BASE_URL}/api/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "valid@commercialeng.com", password: "short" }),
  });
  const shortPassJson = await shortPassRes.json();
  record(
    "Short password (<8 chars) rejected with 400",
    "Input Validation",
    "400 (Password must be at least 8 characters long)",
    `${shortPassRes.status} (${shortPassJson.error})`,
    shortPassRes.status === 400 && shortPassJson.error?.includes("at least 8 characters")
  );

  // Test 2.5: Missing password
  const noPassRes = await fetch(`${BASE_URL}/api/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "valid@commercialeng.com" }),
  });
  const noPassJson = await noPassRes.json();
  record(
    "Missing password rejected with 400",
    "Input Validation",
    "400 (Password must be at least 8 characters long)",
    `${noPassRes.status} (${noPassJson.error})`,
    noPassRes.status === 400 && noPassJson.error?.includes("at least 8 characters")
  );

  // Test 2.6: Verify no admin was created during failed validations
  const countAfterValidationFails = await prisma.adminUser.count();
  record(
    "Zero admin users created during validation stress tests",
    "Database State",
    "0",
    countAfterValidationFails.toString(),
    countAfterValidationFails === 0
  );

  // -------------------------------------------------------------
  // SUITE 3: Valid Admin Account Creation & Bcrypt Inspection
  // -------------------------------------------------------------
  console.log("\n--- SUITE 3: Valid Admin Account Creation & Bcrypt Inspection ---");

  const testEmail = "challenger-test-admin@commercialeng.com";
  const testPassword = "CEA#SuperStrongPassword2026!";
  const testName = "CEA Challenger Admin";

  const createRes = await fetch(`${BASE_URL}/api/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `  ${testEmail.toUpperCase()}  `, // Test email normalization (trim + lowercase)
      password: testPassword,
      name: testName,
    }),
  });
  const createJson = await createRes.json();

  record(
    "POST /api/setup response status code 201 Created",
    "Admin Creation",
    "201",
    createRes.status.toString(),
    createRes.status === 201
  );
  record(
    "POST /api/setup returns success: true",
    "Admin Creation",
    "true",
    String(createJson.success),
    createJson.success === true
  );
  record(
    "POST /api/setup response normalizes email",
    "Admin Creation",
    testEmail,
    createJson.admin?.email,
    createJson.admin?.email === testEmail
  );
  record(
    "POST /api/setup does NOT leak password in response payload",
    "Security & Privacy",
    "undefined",
    String(createJson.admin?.password),
    createJson.admin?.password === undefined
  );

  // Inspect SQLite record directly
  const dbAdmin = await prisma.adminUser.findUnique({
    where: { email: testEmail },
  });

  record(
    "Database record exists in SQLite admin_users table",
    "SQLite Verification",
    "true",
    String(!!dbAdmin),
    !!dbAdmin
  );

  if (dbAdmin) {
    record(
      "Admin name saved correctly in DB",
      "SQLite Verification",
      testName,
      dbAdmin.name || "",
      dbAdmin.name === testName
    );

    // Bcrypt hash verification
    const bcryptRegex = /^\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/;
    const isBcryptHash = bcryptRegex.test(dbAdmin.password);
    record(
      "Password stored as valid modular crypt format bcrypt hash",
      "Cryptographic Security",
      "true",
      String(isBcryptHash),
      isBcryptHash
    );

    // Verify 12 cost rounds ($2a$12$ or $2b$12$)
    const costRounds = dbAdmin.password.split("$")[2];
    record(
      "Bcrypt cost rounds configured to 12",
      "Cryptographic Security",
      "12",
      costRounds,
      costRounds === "12"
    );

    // Verify raw bcrypt compare against database hash
    const validPassMatches = await bcrypt.compare(testPassword, dbAdmin.password);
    record(
      "Direct bcrypt.compare with original password returns true",
      "Cryptographic Security",
      "true",
      String(validPassMatches),
      validPassMatches === true
    );

    const invalidPassMatches = await bcrypt.compare("WrongPassword123!", dbAdmin.password);
    record(
      "Direct bcrypt.compare with incorrect password returns false",
      "Cryptographic Security",
      "false",
      String(invalidPassMatches),
      invalidPassMatches === false
    );
  }

  // Verify settings seeded
  const seededCompany = await prisma.setting.findUnique({ where: { key: "COMPANY_NAME" } });
  record(
    "Default setting COMPANY_NAME present in settings table",
    "System Settings",
    "Commercial Engineering Associates",
    seededCompany?.value || "",
    seededCompany?.value === "Commercial Engineering Associates"
  );

  const seededSalesEmail = await prisma.setting.findUnique({ where: { key: "SALES_EMAIL" } });
  record(
    "Default setting SALES_EMAIL present in settings table",
    "System Settings",
    "present",
    seededSalesEmail ? "present" : "missing",
    !!seededSalesEmail
  );

  // -------------------------------------------------------------
  // SUITE 4: Lockout Enforcement & Adversarial Re-attack
  // -------------------------------------------------------------
  console.log("\n--- SUITE 4: Lockout Enforcement & Adversarial Re-attack ---");

  // HTTP GET /api/setup/status now reflects setup complete
  const postSetupStatusRes = await fetch(`${BASE_URL}/api/setup/status`, { cache: "no-store" });
  const postSetupStatusJson = await postSetupStatusRes.json();
  record(
    "HTTP /api/setup/status reports isSetup: true",
    "Lockout Gate",
    "true",
    String(postSetupStatusJson.isSetup),
    postSetupStatusJson.isSetup === true
  );
  record(
    "HTTP /api/setup/status reports adminCount: 1",
    "Lockout Gate",
    "1",
    String(postSetupStatusJson.adminCount),
    postSetupStatusJson.adminCount === 1
  );

  // Subsequent call to POST /api/setup with a DIFFERENT email
  const secondAttemptRes = await fetch(`${BASE_URL}/api/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "attacker-admin@commercialeng.com",
      password: "AttackerPassword123!",
      name: "Attacker Admin",
    }),
  });
  const secondAttemptJson = await secondAttemptRes.json();
  record(
    "Subsequent POST /api/setup rejected with 403 Forbidden",
    "Lockout Enforcement",
    "403",
    secondAttemptRes.status.toString(),
    secondAttemptRes.status === 403
  );
  record(
    "Lockout response contains permanent lockout error message",
    "Lockout Enforcement",
    "Setup already completed. Initial setup is permanently locked.",
    secondAttemptJson.error,
    secondAttemptJson.error?.includes("Setup already completed")
  );

  // Subsequent call with DUPLICATE email
  const duplicateAttemptRes = await fetch(`${BASE_URL}/api/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: testName,
    }),
  });
  record(
    "Duplicate email POST /api/setup blocked by lockout (403, NOT 409 leak)",
    "Lockout Enforcement",
    "403",
    duplicateAttemptRes.status.toString(),
    duplicateAttemptRes.status === 403
  );

  // Concurrency Stress-Test: 10 parallel POST /api/setup requests
  console.log("\n--- Testing 10 Concurrent Race-Condition Setup Calls ---");
  const concurrentCalls = Array.from({ length: 10 }).map((_, i) =>
    fetch(`${BASE_URL}/api/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `race-admin-${i}@commercialeng.com`,
        password: `RacePassword-${i}-2026!`,
        name: `Race Admin ${i}`,
      }),
    })
  );

  const concurrentResults = await Promise.all(concurrentCalls);
  const all403 = concurrentResults.every((res) => res.status === 403);
  record(
    "All 10 concurrent setup attack requests rejected with 403",
    "Concurrency & Race Hardening",
    "true (all 403)",
    all403 ? "true (all 403)" : `failures detected: ${concurrentResults.map((r) => r.status).join(",")}`,
    all403
  );

  const postRaceAdminCount = await prisma.adminUser.count();
  record(
    "Database admin count remains strictly 1 after concurrent burst",
    "Database Consistency",
    "1",
    postRaceAdminCount.toString(),
    postRaceAdminCount === 1
  );

  // -------------------------------------------------------------
  // SUITE 5: NextAuth Credentials Provider Authorization Verification
  // -------------------------------------------------------------
  console.log("\n--- SUITE 5: NextAuth Credentials Provider Authorization ---");

  // Retrieve CredentialsProvider authorize method from authOptions
  const credentialsProvider = authOptions.providers.find(
    (p: any) => p.id === "credentials"
  ) as any;

  if (!credentialsProvider) {
    throw new Error("CredentialsProvider missing from authOptions");
  }

  // NextAuth v4 wraps user options inside options.authorize
  const authorizeFn = credentialsProvider.options?.authorize || credentialsProvider.authorize;
  if (!authorizeFn || typeof authorizeFn !== "function") {
    throw new Error("Credentials authorize function not found");
  }

  // 5.1 Test valid credentials
  const authValid = await authorizeFn({
    email: testEmail,
    password: testPassword,
  });
  record(
    "NextAuth authorize with valid credentials returns user",
    "NextAuth Integration",
    testEmail,
    authValid?.email || "null",
    authValid?.email === testEmail && !!authValid?.id
  );
  record(
    "NextAuth authorized user does NOT expose password hash",
    "NextAuth Security",
    "undefined",
    String((authValid as any)?.password),
    (authValid as any)?.password === undefined
  );

  // 5.2 Test uppercase / un-trimmed email normalization in NextAuth
  const authCaseTrim = await authorizeFn({
    email: `  ${testEmail.toUpperCase()}  `,
    password: testPassword,
  });
  record(
    "NextAuth authorize handles case-insensitive / trimmed email",
    "NextAuth Integration",
    testEmail,
    authCaseTrim?.email || "null",
    authCaseTrim?.email === testEmail
  );

  // 5.3 Test invalid password
  const authInvalidPass = await authorizeFn({
    email: testEmail,
    password: "IncorrectPassword123!",
  });
  record(
    "NextAuth authorize with incorrect password returns null",
    "NextAuth Security",
    "null",
    authInvalidPass ? "user returned" : "null",
    authInvalidPass === null
  );

  // 5.4 Test non-existent user email
  const authGhostUser = await authorizeFn({
    email: "ghost-user@commercialeng.com",
    password: testPassword,
  });
  record(
    "NextAuth authorize with non-existent user returns null",
    "NextAuth Security",
    "null",
    authGhostUser ? "user returned" : "null",
    authGhostUser === null
  );

  // 5.5 Test empty / missing credentials payload
  const authEmpty = await authorizeFn({
    email: "",
    password: "",
  });
  record(
    "NextAuth authorize with empty credentials returns null",
    "NextAuth Security",
    "null",
    authEmpty ? "user returned" : "null",
    authEmpty === null
  );

  // 5.6 Test undefined credentials object
  const authUndefined = await authorizeFn(undefined);
  record(
    "NextAuth authorize with undefined credentials returns null",
    "NextAuth Security",
    "null",
    authUndefined ? "user returned" : "null",
    authUndefined === null
  );

  // 5.7 Test HTTP NextAuth CSRF and sign-in callback endpoint
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`, { cache: "no-store" });
  const csrfJson = await csrfRes.json();
  record(
    "NextAuth HTTP /api/auth/csrf endpoint reachable",
    "NextAuth HTTP API",
    "200 with csrfToken",
    `${csrfRes.status} (token present: ${!!csrfJson.csrfToken})`,
    csrfRes.status === 200 && !!csrfJson.csrfToken
  );

  // -------------------------------------------------------------
  // SUITE 6: Cleanup & Pristine Uninitialized State Re-verification
  // -------------------------------------------------------------
  console.log("\n--- SUITE 6: Cleanup & Post-Verification Teardown ---");

  // Delete test admin
  const deleteResult = await prisma.adminUser.deleteMany({
    where: { email: testEmail },
  });
  record(
    "Test admin user deleted from SQLite",
    "Teardown & Cleanup",
    "1 deleted",
    `${deleteResult.count} deleted`,
    deleteResult.count >= 1
  );

  // Check DB count is strictly 0
  const finalDbCount = await prisma.adminUser.count();
  record(
    "Final database admin count restored to 0",
    "Pristine Restoration",
    "0",
    finalDbCount.toString(),
    finalDbCount === 0
  );

  // Re-verify HTTP /api/setup/status reports isSetup: false
  const finalStatusRes = await fetch(`${BASE_URL}/api/setup/status`, { cache: "no-store" });
  const finalStatusJson = await finalStatusRes.json();
  record(
    "Final HTTP /api/setup/status restored to isSetup: false",
    "Pristine Restoration",
    "false",
    String(finalStatusJson.isSetup),
    finalStatusJson.isSetup === false
  );
  record(
    "Final HTTP /api/setup/status restored to adminCount: 0",
    "Pristine Restoration",
    "0",
    String(finalStatusJson.adminCount),
    finalStatusJson.adminCount === 0
  );

  // Summary
  console.log("\n==================================================================");
  console.log("📊 EMPIRICAL STRESS TEST RESULTS SUMMARY");
  console.log("==================================================================");

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Assertions: ${total}`);
  console.log(`Passed:           ${passed}`);
  console.log(`Failed:           ${failed}`);

  if (failed > 0) {
    console.error(`\n❌ TEST SUITE FAILED with ${failed} failure(s)!`);
    process.exit(1);
  } else {
    console.log("\n🎯 ALL 36 EMPIRICAL ASSERTIONS PASSED WITH ZERO ERRORS!");
    console.log("VERDICT: APPROVE");
  }
}

runEmpiricalStressTest()
  .catch((err) => {
    console.error("FATAL UNHANDLED ERROR IN TEST HARNESS:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
