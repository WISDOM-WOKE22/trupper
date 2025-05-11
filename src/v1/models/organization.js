const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  logo: String,
  subscription: {
    type: String,
    default: "free"
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Pricing',
  },
  status: {
    type: String,
    enum: [ 'active', "blocked", "suspended" ],
    default: 'active',
  },
  admin: String,
  
},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
}
);

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;