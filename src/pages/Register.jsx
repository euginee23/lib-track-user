import React, { useState } from "react";
import { registerUser } from "../../api/registration/user_registration";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ToastNotification from "../components/ToastNotification";
import { useNavigate } from "react-router-dom";

const palette = {
  darkest: "#031716",
  darkTeal: "#032F30",
  teal: "#0A7075",
  midTeal: "#0C969C",
  lightBlue: "#6BA3BE",
  blueGray: "#274D60"
};

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [corImage, setCorImage] = useState(null);
  const [corImagePreview, setCorImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  function handleContactNumberChange(e) {
    let value = e.target.value.replace(/[^0-9]/g, "");

    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    setContactNumber(value);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const missingFields = [];

    if (!firstName) missingFields.push("First Name");
    if (!middleName) missingFields.push("Middle Name");
    if (!lastName) missingFields.push("Last Name");
    if (!email) missingFields.push("Email");
    if (!studentId) missingFields.push("Student ID");
    if (!contactNumber) missingFields.push("Contact Number");
    if (!password) missingFields.push("Password");
    if (!confirmPassword) missingFields.push("Confirm Password");
    if (!corImage) missingFields.push("Photo of your COR");

    if (missingFields.length > 0) {
      ToastNotification.error(`Please fill in the following fields: ${missingFields.join(", ")}`);
      return;
    }

    if (password !== confirmPassword) {
      ToastNotification.error("Passwords do not match.");
      return;
    }

    const user = {
      firstName,
      middleName,
      lastName,
      email,
      studentId,
      contactNumber,
      password,
      corImage,
    };

    setLoading(true);
    try {
      const response = await registerUser(user);
      ToastNotification.success(response.message);
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);

      if (error.message.startsWith("Conflicts:")) {
        const conflictFields = error.message.replace("Conflicts: ", "").split(", ");
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
        ToastNotification.error(error.message || "An error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setCorImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCorImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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
        paddingBottom: "3rem"
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
          .register-input {
            padding: 0.5rem 0.7rem;
            font-size: 16px; /* Prevents zoom on iOS */
          }
          .password-input {
            padding-right: 2.3rem;
          }
          .password-toggle {
            right: 0.7rem;
            font-size: 1.1rem;
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
        
        <label className="register-label" htmlFor="firstName">First Name</label>
        <div className="input-container">
          <input
            className="register-input"
            type="text"
            id="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
        </div>

        <label className="register-label" htmlFor="middleName">Middle Name</label>
        <div className="input-container">
          <input
            className="register-input"
            type="text"
            id="middleName"
            autoComplete="additional-name"
            value={middleName}
            onChange={e => setMiddleName(e.target.value)}
          />
        </div>

        <label className="register-label" htmlFor="lastName">Last Name</label>
        <div className="input-container">
          <input
            className="register-input"
            type="text"
            id="lastName"
            autoComplete="family-name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </div>
        
        <label className="register-label" htmlFor="studentId">Student ID</label>
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

        <label className="register-label" htmlFor="contactNumber">Contact Number</label>
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

        <label className="register-label">Upload a photo of your COR</label>
        <div className="input-container">
          <div 
            className={`image-upload-container ${corImagePreview ? 'has-image' : ''}`}
            onClick={() => document.getElementById('corImage').click()}
          >
            <input
              type="file"
              id="corImage"
              className="image-upload-input"
              accept="image/*"
              onChange={handleImageChange}
            />
            {corImagePreview ? (
              <div>
                <img src={corImagePreview} alt="COR Preview" className="image-preview" />
                <div className="upload-hint">Click to change image</div>
              </div>
            ) : (
              <div>
                <div className="upload-text">📄 Click to upload your COR</div>
                <div className="upload-hint">PNG, JPG, JPEG up to 10MB</div>
              </div>
            )}
          </div>
        </div>
        
        <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: `1px solid ${palette.midTeal}` }} />

        <label className="register-label" htmlFor="email">Email</label>
        <div className="input-container">
          <input
            className="register-input"
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <label className="register-label" htmlFor="password">Password</label>
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

        <label className="register-label" htmlFor="confirmPassword">Confirm Password</label>
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
    </div>
  );
}