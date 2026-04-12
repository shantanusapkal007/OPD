// ─── Users ───────────────────────────────────────────────
export type UserRole = "admin" | "doctor" | "receptionist" | "nurse";
export type TreatmentType = "Allopathic" | "Homeopathic";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo_url?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

// ─── Patients ────────────────────────────────────────────
export interface Patient {
  id?: string;
  case_number: string;
  treatment_type?: TreatmentType;
  full_name: string;
  mobile_number: string;
  alternate_mobile?: string;
  gender: "Male" | "Female" | "Other";
  date_of_birth?: string;
  age: number;
  blood_group?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  email?: string;
  occupation?: string;
  marital_status?: string;
  allergies?: string;
  chronic_diseases?: string;
  emergency_contact?: string;
  lmp?: string | null;
  menstrual_cycle_days?: number | null;
  photo?: string;
  notes?: string;
  current_medicines?: Medicine[];
  present_complaints?: string;
  weight?: number | null;
  height_cm?: number | null;
  bp?: string;
  temperature?: number | null;
  spo2?: number | null;
  repetition?: string;
  khata_balance?: number;
  created_at: string;
  updated_at: string;
}

// ─── Appointments ────────────────────────────────────────
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no-show";

export interface Appointment {
  id?: string;
  patient_id: string;
  patient_name: string;
  doctor_id?: string;
  appointment_date: string; // YYYY-MM-DD
  time_slot: string; // HH:mm
  type: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  created_at: string;
}

// ─── Visits (Case Papers) ────────────────────────────────
export interface Medicine {
  name: string;
  potency?: string;
  dosage: string;
  frequency: string;
  days: number;
  notes?: string;
}

export interface Vitals {
  bp?: string;
  weight?: number;
  height?: number;
  temperature?: number;
  pulse?: number;
  spo2?: number;
  respiratoryRate?: number;
}

export interface Visit {
  id?: string;
  patient_id: string;
  patient_name: string;
  doctor_id?: string;
  visit_images?: string[];
  complaints: string;
  history_of_present_illness?: string;
  past_history?: string;
  family_history?: string;
  examination_findings?: string;
  diagnosis: string;
  prescriptions: Medicine[];
  vitals: Vitals;
  lab_tests?: string;
  investigations_advised?: string;
  total_bill?: number;
  payment_status?: "paid" | "unpaid";
  advice?: string;
  referral?: string;
  follow_up_date?: string;
  follow_up_message_enabled?: boolean;
  is_edited?: boolean;
  edited_at?: string;
  edited_by?: string;
  created_at: string;
}

// ─── Payments ────────────────────────────────────────────
export type PaymentMethod = "cash" | "upi" | "card";
export type PaymentStatus = "paid" | "pending" | "refunded";

export interface Payment {
  id?: string;
  patient_id: string;
  patient_name: string;
  visit_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  description?: string;
  transaction_id?: string;
  date: string; // YYYY-MM-DD
  created_at: string;
}

// ─── Clinic Settings ─────────────────────────────────────
export interface ClinicSettings {
  id?: string;
  clinic_name: string;
  doctor_name: string;
  specialization: string;
  registration_number?: string;
  phone: string;
  email: string;
  address: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}
