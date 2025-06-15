const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const organizationSettingSchema = new mongoose.Schema({
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
  },
  theme: {
    type: String,
    enum: ['dark', 'light', 'system'],
  },
  defaultPassword: String,
  currentSection: {
    type: Schema.Types.ObjectId,
    ref: 'UserCategoryOne',
  },
});
