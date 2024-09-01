import User from '../../models/Users.js';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//Functionality for handling New Conversation

async function handleDashboardPost(req, res) {
  const email = req.session.email.email;
    const userInput = req.session.userInput;
    const searchContent = req.session.searchContent;
 
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found conersation logic');
    } else {
      console.log('User found:', user);
    }
  
    if (!user.username) {
      const emailLocalPart = email.split('@')[0]; // Extract part before '@'
      user.username = emailLocalPart.trim(); // Trim any extra spaces
      await user.save();
    }

  
    let conversationId;
    let conversationName;
    
    if (req.session.newConversation) {
      conversationId = uuidv4();
      conversationName = 'New Conversation';
     
      // Create the new conversation
      const newConversation = {
        name: conversationName,
        conversationId: conversationId,
        history: [{ searchTerm: userInput, searchContent: searchContent }]
      };
      user.Conversation.push(newConversation);
      req.session.newConversation = false; // Reset the session flag
    } else {
      // Use the existing conversation ID
      conversationId = req.session.conversationId;
      
    }
    await user.save()
      req.session.conversationId = conversationId; // Store the conversation ID in the session
      res.redirect(`/dashboard/${conversationId}`)
      
    
  } catch (error) {
      console.error('Error saving conversation:', error);
      res.status(500).send('Internal server error in dashboard route');
    }
}

export default handleDashboardPost;