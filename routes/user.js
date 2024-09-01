import express from 'express';
const router = express.Router();
import { destroyGrant } from './sendEmail.js';

router.get('/logout', (req, res) => {
    console.log('grant id from session', req.session.grantId)
    const grantId = req.session.grantId
    destroyGrant(grantId )
    res.redirect('/'); 
});
  

  
export default router;