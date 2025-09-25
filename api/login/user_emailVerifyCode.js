const API_URL = import.meta.env.VITE_API_URL;

/**
 * Verify a 6-digit email verification code.
 * @param {string} email - The user's email address
 * @param {string} code - The 6-digit verification code
 * @returns {Promise<{ message: string, librarian_approval: number }>} Response from the server
 */
export async function verifyEmailCode(email, code) {
  const response = await fetch(`${API_URL}/api/verify-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
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
    throw new Error(result.message || `Failed to verify code: ${response.status} ${response.statusText}`);
  }

  return result;
}
