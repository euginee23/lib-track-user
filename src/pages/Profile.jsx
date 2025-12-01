import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ToastNotification from "../components/ToastNotification";
import authService from "../utils/auth";
import { getProfile, updateProfile, updatePassword, getDepartments, getPositions } from "../../api/profile/profileService";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaIdCard, FaUniversity, FaGraduationCap, FaEdit, FaSave, FaTimes, FaCheckCircle, FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    department_id: '',
    position: '',
    student_id: '',
    faculty_id: '',
    year_level: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [corImage, setCorImage] = useState(null);
  const [newCorImage, setNewCorImage] = useState(null);
  const [corPreview, setCorPreview] = useState(null);
  const [uploadingCor, setUploadingCor] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCorModal, setShowCorModal] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchDepartments();
    fetchPositions();
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getProfile();
      
      // Extract user data from response
      const profile = response.user || response;
      
      // Helper function to convert year number to year level string
      const convertYearLevel = (yearValue) => {
        if (!yearValue) return '';
        const yearStr = yearValue.toString();
        // If already in correct format (e.g., "1st Year"), return as is
        if (yearStr.includes('Year')) return yearStr;
        // Convert number to formatted string
        const yearMap = {
          '1': '1st Year',
          '2': '2nd Year',
          '3': '3rd Year',
          '4': '4th Year',
          '5': '5th Year'
        };
        return yearMap[yearStr] || '';
      };
      
      const rawYearLevel = profile.yearLevel || profile.year_level || '';
      const formattedYearLevel = convertYearLevel(rawYearLevel);
      
      console.log("Formatted Year Level:", formattedYearLevel);
      
      setUser(profile);
      setFormData({
        first_name: profile.firstName || profile.first_name || '',
        middle_name: profile.middleName || profile.middle_name || '',
        last_name: profile.lastName || profile.last_name || '',
        email: profile.email || '',
        contact_number: profile.contactNumber || profile.contact_number || '',
        department_id: profile.departmentId || profile.department_id || '',
        position: profile.position || '',
        student_id: profile.studentId || profile.student_id || '',
        faculty_id: profile.facultyId || profile.faculty_id || '',
        year_level: formattedYearLevel
      });
      
      // Handle profile image - check for base64 data or path
      const profileImageData = profile.profileImage || profile.profilePhoto || profile.profile_photo || profile.profile_image;
      if (profileImageData) {
        // If it's already base64 data (starts with data:image), use it directly
        if (profileImageData.startsWith('data:image')) {
          setPreviewImage(profileImageData);
        } else {
          // Otherwise, it's a path, so prepend the API URL
          setPreviewImage(`${import.meta.env.VITE_API_BASE_URL}${profileImageData}`);
        }
      }

      // Handle COR image
      const corImageData = profile.corImage || profile.cor_image || profile.cor;
      if (corImageData) {
        if (typeof corImageData === 'string' && corImageData.startsWith('data:image')) {
          setCorImage(corImageData);
        } else if (typeof corImageData === 'string') {
          setCorImage(`${import.meta.env.VITE_API_BASE_URL}${corImageData}`);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      ToastNotification.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      // Handle both direct array and nested response
      const data = response.departments || response.data || response;
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  const fetchPositions = async () => {
    try {
      const data = await getPositions();
      // Handle both array and object responses
      if (Array.isArray(data)) {
        setPositions(data.map(p => typeof p === 'string' ? p : (p.value || p.position || p.label)));
      } else if (data && data.success && Array.isArray(data.data)) {
        // Handle response with success flag and data array
        setPositions(data.data.map(p => typeof p === 'string' ? p : (p.value || p.label)));
      } else if (data && Array.isArray(data.positions)) {
        setPositions(data.positions.map(p => typeof p === 'string' ? p : (p.value || p.position || p.label)));
      } else {
        // Use default positions
        setPositions(['Student', 'Faculty', 'Staff', 'Administrator']);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
      // Use default positions on error
      setPositions(['Student', 'Faculty', 'Staff', 'Administrator']);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        ToastNotification.error("Image size must be less than 5MB");
        return;
      }
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleCorImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        ToastNotification.error("COR image size must be less than 5MB");
        return;
      }
      setNewCorImage(file);
      setCorPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadCor = async () => {
    if (!newCorImage) {
      ToastNotification.error("Please select a COR image to upload");
      return;
    }

    setUploadingCor(true);

    try {
      const formData = new FormData();
      formData.append('corImage', newCorImage);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile/update-cor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload COR');
      }

      ToastNotification.success("COR uploaded successfully! Pending verification.");
      setNewCorImage(null);
      setCorPreview(null);
      fetchUserData();
    } catch (error) {
      console.error("Error uploading COR:", error);
      ToastNotification.error(error.message || "Failed to upload COR");
    } finally {
      setUploadingCor(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const profileData = { ...formData };
      if (profileImage) {
        profileData.profileImage = profileImage;
      }

      await updateProfile(profileData);
      ToastNotification.success("Profile updated successfully!");
      setEditMode(false);
      fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      ToastNotification.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      ToastNotification.error("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      ToastNotification.error("Password must be at least 8 characters long");
      return;
    }

    setSaving(true);

    try {
      await updatePassword({
        currentPassword: passwordData.current_password,
        newPassword: passwordData.new_password
      });

      ToastNotification.success("Password updated successfully!");
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setPasswordMode(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error("Error updating password:", error);
      ToastNotification.error(error.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    
    // Helper function to convert year number to year level string
    const convertYearLevel = (yearValue) => {
      if (!yearValue) return '';
      const yearStr = yearValue.toString();
      if (yearStr.includes('Year')) return yearStr;
      const yearMap = {
        '1': '1st Year',
        '2': '2nd Year',
        '3': '3rd Year',
        '4': '4th Year',
        '5': '5th Year'
      };
      return yearMap[yearStr] || '';
    };
    
    const rawYearLevel = user.yearLevel || user.year_level || '';
    const formattedYearLevel = convertYearLevel(rawYearLevel);
    
    setFormData({
      first_name: user.firstName || user.first_name || '',
      middle_name: user.middleName || user.middle_name || '',
      last_name: user.lastName || user.last_name || '',
      email: user.email || '',
      contact_number: user.contactNumber || user.contact_number || '',
      department_id: user.departmentId || user.department_id || '',
      position: user.position || '',
      student_id: user.studentId || user.student_id || '',
      faculty_id: user.facultyId || user.faculty_id || '',
      year_level: formattedYearLevel
    });
    setProfileImage(null);
    const profileImageData = user.profileImage || user.profilePhoto || user.profile_photo || user.profile_image;
    if (profileImageData) {
      if (profileImageData.startsWith('data:image')) {
        setPreviewImage(profileImageData);
      } else {
        setPreviewImage(`${import.meta.env.VITE_API_BASE_URL}${profileImageData}`);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        paddingTop: '80px',
        paddingBottom: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          width: 'min(880px, 96%)',
          background: 'rgba(255,255,255,0.98)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 18px 40px rgba(12,150,156,0.12)',
          border: '1px solid rgba(12,150,156,0.08)',
          textAlign: 'center'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
            boxShadow: '0 8px 20px rgba(12,150,156,0.24)',
            marginBottom: '20px'
          }}>
            <FaUser size={28} />
          </div>
          <h4 style={{ margin: 0, color: '#0A7075', fontWeight: 800 }}>Loading Profile</h4>
          <p style={{ margin: '10px 0 0', color: '#6BA3BE' }}>Fetching your information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ 
      minHeight: '100vh',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: isMobile ? '12px' : '24px 12px' 
      }}>
        <div style={{ 
          width: 'min(1200px, 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Header Card */}
          <div style={{
            background: 'rgba(255,255,255,0.98)',
            borderRadius: '16px',
            padding: isMobile ? '24px' : '32px',
            boxShadow: '0 18px 40px rgba(12,150,156,0.12)',
            border: '1px solid rgba(12,150,156,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: isMobile ? 48 : 64,
                  height: isMobile ? 48 : 64,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                  boxShadow: '0 8px 20px rgba(12,150,156,0.24)'
                }}>
                  <FaUser size={isMobile ? 22 : 28} />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: '#0A7075', fontWeight: 800, fontSize: isMobile ? '1.5rem' : '1.75rem' }}>
                    Profile Settings
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#6BA3BE', fontSize: isMobile ? '0.875rem' : '0.95rem' }}>
                    Manage your account information and preferences
                  </p>
                </div>
              </div>
              
              {!editMode && !passwordMode && (
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #0C969C, #0A7075)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(12,150,156,0.24)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <FaEdit size={16} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
            gap: '20px'
          }}>
            {/* Left Column - Profile Picture & Quick Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Profile Picture Card */}
              <div style={{
                background: 'rgba(255,255,255,0.98)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 18px 40px rgba(12,150,156,0.12)',
                border: '1px solid rgba(12,150,156,0.08)',
                textAlign: 'center'
              }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      style={{
                        width: '160px',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '4px solid #6BA3BE',
                        boxShadow: '0 8px 20px rgba(12,150,156,0.2)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '160px',
                      height: '160px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6BA3BE, #0C969C)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 8px 20px rgba(12,150,156,0.2)'
                    }}>
                      <FaUser size={64} />
                    </div>
                  )}
                  
                  {editMode && (
                    <label
                      htmlFor="profileImage"
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0C969C, #0A7075)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(12,150,156,0.3)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FaCamera size={18} />
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
                
                <h5 style={{ margin: '0 0 4px', color: '#0A7075', fontWeight: 700 }}>
                  {user?.firstName || user?.first_name} {user?.lastName || user?.last_name}
                </h5>
                <p style={{ margin: 0, color: '#6BA3BE', fontSize: '0.875rem' }}>
                  {user?.position}
                </p>
                
                {editMode && (
                  <p style={{ 
                    margin: '12px 0 0', 
                    color: '#6BA3BE', 
                    fontSize: '0.75rem',
                    fontStyle: 'italic'
                  }}>
                    Max size: 5MB
                  </p>
                )}
              </div>

              {/* Account Status Card */}
              <div style={{
                background: 'rgba(255,255,255,0.98)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 18px 40px rgba(12,150,156,0.12)',
                border: '1px solid rgba(12,150,156,0.08)'
              }}>
                <h6 style={{ margin: '0 0 16px', color: '#0A7075', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCheckCircle size={18} />
                  Enrollment Status
                </h6>
                
                <div style={{ 
                  padding: '16px', 
                  background: (user?.semesterVerified || user?.semester_verified) === 1 
                    ? 'rgba(16,185,129,0.08)' 
                    : 'rgba(245,158,11,0.08)', 
                  borderRadius: '8px',
                  borderLeft: `3px solid ${(user?.semesterVerified || user?.semester_verified) === 1 ? '#10B981' : '#F59E0B'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6BA3BE', 
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    Current Semester
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    color: '#0A7075',
                    marginBottom: '12px'
                  }}>
                    {user?.semesterName || 'N/A'} {user?.schoolYear || ''}
                  </div>
                  <div>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '12px',
                      background: (user?.semesterVerified || user?.semester_verified) === 1 ? '#10B981' : '#F59E0B',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-block'
                    }}>
                      {(user?.semesterVerified || user?.semester_verified) === 1 ? '✓ Enrolled' : '⏳ Pending Enrollment'}
                    </span>
                  </div>
                  {(user?.semesterVerified || user?.semester_verified) !== 1 && (
                    <div style={{ 
                      marginTop: '12px',
                      fontSize: '0.75rem',
                      color: '#6BA3BE',
                      fontStyle: 'italic'
                    }}>
                      Please upload your Certificate of Registration
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate of Registration (COR) Card */}
              <div style={{
                background: 'rgba(255,255,255,0.98)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 18px 40px rgba(12,150,156,0.12)',
                border: '1px solid rgba(12,150,156,0.08)'
              }}>
                <h6 style={{ margin: '0 0 16px', color: '#0A7075', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaIdCard size={18} />
                  Certificate of Registration
                </h6>
                
                {corImage ? (
                  <>
                    <div style={{ 
                      position: 'relative',
                      width: '100%',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(12,150,156,0.15)',
                      cursor: 'pointer',
                      marginBottom: '12px'
                    }}
                    onClick={() => setShowCorModal(true)}
                    >
                      <img 
                        src={corImage} 
                        alt="Certificate of Registration" 
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          background: '#f9fafb',
                          display: 'block'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                        padding: '8px 12px',
                        color: 'white',
                        fontSize: '0.75rem',
                        textAlign: 'center'
                      }}>
                        Click to view full size
                      </div>
                    </div>

                    <div style={{ 
                      marginBottom: '12px',
                      padding: '8px',
                      background: 'rgba(107,163,190,0.08)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: '#6BA3BE',
                      textAlign: 'center'
                    }}>
                      {(user?.semesterVerified || user?.semester_verified) === 1 ? (
                        <span style={{ color: '#10B981', fontWeight: 600 }}>✓ Verified</span>
                      ) : (
                        <span style={{ color: '#F59E0B', fontWeight: 600 }}>⏳ Pending Verification</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    background: 'rgba(107,163,190,0.05)',
                    borderRadius: '8px',
                    border: '2px dashed #6BA3BE',
                    marginBottom: '12px'
                  }}>
                    <FaIdCard size={48} style={{ color: '#6BA3BE', marginBottom: '12px' }} />
                    <p style={{ margin: 0, color: '#6BA3BE', fontSize: '0.875rem' }}>
                      No COR uploaded yet
                    </p>
                  </div>
                )}

                {/* Upload/Update COR Section - Only show if new semester activated (not verified) */}
                {(user?.semesterVerified || user?.semester_verified) !== 1 && (
                  <div style={{
                    padding: '16px',
                    background: 'rgba(12,150,156,0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(12,150,156,0.2)'
                  }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      color: '#0A7075',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaCamera size={14} />
                      {corImage ? 'Update COR' : 'Upload COR'}
                    </div>

                    {corPreview && (
                      <div style={{
                        marginBottom: '12px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        maxHeight: '200px'
                      }}>
                        <img 
                          src={corPreview} 
                          alt="COR Preview" 
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            background: '#f9fafb'
                          }}
                        />
                      </div>
                    )}

                    <input
                      type="file"
                      id="corImageUpload"
                      accept="image/*"
                      onChange={handleCorImageChange}
                      style={{ display: 'none' }}
                    />

                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                      <label
                        htmlFor="corImageUpload"
                        style={{
                          padding: '10px 16px',
                          background: 'white',
                          color: '#0C969C',
                          border: '2px solid #0C969C',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          display: 'block'
                        }}
                      >
                        📁 Choose COR Image
                      </label>

                      {newCorImage && (
                        <button
                          onClick={handleUploadCor}
                          disabled={uploadingCor}
                          style={{
                            padding: '10px 16px',
                            background: uploadingCor ? '#9CA3AF' : 'linear-gradient(135deg, #0C969C, #0A7075)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: uploadingCor ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(12,150,156,0.24)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {uploadingCor ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              Uploading...
                            </>
                          ) : (
                            <>
                              📤 Upload COR
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <p style={{
                      margin: '12px 0 0',
                      fontSize: '0.7rem',
                      color: '#6BA3BE',
                      textAlign: 'center'
                    }}>
                      Max file size: 5MB. Supported formats: JPG, PNG
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Forms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Personal Information Form */}
              {!passwordMode && (
                <div style={{
                  background: 'rgba(255,255,255,0.98)',
                  borderRadius: '16px',
                  padding: isMobile ? '24px' : '32px',
                  boxShadow: '0 18px 40px rgba(12,150,156,0.12)',
                  border: '1px solid rgba(12,150,156,0.08)'
                }}>
                  <h5 style={{ margin: '0 0 24px', color: '#0A7075', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaUser size={18} />
                    Personal Information
                  </h5>
                  
                  <form onSubmit={handleUpdateProfile}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: editMode ? '2px solid #6BA3BE' : '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            background: editMode ? 'white' : '#F9FAFB',
                            color: '#0A7075',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                          Middle Name
                        </label>
                        <input
                          type="text"
                          name="middle_name"
                          value={formData.middle_name}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: editMode ? '2px solid #6BA3BE' : '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            background: editMode ? 'white' : '#F9FAFB',
                            color: '#0A7075',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: editMode ? '2px solid #6BA3BE' : '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            background: editMode ? 'white' : '#F9FAFB',
                            color: '#0A7075',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                          <FaEnvelope size={14} style={{ marginRight: '6px' }} />
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: editMode ? '2px solid #6BA3BE' : '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            background: editMode ? 'white' : '#F9FAFB',
                            color: '#0A7075',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                          <FaPhone size={14} style={{ marginRight: '6px' }} />
                          Contact Number
                        </label>
                        <input
                          type="text"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: editMode ? '2px solid #6BA3BE' : '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            background: editMode ? 'white' : '#F9FAFB',
                            color: '#0A7075',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                          <FaUniversity size={14} style={{ marginRight: '6px' }} />
                          Department *
                        </label>
                        <select
                          name="department_id"
                          value={formData.department_id}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: editMode ? '2px solid #6BA3BE' : '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            background: editMode ? 'white' : '#F9FAFB',
                            color: '#0A7075',
                            outline: 'none',
                            transition: 'all 0.2s',
                            cursor: editMode ? 'pointer' : 'default'
                          }}
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept.department_id} value={dept.department_id}>
                              {dept.department_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formData.position === 'Student' && (
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                            <FaIdCard size={14} style={{ marginRight: '6px' }} />
                            Student ID *
                          </label>
                          <input
                            type="text"
                            name="student_id"
                            value={formData.student_id}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            required
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              border: editMode ? '2px solid #6BA3BE' : '1px solid #E5E7EB',
                              borderRadius: '8px',
                              fontSize: '0.95rem',
                              background: editMode ? 'white' : '#F9FAFB',
                              color: '#0A7075',
                              outline: 'none',
                              transition: 'all 0.2s'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                            <FaGraduationCap size={14} style={{ marginRight: '6px' }} />
                            Year Level
                          </label>
                          <select
                            name="year_level"
                            value={formData.year_level}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              border: editMode ? '2px solid #6BA3BE' : '1px solid #E5E7EB',
                              borderRadius: '8px',
                              fontSize: '0.95rem',
                              background: editMode ? 'white' : '#F9FAFB',
                              color: '#0A7075',
                              outline: 'none',
                              transition: 'all 0.2s',
                              cursor: editMode ? 'pointer' : 'default'
                            }}
                          >
                            <option value="">Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="5th Year">5th Year</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {formData.position !== 'Student' && formData.position && (
                      <div style={{ marginTop: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                          <FaIdCard size={14} style={{ marginRight: '6px' }} />
                          Faculty ID *
                        </label>
                        <input
                          type="text"
                          name="faculty_id"
                          value={formData.faculty_id}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          required
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: editMode ? '2px solid #6BA3BE' : '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            background: editMode ? 'white' : '#F9FAFB',
                            color: '#0A7075',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                    )}

                    {editMode && (
                      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          style={{
                            padding: '12px 24px',
                            background: 'transparent',
                            color: '#6BA3BE',
                            border: '2px solid #6BA3BE',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <FaTimes size={16} />
                          Cancel
                        </button>
                        
                        <button
                          type="submit"
                          disabled={saving}
                          style={{
                            padding: '12px 24px',
                            background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0C969C, #0A7075)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(12,150,156,0.24)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave size={16} />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Change Password Card */}
              <div style={{
                background: 'rgba(255,255,255,0.98)',
                borderRadius: '16px',
                padding: isMobile ? '24px' : '32px',
                boxShadow: '0 18px 40px rgba(12,150,156,0.12)',
                border: '1px solid rgba(12,150,156,0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: passwordMode ? '24px' : '0' }}>
                  <h5 style={{ margin: 0, color: '#0A7075', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaLock size={18} />
                    Change Password
                  </h5>
                  
                  {!passwordMode && !editMode && (
                    <button
                      onClick={() => setPasswordMode(true)}
                      style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: '#0C969C',
                        border: '2px solid #0C969C',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Update Password
                    </button>
                  )}
                </div>

                {passwordMode && (
                  <form onSubmit={handleUpdatePassword}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                          Current Password *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="current_password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            required
                            style={{
                              width: '100%',
                              padding: '10px 40px 10px 14px',
                              border: '2px solid #6BA3BE',
                              borderRadius: '8px',
                              fontSize: '0.95rem',
                              background: 'white',
                              color: '#0A7075',
                              outline: 'none',
                              transition: 'all 0.2s'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6BA3BE',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                            New Password *
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="new_password"
                              value={passwordData.new_password}
                              onChange={handlePasswordChange}
                              required
                              minLength={8}
                              style={{
                                width: '100%',
                                padding: '10px 40px 10px 14px',
                                border: '2px solid #6BA3BE',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                background: 'white',
                                color: '#0A7075',
                                outline: 'none',
                                transition: 'all 0.2s'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6BA3BE',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                          </div>
                          <small style={{ display: 'block', marginTop: '4px', color: '#6BA3BE', fontSize: '0.75rem' }}>
                            Minimum 8 characters
                          </small>
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A7075', marginBottom: '6px' }}>
                            Confirm New Password *
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirm_password"
                              value={passwordData.confirm_password}
                              onChange={handlePasswordChange}
                              required
                              style={{
                                width: '100%',
                                padding: '10px 40px 10px 14px',
                                border: '2px solid #6BA3BE',
                                borderRadius: '8px',
                                fontSize: '0.95rem',
                                background: 'white',
                                color: '#0A7075',
                                outline: 'none',
                                transition: 'all 0.2s'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6BA3BE',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordMode(false);
                          setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                        }}
                        disabled={saving}
                        style={{
                          padding: '12px 24px',
                          background: 'transparent',
                          color: '#6BA3BE',
                          border: '2px solid #6BA3BE',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FaTimes size={16} />
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          padding: '12px 24px',
                          background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #0C969C, #0A7075)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: saving ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(12,150,156,0.24)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <FaSave size={16} />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COR Full Size Modal */}
      {showCorModal && corImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px 20px',
            overflowY: 'auto',
            cursor: 'zoom-out'
          }}
          onClick={() => setShowCorModal(false)}
        >
          <button
            onClick={() => setShowCorModal(false)}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              zIndex: 10001,
              backdropFilter: 'blur(4px)'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.35)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <FaTimes />
          </button>

          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            width: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={corImage} 
              alt="Certificate of Registration - Full Size" 
              style={{
                width: 'auto',
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                cursor: 'default',
                display: 'block'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            
            <div style={{
              marginTop: '16px',
              marginBottom: '20px',
              color: 'white',
              fontSize: '0.875rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '10px 20px',
              borderRadius: '20px',
              backdropFilter: 'blur(4px)'
            }}>
              Certificate of Registration
            </div>
          </div>
        </div>
      )}
    </div>
  );
}