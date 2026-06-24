// ── Pre-defined colleges for the subscription UI ─────────────
// These are common IITs, NITs, and IIITs in India.
// Users can also type custom college names.

export const IIT_COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
  'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'IIT Indore', 'IIT BHU Varanasi',
  'IIT Tirupati', 'IIT Palakkad', 'IIT Dharwad', 'IIT Bhilai', 'IIT Goa',
  'IIT Jammu', 'IIT Dhanbad', 'IIT Mandi', 'IIT Patna', 'IIT Ropar',
  'IIT Jodhpur', 'IIT Bhubaneswar'
];

export const NIT_COLLEGES = [
  'NIT Trichy', 'NIT Surathkal', 'NIT Warangal', 'NIT Calicut', 'NIT Rourkela',
  'NIT Allahabad', 'NIT Durgapur', 'NIT Kurukshetra', 'NIT Jaipur', 'NIT Surat',
  'NIT Silchar', 'NIT Hamirpur', 'NIT Jalandhar', 'NIT Nagpur', 'NIT Patna',
  'NIT Raipur', 'NIT Agartala', 'NIT Arunachal Pradesh', 'NIT Delhi',
  'NIT Goa', 'NIT Manipur', 'NIT Meghalaya', 'NIT Mizoram', 'NIT Sikkim',
  'NIT Srinagar', 'NIT Uttarakhand', 'NIT Andhra Pradesh', 'NIT Puducherry'
];

export const IIIT_COLLEGES = [
  'IIIT Hyderabad', 'IIIT Delhi', 'IIIT Allahabad', 'IIIT Bangalore',
  'IIIT Surat', 'IIIT Gwalior', 'IIIT Jabalpur', 'IIIT Kancheepuram',
  'IIIT Kota', 'IIIT Lucknow', 'IIIT Nagpur', 'IIIT Pune', 'IIIT Ranchi',
  'IIIT Sri City', 'IIIT Una', 'IIIT Vadodara', 'IIIT Kalyani',
  'IIIT Sonepat', 'IIIT Dharwad', 'IIIT Kottayam', 'IIIT Manipur',
  'IIIT Tiruchirappalli', 'IIIT Bhagalpur', 'IIIT Bhopal', 'IIIT Agartala'
];

export const ALL_COLLEGES = [...IIT_COLLEGES, ...NIT_COLLEGES, ...IIIT_COLLEGES].sort();

export const INSTITUTION_TYPES = [
  { value: 'IIT', label: 'All IITs' },
  { value: 'NIT', label: 'All NITs' },
  { value: 'IIIT', label: 'All IIITs' },
  { value: 'Other', label: 'Other Institutions' }
];

export const EVENT_CATEGORIES = [
  'Hackathon', 'Workshop', 'Seminar', 'Technical', 'Cultural',
  'Webinar', 'Competition', 'Internship', 'Placement Drive',
  'Tech Fest', 'Cultural Fest', 'Sports', 'Sports Event',
  'Coding Contest', 'Research Program', 'Open Source Program', 'Scholarship'
];
