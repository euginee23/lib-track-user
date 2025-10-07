const API_URL = import.meta.env.VITE_API_URL;

export async function fetchDepartments() {
  try {
    const response = await fetch(`${API_URL}/api/settings/departments`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
}