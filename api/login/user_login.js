const API_URL = import.meta.env.VITE_API_URL;

export async function loginUser(identifier, password) {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password }),
  });

  let rawResponse, result;
  try {
    rawResponse = await response.text();
    result = JSON.parse(rawResponse);
  } catch (error) {
    console.error("Raw server response:", rawResponse);
    throw new Error("Unexpected response from the server. Please try again later.");
  }

  if (!response.ok) {
    // Attach the result to the error for downstream usage
    const error = new Error(result.message || `Failed to log in: ${response.status} ${response.statusText}`);
    error.result = result;
    throw error;
  }

  return result;
}
