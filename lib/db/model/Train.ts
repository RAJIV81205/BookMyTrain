import mongoose from "mongoose";

const trainSchema = new mongoose.Schema({
  trainNo: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  trainName: { 
    type: String, 
    required: true 
  },
  classes: { 
    type: Map,
    of: Number,
    required: true,
    validate: {
      validator: function(v: Map<string, number>) {
        return v.size > 0;
      },
      message: 'At least one class must be specified'
    }
  },
  addedDate: { 
    type: String, 
    required: true, 
    default: new Date().toLocaleDateString("en-IN")
  }
}, {
  timestamps: true
});

// Convert Map to Object when converting to JSON
trainSchema.set('toJSON', {
  transform: function(doc, ret: any) {
    if (ret.classes instanceof Map) {
      ret.classes = Object.fromEntries(ret.classes);
    }
    return ret;
  }
});

export default mongoose.models.Train || mongoose.model("Train", trainSchema);
