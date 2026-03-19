// Demo data for development without Firebase
export const DEMO_USER = {
  uid: 'demo-admin-001',
  email: 'doctor@clinicflow.com',
  displayName: 'Dr. Rajesh Sharma',
  photoURL: null,
  role: 'admin',
};

export const DEMO_PATIENTS = [
  { id: 'p1', firstName: 'Rahul', lastName: 'Sharma', mobile: '9876543210', email: 'rahul@email.com', gender: 'male', dateOfBirth: '1993-05-15', age: 32, bloodGroup: 'B+', allergies: [], address: '42 MG Road, Mumbai', emergencyContact: 'Priya - 9876543211', notes: '', totalVisits: 8, lastVisitDate: '2025-01-12', createdAt: '2024-06-01' },
  { id: 'p2', firstName: 'Priya', lastName: 'Mehta', mobile: '9765432100', email: 'priya.m@email.com', gender: 'female', dateOfBirth: '1997-08-22', age: 28, bloodGroup: 'A+', allergies: ['Penicillin'], address: '15 Linking Road, Mumbai', emergencyContact: 'Raj - 9765432101', notes: '', totalVisits: 5, lastVisitDate: '2025-01-10', createdAt: '2024-07-15' },
  { id: 'p3', firstName: 'Amit', lastName: 'Kumar', mobile: '9654321000', email: '', gender: 'male', dateOfBirth: '1980-03-10', age: 45, bloodGroup: 'O+', allergies: ['Sulfa drugs'], address: '78 Park Street, Delhi', emergencyContact: 'Ritu - 9654321001', notes: 'Diabetic patient', totalVisits: 12, lastVisitDate: '2025-01-08', createdAt: '2024-03-20' },
  { id: 'p4', firstName: 'Sita', lastName: 'Rao', mobile: '9543210000', email: 'sita.rao@email.com', gender: 'female', dateOfBirth: '1970-11-28', age: 55, bloodGroup: 'AB+', allergies: [], address: '23 Brigade Road, Bangalore', emergencyContact: 'Venkat - 9543210001', notes: 'Hypertension patient', totalVisits: 15, lastVisitDate: '2025-01-05', createdAt: '2024-01-10' },
  { id: 'p5', firstName: 'Jay', lastName: 'Patel', mobile: '9432100000', email: 'jay.p@email.com', gender: 'male', dateOfBirth: '2003-07-05', age: 22, bloodGroup: 'B-', allergies: [], address: '56 CG Road, Ahmedabad', emergencyContact: 'Meena - 9432100001', notes: '', totalVisits: 2, lastVisitDate: '2025-01-03', createdAt: '2024-11-01' },
  { id: 'p6', firstName: 'Meera', lastName: 'Joshi', mobile: '9321000000', email: '', gender: 'female', dateOfBirth: '1988-12-15', age: 37, bloodGroup: 'A-', allergies: ['Aspirin'], address: '12 FC Road, Pune', emergencyContact: 'Suresh - 9321000001', notes: '', totalVisits: 6, lastVisitDate: '2025-01-14', createdAt: '2024-08-05' },
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const DEMO_APPOINTMENTS = [
  { id: 'a1', patientId: 'p1', patientName: 'Rahul Sharma', patientMobile: '9876543210', date: today, timeSlot: '09:00', endTime: '09:30', status: 'completed', type: 'follow-up', notes: '', whatsappSent: true, createdAt: today },
  { id: 'a2', patientId: 'p2', patientName: 'Priya Mehta', patientMobile: '9765432100', date: today, timeSlot: '09:30', endTime: '10:00', status: 'completed', type: 'new', notes: '', whatsappSent: true, createdAt: today },
  { id: 'a3', patientId: 'p3', patientName: 'Amit Kumar', patientMobile: '9654321000', date: today, timeSlot: '10:00', endTime: '10:30', status: 'scheduled', type: 'follow-up', notes: '', whatsappSent: false, createdAt: today },
  { id: 'a4', patientId: 'p4', patientName: 'Sita Rao', patientMobile: '9543210000', date: today, timeSlot: '11:00', endTime: '11:30', status: 'scheduled', type: 'new', notes: 'Blood pressure check', whatsappSent: true, createdAt: today },
  { id: 'a5', patientId: 'p5', patientName: 'Jay Patel', patientMobile: '9432100000', date: today, timeSlot: '11:30', endTime: '12:00', status: 'scheduled', type: 'follow-up', notes: '', whatsappSent: false, createdAt: today },
  { id: 'a6', patientId: 'p6', patientName: 'Meera Joshi', patientMobile: '9321000000', date: today, timeSlot: '14:00', endTime: '14:30', status: 'scheduled', type: 'new', notes: '', whatsappSent: true, createdAt: today },
  { id: 'a7', patientId: 'p1', patientName: 'Rahul Sharma', patientMobile: '9876543210', date: today, timeSlot: '15:00', endTime: '15:30', status: 'cancelled', type: 'follow-up', notes: 'Cancelled by patient', whatsappSent: false, createdAt: today },
];

export const DEMO_VISITS = [
  {
    id: 'v1', patientId: 'p1', appointmentId: 'a1', date: '2025-01-12',
    vitals: { bp: '120/80', temperature: '99.2', weight: '72', pulse: '78', spo2: '98' },
    complaints: 'Fever since 3 days, headache, body pain',
    diagnosis: 'Viral Fever',
    medicines: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'TDS', duration: '3 days', instructions: 'After food' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'OD', duration: '5 days', instructions: 'At night' },
    ],
    followUpDate: tomorrow,
    followUpReminderSent: false,
    notes: 'Patient advised rest and plenty of fluids.',
    createdAt: '2025-01-12',
  },
  {
    id: 'v2', patientId: 'p1', appointmentId: null, date: '2025-01-05',
    vitals: { bp: '118/76', temperature: '98.6', weight: '72', pulse: '74', spo2: '99' },
    complaints: 'Lower back pain, stiffness in morning',
    diagnosis: 'Lumbar strain',
    medicines: [
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'BD', duration: '5 days', instructions: 'After food' },
      { name: 'Thiocolchicoside', dosage: '4mg', frequency: 'BD', duration: '3 days', instructions: 'After food' },
    ],
    followUpDate: '2025-01-12',
    followUpReminderSent: true,
    notes: 'Advised hot fomentation.',
    createdAt: '2025-01-05',
  },
  {
    id: 'v3', patientId: 'p2', appointmentId: 'a2', date: '2025-01-10',
    vitals: { bp: '110/70', temperature: '98.4', weight: '58', pulse: '72', spo2: '99' },
    complaints: 'Skin rash on arms, itching',
    diagnosis: 'Allergic dermatitis',
    medicines: [
      { name: 'Levocetirizine', dosage: '5mg', frequency: 'OD', duration: '7 days', instructions: 'At night' },
      { name: 'Calamine lotion', dosage: '', frequency: 'BD', duration: '7 days', instructions: 'Apply locally' },
    ],
    followUpDate: '2025-01-18',
    followUpReminderSent: false,
    notes: 'Avoid allergens.',
    createdAt: '2025-01-10',
  },
  {
    id: 'v4', patientId: 'p3', appointmentId: null, date: '2025-01-08',
    vitals: { bp: '140/90', temperature: '98.6', weight: '85', pulse: '82', spo2: '97' },
    complaints: 'Routine diabetes check, increased thirst',
    diagnosis: 'Type 2 Diabetes - follow-up',
    medicines: [
      { name: 'Metformin', dosage: '500mg', frequency: 'BD', duration: '30 days', instructions: 'After food' },
      { name: 'Glimepiride', dosage: '1mg', frequency: 'OD', duration: '30 days', instructions: 'Before breakfast' },
    ],
    followUpDate: '2025-01-20',
    followUpReminderSent: false,
    notes: 'HbA1c test recommended. Diet counseling done.',
    createdAt: '2025-01-08',
  },
];

export const DEMO_PAYMENTS = [
  { id: 'pay1', patientId: 'p1', patientName: 'Rahul Sharma', visitId: 'v1', amount: 500, paymentMode: 'upi', date: today, receiptNumber: 'CF-0042', notes: '', createdAt: today },
  { id: 'pay2', patientId: 'p2', patientName: 'Priya Mehta', visitId: 'v3', amount: 800, paymentMode: 'cash', date: today, receiptNumber: 'CF-0043', notes: '', createdAt: today },
  { id: 'pay3', patientId: 'p3', patientName: 'Amit Kumar', visitId: 'v4', amount: 1200, paymentMode: 'card', date: today, receiptNumber: 'CF-0044', notes: 'Including lab tests', createdAt: today },
  { id: 'pay4', patientId: 'p4', patientName: 'Sita Rao', visitId: null, amount: 600, paymentMode: 'upi', date: today, receiptNumber: 'CF-0045', notes: '', createdAt: today },
  { id: 'pay5', patientId: 'p6', patientName: 'Meera Joshi', visitId: null, amount: 1500, paymentMode: 'cash', date: today, receiptNumber: 'CF-0046', notes: 'Procedure charge', createdAt: today },
];
