const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password:{
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'bace'],
        default: 'bace'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    }
})

UserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

UserSchema.methods.generateToken = async function(){
    try{
        return jwt.sign(
            { 
                id: this._id.toString(), 
                name: this.name,
                role: this.role
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '5h' }
        );
    }
    catch(error){
        console.error('Error generating token:', error);
        throw new Error('Token generation failed');
    }
};

module.exports = mongoose.model('User', UserSchema)
