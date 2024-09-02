import mongoose from 'mongoose';
const Schema = mongoose.Schema;

import passportLocalMongoose from 'passport-local-mongoose'

const conversationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  conversationId: { type: String, unique: true }, // Unique ID for each conversation
  history: [{
    searchTerm: { type: String },
    searchContent: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
});

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    grantId: { type: String, required: true },
    username: { type: String, required: true },
    Conversation: [
        conversationSchema
    ]
})

UserSchema.plugin(passportLocalMongoose, { usernameField: 'username' })

const User = mongoose.model('User', UserSchema);

export default User;




