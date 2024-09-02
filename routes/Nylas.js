import express from 'express';
import Nylas from 'nylas';
import User from '../models/Users.js';
import { v4 as uuidv4 } from 'uuid';
import { updateUserGrant } from '../utils/userService.js';
const router = express.Router();

const config = {
    clientId: process.env.NYLAS_CLIENT_ID,
    callbackUri: "http://localhost:3000/oauth/exchange",
    apiKey: process.env.NYLAS_API_KEY,
    apiUri: process.env.NYLAS_API_URI,
};

const nylas = new Nylas({
    apiKey: config.apiKey,
    apiUri: config.apiUri,
})


// Route to initialize authentication by Nylas
router.get("/nylas/auth", (req, res) => {
  const authUrl = nylas.auth.urlForOAuth2({
    clientId: config.clientId,
    redirectUri: config.callbackUri,
  });

  res.redirect(authUrl);
});   

// Route to Exchange Code with Token
router.get("/oauth/exchange", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    res.status(400).send("No authorization code returned from Nylas");
    return;
  }
  
  const codeExchangePayload = {
    clientSecret: config.apiKey,
    clientId: config.clientId,
    redirectUri: config.callbackUri,
    code,
  };

  try {
    const response = await nylas.auth.exchangeCodeForToken(codeExchangePayload);
    const { accessToken, grantId} = response;
  
    const email = response.email;
    let user = await User.findOne({ email: response.email });

    console.log('user already exists', User.findOne({ email: response.email }))

    const username = email.split('@')[0]; // Ensure this produces a valid value
    const conversationName = 'New Conversation'; 

    if (!user) {
      console.log('User not found, creating a new user');
      user = new User({
        email,
        grantId,
        username: username, // Example: Use email prefix as username
        Conversation: [{
          name: 'New Conversation',
          conversationId: uuidv4(), // Generate a unique conversationId
          // Add any other necessary fields here
        }] // Initialize with default values
      });
    } 
    await user.save();
    req.session.userInput = null;
    req.session.searchContent = null;
    req.session.accessToken = accessToken;
    req.session.grantId = grantId;
    req.session.email = email;
  
    process.env.NYLAS_GRANT_ID = grantId;
    process.env.NYLAS_ACCESS_TOKEN = accessToken
    await updateUserGrant(email, grantId);

    res.redirect('/dashboard')
   
  } catch (error) {
    console.error('Error exchanging authorization code for token:', error);
    res.status(500).send("Failed to exchange authorization code for token");
  }
});     

//Dashboard route to Chat

router.get("/dashboard", async (req, res) => {
  const email = req.session.email;
  try {
    const users = await User.findOne({ email });
    console.log('user email', User.findOne({ email }))
    console.log('user in dashboard', users)
    const previous_conversation = users?.Conversation;
    if (!previous_conversation) {
      previous_conversation = [] ;
  }
      res.render('dashboard', { previous_conversation });
    }
   catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).send('Internal server error');
}

});

export default router;