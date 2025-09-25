const API_URL = import.meta.env.VITE_API_URL;

export async function registerUser(user) {
  const formData = new FormData();
  formData.append("firstName", user.firstName);
  formData.append("middleName", user.middleName);
  formData.append("lastName", user.lastName);
  formData.append("email", user.email);
  formData.append("studentId", user.studentId);
  formData.append("contactNumber", user.contactNumber);
  formData.append("password", user.password);
  if (user.corImage) {
    formData.append("corImage", user.corImage);
  }

  const response = await fetch(`${API_URL}/api/users/register`, {
    method: "POST",
    body: formData,
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