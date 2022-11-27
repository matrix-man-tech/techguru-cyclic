require('dotenv').config()
const fs = require('fs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail')
const expressAsyncHandler = require("express-async-handler")
const User = require('../../models/user/User')
const generateToken = require("../../config/token/generateToken")
const validateMongodbId = require("../../utils/validateMongodbID")
const cloudinaryUploading = require('../../utils/cloudinary')
const { log } = require('console')

sgMail.setApiKey(process.env.SEND_GRID)

let refreshTokens = []

const userRegisterCtrl = expressAsyncHandler(async (req,res) =>{
    const { firstName,lastName,email,password} = req.body
    console.log(req.body);
    const userExists = await User.findOne({ email })

    if (userExists) {
      res.status(400)
      throw new Error('User already exists')
    }
    
        try {
            const user = await User.create({
                firstName: req?.body?.firstName,
                lastName: req?.body?.lastName,
                email: req?.body?.email,
                password: req?.body?.password
            })
            res.json(user)
        } catch (error) {
            res.json(error);
        }
    })

const loginUserCtrl = expressAsyncHandler(async (req,res)=>{
    const { firstName,lastName,email,password} = req.body
    const userFound = await User.findOne({email})
   
    if(userFound && (await userFound.isPasswordMatched(password))){
        res.json({
            id:userFound?._id,
            firstName:userFound?.firstName,
            lastName:userFound?.lastName,
            email:userFound?.email,
            profilePhoto:userFound.profilePhoto,
            isAdmin:userFound?.isAdmin,
            token:generateToken(userFound?._id)
            
        })
    }
    else{
        res.status(401)
        throw new Error("Invalid credentials")
    }
})

const fetchUserCtrl = expressAsyncHandler(async (req,res)=>{
    try{
        const users = await User.find({})
        res.json(users)
    }catch (error){
        res.json(error)
    }
})

const deleteUserCtrl = expressAsyncHandler(async (req,res)=>{
    const { id } = req.params
    validateMongodbId(id)
    try {
        const deletedUser = await User.findByIdAndDelete(id)
        res.json(deletedUser)
    } catch (error) {
        res.json(error)
    }
})

const fetchUserDetailsCtrl = expressAsyncHandler(async (req,res)=>{
    const { id } = req.params
    validateMongodbId(id)
    try {
        const user = await User.findById(id)
        res.json(user)
    } catch (error) {
        res.json(error)
    }
})

const userProfileCtrl = expressAsyncHandler(async(req,res)=>{
    const { id } = req.params
    validateMongodbId(id)
    try {
        const myProfile = await User.findById(id)
            .populate('posts')
        res.json(myProfile)
    } catch (error) {
        res.json(error)
    }
})

const updateUserCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params
   
    
    validateMongodbId(id);
    const user = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        bio: req?.body?.bio,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(user);
  });

  const updateUserPasswordCtrl = expressAsyncHandler(async (req, res) => {
    
    const { _id } = req.user;
    const { password } = req.body;
    validateMongodbId(_id);
    
    const user = await User.findById(_id);
  
    if (password) {
      user.password = password;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.json(user);
    }
  });

const followingUserCtrl = expressAsyncHandler(async(req,res) =>{
    const { followId } = req.body
    const loginUserId = req.user.id
    
    const targetUser = await User.findById(followId)

    const alreadyFollowing = targetUser?.followers?.find(
        user => user.toString() === loginUserId.toString()
    )
   
    await User.findByIdAndUpdate(followId,{
        $push:{ followers:loginUserId},
        isFollowing: true
    },
    {new: true})

    if(alreadyFollowing) throw new Error(" You are already followed this auther")
    await User.findByIdAndUpdate(loginUserId,{
        $push:{following:followId},
        
    },
    {new: true})
    res.json('You have succesfully followed this user')
})

const unfollowUserCtrl = expressAsyncHandler(async(req,res) =>{
    const { unfollowId } = req.body
    const loginUserId = req.user.id
   await User.findByIdAndUpdate(unfollowId,{
    $pull:{ followers:loginUserId},
    isFollowing: false
   },
   {
    new:true
   })
   
   await User.findByIdAndUpdate(loginUserId,{
    $pull:{ following:unfollowId},
    
   },
   {
    new:true
   })

   res.json("You have succesfully unfollowed")
})

