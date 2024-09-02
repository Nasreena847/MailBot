import express from 'express';
import  Ai  from '../utils/openai.js';
import User from '../models/Users.js';
import handleDashboardPost from '../public/javascripts/conversationLogic.js';

const router = express.Router();

const checkAuth = (req, res, next) => {
  if (!req.session.email) {
    return res.redirect('/nylas/auth'); // Redirect to login if not authenticated
  }
  next();
};

// Apply middleware to all routes
router.use(checkAuth);

router.post('/start-new-conversation', async(req, res) => {
  req.session.newConversation = true; // Set session flag for new conversation
  req.session.conversationId = null;  

  req.session.userInput = '';  // Initialize with an empty string or default input
  req.session.searchContent = '';
  await handleDashboardPost(req, res);
 
});

router.post("/dashboard", async (req, res) => {
  await handleDashboardPost(req, res);
});

router.get('/dashboard/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
      // Fetch the user from the database using the session's email
      const user = await User.findOne({ email: req.session.email });

      if (!user) {
          return res.status(404).send('User not found');
    }
    
    req.session.conversationId = conversationId
    const advice = ''; // Placeholder for advice or any other content you want to display
    const previous_conversation = user.Conversation;
    const selectedConversation = user.Conversation.find(convo => convo.conversationId === conversationId);

    if (!selectedConversation) {
        return res.status(404).send('Conversation not found');
    }
      
    res.render('dashboard', { conversationId, advice, previous_conversation, selectedConversation });

  } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).send('Internal server error');
  }
});

export default router;