const API_URL = import.meta.env.VITE_API_URL;

/**
 * Request a 6-digit verification code to be sent to the user's email.
 * @param {string} email - The user's email address
 * @returns {Promise<{ message: string, code: string }>} Response from the server
 */
export async function requestEmailVerification(email) {
  const response = await fetch(`${API_URL}/api/send-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
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
    throw new Error(result.message || `Failed to send verification code: ${response.status} ${response.statusText}`);
  }

  return result;
}
