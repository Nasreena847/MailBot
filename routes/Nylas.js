import express from 'express';
import Nylas from 'nylas';
import User from '../models/Users.js';
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
    const { accessToken, grantId, expiresIn } = response;
  

    req.session.userInput = null;
    req.session.searchContent = null;
    req.session.accessToken = accessToken;
    req.session.grantId = grantId;

    const email = response;
    req.session.email = email;
  
    process.env.NYLAS_GRANT_ID = grantId;
    process.env.NYLAS_ACCESS_TOKEN = accessToken
    await updateUserGrant(email, grantId);

    res.redirect('/dashboard')
   
  } catch (error) {
    res.status(500).send("Failed to exchange authorization code for token");
  }

 
});     

//Dashboard route to Chat

router.get("/dashboard", async (req, res) => {
  const email = req.session.email.email;
  try {
    const user = await User.findOne({ email });
    console.log('nylas user', user)

    if (!user) {
      return res.status(404).send('User not found');
    }

    const users = await User.findOne({ email });
    const previous_conversation = users.Conversation;

    res.render('dashboard', {previous_conversation})

    }
   catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).send('Internal server error');
}

});

export default router;