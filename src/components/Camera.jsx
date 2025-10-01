import React, { useRef, useState, useEffect } from 'react';
import { FaCamera, FaTimes, FaCheck, FaRedo } from 'react-icons/fa';

const Camera = ({ onCapture, onClose, isOpen }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsStreaming(true);
        
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn('Video play failed:', playError);
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please make sure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && isStreaming) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Clear canvas and draw the current video frame
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and create preview URL
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          setCapturedBlob(blob); // Store the blob for later use
        }
      }, 'image/jpeg', 0.9); // Increased quality to 0.9 for better image
    }
  };

  const retakePhoto = async () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setCapturedBlob(null);
    
    stopCamera();

    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const confirmPhoto = () => {
    if (capturedBlob) {
      const file = new File([capturedBlob], 'selfie.jpg', { type: 'image/jpeg' });
      // Create a new URL for the final image to ensure consistency
      const finalImageUrl = URL.createObjectURL(capturedBlob);
      
      // Clean up the previous capturedImage URL since we're creating a new one
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
      
      // Pass both the file and the new image URL to the parent form
      onCapture(file, finalImageUrl);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    
    // Clean up any existing image URLs to prevent memory leaks
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    
    // Reset component state
    setCapturedImage(null);
    setCapturedBlob(null);
    setError(null);
    setIsStreaming(false);
    
    // Call parent's close handler
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    modal: {
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      background: '#0A7075',
      color: 'white'
    },
    headerTitle: {
      margin: 0,
      fontSize: '1.2rem',
      fontWeight: '600'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '1.2rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '300px'
    },
    error: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      flex: 1
    },
    errorText: {
      color: '#dc3545',
      marginBottom: '1rem',
      fontSize: '0.95rem'
    },
    retryBtn: {
      background: '#0A7075',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    cameraView: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1
    },
    video: {
      width: '100%',
      maxWidth: '400px',
      height: 'auto',
      borderRadius: '8px',
      margin: '1rem',
      background: '#000'
    },
    canvas: {
      display: 'none'
    },
    controls: {
      padding: '1rem',
      display: 'flex',
      justifyContent: 'center'
    },
    captureBtn: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: '#0A7075',
      border: '3px solid white',
      color: 'white',
      fontSize: '1.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    },
    captureBtnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    preview: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1rem',
      flex: 1
    },
    capturedImage: {
      maxWidth: '100%',
      maxHeight: '300px',
      borderRadius: '8px',
      marginBottom: '1rem',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    previewControls: {
      display: 'flex',
      gap: '1rem'
    },
    actionBtn: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.95rem'
    },
    retakeBtn: {
      background: '#6c757d',
      color: 'white'
    },
    confirmBtn: {
      background: '#0A7075',
      color: 'white'
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>Take a Selfie</h3>
          <button style={styles.closeBtn} onClick={handleClose}>
            <FaTimes />
          </button>
        </div>
        
        <div style={styles.content}>
          {error ? (
            <div style={styles.error}>
              <p style={styles.errorText}>{error}</p>
              <button style={styles.retryBtn} onClick={startCamera}>
                Try Again
              </button>
            </div>
          ) : !capturedImage ? (
            <div style={styles.cameraView}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={styles.video}
              />
              <canvas ref={canvasRef} style={styles.canvas} />
              
              <div style={styles.controls}>
                <button 
                  style={{
                    ...styles.captureBtn,
                    ...(isStreaming ? {} : styles.captureBtnDisabled)
                  }}
                  onClick={capturePhoto}
                  disabled={!isStreaming}
                >
                  <FaCamera />
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.preview}>
              <img 
                src={capturedImage} 
                alt="Captured selfie" 
                style={styles.capturedImage}
              />
              
              <div style={styles.previewControls}>
                <button 
                  style={{...styles.actionBtn, ...styles.retakeBtn}} 
                  onClick={retakePhoto}
                >
                  <FaRedo /> Retake
                </button>
                <button 
                  style={{...styles.actionBtn, ...styles.confirmBtn}} 
                  onClick={confirmPhoto}
                >
                  <FaCheck /> Use Photo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;