const OLLAMA_HOST = 'https://8adf-2405-4802-1c86-5a54-00-1001.ngrok-free.app';

function buildGrammarMessages(word, sentence) {
    return [
        {
            role: 'system',
            content: 'You are an English grammar teacher helping a student practice English. Always respond in the exact format requested. Keep explanations short and clear.'
        },
        {
            role: 'user',
            content: `I am learning English. I wrote a sentence to practice the word "${word}" and its variations.
My sentence is:
"${sentence}"

Please respond exactly in the following format, no other text, without repeating the instruction titles, index only:
1. Fix my sentence and clearly highlight the mistakes.
   - Show ONLY the fixed sentence (do not repeat the original sentence).
   - List all corrections made.
2. Provide 2–3 better and more natural versions of the sentence and using this word "${word}" and its variations.
3. Briefly explain how I can improve my English based on my mistakes.

Format 
1.
2.
3.
Important:
- Always replace the original sentence with the fixed sentence.
- Keep explanations short and clear.`
        }
    ];
}

function buildRealtimeFixEnglishMessages(word, sentence) {
    return [
        {
            role: 'system',
            content: `You are an English grammar corrector. Your output must be strictly limited to the corrected text.

Rules:

No Metadata: No explanations, no preamble, and no labels (e.g., do not include "Output:" or "Fixed sentence:").

Sentence Completion: If the input is an incomplete fragment, complete it into a full, logical sentence based on the provided words. Avoid adding nonsensical or unrelated details.

Correctness: If the sentence is already correct, return ok.

Punctuation: Ignore trailing punctuation; do not add or remove periods or commas at the end of the sentence unless necessary for grammar.

Failure Condition: If you add any conversational text or formatting headers, you have failed the task.

Example 1:
Input: "She are good"
Output: She is good

Example 2 :
Input: "went to market"
Output: I went to the market

Example 3:
Input: "I am the only one"
Output: ok`

        },
        {
            role: 'user',
            content: sentence
          }
    ];
}

function buildSampleSentenceMessages(words) {
    const list = Array.isArray(words) ? words.filter(Boolean).map(String) : [String(words ?? '')];
    const cleaned = list.map(w => w.trim()).filter(Boolean);
    const wordsLine = cleaned.join(', ');

    return [
        {
            role: 'system',
            content:
                'You are an English tutor. Generate concise sample sentences for vocabulary practice. Output ONLY in the requested format, No explanations, no preamble, no extra text'
        },
        {
            role: 'user',
            content: `Generate sample sentences using the following word(s):
${wordsLine}

Rules:
- Create 3 sample sentences use the combination of the words.
- Vary tense and structure.
- Keep each sentence on its own line.
- Each sentence is only in one line.
`
        }
    ];
}

function buildDescribeImageFromBase64(base64Image) {
    return [
        {
            role: 'user',
            content: 'Describe this image',
            images: [base64Image]
        },
    ];
}

async function createOllamaChatStream({ modelName, messages, startTime, think = false }) {
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    console.log('[ollama] fetch start', { requestId, modelName, think, t: Date.now() });

    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Most Ollama-compatible APIs expect `model`, not `modelName`
        body: JSON.stringify({ model: modelName, messages, stream: true, think })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (!response.body) throw new Error('No response body (stream unavailable)');

    const processingTime = Math.round(performance.now() - startTime);
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
        return {
            modelName,
            processingTime,
            stream: ({ onToken, onThinking } = {}) =>
                consumeOllamaStreamQwenModel({ reader, decoder, onToken, onThinking, requestId })
        };    
}

async function consumeOllamaStreamGemmaModel({ reader, decoder, onToken }) {
    let buffer = '';
    let fullText = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const frame = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);

            const line = frame.split('\n').find(l => l.startsWith('data: '));
            if (!line) continue;

            try {
                const j = JSON.parse(line.slice(6));
                const token = j?.message?.content ?? '';

                if (token) {
                    fullText += token;
                    onToken(token, fullText);
                }

                if (j.done) {
                    onToken('', fullText, { done: true, usage: j.usage ?? {} });
                    return fullText;
                }
            } catch (e) {
                console.error('parse error:', e, 'line was:', line);
            }
        }
    }

    return fullText;
}

// async function consumeOllamaStreamQwenModel({ reader, decoder, onToken }) {
//     let buffer = '';
//     let fullText = '';

//     while (true) {
//         const { value, done } = await reader.read();
//         if (done) break;

//         buffer += decoder.decode(value, { stream: true });

//         let idx;
//         while ((idx = buffer.indexOf('\n')) !== -1) {
//             const line = buffer.slice(0, idx).trim();
//             buffer = buffer.slice(idx + 1);

//             if (!line) continue;

//             try {
//                 const j = JSON.parse(line);
//                 const token = j?.message?.content ?? '';

//                 if (token) {
//                     fullText += token;
//                     onToken(token, fullText);
//                 }

