export class ProfileService {
  constructor() {
    this.API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  }

  // Get current user profile
  async getCurrentProfile() {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${this.API_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  // Update user profile information
  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${this.API_URL}/api/user/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  // Change user password
  async changePassword(passwordData) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${this.API_URL}/api/user/profile/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      return await response.json();
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(file, userId) {
    try {
      const token = localStorage.getItem('token');
      
      // Rename file to user ID for consistent naming
      const formData = new FormData();
      const renamedFile = new File([file], `${userId}.${file.name.split('.').pop()}`, { type: file.type });
      formData.append('file', renamedFile);

      const response = await fetch(`${this.API_URL}/api/uploads/user-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload profile image');
      }

      return await response.json();
    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw error;
    }
  }

  // Update profile image URL in database
  async updateProfileImageUrl(imageUrl) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${this.API_URL}/api/user/profile/update-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile_image: imageUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile image URL');
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating profile image URL:", error);
      throw error;
    }
  }

  // Get all departments
  async getDepartments() {
    try {
      const response = await fetch(`${this.API_URL}/api/settings/departments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  }

  // Get active semester
  async getActiveSemester() {
    try {
      const response = await fetch(`${this.API_URL}/api/semesters/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No active semester
        }
        throw new Error(`Failed to fetch active semester: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching active semester:", error);
      throw error;
    }
  }

  // Get all semesters
  async getAllSemesters() {
    try {
      const response = await fetch(`${this.API_URL}/api/semesters`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch semesters: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching semesters:", error);
      throw error;
    }
  }

  // Delete profile image
  async deleteProfileImage(filename) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${this.API_URL}/api/uploads/user-profile/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete profile image');
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting profile image:", error);
      throw error;
    }
  }

  // Update semester verification status (when user uploads COR)
  async updateSemesterVerification(semesterId) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${this.API_URL}/api/user/profile/update-semester`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ semester_id: semesterId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update semester verification');
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating semester verification:", error);
      throw error;
    }
  }

  // Validate profile data
  validateProfileData(data) {
    const errors = {};

    if (!data.first_name || data.first_name.trim().length < 2) {
      errors.first_name = 'First name must be at least 2 characters';
    }

    if (!data.last_name || data.last_name.trim().length < 2) {
      errors.last_name = 'Last name must be at least 2 characters';
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Valid email address is required';
    }

    if (data.contact_number && !/^[\d\-\+\(\)\s]+$/.test(data.contact_number)) {
      errors.contact_number = 'Invalid contact number format';
    }

    if (!data.department_id || data.department_id === '') {
      errors.department_id = 'Department is required';
    }

    if (!data.position || data.position === '') {
      errors.position = 'Position is required';
    }

    // Position-specific validation
    if (data.position === 'Student') {
      if (!data.student_id || data.student_id.trim().length < 3) {
        errors.student_id = 'Student ID is required and must be at least 3 characters';
      }
    } else {
      if (!data.faculty_id || data.faculty_id.trim().length < 3) {
        errors.faculty_id = 'Faculty ID is required and must be at least 3 characters';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate password change data
  validatePasswordChange(data) {
    const errors = {};

    if (!data.currentPassword || data.currentPassword.trim().length < 1) {
      errors.currentPassword = 'Current password is required';
    }

    if (!data.newPassword || data.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters';
    }

    if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'New password and confirmation do not match';
    }

    // Password strength validation
    if (data.newPassword) {
      const hasUpperCase = /[A-Z]/.test(data.newPassword);
      const hasLowerCase = /[a-z]/.test(data.newPassword);
      const hasNumbers = /\d/.test(data.newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        errors.newPassword = 'Password must contain at least one uppercase letter, lowercase letter, and number';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Get profile image URL
  getProfileImageUrl(userId, filename) {
    if (!filename) return null;
    return `${this.API_URL.replace('/api', '')}/uploads/user_profiles/${filename}`;
  }

  // Format profile data for display
  formatProfileData(userData) {
    return {
      id: userData.id || userData.user_id,
      firstName: userData.firstName || userData.first_name,
      middleName: userData.middleName || userData.middle_name,
      lastName: userData.lastName || userData.last_name,
      email: userData.email,
      contactNumber: userData.contactNumber || userData.contact_number,
      studentId: userData.studentId || userData.student_id,
      facultyId: userData.facultyId || userData.faculty_id,
      position: userData.position,
      departmentId: userData.departmentId || userData.department_id,
      semesterId: userData.semesterId || userData.semester_id,
      profileImage: userData.profileImage || userData.profile_image,
      emailVerification: userData.emailVerification || userData.email_verification,
      librarianApproval: userData.librarianApproval || userData.librarian_approval,
      semesterVerified: userData.semesterVerified || userData.semester_verified,
      hasFingerprint: userData.hasFingerprint,
      createdAt: userData.createdAt || userData.created_at
    };
  }

  // Check if profile is complete
  isProfileComplete(userData) {
    const requiredFields = ['firstName', 'lastName', 'email', 'position', 'departmentId'];
    
    if (userData.position === 'Student') {
      requiredFields.push('studentId');
    } else {
      requiredFields.push('facultyId');
    }

    return requiredFields.every(field => 
      userData[field] && userData[field].toString().trim().length > 0
    );
  }

  // Get profile completion percentage
  getProfileCompletionPercentage(userData) {
    const allFields = [
      'firstName', 'lastName', 'middleName', 'email', 'contactNumber',
      'position', 'departmentId', 'profileImage'
    ];

    if (userData.position === 'Student') {
      allFields.push('studentId');
    } else {
      allFields.push('facultyId');
    }

    const filledFields = allFields.filter(field => 
      userData[field] && userData[field].toString().trim().length > 0
    );

    return Math.round((filledFields.length / allFields.length) * 100);
  }
}

// Export singleton instance
export const profileService = new ProfileService();

// Export individual functions for compatibility with existing code
export const getProfile = () => profileService.getCurrentProfile();
export const updateProfile = (data) => profileService.updateProfile(data);
export const updatePassword = (data) => profileService.changePassword(data);
export const getDepartments = () => profileService.getDepartments();
export const getPositions = () => Promise.resolve({
  success: true,
  data: [
    { value: 'Student', label: 'Student' },
    { value: 'Faculty', label: 'Faculty' },
    { value: 'Staff', label: 'Staff' },
    { value: 'Administrator', label: 'Administrator' }
  ]
});

export default profileService;