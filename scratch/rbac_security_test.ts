
import { normalizeRole } from "../src/lib/rbac";

const testCases = [
  { role: 'ADMINISTRATOR', expected: 'ADMIN', label: 'Valid legacy role' },
  { role: 'clinic admin', expected: 'ADMIN', label: 'Lowercase legacy role' },
  { role: 'OWNER', expected: 'OWNER', label: 'Valid system role' },
  { role: 'owner', expected: 'OWNER', label: 'Lowercase system role' },
  { role: 'CEO', expected: null, label: 'Unknown high-privilege role (FAIL-CLOSED)' },
  { role: 'Manager', expected: null, label: 'Unknown role (FAIL-CLOSED)' },
  { role: 'Test', expected: null, label: 'Malformed role (FAIL-CLOSED)' },
  { role: '', expected: null, label: 'Empty role (FAIL-CLOSED)' },
  { role: null, expected: null, label: 'Null role (FAIL-CLOSED)' },
  { role: undefined, expected: null, label: 'Undefined role (FAIL-CLOSED)' },
  { role: 'RECEPTIONIST', expected: 'RECEPTIONIST', label: 'Valid low-privilege role' },
];

console.log("=== RBAC FAIL-CLOSED SECURITY TEST ===");

let passed = 0;
testCases.forEach(({ role, expected, label }) => {
  const result = normalizeRole(role as any);
  const status = result === expected ? "✅ PASS" : "❌ FAIL";
  if (result === expected) passed++;
  console.log(`${status} | ${label.padEnd(40)} | Input: ${String(role).padEnd(15)} | Output: ${result}`);
});

console.log(`\nResults: ${passed}/${testCases.length} tests passed.`);

if (passed === testCases.length) {
  console.log("\nSECURITY VERIFIED: RBAC system correctly enforces Fail-Closed model.");
} else {
  console.error("\nSECURITY VULNERABILITY: RBAC system returned unexpected role fallbacks.");
  process.exit(1);
}
