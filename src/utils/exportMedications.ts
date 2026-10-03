import { Medicine, User, DoseEvent } from '../types';

/**
 * Exports patient medication list to an RFC 4180 compliant CSV file.
 * Tailored specifically for clinical review during doctor appointments.
 */
export interface ExportResult {
  filename: string;
  rowCount: number;
  fileSizeBytes: number;
  timestamp: string;
}

export const exportMedicationsToCSV = (
  medicines: Medicine[],
  patient: User,
  doctor: User,
  dosesToday: DoseEvent[] = []
): ExportResult => {
  const exportDate = new Date();
  const formattedDate = exportDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = exportDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const escapeCSV = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Header metadata block for physician
  const lines: string[] = [
    '# ==========================================================================',
    '# AYUNEXA CONNECTED CARE - OFFICIAL PATIENT MEDICATION REPORT',
    '# Generated for Clinical Consultation & Doctor Visit Review',
    '# ==========================================================================',
    `# Patient Name:,${escapeCSV(patient.name)}`,
    `# Patient Age:,${escapeCSV(`${patient.age} years`)}`,
    `# Blood Group:,${escapeCSV(patient.bloodGroup)}`,
    `# Documented Allergies:,${escapeCSV(patient.allergies.join(', ') || 'No known drug allergies')}`,
    `# Primary Cardiologist / Physician:,${escapeCSV(`${patient.doctorName} (${patient.doctorPhone})`)}`,
    `# Primary Caregiver:,${escapeCSV(`${patient.emergencyContactName} (${patient.emergencyContact})`)}`,
    `# Report Export Date:,${escapeCSV(`${formattedDate} at ${formattedTime}`)}`,
    `# Data Source:,${escapeCSV('AyuNexa Local SQLite Room Database (Authoritative Patient Device Record)')}`,
    '# ==========================================================================',
    '',
    // CSV Columns
    [
      'Medicine Name',
      'Generic Name / Composition',
      'Strength / Dosage',
      'Form',
      'Frequency',
      'Daily Scheduled Times',
      'Food Instructions',
      'Special Clinical Instructions',
      'Current In-Hand Stock',
      'Unit',
      'Stock Runway (Days Remaining)',
      'Reorder Alert Threshold',
      'Today Compliance Status',
      'Last Confirmed Dose',
      'Prescription Active',
    ].map((h) => escapeCSV(h)).join(','),
  ];

  medicines.forEach((med) => {
    const schedules = med.schedules || [];
    const times = schedules.map((s) => s.timeOfDay).join('; ') || 'As needed (PRN)';
    const freq = schedules[0]?.frequency || 'DAILY';
    const dosesForMed = dosesToday.filter((d) => d.medicineId === med.id);
    const todayStatus = dosesForMed.length > 0
      ? dosesForMed.map((d) => `${d.scheduledTime}: ${d.status}`).join('; ')
      : 'No scheduled doses today';

    const dailyDosesCount = Math.max(1, schedules.length);
    const runwayDays = Math.round(med.currentStock / dailyDosesCount);

    const row = [
      escapeCSV(med.name),
      escapeCSV(med.genericName || 'Standard Formulatory'),
      escapeCSV(med.strength),
      escapeCSV(med.form),
      escapeCSV(freq),
      escapeCSV(times),
      escapeCSV(med.foodInstruction.replace(/_/g, ' ')),
      escapeCSV(med.instructions || 'Take as directed by physician'),
      escapeCSV(med.currentStock),
      escapeCSV(med.unit),
      escapeCSV(`~${runwayDays} days`),
      escapeCSV(`${med.reorderThreshold} ${med.unit}`),
      escapeCSV(todayStatus),
      escapeCSV(med.lastTakenTime || 'None recorded today'),
      escapeCSV(med.isActive ? 'ACTIVE' : 'INACTIVE'),
    ];

    lines.push(row.join(','));
  });

  // Footer audit notes
  lines.push('');
  lines.push('# Safety Note: Dose confirmations represent patient-reported local records. AyuNexa does not autonomously alter prescription dosages.');
  lines.push(`# Total Prescribed Medications: ${medicines.length}`);

  const csvString = lines.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const sanitizedName = patient.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `AyuNexa_Medications_${sanitizedName}_${exportDate.toISOString().slice(0, 10)}.csv`;

  // Trigger browser download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    filename,
    rowCount: medicines.length,
    fileSizeBytes: blob.size,
    timestamp: `${formattedDate} ${formattedTime}`,
  };
};
