import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import path from "path"; 
import { fileURLToPath } from 'url'; 
import ejsMate from 'ejs-mate';
import session  from 'express-session';
import expressMongoSanitize from "express-mongo-sanitize";
import passport from 'passport';
import flash from 'connect-flash';
import LocalStrategy from 'passport-local'
import User from './models/Users.js';
import UserRoutes from './routes/user.js';
import NylasRoutes from './routes/Nylas.js'
import OpenAiRoutes from './routes/openai.js'
import ExpressError from './utils/ExpressError.js';
import ConversationRoutes from './routes/conversation.js'
import sendEmail from './routes/sendEmail.js'
import Nylas from 'nylas';
import axios from 'axios';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = 'mongodb://localhost:27017/Medical-Advisor';


mongoose.connect(dbUrl)
  .then(async () => {
    console.log('Database connected');
})
    .catch((err) => {
    console.log('database connection error: ', err)
    })



const app = express();

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}));
app.use('/images', express.static(path.join(__dirname, 'Images')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressMongoSanitize());

const NylasConfig = {
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
}

const nylas = new Nylas(NylasConfig)



const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'Secret',
    }

})

store.on("error", function (e) {
    console.log('session store error')
})




const sessionConfig = {
    store,
    secret: 'Secret',
    resave: false,
    saveUninitialized: true, 
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


app.get('/', (req, res) => {
  req.session.email.email = null
  res.render('Home')
  console.log('authencated', req.session.email.email)
})
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session && req.session.email.email; 
  next();
});



app.use('/', UserRoutes);
app.use('/', NylasRoutes)
app.use('/', OpenAiRoutes);

app.use(express.text());
app.use('/', ConversationRoutes);
app.use('/', sendEmail)

console.log('app conversation', User.Conversation)

const config = {
    apiUri: process.env.NYLAS_API_URI,  
    apiKey: process.env.NYLAS_API_KEY  
  };
  
  async function fetchGrantIds() {
    try {
      const response = await axios.get(`${config.apiUri}/v3/grants`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
  
      const grants = response.data;
      console.log('List of Grants:', grants);
      return grants;
    } catch (error) {
      console.error('Error fetching grants:', error.response ? error.response.data : error.message);
    }
  }
  
  (async () => {
    const grants = await fetchGrantIds();
})();
  

async function storeGrantData() {
    const grantsResponse = await fetchGrantIds(); // Call to fetchGrantIds to get the API response
  
    if (grantsResponse && grantsResponse.data && Array.isArray(grantsResponse.data)) {
      const grants = grantsResponse.data; // Access the actual grants array
  
      for (const grant of grants) {
        if (grant.email && grant.id) {
          await User.updateOne(
            { email: grant.email },  
            { $set: { grantId: grant.id } },  
            { upsert: true } 
          );
        } else {
          console.error('Grant is missing email or id:', grant);
          }
          console.log('User', User)
      }
    } else {
      console.error('No grants data found or data is not an array:', grantsResponse);
    }
  }

storeGrantData();
  
app.use(express.json());
  app.post('/delete-scheduled-message', async (req, res) => {
    const { scheduleId } = req.body; // Get scheduleId from the request body
    console.log('POST request received for delete');
    console.log(`Schedule ID: ${scheduleId}`);
    try {
        const result = await nylas.messages.stopScheduledMessage({
            identifier: req.session.grantId,
            scheduleId: scheduleId,
        });

        console.log("Message deleted:", result);
        res.status(200).send('Message deleted');
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).send('Error deleting message');
    }
  });




app.all('*', (req, res, next) => {
    next(new ExpressError('page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, ()=> {
    console.log(`server is running on port 3000no`)
})