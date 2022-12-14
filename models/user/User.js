const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
//Schema

const userSchema = new mongoose.Schema({
    firstName:{
        required:[true,'First name is required'],
        type: String
    },
    lastName:{
        required:[true,'Last name is required'],
        type: String
    },
    profilePhoto:{
        type: String,
        default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    },
    email:{
        required:[true,'Email is required'],
        type: String
    },
    bio:{
        type: String
    },
    password:{
        type: String,
        required: [true,'Password is required']
    },
    postCount:{
        type: Number,
        default: 0
    },
    isBlocked:{
        type: Boolean,
        default: false
    },isAdmin:{
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        enum: ['Admin','Guest','Blogger']
    },
    isFollowing:{
        type: Boolean,
        deafult: false
    },
    isAccountVerified: { type: Boolean, default: false},
    accountVerificationToken: String,
    accountVerificationTokenExpires: Date,

    viewedBy: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ]
    },
    followers:{
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ]
    },
    following:{
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ]
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    active: {
        type:Boolean,
        default: false
    }
},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals: true
    },
    timestamps: true
}) 

userSchema.virtual("posts", {
    ref: "Post",
    foreignField: "user",
    localField: "_id",
  });

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        next()
    }
    var salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password,salt)
    next()
})

userSchema.methods.isPasswordMatched = async function (enteredPassowrd){
    return await bcrypt.compare(enteredPassowrd, this.password)
}

userSchema.methods.createAccountVerificationToken = async function(){
    const verificationToken = crypto.randomBytes(32).toString("hex")
    this.accountVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest("hex")
        this.accountVerificationTokenExpires = Date.now() + 30 * 60 * 1000
        return verificationToken
} 

userSchema.methods.createPasswordResetToken = async function(){
    const resetToken = crypto.randomBytes(32).toString("hex")
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000
    return resetToken
}

const User = mongoose.model("User", userSchema)

module.exports = User
