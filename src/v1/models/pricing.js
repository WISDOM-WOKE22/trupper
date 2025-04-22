const mongoose = require('mongoose');
const crypto = require('crypto');

const pricingSchema = new mongoose.Schema(
  {
    name: String,
    amount: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
    },
    status: {
      type: Boolean,
      default: false,
    },
    cbtAi: {
      type: Boolean,
      default: false,
    },
    cbtAiTrials: {
      type: Number,
      default: 0,
    },
    cbtSummary: {
      type: Boolean,
      default: false,
    },
    queryId: String,
  },
  {
    timeseries: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

pricingSchema.pre('save', async function (next) {
  this.queryId = crypto.randomBytes(20).toString('hex');
  next();
});

const Pricing = mongoose.model('Pricing', pricingSchema);

module.exports = Pricing;
