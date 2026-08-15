// Backend minimal pour Leia
// Reçoit les requêtes du site (Netlify) et les relaie vers l'API Claude
// en gardant la clé API secrète côté serveur.

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // en prod, restreindre à ton domaine Netlify avec { origin: 'https://ton-site.netlify.app' }
app.use(express.json({ limit: '5mb' }));

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('ERREUR: la variable d\'environnement ANTHROPIC_API_KEY n\'est pas définie.');
}

app.post('/api/claude', async (req, res) => {
  try {
    const { system, messages, max_tokens } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1000,
        system: system || '',
        messages: messages || []
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur API Anthropic:', data);
      return res.status(response.status).json({ error: data });
    }

    res.json(data);
  } catch (err) {
    console.error('Erreur serveur:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Leia backend démarré sur le port ${PORT}`));
