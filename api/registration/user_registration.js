const API_URL = import.meta.env.VITE_API_URL;

export async function registerUser(user) {
  const formData = new FormData();
  formData.append("firstName", user.firstName);
  formData.append("middleName", user.middleName || "");
  formData.append("lastName", user.lastName);
  formData.append("email", user.email);
  formData.append("contactNumber", user.contactNumber);
  formData.append("college", user.college);
  formData.append("position", user.position);
  formData.append("password", user.password);
  
  // Add student-specific fields
  if (user.studentId) {
    formData.append("studentId", user.studentId);
    if (user.yearLevel) {
      formData.append("yearLevel", user.yearLevel);
    }
  }
  
  // Add faculty-specific fields
  if (user.facultyId) {
    formData.append("facultyId", user.facultyId);
  }
  
  // Add images
  if (user.corImage) {
    formData.append("corImage", user.corImage);
  }
  
  if (user.profileImage) {
    formData.append("profileImage", user.profileImage);
  }

  const response = await fetch(`${API_URL}/api/users/register`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
    },
    body: formData,
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-cache',
  });

  if (!response.ok) {
    const result = await response.json();
    if (response.status === 409 && result.conflictFields) {
      throw new Error(`Conflicts: ${result.conflictFields.join(", ")}`);
    }
    throw new Error(result.message || `Failed to register user: ${response.status} ${response.statusText}`);
  }

  return response.json();
}