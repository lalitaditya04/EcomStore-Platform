const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/seller-docs/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
    }
  }
});

// Create seller profile directory if it doesn't exist
const fs = require('fs');
const uploadsDir = 'uploads/seller-docs/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get seller profile
router.get('/seller-profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Seller role required.' });
    }

    const sellerProfile = await SellerProfile.findOne({ user: req.user._id });
    
    if (!sellerProfile) {
      return res.json({ profile: null, message: 'No seller profile found' });
    }

    res.json({ 
      profile: sellerProfile,
      completionPercentage: sellerProfile.getCompletionPercentage(),
      isComplete: sellerProfile.isProfileComplete()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create or update seller profile
router.post('/seller-profile', auth, upload.fields([
  { name: 'businessRegCertificate', maxCount: 1 },
  { name: 'cancelledCheque', maxCount: 1 }
]), async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Seller role required.' });
    }

    const {
      fullName, phoneNumber, businessName, businessType, businessPAN, gstin,
      bankAccountNumber, accountHolderName, ifscCode,
      addressLine1, addressLine2, city, state, pincode, landmark, pickupContactNumber,
      aadharNumber, msmeRegistration, returnAddressSame,
      returnAddressLine1, returnAddressLine2, returnCity, returnState, returnPincode
    } = req.body;

    // Prepare profile data
    const profileData = {
      user: req.user._id,
      fullName,
      phoneNumber,
      businessName,
      businessType,
      businessPAN: businessPAN.toUpperCase(),
      gstin: gstin ? gstin.toUpperCase() : '',
      bankAccountNumber,
      accountHolderName,
      ifscCode: ifscCode.toUpperCase(),
      pickupAddress: {
        addressLine1,
        addressLine2: addressLine2 || '',
        city,
        state,
        pincode,
        landmark: landmark || '',
        contactNumber: pickupContactNumber || ''
      },
      returnAddress: {
        isSameAsPickup: returnAddressSame !== 'false',
        addressLine1: returnAddressSame === 'false' ? returnAddressLine1 : '',
        addressLine2: returnAddressSame === 'false' ? returnAddressLine2 : '',
        city: returnAddressSame === 'false' ? returnCity : '',
        state: returnAddressSame === 'false' ? returnState : '',
        pincode: returnAddressSame === 'false' ? returnPincode : ''
      },
      aadharNumber: aadharNumber || '',
      msmeRegistration: msmeRegistration || ''
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.businessRegCertificate) {
        profileData.businessRegCertificate = req.files.businessRegCertificate[0].path;
      }
      if (req.files.cancelledCheque) {
        profileData.cancelledCheque = req.files.cancelledCheque[0].path;
      }
    }

    // Check if profile exists
    let sellerProfile = await SellerProfile.findOne({ user: req.user._id });

    if (sellerProfile) {
      // Update existing profile
      Object.assign(sellerProfile, profileData);
      
      // Update status to pending if profile is complete
      if (sellerProfile.isProfileComplete()) {
        sellerProfile.profileStatus = 'pending';
      }
      
      await sellerProfile.save();
    } else {
      // Create new profile
      sellerProfile = new SellerProfile(profileData);
      
      // Set status to pending if profile is complete
      if (sellerProfile.isProfileComplete()) {
        sellerProfile.profileStatus = 'pending';
      }
      
      await sellerProfile.save();
    }

    res.json({
      message: 'Seller profile saved successfully',
      profile: sellerProfile,
      completionPercentage: sellerProfile.getCompletionPercentage(),
      isComplete: sellerProfile.isProfileComplete()
    });

  } catch (error) {
    console.error('Seller profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get seller profile status
router.get('/seller-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Seller role required.' });
    }

    const sellerProfile = await SellerProfile.findOne({ user: req.user._id });
    
    if (!sellerProfile) {
      return res.json({ 
        hasProfile: false,
        status: 'no_profile',
        message: 'Please complete your seller profile'
      });
    }

    res.json({
      hasProfile: true,
      status: sellerProfile.profileStatus,
      completionPercentage: sellerProfile.getCompletionPercentage(),
      isComplete: sellerProfile.isProfileComplete(),
      verificationStatus: sellerProfile.verificationStatus,
      rejectionReason: sellerProfile.rejectionReason || '',
      canSell: sellerProfile.profileStatus === 'approved'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;