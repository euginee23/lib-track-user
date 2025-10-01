const API_URL = import.meta.env.VITE_API_URL;

export async function fetchDepartments() {
  try {
    const response = await fetch(`${API_URL}/api/settings/departments`);
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