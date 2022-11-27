const express = require('express')

const { 
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
    accountVerificationCtrl,
    generateVerificationTokenCtrl,
    forgetPasswordToken,
    passwordResetCtrl,
    profilePhotoUploadCtrl,
   
 } = require('../../controllers/users/userController')
const authMiddleware = require('../../middleware/auth/authMiddleware')
const {
    photoUpload,
    profilePhotoResize
    } = require('../../middleware/upload/photoUpload')


const userRoutes = express.Router()

userRoutes.post('/register',userRegisterCtrl)
userRoutes.post('/login',loginUserCtrl)
userRoutes.put(
    '/profilephoto-upload',
    authMiddleware,
    photoUpload.single('image'),
    profilePhotoResize,
    profilePhotoUploadCtrl)
userRoutes.get('/profile/:id',authMiddleware, userProfileCtrl)
userRoutes.get('/',authMiddleware, fetchUserCtrl)
userRoutes.delete('/:id',deleteUserCtrl)
userRoutes.put('/block-user/:id',authMiddleware,blockUserCtrl)
userRoutes.put('/unblock-user/:id',authMiddleware,unblockUserCtrl)
userRoutes.put("/follow", authMiddleware, followingUserCtrl);
userRoutes.post(
    "/generate-verify-email-token", 
    authMiddleware, 
    generateVerificationTokenCtrl);
userRoutes.put("/verify-account", authMiddleware,accountVerificationCtrl );
userRoutes.put('/unfollow',authMiddleware,unfollowUserCtrl)
userRoutes.put('/reset-password',passwordResetCtrl)
userRoutes.put('/:id',authMiddleware, updateUserCtrl)
userRoutes.post('/forget-password-token',forgetPasswordToken)

userRoutes.put('/password/:id',authMiddleware, updateUserPasswordCtrl)
userRoutes.get('/:id',fetchUserDetailsCtrl)
 

module.exports = userRoutes
