import CryptoJS from 'crypto-js';

const SECRET_KEY = "YourSuperSecretPassword";

const encrypt = (text) => CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
const decrypt = (cipher) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "[Decryption Error]";
  }
};
await addDoc(collection(db, 'entries'), {
  feeling: encrypt(formData.feeling),
  logic: encrypt(formData.logic),
  alignment: encrypt(formData.alignment),
  energy: encrypt(formData.energy),
  userId: user.uid,
  timestamp: new Date()
});


// Add to App.jsx
const [insights, setInsights] = useState({});

// Fetch insights for each entry
useEffect(() => {
  if (!user || entries.length === 0) return;

  const unsubscribes = entries.map(entry => {
    const q = query(
      collection(db, 'entries', entry.id, 'insights'),
      orderBy('created', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      setInsights(prev => ({
        ...prev,
        [entry.id]: snapshot.docs[0]?.data()
      }));
    });
  });

  return () => {
    unsubscribes.forEach(unsub => typeof unsub === 'function' && unsub());
  };
}, [entries, user]);

// Add to entry display component
{entries.map(entry => (
  <div key={entry.id} className="bg-gray-800 p-4 rounded-lg mb-6">
    <p className="text-gray-400 text-sm mb-1">
      {new Date(entry.timestamp?.toDate()).toLocaleString()}
    </p>
    <EntrySection title="Feeling" content={decrypt(entry.feeling)} />
    <EntrySection title="Logic" content={decrypt(entry.logic)} />
    <EntrySection title="Alignment" content={entry.alignment} />
    <EntrySection title="Energy" content={entry.energy} />

    {insights[entry.id] && (
      <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-green-400/20">
        <h3 className="text-lg font-semibold text-green-400 mb-2">
          AI Insights 💡
        </h3>
        <p className="text-sm mb-3 italic text-green-200">
          {insights[entry.id].summary}
        </p>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-medium text-gray-300">Primary Emotion:</span>
            <span className="ml-2 text-green-300">
              {insights[entry.id].emotional_state}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-300">Energy Level:</span>
            <span className="ml-2 text-green-300">
              {insights[entry.id].energy_analysis}
            </span>
          </div>
        </div>
      </div>
    )}
  </div>
))}
<button onClick={startListening}>🎤 Speak</button>
const startListening = () => {
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.onresult = (e) => {
    setFormData(prev => ({
      ...prev,
      feeling: prev.feeling + ' ' + e.results[0][0].transcript
    }));
  };
  recognition.start();
};
<div className="text-sm mt-2 text-yellow-300">
  <strong>🧠 Self-Reflection Score:</strong> {insights[entry.id].self_reflection_score}/100
</div>

