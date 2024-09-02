import express from 'express';
import  Ai  from '../utils/openai.js';
import User from '../models/Users.js';
import { v4 as uuidv4 } from 'uuid';
import { marked } from 'marked';

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
//Search Function

router.post('/search', async (req, res) => {
    const userInput = req.body.input;
    req.session.userInput = userInput
  const email = req.session.email;
    const conversationId = req.session.conversationId;

  
    if (!email || !userInput) {
      return res.status(400).send('Email or input not provided');
  }

    try {
      // Find user and update search history
      const user = await User.findOne({ email });
    
      const advice = await Ai(userInput);
      const trimmedAdvice = advice.trim();
      req.session.searchContent = trimmedAdvice;

      if (user) {
        let conversation = user.Conversation.find(convo => convo.conversationId === conversationId);
        if (conversation) {
          // Update existing conversation history
          conversation.history.push({ searchTerm: userInput, searchContent: trimmedAdvice });
          if (!conversation.name || conversation.name === 'New Conversation') {
            const conversationName = await generateConversationName(userInput);
            conversation.name = conversationName;
          }
        } else {
          // Create a new conversation if it doesn't exist
          const newConversationId = uuidv4(); // Generate a new conversation ID if needed
          conversation = {
            name: userInput.length > 0 ? userInput.substring(0, 20) + '...' : 'New Conversation',
            conversationId: newConversationId,
            history: [{ searchTerm: userInput, searchContent: trimmedAdvice }]
          };
          user.Conversation.push(conversation);
          req.session.conversationId = newConversationId; // Update the session with the new conversation ID
        }
        const conversationHistory = conversation.history
       
        res.json({ advice: trimmedAdvice, history: conversationHistory });
        
        await user.save();
      }
      

    } catch (error) {
      console.error('Error saving search details:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
    if (!userInput) {
        return res.status(400).send('No input provided');
    }
   
});



const generateConversationName = async (userInput) => {
  try {
    const summarizedResult = await Ai(`Summarize: ${userInput}`);
    const summarizedInput = summarizedResult.trim();
    const conversationNameResult = await Ai(`give title for this is in one word or two: ${summarizedInput}`);
    const conversationName = conversationNameResult.trim();

    return conversationName;
  } catch (error) {
    console.error('Error generating conversation name:', error);
    return 'Untitled Conversation';
  }
};

export default router;