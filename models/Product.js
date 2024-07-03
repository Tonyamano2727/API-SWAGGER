const mongoose = require("mongoose"); // Erase if already required
// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // bo dau cach o 2 dau
    },
    slug: {
        type: String,
        required: true,
        // unique: true,
        lowercase: true
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    thumb: {
      type: String,
      require: true
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    color: {
      type: String,
      require: true,
    },
    ratings: [        
      {
        star: { type: Number },
        postedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
        comment: { type: String },
      },
    ],
    totalRatings: {   // tong so danh gia
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre('save', function(next) {
  const currentDate = new Date();
  this.createdAt = currentDate.toISOString(); // Format createdAt
  this.updatedAt = currentDate.toISOString(); // Format updatedAt
  next();
});


//Export the model
module.exports = mongoose.model("Products", productSchema);
