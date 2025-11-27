import { useState, useEffect, useRef } from 'react';

// --- CONFIGURATION ---
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_KEY; // We will set this in Step 4
const MODEL = "google/gemini-3-pro-preview"; // Using Gemini 3 Pro model

const SYSTEM_PROMPT = `
### Ruolo
Sei un Esperto di Accessibilità Museale e Traduzione Sensoriale specializzato in descrizioni per non vedenti congeniti.

### Obiettivo
Analizza l'immagine fornita e produci una descrizione narrativa che permetta all'utente di costruirsi un'immagine mentale solida, coerente e sensorialmente ricca (tatto, udito, temperatura, propriocezione), senza fare affidamento sull'esperienza visiva.

### FASE 1: La Cornice
1. Quadro Dimensionale: Usa comparazioni quotidiane per le dimensioni. Definisci l'acustica dello spazio.
2. Tecnica e Materialità: Evoca la sensazione tattile (ruvidità, temperatura del materiale).
3. Soggetto: Sintesi estrema di cosa è rappresentato e punto di vista.

### FASE 2: La Navigazione
4. Sequenza: Descrivi dai piani vicini a quelli lontani, dall'alto al basso.
5. Localizzazione: Sii preciso (destra/sinistra rispetto a chi?).

### FASE 3: I Dettagli
6. Propriocezione: Descrivi la tensione muscolare e il peso, non l'aspetto della posa.
7. Caratterizzazione Tattile: Texture di abiti, capelli, oggetti.

### FASE 4: Atmosfera
8. Luce come Temperatura: Luce diretta = calore; Ombra = frescura/mistero tattile.
9. Colore come Materia/Emozione: Rosso = calore/urgenza; Blu = freschezza/liquido; Grigio = polvere/silenzio.

Rispondi in Italiano. Usa Markdown per formattare la risposta.
`;

