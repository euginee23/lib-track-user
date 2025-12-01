import { jwtDecode } from "jwt-decode";

class AuthService {
  constructor() {
    this.TOKEN_KEY = "token";
    this.USER_KEY = "user";
  }

  // Check if user is authenticated by validating token
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      return decoded.exp > Date.now() / 1000;
    } catch (error) {
      console.error("Token validation error:", error);
      this.logout(); // Clear invalid token
      return false;
    }
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get user data from localStorage
  getUser() {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) return null;
    
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  // Save authentication data
  saveAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Update user data while keeping the same token
  updateUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Clear authentication data
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Additional cleanup if needed
    sessionStorage.clear();
  }

  // Logout helper utility for components
  logoutAndRedirect(navigate) {
    this.logout();
    
    // Hide navbar if it's expanded (for mobile)
    const navbar = document.querySelector(".navbar-collapse");
    if (navbar?.classList.contains("show")) {
      if (window.bootstrap?.Collapse) {
        const bsCollapse = new window.bootstrap.Collapse(navbar, {
          toggle: false,
        });
        bsCollapse.hide();
      }
    }

    // Redirect to login page
    if (navigate) {
      navigate("/");
    } else {
      window.location.href = "/";
    }
  }

  // Get user from token
  getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Refresh user data from server to get latest verification status
  async refreshUserData() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          // Update stored user data with fresh data from server
          this.updateUser(data.user);
          return data.user;
        }
      } else if (response.status === 401) {
        // Token is invalid, logout user
        this.logout();
        return null;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }

    return this.getUser(); // Return cached data if refresh fails
  }

  // Get user data with optional refresh from server
  async getUserWithRefresh(forceRefresh = false) {
    if (forceRefresh || !this.getUser()) {
      return await this.refreshUserData();
    }
    return this.getUser();
  }
}

// Create a singleton instance
const authService = new AuthService();
export default authService;