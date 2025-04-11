const mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  });
  
  exports.sendWeeklyDigest = functions.pubsub.schedule('every sunday 09:00').onRun(async () => {
    const users = await db.collection('users').get();
  
    for (const doc of users.docs) {
      const userId = doc.id;
      const userEmail = doc.data().email;
  
      const entries = await db.collection('entries')
        .where('userId', '==', userId)
        .where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .get();
  
      let summary = '';
      for (const entry of entries.docs) {
        const data = entry.data();
        const insights = await db.collection('entries').doc(entry.id).collection('insights').orderBy('created', 'desc').limit(1).get();
        const insightData = insights.docs[0]?.data() ?? {};
        summary += `• Feeling: ${decrypt(data.feeling)} | Summary: ${insightData.summary}\n`;
      }
  
      if (summary) {
        await mailgun.messages().send({
          from: 'MindTracker <no-reply@yourdomain.com>',
          to: userEmail,
          subject: '🧠 Your Weekly Mind Summary',
          text: `Here's your digest:\n\n${summary}`
        });
      }
    }
  
    return null;
  });
  