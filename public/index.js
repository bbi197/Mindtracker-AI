// functions/index.js
const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const OpenAI = require('openai');
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const [selectedDate, setSelectedDate] = useState(new Date());

<Calendar
  onChange={setSelectedDate}
  value={selectedDate}
  className="mb-4"
/>

{entries
  .filter(e => new Date(e.timestamp.toDate()).toDateString() === selectedDate.toDateString())
  .map(entry => (
    <div key={entry.id} className="bg-gray-800 p-4 rounded-lg mb-4">
      {/* Decrypted content */}
    </div>
))}

const prompt = `Analyze this journal entry and return psychological insights:
Feeling: ${entry.feeling}
Logic: ${entry.logic}
Alignment: ${entry.alignment}
Energy: ${entry.energy}

Return JSON with:
{
  "emotional_state": "<primary emotion>",
  "cognitive_patterns": ["<pattern1>", "<pattern2>"],
  "energy_analysis": "<energy evaluation>",
  "recommended_actions": ["<action1>", "<action2>"],
  "self_reflection_score": "<score from 0 (shallow) to 100 (deep)>",
  "summary": "<3-sentence summary>"
}
`;


initializeApp();
const db = getFirestore();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateInsights = functions.firestore
  .document('entries/{entryId}')
  .onCreate(async (snapshot, context) => {
    const entry = snapshot.data();
    
    const prompt = `Analyze this journal entry and provide concise psychological insights:
    Feeling: ${entry.feeling}
    Logic: ${entry.logic}
    Alignment: ${entry.alignment}
    Energy: ${entry.energy}
    
    Provide analysis in this JSON format:
    {
      "emotional_state": "<primary emotion>",
      "cognitive_patterns": ["<pattern1>", "<pattern2>"],
      "energy_analysis": "<energy evaluation>",
      "recommended_actions": ["<action1>", "<action2>"],
      "summary": "<3-sentence summary>"
    }`;

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 500
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      
      // Store insights in subcollection
      await db.collection('entries').doc(context.params.entryId)
        .collection('insights').add({
          ...analysis,
          created: new Date(),
          model: 'gpt-3.5-turbo'
        });

    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw new functions.https.HttpsError('internal', 'AI analysis failed');
    }
  });
  