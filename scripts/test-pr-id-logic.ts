// Test script to verify PR ID generation logic
// This tests the logic without requiring a database connection

function generateNextPrId(latestPrId: string | null): string {
  if (!latestPrId) {
    // First PR ID
    return "RW10000";
  }
  
  // Extract number from latest PR ID (e.g., "RW10005" -> 10005)
  const latestNumber = parseInt(latestPrId.replace("RW", ""), 10);
  const nextNumber = latestNumber + 1;
  
  return `RW${nextNumber}`;
}

// Test cases
console.log("Testing PR ID generation logic...\n");

const testCases = [
  { input: null, expected: "RW10000", description: "First PR ID (no existing IDs)" },
  { input: "RW10000", expected: "RW10001", description: "Second PR ID" },
  { input: "RW10001", expected: "RW10002", description: "Third PR ID" },
  { input: "RW10099", expected: "RW10100", description: "Transition to 5 digits" },
  { input: "RW10999", expected: "RW11000", description: "Transition to next thousand" },
  { input: "RW99999", expected: "RW100000", description: "Transition to 6 digits" },
];

let allPassed = true;

testCases.forEach((testCase, index) => {
  const result = generateNextPrId(testCase.input);
  const passed = result === testCase.expected;
  
  if (passed) {
    console.log(`✓ Test ${index + 1}: ${testCase.description}`);
    console.log(`  Input: ${testCase.input || "null"} → Output: ${result}`);
  } else {
    console.log(`✗ Test ${index + 1}: ${testCase.description}`);
    console.log(`  Input: ${testCase.input || "null"}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Got: ${result}`);
    allPassed = false;
  }
  console.log("");
});

if (allPassed) {
  console.log("========================================");
  console.log("✓ All tests passed!");
  console.log("========================================");
  process.exit(0);
} else {
  console.log("========================================");
  console.log("✗ Some tests failed!");
  console.log("========================================");
  process.exit(1);
}

