const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Wrapper pour fetch avec gestion automatique des headers (JWT)
 */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`API Call: ${API_URL}${endpoint}`); // Debug URL

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Gestion erreur 401 (Token expiré)
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/patient/login';
    throw new Error('Session expirée');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erreur ${response.status}`);
  }

  if (response.status === 204) return null;

  return response.json();
}

export async function login(email, passwordHash) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, passwordHash }),
  });
}

export async function register(userData) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getPsychologists(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return apiFetch(`/psychologists?${query}`);
}

export async function getAvailabilities(psyId) {
  return apiFetch(`/psy/${psyId}/availabilities`);
}

export async function bookAppointment(availabilityId, type = 'ONLINE') {
  return apiFetch('/appointments/book', {
    method: 'POST',
    body: JSON.stringify({ availabilityId, type }),
  });
}

export async function updatePatientProfile(encryptedProfileData) {
  return apiFetch('/patients/me', {
    method: 'PATCH',
    body: JSON.stringify(encryptedProfileData),
  });
}

export async function updatePsyProfile(profileData) {
  return apiFetch('/psychologists/me', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function getMyPsyProfile() {
  return apiFetch('/psychologists/me');
}

export async function getMyAppointments() {
  return apiFetch('/appointments/my');
}

export async function getPsyAppointments() {
  return apiFetch('/psy/appointments');
}

export async function createAvailability(date, startTime, endTime, isRemote = true) {
  return apiFetch('/psy/availabilities', {
    method: 'POST',
    body: JSON.stringify({ date, startTime, endTime, isRemote }),
  });
}

export async function cancelAppointment(id) {
  return apiFetch(`/appointments/${id}/cancel`, {
    method: 'PATCH',
  });
}

export async function getConversation(userId) {
  return apiFetch(`/chat/conversation/${userId}`);
}

export async function getContacts() {
  const response = await getMyAppointments().catch(() => ({ appointments: [] }));
  const appointments = response.appointments || [];
  
  const contacts = new Map();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  appointments.forEach(appt => {
    // Identifier l'autre participant
    let other = null;
    if (appt.psy && appt.psy.id !== currentUser.id) other = appt.psy;
    else if (appt.patient && appt.patient.id !== currentUser.id) other = appt.patient;

    if (other && !contacts.has(other.id)) {
      contacts.set(other.id, {
        id: other.id,
        name: `${other.firstName} ${other.lastName}`,
        role: other.role,
        avatar: `https://ui-avatars.com/api/?name=${other.firstName}+${other.lastName}&background=random`,
        specialty: 'Psychologue', // À affiner si dispo
        online: false
      });
    }
  });
  
  return Array.from(contacts.values());
}

export default {
  apiFetch,
  login,
  register,
  getPsychologists,
  getAvailabilities,
  bookAppointment,
  updatePatientProfile,
  updatePsyProfile,
  getMyPsyProfile,
  getMyAppointments,
  getPsyAppointments,
  createAvailability,
  cancelAppointment,
  getConversation,
  getContacts
};
