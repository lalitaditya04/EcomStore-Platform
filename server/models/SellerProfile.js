const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  // Business Information
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    required: true,
    enum: ['individual', 'sole_proprietor', 'partnership', 'private_ltd', 'llp', 'others']
  },
  businessPAN: {
    type: String,
    required: true,
    uppercase: true,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  },
  gstin: {
    type: String,
    uppercase: true,
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    default: ''
  },
  businessRegCertificate: {
    type: String, // File path
    default: ''
  },
  
  // Banking Information
  bankAccountNumber: {
    type: String,
    required: true
  },
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  ifscCode: {
    type: String,
    required: true,
    uppercase: true,
    match: /^[A-Z]{4}0[A-Z0-9]{6}$/
  },
  cancelledCheque: {
    type: String, // File path
    default: ''
  },
  
  // Pickup Address
  pickupAddress: {
    addressLine1: {
      type: String,
      required: true,
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/
    },
    landmark: {
      type: String,
      trim: true,
      default: ''
    },
    contactNumber: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Return Address (if different)
  returnAddress: {
    isSameAsPickup: {
      type: Boolean,
      default: true
    },
    addressLine1: {
      type: String,
      trim: true,
      default: ''
    },
    addressLine2: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    pincode: {
      type: String,
      default: ''
    }
  },
  
  // Additional Information
  aadharNumber: {
    type: String,
    match: /^[0-9]{12}$/,
    default: ''
  },
  msmeRegistration: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Profile Status
  profileStatus: {
    type: String,
    enum: ['incomplete', 'pending', 'approved', 'rejected', 'suspended'],
    default: 'incomplete'
  },
  verificationStatus: {
    kycDone: {
      type: Boolean,
      default: false
    },
    bankVerified: {
      type: Boolean,
      default: false
    },
    businessVerified: {
      type: Boolean,
      default: false
    }
  },
  
  // Admin fields
  rejectionReason: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  
  // Stats
  totalProducts: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
sellerProfileSchema.index({ user: 1 });
sellerProfileSchema.index({ businessPAN: 1 });
sellerProfileSchema.index({ gstin: 1 });
sellerProfileSchema.index({ profileStatus: 1 });

// Virtual for full pickup address
sellerProfileSchema.virtual('fullPickupAddress').get(function() {
  const addr = this.pickupAddress;
  return `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
});

// Method to check if profile is complete
sellerProfileSchema.methods.isProfileComplete = function() {
  return !!(
    this.fullName &&
    this.phoneNumber &&
    this.businessName &&
    this.businessType &&
    this.businessPAN &&
    this.bankAccountNumber &&
    this.accountHolderName &&
    this.ifscCode &&
    this.pickupAddress.addressLine1 &&
    this.pickupAddress.city &&
    this.pickupAddress.state &&
    this.pickupAddress.pincode
  );
};

// Method to get completion percentage
sellerProfileSchema.methods.getCompletionPercentage = function() {
  const requiredFields = [
    'fullName', 'phoneNumber', 'businessName', 'businessType', 'businessPAN',
    'bankAccountNumber', 'accountHolderName', 'ifscCode',
    'pickupAddress.addressLine1', 'pickupAddress.city', 'pickupAddress.state', 'pickupAddress.pincode'
  ];
  
  let completedFields = 0;
  
  requiredFields.forEach(field => {
    const value = field.includes('.') 
      ? field.split('.').reduce((obj, key) => obj && obj[key], this)
      : this[field];
    
    if (value && value.toString().trim()) {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / requiredFields.length) * 100);
};

module.exports = mongoose.model('SellerProfile', sellerProfileSchema);
