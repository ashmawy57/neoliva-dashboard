import { PatientSchema, AppointmentSchema, InvoiceSchema, PaymentSchema, formatZodError } from "../src/lib/validations/schemas";

console.log("=== STARTING VALIDATION TESTS ===");

function testSchema(name: string, schema: any, payload: any, expectedSuccess: boolean) {
  const result = schema.safeParse(payload);
  const success = result.success;
  if (success === expectedSuccess) {
    console.log(`[PASS] ${name} (Expected: ${expectedSuccess}, Got: ${success})`);
  } else {
    console.error(`[FAIL] ${name} (Expected: ${expectedSuccess}, Got: ${success})`);
    if (!success) {
      console.error(`  Details: ${formatZodError(result.error)}`);
    }
  }
}

// 1. Patient Tests
testSchema("Patient - Valid Payload", PatientSchema, {
  name: "Jane Doe",
  phone1: "+123456789",
  email: "jane.doe@example.com",
  dob: "1990-05-15",
  isDeceased: "false",
  isSigned: "true"
}, true);

testSchema("Patient - Invalid Email", PatientSchema, {
  name: "Jane Doe",
  phone1: "+123456789",
  email: "invalid-email",
  isDeceased: "false",
  isSigned: "true"
}, false);

testSchema("Patient - Future DOB", PatientSchema, {
  name: "Jane Doe",
  phone1: "+123456789",
  dob: "2050-01-01",
  isDeceased: "false",
  isSigned: "true"
}, false);

testSchema("Patient - Missing Name", PatientSchema, {
  phone1: "+123456789",
  isDeceased: "false",
  isSigned: "true"
}, false);

// 2. Appointment Tests
const todayStr = new Date().toISOString().split('T')[0];
const pastDateStr = "2020-01-01";

testSchema("Appointment - Valid Payload", AppointmentSchema, {
  patientId: "9d2a385f-637c-49e2-8129-eb1f11fd957e",
  doctorId: "9d2a385f-637c-49e2-8129-eb1f11fd957e",
  date: todayStr,
  time: "09:00",
  duration: 30,
  treatment: "Cleaning"
}, true);

testSchema("Appointment - Date in Past", AppointmentSchema, {
  patientId: "9d2a385f-637c-49e2-8129-eb1f11fd957e",
  doctorId: "9d2a385f-637c-49e2-8129-eb1f11fd957e",
  date: pastDateStr,
  time: "09:00",
  duration: 30,
  treatment: "Cleaning"
}, false);

testSchema("Appointment - Non-Positive Duration", AppointmentSchema, {
  patientId: "9d2a385f-637c-49e2-8129-eb1f11fd957e",
  doctorId: "9d2a385f-637c-49e2-8129-eb1f11fd957e",
  date: todayStr,
  time: "09:00",
  duration: -15,
  treatment: "Cleaning"
}, false);

// 3. Invoice Tests
testSchema("Invoice - Valid Payload", InvoiceSchema, {
  patientId: "9d2a385f-637c-49e2-8129-eb1f11fd957e",
  items: [{
    description: "Tooth Extraction",
    quantity: 1,
    price: 150
  }]
}, true);

testSchema("Invoice - Negative Price", InvoiceSchema, {
  patientId: "9d2a385f-637c-49e2-8129-eb1f11fd957e",
  items: [{
    description: "Tooth Extraction",
    quantity: 1,
    price: -100
  }]
}, false);

testSchema("Invoice - Negative Quantity", InvoiceSchema, {
  patientId: "9d2a385f-637c-49e2-8129-eb1f11fd957e",
  items: [{
    description: "Tooth Extraction",
    quantity: -2,
    price: 100
  }]
}, false);

// 4. Payment Tests
testSchema("Payment - Valid Payload", PaymentSchema, {
  amount: 100.50,
  method: "CARD"
}, true);

testSchema("Payment - Negative Amount", PaymentSchema, {
  amount: -50,
  method: "CASH"
}, false);

testSchema("Payment - Invalid Method", PaymentSchema, {
  amount: 50,
  method: "CRYPTO"
}, false);

console.log("=== VALIDATION TESTS FINISHED ===");
