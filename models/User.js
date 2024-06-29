const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const { title } = require("process");
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  avatar:{
    type: String,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [1945,1979],
    default: 1979,
  },
  cart: [{
    product: {type : mongoose.Types.ObjectId , ref: 'Products'},
    quantity : Number,
    color: String,
    price:Number,
    title: String,
    thumb: String
  }],
  address: String,
  wishlist: [{type: mongoose.Types.ObjectId, ref: 'Products'}],

  isBlocked: {
    type: Boolean,
    default: false,
  },
  refreshToken:{
    type:String,
  },
  passwordChangArt:{
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: String
  },
},{
  timestamps:true
});

// hash password
userSchema.pre("save", async function(next){
    if(!this.isModified('password')){
        next()
    }
    const salt = bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password , salt)
});

userSchema.methods =  {
    isConrectPassword : async function(password){
        return await bcrypt.compare(password, this.password)
    },
    createPasswordchangedToken: function () {
      const resetToken =  crypto.randomBytes(32).toString('hex')  // 16 ky tu 0>9 a>s
      this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
      this.passwordResetExpires = Date.now() + 15 * 60 * 1000 // cong 15p
      return resetToken
    }
}
//Export the model
module.exports = mongoose.model("User", userSchema);
