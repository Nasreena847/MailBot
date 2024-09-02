import express from 'express';
import Nylas from 'nylas';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory for simplicity
console.log('upload', upload)

const NylasConfig = {
    apiKey: process.env.NYLAS_SEND_EMAIL,
  apiUri: process.env.NYLAS_API_URI || 'https://api.nylas.com/', // Default URI,
}

const nylas = new Nylas(NylasConfig)


router.get('/send-email', (req, res) => {
    res.render('sendEmail'); // Renders the form (assuming you're using a templating engine like EJS)
});


router.post('/send-email', upload.array('attachments') , async (req, res) => {
  const { subject, toEmail, toName, body, attachment } = req.body;
  const grantId = req.session.grantId;
  try {
 // Prepare the attachments in the format required by Nylas
 const attachments = req.files.map(file => ({
  content_type: file.mimetype,
  filename: file.originalname,
  content: file.buffer.toString('base64'),
  content_id: uuidv4(),// Generating a unique ID for each attachment
}));

    console.log('attahments', attachments)
    // Send the email
    const sentMessage = await nylas.messages.send({
      identifier: grantId,
      requestBody: {
        to: [{ name: `${toName}`, email: `${toEmail}` }],
        replyTo: [{ name: "Name", email: 'syednasreen1506@gmail.com' }],
        subject: `${subject}`,
        body: `${body}`,
        attachments: attachments,
      },
    });
    console.log('sent', sentMessage)
    req.flash('success', 'Email sent successfully!');
    res.redirect('/dashboard');

  } catch (error) {
    console.error("Error sending email in app:", error);
    res.status(500).send("Error sending email");
  }
});


router.get('/schedule-email', (req, res) => {
  res.render('scheduleEmail'); // Renders the form 
});


router.post('/schedule-email', async (req, res) => {
  const { subject, toEmail, toName, body, sendAt } = req.body;
  
  const sendAtTime = Math.floor(new Date(sendAt).getTime() / 1000);
  try {
    const sentMessage = await nylas.messages.send({
        identifier: req.session.grantId,
        requestBody: {
          to: [{ name: `${toName}`, email: `${toEmail}`}],
          replyTo: [{ name: "Ram", email: `${toEmail}`}],
          subject: `${subject}`,
          body: `${body}`,
          sendAt: sendAtTime,
          useDraft: true
        },
    })
    req.flash('success', 'Email Scheduled successfully!');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error scheduling email:', error)
  }
})

// List of Schduled Emails

router.get('/list-schedule-email', async(req, res) => {
  try {
    const messageSchedules = await nylas.messages.listScheduledMessages({
      identifier: req.session.grantId,
    })
    res.render('Listscheduleemail', { messages: messageSchedules.data });
  } catch (error) {
    console.error('Error fetching message schedules:', error)
  }
 
});

// Detail status of specific Schduled email

router.get('/scheduled-message/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;

  try {
    // Fetch details of the scheduled message
    const messageDetails = await nylas.messages.findScheduledMessage({
      identifier: req.session.grantId,
      scheduleId: scheduleId,
    });
    // Render the message details page
    res.render('scheduler', { message: messageDetails });

  } catch (error) {
    console.error('Error fetching scheduled message details:', error);
    res.status(500).send('Error fetching message details');
  }
});

//To delete a Grant

export async function destroyGrant(grantId) {
  try {
    const response = await nylas.grants.destroy({
      grantId: grantId,
    })

    console.log('Grant deleted:', response)
  } catch (error) {
    console.error('Error finding grant:', error)
  }
}



export default router;