const TEXT_SYSTEM_PROMPT = `
# Istruzioni di Sistema: Traduzione Multisensoriale e Corrispondenza Linguistica

## 🎭 Ruolo
Sei un **Traduttore Sensoriale ed Esperto di Comunicazione Non Visiva**. Il tuo obiettivo è riscrivere il testo di input per renderlo completamente accessibile e cognitivamente naturale per una persona non vedente dalla nascita (cieco congenito).

## 🌐 Integrità Linguistica (CRITICO)
*   **Identifica la Lingua:** Rileva la lingua del testo di input dell'utente (es. italiano, inglese, francese, spagnolo, ecc.).
*   **Corrispondenza dell'Output:** Devi generare la traduzione sensoriale **rigorosamente nella stessa lingua** dell'input.
*   **Non Tradurre le Lingue:** Se l'input è in italiano, l'output deve essere in italiano. Se l'input è in inglese, l'output deve essere in inglese. Traduci solo i *concetti* (da visivo a sensoriale), non la lingua stessa.

## 🧠 La Filosofia Fondamentale
> Una persona che non ha mai visto non "visualizza" una scena nella sua mente; la "costruisce" attraverso la consapevolezza spaziale, il suono, il tatto e la temperatura.

*   **Evita l'Ocularcentrismo:** Non usare frasi come "Sembra", "Puoi vedere" o "La vista mostra".
*   **Evita Metafore Visive:** Non usare modi di dire come "futuro luminoso", "brancolare nel buio" o "verde d'invidia" a meno che tu non spieghi direttamente l'emozione fisica.
*   **Concentrati sull'Essenza:** Descrivi l'oggetto o la scena attraverso il suo peso, la consistenza del materiale, il riflesso del suono, lo spostamento d'aria e la temperatura.

## 🛠️ Protocollo di Traduzione
Applica le seguenti regole di trasformazione al testo di input:

### 1. Luce e Contrasto → Temperatura e Definizione
*La luce visiva non ha significato; traducila in sensazione fisica.*
*   **Luce:** Calore radiante (sole, fuoco) o un senso di "apertura" e sicurezza. Una stanza "ben illuminata" sembra ariosa e distinta; nulla è nascosto.
*   **Oscurità:** Un calo di temperatura, un addensarsi dell'aria o uno spazio in cui i suoni sono smorzati. Rappresenta l'ignoto o il nascosto.
*   **Contrasto Visivo:** Traduci l'alto contrasto (nero su bianco) come "bordi netti", "cambiamenti improvvisi di consistenza" (es. seta contro cemento) o separazione distinta. Il basso contrasto è "ovattato", "sfocato" o "liscio".

### 2. Colore → Materialità e Sinestesia
*I colori sono concetti astratti per i ciechi congeniti. Traducili in materiali, temperature o pesi emotivi.*
*   **Rosso:** Calore intenso, sangue che pulsa, urgenza, spezie, la consistenza di una scottatura.
*   **Blu:** Acqua fresca, ghiaccio liscio, movimento fluido, suoni calmi a bassa frequenza.
*   **Verde:** L'odore di erba/foglie schiacciate, umidità, consistenza organica, il profumo della pioggia.
*   **Giallo/Oro:** Calore secco e pungente del sole, il sapore degli agrumi, vibrazione acuta, risonanza metallica.
*   **Bianco:** Pulizia sterile, silenzio, plastica liscia e fredda, assenza di profumo, vastità.
*   **Nero:** Pesantezza, densità, suono basso profondo, consistenza vellutata, gravità.
*   **Grigio:** Polvere, pietra, cemento, neutralità, superfici ruvide ma piatte.

### 3. Consapevolezza Spaziale → Acustica e Portata
*Sostituisci la prospettiva visiva con la relazione corporea e l'ecolocalizzazione.*
*   **Distanza:** Descrivi in termini di portata ("a portata di mano"), tempo ("a pochi passi") o suono ("la voce suona distante, sottile ed echeggiante").
*   **Dimensione:** Usa la relatività corporea ("altezza della vita", "più pesante di un gatto", "sta nel palmo di una mano").
*   **Ambiente:** Descrivi l'acustica. Lo spazio è "stretto e morto" (come un armadio) o "cavernoso ed echeggiante" (come una sala)? L'aria sembra stagnante o in movimento?

### 4. Azione e Postura → Cinestesia e Propriocezione
*Non descrivere come appare una persona mentre si muove; descrivi lo sforzo e la tensione interna.*
*   **Invece di:** "Si alzò in piedi e sembrava arrabbiato."
    *   **Usa:** "Irrigidì la spina dorsale, bloccando le ginocchia, la mascella serrata e i muscoli che vibravano di tensione."
*   **Invece di:** "Corse veloce."
    *   **Usa:** "I suoi piedi battevano il terreno in un ritmo rapido e pesante, il vento che sferzava contro il suo viso."

## 📝 Tono e Guida di Stile
*   **Concreto e Diretto:** Evita aggettivi visivi astratti. Sii specifico.
*   **Logica Sequenziale:** Costruisci la scena dalla "mano" verso l'esterno (ciò che è vicino) all'"orecchio" (ciò che è lontano). Non saltare qua e là basandoti puramente sulle linee visive.
*   **Vocabolario Sensoriale:** Usa parole come *fragile, pesante, vuoto, affilato, vellutato, metallico, ritmico, stagnante, pungente, umido, vibrante*.

## 🚀 Compito
Ricevi l'input dell'utente qui sotto. Rileva la lingua. Riscrivi il testo seguendo i protocolli di Traduzione Sensoriale in quella stessa lingua.
`;

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const resultRef = useRef<HTMLHeadingElement>(null);

  // Handle pasting images or text from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      // Check for image first
      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setImage(event.target?.result as string);
              setTextInput(""); // Clear text if image is pasted
            };
            reader.readAsDataURL(blob);
            return; // Stop processing if image found
          }
        }
      }

      // If no image, check for text
      const text = e.clipboardData?.getData("text");
      if (text) {
        setTextInput(text);
        setImage(null); // Clear image if text is pasted
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Handle file input selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setTextInput(""); // Clear text if image is uploaded
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
    if (e.target.value) {
      setImage(null); // Clear image if user types text
    }
  };

  const speakWithElevenLabs = async (text: string) => {
    const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_KEY;
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // "Rachel" - sounds good in Italian
    
    console.log("ElevenLabs Key present:", !!ELEVEN_KEY);
    if (ELEVEN_KEY) console.log("Key length:", ELEVEN_KEY.length);

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", // SOTA for Italian
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("ElevenLabs API Error:", response.status, errorData);
        alert(`ElevenLabs Error: ${errorData?.detail?.message || "Unauthorized"}`);
        return;
      }

      const blob = await response.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } catch (err) {
      console.error("TTS Error", err);
    }
  };

  const generateDescription = async () => {
    if (!image && !textInput) return;
    if (!OPENROUTER_API_KEY) {
      setError("Manca la API Key nel file .env");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      let messages;
      
      if (image) {
        messages = [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Descrivi questa immagine per un non vedente congenito seguendo rigorosamente le tue istruzioni." },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ];
      } else {
        messages = [
          {
            role: "system",
            content: TEXT_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: textInput
          }
        ];
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Sensory Translator"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: messages
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error.message);
      
      setResult(data.choices[0].message.content);
      // Focus on result after a short delay to ensure rendering
      setTimeout(() => {
        resultRef.current?.focus();
      }, 100);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Errore durante la generazione");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto font-sans" aria-live="polite">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">👁️‍🗨️ Tiresia</h1>
        <p className="text-slate-500">Carica un'immagine, incolla un testo o un'immagine (CTRL+V) per ottenere una traduzione sensoriale.</p>
      </header>

      {/* Input Area */}
      <section aria-label="Area di input" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500">
        
        {/* Image Preview */}
        {image && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <img src={image} alt="Anteprima immagine caricata" className="max-h-96 rounded-lg shadow-sm" />
            <button
              onClick={() => setImage(null)}
              className="text-sm text-red-500 hover:text-red-700 underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
              aria-label="Rimuovi l'immagine caricata"
            >
              Rimuovi immagine
            </button>
          </div>
        )}

        {/* Text Input Area (Hidden if image is present) */}
        {!image && (
          <div className="flex flex-col gap-4">
            <label htmlFor="text-input" className="sr-only">Inserisci testo da tradurre o incolla un'immagine</label>
            <textarea
              id="text-input"
              value={textInput}
              onChange={handleTextChange}
              placeholder="Scrivi qui il testo da tradurre sensorialmente, oppure incolla un'immagine (CTRL+V)..."
              className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y text-slate-700 placeholder:text-slate-400"
              aria-label="Area di testo per input o incolla immagine"
            />
            
            <div className="flex justify-center">
              <div className="relative">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Carica un'immagine dal dispositivo"
                />
                <button
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium transition-colors"
                  tabIndex={-1} // Focus is handled by the input
                >
                  📁 Carica Immagine
                </button>
              </div>
            </div>
          </div>
        )}

        {(image || textInput) && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={generateDescription}
              disabled={loading}
              aria-busy={loading}
              className={`px-8 py-3 rounded-full font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2
                ${loading ? 'bg-slate-500 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-800'}`}
            >
              {loading ? "Generazione in corso..." : (image ? "✨ Genera Descrizione Immagine" : "✨ Traduci Testo Sensorialmente")}
            </button>
          </div>
        )}
        
        {error && <div role="alert" className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>}
      </section>

      {/* Result Area */}
      {result && (
        <article className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 animate-fade-in relative">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 ref={resultRef} tabIndex={-1} className="text-xl font-bold text-indigo-900 outline-none">Descrizione Generata</h2>
            <button
              onClick={() => speakWithElevenLabs(result.split('### FASE 2: La Navigazione')[0])}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Ascolta la descrizione generata"
            >
              🔊 Ascolta
            </button>
            <button
              onClick={() => speakWithElevenLabs("Prova audio di debug")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-lg hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Test audio di debug"
            >
              🔊 Test Audio
            </button>
          </div>
          <div className="prose prose-slate max-w-none leading-relaxed whitespace-pre-wrap text-slate-700">
            {result}
          </div>
        </article>
      )}
    </main>
  );
}

export default App;
