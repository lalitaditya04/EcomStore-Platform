import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const SellerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [profileData, setProfileData] = useState({
    // Basic Information
    fullName: user?.name || '',
    email: user?.email || '',
    phoneNumber: '',
    
    // Business Information
    businessName: '',
    businessType: 'individual',
    businessPAN: '',
    gstin: '',
    businessRegCertificate: null,
    
    // Banking Information
    bankAccountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    cancelledCheque: null,
    
    // Pickup Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    pickupContactNumber: '',
    
    // Additional Information
    aadharNumber: '',
    msmeRegistration: '',
    returnAddressSame: true,
    returnAddressLine1: '',
    returnAddressLine2: '',
    returnCity: '',
    returnState: '',
    returnPincode: ''
  });

  useEffect(() => {
    // Redirect if not a seller
    if (user && user.role !== 'seller') {
      navigate('/dashboard');
    }
    
    // Load existing profile data if available
    fetchSellerProfile();
  }, [user, navigate]);

  const fetchSellerProfile = async () => {
    try {
      const response = await api.get('/users/seller-profile');
      if (response.data.profile) {
        setProfileData(prev => ({ ...prev, ...response.data.profile }));
      }
    } catch (error) {
      // Profile doesn't exist yet, which is fine for first-time setup
      console.log('No existing profile found');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setProfileData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (type === 'checkbox') {
      setProfileData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return profileData.fullName && profileData.phoneNumber;
      case 2:
        return profileData.businessName && profileData.businessType && profileData.businessPAN;
      case 3:
        return profileData.bankAccountNumber && profileData.accountHolderName && profileData.ifscCode;
      case 4:
        return profileData.addressLine1 && profileData.city && profileData.state && profileData.pincode;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      
      // Append all form data
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== '') {
          if (key === 'businessRegCertificate' || key === 'cancelledCheque') {
            if (profileData[key]) {
              formData.append(key, profileData[key]);
            }
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });

      const response = await api.post('/users/seller-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Seller profile submitted successfully! Your account is under review.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting profile');
    }
    setLoading(false);
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h3 className="step-title">Basic Information</h3>
      
      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input
          type="text"
          name="fullName"
          value={profileData.fullName}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email Address *</label>
        <input
          type="email"
          name="email"
          value={profileData.email}
          className="form-control"
          disabled
        />
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number *</label>
        <input
          type="tel"
          name="phoneNumber"
          value={profileData.phoneNumber}
          onChange={handleChange}
          className="form-control"
          placeholder="+91 XXXXXXXXXX"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3 className="step-title">Business Information</h3>
      
      <div className="form-group">
        <label className="form-label">Business/Company Name *</label>
        <input
          type="text"
          name="businessName"
          value={profileData.businessName}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Business Type *</label>
        <select
          name="businessType"
          value={profileData.businessType}
          onChange={handleChange}
          className="form-control"
          required
        >
          <option value="individual">Individual</option>
          <option value="sole_proprietor">Sole Proprietor</option>
          <option value="partnership">Partnership</option>
          <option value="private_ltd">Private Limited</option>
          <option value="llp">LLP</option>
          <option value="others">Others</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Business PAN *</label>
        <input
          type="text"
          name="businessPAN"
          value={profileData.businessPAN}
          onChange={handleChange}
          className="form-control"
          placeholder="ABCDE1234F"
          maxLength="10"
          style={{ textTransform: 'uppercase' }}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">GSTIN (if applicable)</label>
        <input
          type="text"
          name="gstin"
          value={profileData.gstin}
          onChange={handleChange}
          className="form-control"
          placeholder="22AAAAA0000A1Z5"
          maxLength="15"
          style={{ textTransform: 'uppercase' }}
        />
        <small className="form-text">Required if annual turnover exceeds ₹40 lakhs</small>
      </div>

      <div className="form-group">
        <label className="form-label">Business Registration Certificate (Optional)</label>
        <input
          type="file"
          name="businessRegCertificate"
          onChange={handleChange}
          className="form-control"
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <small className="form-text">Upload PDF, JPG, or PNG (Max 5MB)</small>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3 className="step-title">Banking Information</h3>
      
      <div className="form-group">
        <label className="form-label">Bank Account Number *</label>
        <input
          type="text"
          name="bankAccountNumber"
          value={profileData.bankAccountNumber}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Account Holder's Name *</label>
        <input
          type="text"
          name="accountHolderName"
          value={profileData.accountHolderName}
          onChange={handleChange}
          className="form-control"
          placeholder="Should match seller's or business name"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">IFSC Code *</label>
        <input
          type="text"
          name="ifscCode"
          value={profileData.ifscCode}
          onChange={handleChange}
          className="form-control"
          placeholder="ABCD0123456"
          maxLength="11"
          style={{ textTransform: 'uppercase' }}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Cancelled Cheque / Bank Passbook Photo</label>
        <input
          type="file"
          name="cancelledCheque"
          onChange={handleChange}
          className="form-control"
          accept=".jpg,.jpeg,.png,.pdf"
        />
        <small className="form-text">Upload clear photo of cancelled cheque or bank passbook</small>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h3 className="step-title">Pickup/Warehouse Address</h3>
      
      <div className="form-group">
        <label className="form-label">Address Line 1 *</label>
        <input
          type="text"
          name="addressLine1"
          value={profileData.addressLine1}
          onChange={handleChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Address Line 2</label>
        <input
          type="text"
          name="addressLine2"
          value={profileData.addressLine2}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">City *</label>
          <input
            type="text"
            name="city"
            value={profileData.city}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">State *</label>
          <input
            type="text"
            name="state"
            value={profileData.state}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={profileData.pincode}
            onChange={handleChange}
            className="form-control"
            maxLength="6"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Landmark</label>
        <input
          type="text"
          name="landmark"
          value={profileData.landmark}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Contact Number at Pickup Location</label>
        <input
          type="tel"
          name="pickupContactNumber"
          value={profileData.pickupContactNumber}
          onChange={handleChange}
          className="form-control"
          placeholder="For delivery personnel queries"
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="form-step">
      <h3 className="step-title">Additional Information</h3>
      
      <div className="form-group">
        <label className="form-label">Aadhar Number (Optional)</label>
        <input
          type="text"
          name="aadharNumber"
          value={profileData.aadharNumber}
          onChange={handleChange}
          className="form-control"
          placeholder="XXXX XXXX XXXX"
          maxLength="12"
        />
        <small className="form-text">For KYC verification</small>
      </div>

      <div className="form-group">
        <label className="form-label">MSME/Udyam Registration Number (Optional)</label>
        <input
          type="text"
          name="msmeRegistration"
          value={profileData.msmeRegistration}
          onChange={handleChange}
          className="form-control"
          placeholder="UDYAM-XX-00-0000000"
        />
      </div>

      <div className="form-group">
        <label className="form-check">
          <input
            type="checkbox"
            name="returnAddressSame"
            checked={profileData.returnAddressSame}
            onChange={handleChange}
            className="form-check-input"
          />
          <span className="form-check-label">Return address same as pickup address</span>
        </label>
      </div>

      {!profileData.returnAddressSame && (
        <div className="return-address-section">
          <h4>Return Address (if different)</h4>
          
          <div className="form-group">
            <label className="form-label">Return Address Line 1</label>
            <input
              type="text"
              name="returnAddressLine1"
              value={profileData.returnAddressLine1}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Return Address Line 2</label>
            <input
              type="text"
              name="returnAddressLine2"
              value={profileData.returnAddressLine2}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Return City</label>
              <input
                type="text"
                name="returnCity"
                value={profileData.returnCity}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Return State</label>
              <input
                type="text"
                name="returnState"
                value={profileData.returnState}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Return Pincode</label>
              <input
                type="text"
                name="returnPincode"
                value={profileData.returnPincode}
                onChange={handleChange}
                className="form-control"
                maxLength="6"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
      <div className="seller-profile-container">
        <div className="profile-header">
          <h1>Complete Your Seller Profile</h1>
          <p>Please provide the following information to start selling on our platform</p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          {[1, 2, 3, 4, 5].map(step => (
            <div
              key={step}
              className={`progress-step ${currentStep >= step ? 'active' : ''}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-name">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Business'}
                {step === 3 && 'Banking'}
                {step === 4 && 'Address'}
                {step === 5 && 'Additional'}
              </div>
            </div>
          ))}
        </div>

        <form className="seller-profile-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
              >
                Previous
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Submitting...' : 'Submit Profile'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProfile;
