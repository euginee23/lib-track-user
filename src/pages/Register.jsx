import React, { useState, useEffect } from "react";
import { registerUser } from "../../api/registration/user_registration";
import { fetchDepartments } from "../../api/registration/get_departments";
import {
  FaEye,
  FaEyeSlash,
  FaCamera,
  FaTrash,
  FaFolder,
  FaFileImage,
} from "react-icons/fa";
import ToastNotification from "../components/ToastNotification";
import { useNavigate } from "react-router-dom";
import Camera from "../components/Camera";

const palette = {
  darkest: "#031716",
  darkTeal: "#032F30",
  teal: "#0A7075",
  midTeal: "#0C969C",
  lightBlue: "#6BA3BE",
  blueGray: "#274D60",
};

export default function Register() {
  const [userType, setUserType] = useState("student");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [college, setCollege] = useState("");
  const [position, setPosition] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [corImage, setCorImage] = useState(null);
  const [corImagePreview, setCorImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  // Cleanup function to revoke object URLs and prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup image URLs when component unmounts
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
      if (corImagePreview && corImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(corImagePreview);
      }
    };
  }, [profileImagePreview, corImagePreview]);

  const facultyPositions = ["Regular", "Visiting Lecturer"];

  useEffect(() => {
    async function loadDepartments() {
      try {
        const fetchedDepartments = await fetchDepartments();
        setDepartments(fetchedDepartments);
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    }

    loadDepartments();
  }, []);

  function handleStudentIdChange(e) {
    let value = e.target.value.replace(/[^0-9]/g, "");

    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4);
    }

    setStudentId(value);
  }

  function handleFacultyIdChange(e) {
    let value = e.target.value.replace(/[^0-9]/g, "");

    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    setFacultyId(value);
  }

  function handleContactNumberChange(e) {
    let value = e.target.value.replace(/[^0-9]/g, "");

    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    setContactNumber(value);
  }

  function handleCollegeChange(e) {
    const selectedValue = e.target.value;
    setCollege(selectedValue);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const missingFields = [];

    if (!firstName) missingFields.push("First Name");
    if (!middleName) missingFields.push("Middle Name");
    if (!lastName) missingFields.push("Last Name");
    if (!email) missingFields.push("Email");
    if (!contactNumber) missingFields.push("Contact Number");
    if (!college) missingFields.push("College/Department");
    if (!password) missingFields.push("Password");
    if (!confirmPassword) missingFields.push("Confirm Password");

    if (userType === "student") {
      if (!studentId) missingFields.push("Student ID");
      if (!yearLevel) missingFields.push("Year Level");
      if (!corImage) missingFields.push("Photo of your COR");
      if (!profileImage) missingFields.push("Profile Picture");
    } else {
      if (!facultyId) missingFields.push("Faculty ID");
      if (!position) missingFields.push("Position");
      if (!profileImage) missingFields.push("Profile Picture");
    }

    if (missingFields.length > 0) {
      ToastNotification.error(
        `Please fill in the following fields: ${missingFields.join(", ")}`
      );
      return;
    }

    if (password !== confirmPassword) {
      ToastNotification.error("Passwords do not match.");
      return;
    }

    // POSITION BASED ON USER TYPE
    const finalPosition = userType === "student" ? "Student" : position;

    const user = {
      firstName,
      middleName,
      lastName,
      email,
      contactNumber,
      college,
      position: finalPosition,
      password,
      profileImage,
      ...(userType === "student"
        ? {
            studentId,
            yearLevel,
            corImage,
          }
        : {
            facultyId,
          }),
    };

    setLoading(true);
    try {
      const response = await registerUser(user);
      ToastNotification.success(response.message);
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);

      if (error.message.startsWith("Conflicts:")) {
        const conflictFields = error.message
          .replace("Conflicts: ", "")
          .split(", ");
        const conflictMessages = conflictFields.map((field) => {
          switch (field) {
            case "email":
              return "Email Address already used.";
            case "student_id":
              return "The Student ID already registered.";
            case "contact_number":
              return "Contact number already registered.";
            default:
              return "An unknown conflict occurred.";
          }
        });
        ToastNotification.error(conflictMessages.join(" "));
      } else {
        ToastNotification.error(
          error.message || "An error occurred during registration."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e, imageType) {
    const file = e.target.files[0];
    console.log('🔄 Image selection started:', {
      hasFile: !!file,
      imageType: imageType,
      timestamp: new Date().toISOString()
    });
    
    if (file) {
      console.log('📁 File selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        imageType: imageType
      });

      // Check file size (10MB limit - increased for mobile photos)
      if (file.size > 10 * 1024 * 1024) {
        console.error('❌ File too large:', file.size);
        ToastNotification.error('File size must be less than 10MB');
        return;
      }

      // Enhanced image type detection
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      
      console.log('🔍 File analysis:', {
        fileName: fileName,
        fileType: fileType,
        hasType: !!file.type
      });
      
      // Support more image formats and extensions
      const supportedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
        'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml'
      ];
      
      const supportedExtensions = [
        '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', 
        '.heic', '.heif', '.tiff', '.tif', '.svg'
      ];
      
      // Check if it's HEIC/HEIF (special handling needed)
      const isHeicOrHeif = fileType.includes('heic') || fileType.includes('heif') || 
                           fileName.endsWith('.heic') || fileName.endsWith('.heif');
      
      // Check if file extension is supported
      const hasValidExtension = supportedExtensions.some(ext => fileName.endsWith(ext));
      
      // Check if MIME type is supported or if it's a special case
      const hasValidMimeType = supportedMimeTypes.includes(fileType);
      
      // Allow files with no MIME type but valid extension (common on mobile)
      const isValidFile = hasValidMimeType || hasValidExtension || isHeicOrHeif || !fileType;

      console.log('✅ File validation:', {
        isHeicOrHeif: isHeicOrHeif,
        hasValidExtension: hasValidExtension,
        hasValidMimeType: hasValidMimeType,
        isValidFile: isValidFile
      });

      if (!isValidFile) {
        console.error('❌ Invalid file type:', {
          fileName: fileName,
          fileType: fileType,
          supportedMimeTypes: supportedMimeTypes,
          supportedExtensions: supportedExtensions
        });
        ToastNotification.error('Please select a valid image file (JPEG, PNG, WEBP, HEIC, HEIF, etc.)');
        return;
      }

      console.log('🚀 Starting image processing...');
      // Use enhanced processing for all uploads to ensure compatibility
      processImageFile(file, imageType);
    } else {
      console.log('❌ No file selected');
    }
  }

  function processImageFile(file, imageType) {
    // Log detailed file information for debugging
    console.log('🔄 Processing image file:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      lastModified: file.lastModified,
      imageType: imageType,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // Always use the robust image processing method
    const reader = new FileReader();
    
    reader.onload = function(e) {
      console.log('📖 FileReader onload triggered, result length:', e.target.result?.length);
      
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
          console.log('🖼️ Image loaded successfully:', {
            width: img.width,
            height: img.height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          });
          
          try {
            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              console.error('❌ Failed to get canvas context');
              useOriginalFile(file, imageType);
              return;
            }
            
            // Calculate optimal dimensions (max 1920x1920)
            let { width, height } = img;
            const maxSize = 1920;
            const originalDimensions = { width, height };
            
            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = (height * maxSize) / width;
                width = maxSize;
              } else {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            console.log('📐 Canvas dimensions:', {
              original: originalDimensions,
              resized: { width, height }
            });
            
            canvas.width = width;
            canvas.height = height;
            
            // Fill with white background for better JPEG conversion
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            
            // Draw image
            ctx.drawImage(img, 0, 0, width, height);
            
            console.log('🎨 Image drawn to canvas, attempting to convert to blob...');
            
            // Convert to JPEG blob with high quality
            canvas.toBlob((blob) => {
              if (blob) {
                console.log('✅ Blob created successfully:', {
                  size: blob.size,
                  type: blob.type
                });
                
                // Create a proper filename
                const originalName = file.name || 'image';
                const fileName = originalName.replace(/\.(heic|heif|png|webp|gif|bmp|tiff|tif|svg)$/i, '.jpg');
                
                const convertedFile = new File([blob], fileName, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                
                // Create preview URL
                const previewUrl = URL.createObjectURL(blob);
                
                console.log('🔗 Preview URL created:', previewUrl);
                
                // Set the image based on type
                if (imageType === "cor") {
                  // Clean up previous image
                  if (corImagePreview && corImagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(corImagePreview);
                  }
                  setCorImage(convertedFile);
                  setCorImagePreview(previewUrl);
                  console.log('✅ COR image set successfully');
                } else if (imageType === "profile") {
                  // Clean up previous image
                  if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
                    URL.revokeObjectURL(profileImagePreview);
                  }
                  setProfileImage(convertedFile);
                  setProfileImagePreview(previewUrl);
                  console.log('✅ Profile image set successfully');
                }
              } else {
                console.error('❌ Failed to create blob from canvas');
                ToastNotification.error('Failed to process image. Please try again.');
                useOriginalFile(file, imageType);
              }
            }, 'image/jpeg', 0.85);
            
          } catch (canvasError) {
            console.error('❌ Canvas processing error:', {
              error: canvasError,
              message: canvasError.message,
              stack: canvasError.stack
            });
            // Fallback: use original file
            useOriginalFile(file, imageType);
          }
        };
        
        img.onerror = function(imgError) {
          console.error('❌ Image load error:', {
            error: imgError,
            src: img.src?.substring(0, 100) + '...',
            fileType: file.type,
            fileName: file.name
          });
          // Fallback: use original file
          useOriginalFile(file, imageType);
        };
        
        // Set image source
        img.src = e.target.result;
        console.log('🔗 Image src set, waiting for load...');
        
      } catch (error) {
        console.error('❌ Image processing error:', {
          error: error,
          message: error.message,
          stack: error.stack,
          fileType: file.type,
          fileName: file.name
        });
        useOriginalFile(file, imageType);
      }
    };
    
    reader.onerror = function(readerError) {
      console.error('❌ FileReader error:', {
        error: readerError,
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size
      });
      ToastNotification.error('Failed to read the image file. Please try a different image.');
    };
    
    console.log('📖 Starting FileReader...');
    // Read file as data URL
    reader.readAsDataURL(file);
  }



  function useOriginalFile(file, imageType) {
    // Last resort: use the original file as-is
    console.log('🔄 Using original file as fallback:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      imageType: imageType
    });
    
    try {
      const previewUrl = URL.createObjectURL(file);
      console.log('🔗 Original file preview URL created:', previewUrl);
      
      if (imageType === "cor") {
        if (corImagePreview && corImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(corImagePreview);
        }
        setCorImage(file);
        setCorImagePreview(previewUrl);
        console.log('✅ Original COR file set successfully');
      } else if (imageType === "profile") {
        if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(profileImagePreview);
        }
        setProfileImage(file);
        setProfileImagePreview(previewUrl);
        console.log('✅ Original profile file set successfully');
      }
    } catch (error) {
      console.error('❌ Fallback file processing error:', {
        error: error,
        message: error.message,
        stack: error.stack,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      ToastNotification.error('Unable to process this image. Please try a different image.');
    }
  }





  function handleCameraCapture(file, imageUrl) {
    setProfileImage(file);
    setProfileImagePreview(imageUrl);
  }

  function handleRemoveProfileImage() {
    // Clean up the existing image URL to prevent memory leaks
    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview);
    }
    setProfileImage(null);
    setProfileImagePreview(null);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        overflow: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${palette.lightBlue} 0%, ${palette.midTeal} 50%, ${palette.teal} 100%)`,
        padding: "1rem",
        boxSizing: "border-box",
        paddingBottom: "3rem",
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: auto;
        }
        .register-card {
          background: rgba(255,255,255,0.95);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44,62,80,0.15);
          padding: 1.5rem;
          width: 100%;
          max-width: 350px;
          backdrop-filter: blur(12px);
          margin: auto;
        }
        .register-title {
          color: ${palette.darkest};
          font-weight: 700;
          font-size: 1.4rem;
          margin-bottom: 0.3rem;
          letter-spacing: 0.5px;
          text-align: center;
        }
        .register-desc {
          color: ${palette.blueGray};
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .register-label {
          color: ${palette.darkTeal};
          font-size: 0.9rem;
          margin-bottom: 0.3rem;
          font-weight: 500;
          display: block;
        }
        .input-container {
          position: relative;
          margin-bottom: 1rem;
        }
        .register-input {
          width: 100%;
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          border: 1.5px solid ${palette.midTeal};
          background: #f9fbfc;
          color: ${palette.darkest};
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .register-input:focus {
          border-color: ${palette.teal};
        }
        .image-upload-container {
          border: 2px dashed ${palette.midTeal};
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          background: #f9fbfc;
          cursor: pointer;
          transition: border-color 0.2s;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image-upload-container:hover {
          border-color: ${palette.teal};
        }
        .image-upload-container.has-image {
          border: 2px solid ${palette.teal};
        }
        .image-upload-input {
          position: absolute;
          left: -9999px;
          width: 1px;
          height: 1px;
          opacity: 0;
        }
        .image-preview {
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
          margin-top: 0.5rem;
        }
        .upload-text {
          color: ${palette.blueGray};
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .upload-hint {
          color: ${palette.blueGray};
          font-size: 0.8rem;
        }
        .password-input {
          padding-right: 2.5rem;
        }
        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: ${palette.blueGray};
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .password-toggle:hover {
          color: ${palette.teal};
        }
        .register-btn {
          width: 100%;
          padding: 0.75rem 0;
          background: linear-gradient(90deg, ${palette.teal} 0%, ${palette.midTeal} 100%);
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(44,62,80,0.10);
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .register-btn:hover {
          background: linear-gradient(90deg, ${palette.midTeal} 0%, ${palette.teal} 100%);
          transform: translateY(-1px);
        }
        .user-type-selector {
          display: flex;
          background: #f9fbfc;
          border-radius: 8px;
          border: 1.5px solid ${palette.midTeal};
          margin-bottom: 1.5rem;
          overflow: hidden;
        }
        .user-type-option {
          flex: 1;
          padding: 0.75rem;
          text-align: center;
          cursor: pointer;
          background: transparent;
          border: none;
          color: ${palette.blueGray};
          font-weight: 500;
          transition: all 0.2s;
        }
        .user-type-option.active {
          background: ${palette.teal};
          color: white;
        }
        .user-type-option:hover:not(.active) {
          background: rgba(12, 150, 156, 0.1);
        }
        .select-input {
          width: 100%;
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          border: 1.5px solid ${palette.midTeal};
          background: #f9fbfc;
          color: ${palette.darkest};
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .select-input:focus {
          border-color: ${palette.teal};
        }
        .upload-options {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          justify-content: center;
        }
        .camera-btn {
          width: 100%;
          padding: 0.6rem;
          border: 1px solid ${palette.midTeal};
          background: #f9fbfc;
          color: ${palette.darkTeal};
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          transition: all 0.2s;
          font-weight: 500;
        }
        .camera-btn:hover {
          background: ${palette.teal};
          color: white;
          transform: translateY(-1px);
        }
        .login-link {
          text-align: center;
          font-size: 0.9rem;
          color: ${palette.blueGray};
        }
        .login-link a {
          color: ${palette.teal};
          text-decoration: none;
          font-weight: 600;
        }
        .login-link a:hover {
          text-decoration: underline;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: ${palette.lightBlue};
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 480px) {
          .register-card {
            padding: 1.25rem;
            margin: 0.5rem;
            border-radius: 12px;
          }
          .register-title {
            font-size: 1.3rem;
          }
          .register-desc {
            font-size: 0.85rem;
            margin-bottom: 1.25rem;
          }
          .register-input, .select-input {
            padding: 0.5rem 0.7rem;
            font-size: 16px; /* Prevents zoom on iOS */
            -webkit-appearance: none;
            appearance: none;
          }
          .password-input {
            padding-right: 2.3rem;
          }
          .password-toggle {
            right: 0.7rem;
            font-size: 1.1rem;
          }
          .image-upload-container {
            min-height: 150px;
            padding: 0.75rem;
          }
          .image-preview {
            max-height: 150px;
          }
          .camera-btn {
            font-size: 0.8rem;
            padding: 0.6rem;
          }
        }
        @media (max-height: 600px) {
          .register-card {
            padding: 1rem;
          }
          .register-title {
            font-size: 1.2rem;
            margin-bottom: 0.2rem;
          }
          .register-desc {
            font-size: 0.8rem;
            margin-bottom: 1rem;
          }
          .input-container {
            margin-bottom: 0.8rem;
          }
          .register-btn {
            margin-bottom: 0.8rem;
          }
        }
        @media (min-width: 768px) {
          .register-card {
            max-width: 500px; /* Increased width for desktop */
            padding: 2rem; /* Adjusted padding for larger screens */
          }
          .register-title {
            font-size: 1.8rem; /* Larger font size for desktop */
          }
          .register-desc {
            font-size: 1rem; /* Adjusted font size */
          }
          .register-input {
            font-size: 1.1rem; /* Larger input text */
          }
          .register-btn {
            font-size: 1.1rem; /* Adjusted button text size */
          }
        }
      `}</style>
      <form className="register-card" onSubmit={handleSubmit}>
        <div className="register-title">Create Your Account</div>
        <div className="register-desc">Sign up to access Lib-Track</div>

        {/* User Type Selector */}
        <div className="user-type-selector">
          <button
            type="button"
            className={`user-type-option ${
              userType === "student" ? "active" : ""
            }`}
            onClick={() => setUserType("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={`user-type-option ${
              userType === "faculty" ? "active" : ""
            }`}
            onClick={() => setUserType("faculty")}
          >
            Faculty
          </button>
        </div>

        <label className="register-label" htmlFor="firstName">
          First Name
        </label>
        <div className="input-container">
          <input
            className="register-input"
            type="text"
            id="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <label className="register-label" htmlFor="middleName">
          Middle Name
        </label>
        <div className="input-container">
          <input
            className="register-input"
            type="text"
            id="middleName"
            autoComplete="additional-name"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
        </div>

        <label className="register-label" htmlFor="lastName">
          Last Name
        </label>
        <div className="input-container">
          <input
            className="register-input"
            type="text"
            id="lastName"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        {/* Student-specific fields */}
        {userType === "student" && (
          <>
            <label className="register-label" htmlFor="studentId">
              Student ID
            </label>
            <div className="input-container">
              <input
                className="register-input"
                type="text"
                id="studentId"
                value={studentId}
                onChange={handleStudentIdChange}
                placeholder="1234-5678"
              />
            </div>

            <label className="register-label" htmlFor="yearLevel">
              Year Level
            </label>
            <div className="input-container">
              <select
                className="select-input"
                id="yearLevel"
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
              >
                <option value="">Select your year level</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
                <option value="5">Fifth Year</option>
                <option value="6">Sixth Year</option>
                <option value="Graduate">Graduate Student</option>
              </select>
            </div>

            <label className="register-label">Profile Picture</label>
            <div className="input-container">
              <div
                className={`image-upload-container ${
                  profileImagePreview ? "has-image" : ""
                }`}
                onClick={() => document.getElementById("profileImageStudent").click()}
              >
                <input
                  type="file"
                  id="profileImageStudent"
                  className="image-upload-input"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                  onChange={(e) => handleImageChange(e, "profile")}
                />
                {profileImagePreview ? (
                  <div>
                    <img
                      src={profileImagePreview}
                      alt="Profile Preview"
                      className="image-preview"
                    />
                    <div className="upload-hint">Click to change image</div>
                  </div>
                ) : (
                  <div>
                    <div className="upload-text">
                      <FaCamera /> Click to upload your profile picture
                    </div>
                    <div className="upload-hint">PNG, JPG, JPEG, HEIC, HEIF up to 10MB</div>
                  </div>
                )}
              </div>
              <div className="upload-options">
                {profileImagePreview ? (
                  <button
                    type="button"
                    className="camera-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveProfileImage();
                    }}
                    style={{ background: "#dc3545", borderColor: "#dc3545", color: "white" }}
                  >
                    <FaTrash /> Remove Photo
                  </button>
                ) : (
                  <button
                    type="button"
                    className="camera-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCamera(true);
                    }}
                  >
                    <FaCamera /> Take Selfie
                  </button>
                )}
              </div>
            </div>

            <label className="register-label">Upload a photo of your COR</label>
            <div className="input-container">
              <div
                className={`image-upload-container ${
                  corImagePreview ? "has-image" : ""
                }`}
                onClick={() => document.getElementById("corImage").click()}
              >
                <input
                  type="file"
                  id="corImage"
                  className="image-upload-input"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                  onChange={(e) => handleImageChange(e, "cor")}
                />
                {corImagePreview ? (
                  <div>
                    <img
                      src={corImagePreview}
                      alt="COR Preview"
                      className="image-preview"
                    />
                    <div className="upload-hint">Click to change image</div>
                  </div>
                ) : (
                  <div>
                    <div className="upload-text">
                      <FaFileImage /> Click to upload your COR
                    </div>
                    <div className="upload-hint">PNG, JPG, JPEG, HEIC, HEIF up to 10MB</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Faculty-specific fields */}
        {userType === "faculty" && (
          <>
            <label className="register-label" htmlFor="facultyId">
              Faculty ID Number
            </label>
            <div className="input-container">
              <input
                className="register-input"
                type="text"
                id="facultyId"
                value={facultyId}
                onChange={handleFacultyIdChange}
                placeholder="123456"
              />
            </div>

            <label className="register-label" htmlFor="position">
              Position
            </label>
            <div className="input-container">
              <select
                className="select-input"
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value="">Select your position</option>
                {facultyPositions.map((pos, index) => (
                  <option key={index} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <label className="register-label">Profile Picture</label>
            <div className="input-container">
              <div
                className={`image-upload-container ${
                  profileImagePreview ? "has-image" : ""
                }`}
                onClick={() => document.getElementById("profileImageFaculty").click()}
              >
                <input
                  type="file"
                  id="profileImageFaculty"
                  className="image-upload-input"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                  onChange={(e) => handleImageChange(e, "profile")}
                />
                {profileImagePreview ? (
                  <div>
                    <img
                      src={profileImagePreview}
                      alt="Profile Preview"
                      className="image-preview"
                    />
                    <div className="upload-hint">Click to change image</div>
                  </div>
                ) : (
                  <div>
                    <div className="upload-text">
                      <FaCamera /> Click to upload your profile picture
                    </div>
                    <div className="upload-hint">PNG, JPG, JPEG, HEIC, HEIF up to 10MB</div>
                  </div>
                )}
              </div>
              <div className="upload-options">
                {profileImagePreview ? (
                  <button
                    type="button"
                    className="camera-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveProfileImage();
                    }}
                    style={{ background: "#dc3545", borderColor: "#dc3545", color: "white" }}
                  >
                    <FaTrash /> Remove Photo
                  </button>
                ) : (
                  <button
                    type="button"
                    className="camera-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCamera(true);
                    }}
                  >
                    <FaCamera /> Take Selfie
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        <label className="register-label" htmlFor="college">
          College/Department
        </label>
        <div className="input-container">
          <select
            className="select-input"
            id="college"
            value={college}
            onChange={handleCollegeChange}
          >
            <option value="">Select your college</option>
            {departments.map((dept) => (
              <option key={dept.department_id} value={dept.department_id}>
                {dept.department_acronym} - {dept.department_name}
              </option>
            ))}
          </select>
        </div>

        <label className="register-label" htmlFor="contactNumber">
          Contact Number
        </label>
        <div className="input-container">
          <input
            className="register-input"
            type="text"
            id="contactNumber"
            value={contactNumber}
            onChange={handleContactNumberChange}
            placeholder="09123456789"
          />
        </div>

        <hr
          style={{
            margin: "1.5rem 0",
            border: "none",
            borderTop: `1px solid ${palette.midTeal}`,
          }}
        />

        <label className="register-label" htmlFor="email">
          Email
        </label>
        <div className="input-container">
          <input
            className="register-input"
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <label className="register-label" htmlFor="password">
          Password
        </label>
        <div className="input-container">
          <input
            className="register-input password-input"
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <label className="register-label" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <div className="input-container">
          <input
            className="register-input password-input"
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button className="register-btn" type="submit" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Sign Up"}
        </button>

        <div className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </div>
      </form>

      <Camera
        isOpen={showCamera}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    </div>
  );
}
