# MailBot

MailBot is an AI-powered chatbot application that allows users to interact with AI, save conversation history, and send scheduled or immediate emails based on chat content. It is built with Express.js, integrates with OpenAI for generating responses, and supports user session management.

## Features

- **AI-Powered Conversations**: Users can interact with an AI model to ask questions and receive detailed responses.
- **Conversation History**: Users' conversation histories are saved, allowing them to revisit past interactions.
- **Email Integration**: Users can send or schedule emails directly from the conversation history.
- **Session Management**: User sessions are maintained, so they can continue where they left off.
- **Dynamic Conversation Naming**: Conversations are automatically named based on the content.

## Technologies Used

- **Express.js**: Backend framework for building the server and managing routes.
- **OpenAI API**: Utilized for generating AI responses.
- **MongoDB**: Database for storing user data and conversation history.
- **Node.js**: Server-side JavaScript runtime.
- **EJS**: Embedded JavaScript templating for generating dynamic HTML.

## Installation

1. ## Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mailbot.git

2. ## Navigate to the project directory:

```bash
cd mailbot```

3. ## Navigate to the project directory:

```bash
cd mailbot

4. Create a .env file in the root directory and add the following variables:
 ```bash
   OPENAI_API_KEY=your-openai-api-key
   NYLAS_API_KEY=your-nylas-api-key
   NYLAS_URI=your-nylas-uri
   NYLAS_EMAIL_API_KEY=nylas_email_api_key

5. Start the server:
   ```bash
    nodemon app.js