const blockUserCtrl = expressAsyncHandler(async(req,res)=>{
   const { id } = req.params
   validateMongodbId(id)
   const user = await User.findByIdAndUpdate(
    id, 
    {
    isBlocked: true
    },
    {
    new: true
    })
    res.json(user)
})

const unblockUserCtrl = expressAsyncHandler(async(req,res)=>{
    const { id } = req.params
    validateMongodbId(id)
    const user = await User.findByIdAndUpdate(
     id, 
     {
     isBlocked: false
     },
     {
     new: true
     })
     res.json(user)
 })

const generateVerificationTokenCtrl = expressAsyncHandler(async(req,res) =>{
    const loginUserId = req.user.id
    const user = await User.findById(loginUserId)
    // console.log(user);
    try {
        const verificationToken = await user.createAccountVerificationToken()
        await user.save()
        console.log(verificationToken);

        const resetURL = `If you were requested to verify your account verify within 10 minutes <a href="http://localhost:3000/verify-account/${verificationToken}">
        Click to verify your account</a>`
        const msg = {
            
                to: 'rahulparakkal98@gmail.com',
                from: 'techguruindia.ltd@gmail.com',        
                subject: 'Sending with SendGrid is Fun',
                html: resetURL,
                
              
        }
        await sgMail.send(msg)
        res.json(resetURL)
    } catch (error) {
        res.json(error)
    }
    
    
})

const accountVerificationCtrl = expressAsyncHandler(async(req,res)=>{
    const {token} = req.body
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')
    
    const userFound = await User.findOne({
        accountVerificationToken: hashedToken,
        accountVerificationTokenExpires: {$gt: new Date()}
    })

    if(!userFound) throw new Error("Token Expired, try again")
    userFound.isAccountVerified = true
    userFound.accountVerificationToken = undefined
    userFound.accountVerificationTokenExpires = undefined
    await userFound.save()
    res.json(userFound)
})

const forgetPasswordToken = expressAsyncHandler(async(req,res)=>{
    
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user) throw new Error("user not found")
   
    try {
      const token = await user.createPasswordResetToken()
      console.log(token);
      await user.save()

      const resetURL = `If you were requested to reset your account verify within 10 minutes <a href="http://localhost:3000/verify-account/${token}">
        Click to verify your account</a>`
        const msg = {
            
                to: email,
                from: 'techguruindia.ltd@gmail.com',        
                subject: 'Reset your password',
                html: resetURL,
                
        }
      const emailMsg =  await sgMail.send(msg)
      res.json({
        msg:`A verification message is successfully sent to ${user?.email}.Reset now within 10 minutes, ${resetURL}`
      })
    } catch (error) {
        res.json(error)
    }
})

const passwordResetCtrl = expressAsyncHandler(async(req,res)=>{
    const {token, password} = req.body

    const hashedToken =  crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({passwordResetToken: hashedToken,passwordResetExpires:{$gt:Date.now()}})
    if(!user) throw new Error("Token expired, try again later")
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
    res.json(user)

})

const profilePhotoUploadCtrl = expressAsyncHandler(async(req,res)=>{
    const {_id } = req.user

    const localPath = `public/images/profile/${req.file.filename}`
    const imageUpload =  await cloudinaryUploading(localPath)
    const foundUser = await User.findByIdAndUpdate(_id,
        {
            profilePhoto: imageUpload?.url
        },
        {
            new:true
        })
    fs.unlinkSync(localPath)
    res.json(foundUser)
    
})

module.exports = {
    userRegisterCtrl,
    loginUserCtrl,
    fetchUserCtrl,
    deleteUserCtrl,
    fetchUserDetailsCtrl,
    userProfileCtrl,
    updateUserCtrl,
    updateUserPasswordCtrl,
    followingUserCtrl,
    unfollowUserCtrl,
    blockUserCtrl,
    unblockUserCtrl,
    generateVerificationTokenCtrl,
    accountVerificationCtrl,
    forgetPasswordToken,
    passwordResetCtrl,
    profilePhotoUploadCtrl
}