//                 if (j.done) {
//                     onToken('', fullText, {
//                         done: true,
//                         usage: {
//                             prompt_tokens: j.prompt_eval_count ?? 0,
//                             completion_tokens: j.eval_count ?? 0,
//                             total_tokens: (j.prompt_eval_count ?? 0) + (j.eval_count ?? 0),
//                         }
//                     });
//                     return fullText;
//                 }
//             } catch (e) {
//                 console.error('parse error:', e, 'line was:', line);
//             }
//         }
//     }

//     return fullText;
// }

async function consumeOllamaStreamQwenModel({ reader, decoder, onToken, onThinking, requestId }) {
    let buffer = '';
    let fullText = '';
    let fullThinking = '';
    let firstTokenLogged = false;

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);

            if (!line) continue;

            try {
                const j = JSON.parse(line);
                const token = j?.message?.content ?? '';
                const thinking = j?.message?.thinking ?? '';

                if (thinking) {
                    fullThinking += thinking;
                    onThinking?.(thinking, fullThinking);
                }

                if (token) {
                    fullText += token;
                    if (!firstTokenLogged) {
                        firstTokenLogged = true;
                        console.log('[ollama] first token', { requestId, modelName: j?.model, t: Date.now() });
                    }
                    onToken(token, fullText);
                }

                if (j.done) {
                    onToken('', fullText, {
                        done: true,
                        thinking: fullThinking,
                        usage: {
                            total_duration: j.total_duration,
                            load_duration: j.load_duration,
                            prompt_eval_count: j.prompt_eval_count,
                            prompt_eval_duration: j.prompt_eval_duration,
                            eval_count: j.eval_count,
                            eval_duration: j.eval_duration
                        }
                    });
                    return { fullText, fullThinking };
                }
            } catch (e) {
                console.error('parse error:', e, 'line was:', line);
            }
        }
    }

    return { fullText, fullThinking };
}

async function checkGrammar(word, sentence, modelName) {
    const startTime = performance.now();
    const messages = buildGrammarMessages(word, sentence);

    try {
        return await createOllamaChatStream({ modelName, messages, startTime });
    } catch (error) {
        const elapsed = Math.round(performance.now() - startTime);
        throw new Error(`Grammar request failed after ${elapsed}ms. Last: ${error.message}`);
    }
}

// Streams a quick correction + highlighted version for UI display.
// Returns the same shape as checkGrammar(): { modelName, processingTime, stream(onToken) }.
async function checkRealtimeFixEnglish(word, sentence, modelName) {
    const startTime = performance.now();
    const messages = buildRealtimeFixEnglishMessages(word, sentence);

    try {
        return await createOllamaChatStream({ modelName, messages, startTime });
    } catch (error) {
        const elapsed = Math.round(performance.now() - startTime);
        throw new Error(`Realtime fix failed after ${elapsed}ms. Last: ${error.message}`);
    }
}

async function describeImage(base64Image, modelName) {
    const startTime = performance.now();
    const messages = buildDescribeImageFromBase64(base64Image);

    try {
        return await createOllamaChatStream({ modelName, messages, startTime });
    } catch (error) {
        const elapsed = Math.round(performance.now() - startTime);
        throw new Error(`describeImage ${elapsed}ms. Last: ${error.message}`);
    }
}

async function makeSampleSentences(words, modelName) {
    const startTime = performance.now();
    const messages = buildSampleSentenceMessages(words);

    try {
        const result = await createOllamaChatStream({ modelName, messages, startTime, think: false });
        return result;
    } catch (error) {
        const elapsed = Math.round(performance.now() - startTime);
        throw new Error(`Sample sentence generation failed after ${elapsed}ms. Last: ${error.message}`);
    }
}

function buildMeaningInEnglishMessages(words) {
    const list = Array.isArray(words) ? words.filter(Boolean).map(String) : [String(words ?? '')];
    const cleaned = list.map(w => w.trim()).filter(Boolean);
    const wordsLine = cleaned.join(', ');

    return [
        {
            role: 'system',
            content:
                'You are an English dictionary teacher. Explain meanings in simple English, with examples. Output ONLY in the requested format.'
        },
        {
            role: 'user',
            content: `Explain the meaning of the following English word(s) in simple English and give 2 short example sentences for each:
${wordsLine}

Rules:
- Use simple, learner-friendly English.
- Do NOT use another language.
- For each word: 1–2 short definitions + 2 short example sentences.

Output format (no extra text):
<word1>
- Meaning: ...
- Meaning: ...
- Meaning: ...
- Meaning: ...
...
Examples:
1. ...
2. ...
`
        }
    ];
}

// Same shape as makeSampleSentences: { modelName, processingTime, stream(onToken) }
async function getMeaningInEnglish(words, modelName) {
    const startTime = performance.now();
    const messages = buildMeaningInEnglishMessages(words);

    try {
        const result = await createOllamaChatStream({ modelName, messages, startTime });
        return result;
    } catch (error) {
        const elapsed = Math.round(performance.now() - startTime);
        throw new Error(`Meaning generation failed after ${elapsed}ms. Last: ${error.message}`);
    }
}