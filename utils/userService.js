import User from '../models/Users.js'

export async function updateUserGrant(email, grantId) {
    try {
      await User.updateOne(
        { email },  // Match user by email
        { $set: { grantId } },  // Store grant ID
        { upsert: true }  // Create a new user if it does not exist
      );
      console.log('User updated successfully:', email);
    } catch (error) {
      console.error('Error updating user grant:', error);
    }
  }

