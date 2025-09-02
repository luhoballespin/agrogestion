const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'Argentina',
      },
    },
  },
  businessInfo: {
    businessName: String,
    taxCategory: String,
    taxStatus: String,
    cuit: String,
  },
  paymentTerms: {
    type: Number,
    default: 30,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active',
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para actualizar updatedAt
supplierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índices para búsquedas frecuentes
supplierSchema.index({ name: 1 });
supplierSchema.index({ 'contactInfo.email': 1 });
supplierSchema.index({ 'businessInfo.cuit': 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
