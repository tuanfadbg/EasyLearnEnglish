// const OLLAMA_HOST = 'https://8adf-2405-4802-1c86-5a54-00-1001.ngrok-free.app';
// const OLLAMA_HOST = 'http://127.0.0.1:11434';
const OLLAMA_HOST = 'http://localhost:11434';


function buildStoryMessages(words) {
    const list = Array.isArray(words) ? words.filter(Boolean).map(String) : [String(words ?? '')];
    const cleaned = list.map(w => w.trim()).filter(Boolean);
    const wordsLine = cleaned.join(', ');

    return [
        {
            role: 'system',
            content: 'You are an English story writer. Your task is to help the learner understand and remember new words by writing a creative story that naturally uses the provided words and their variations.'
        },
        {
            role: 'user',
            content: `Please write a story to help me learn these words:
${wordsLine}

Guidelines:
- Make sure the story uses each word (and their variations) several times naturally.
- Use different tenses and sentence structures.
- Each sentence should be on its own line.
- The story should help me understand and remember the meaning and usage of these words.
`
        }
    ];
}

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

function buildRealtimeFixEnglishMessages(sentence) {
    return [
        {
            role: 'system',
            content: `You are an English grammar corrector. Your output must be strictly limited to the corrected text.

Rules:

No Metadata: No explanations, no preamble, and no labels (e.g., do not include "Output:" or "Fixed sentence:").

Correct and Preserve: Fix any grammatical, structural, or natural phrasing errors. Keep the original intent and format (e.g., if the input is a question, the output must remain a question).

If Already Correct: If the sentence is already correct and natural, return "ok".

Failure Condition: If you add any conversational text, explanations, or formatting headers, you have failed the task.

Example 1:
Input: "She are good"
Output: She is good

Example 2:
Input: "who is you"
Output: Who are you

Example 3:
Input: "I am the only one"
Output: ok

Example 4:
Input: "what type of these bricks?"
Output: What type of bricks are these?

If the sentence is already correct, don't rephrase the sentence—just check the grammar.`

        },
        {
            role: 'user',
            content: sentence
          }
    ];
}

function buildSynonymMessages(word) {
    return [
        {
            role: 'system',
            content: 'You are an English language assistant.'
        },
        {
            role: 'user',
            content: `Provide a list of 5-10 synonyms for the following English word. List only English words, separated by commas. Do not include any extra explanation or text.

Word: ${word}
`
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

function buildDescribeImageFromBase64(base64Image, content) {
    return [
        {
            role: 'user',
            content: (typeof content === 'string' && content.trim() !== '') ? content : 'Describe what you see in the image like casual conversation in 50 words.',
       
    //    content: 'Describe what you see in the image like a friend talking to another friend in 50 words.',
            // content: 'Tell me what you see in 50 words or less',
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
async function checkRealtimeFixEnglish(sentence, modelName) {
    const startTime = performance.now();
    const messages = buildRealtimeFixEnglishMessages(sentence);

    try {
        return await createOllamaChatStream({ modelName, messages, startTime });
    } catch (error) {
        const elapsed = Math.round(performance.now() - startTime);
        throw new Error(`Realtime fix failed after ${elapsed}ms. Last: ${error.message}`);
    }
}

async function describeImage(base64Image, content, modelName) {
    const startTime = performance.now();
    const messages = buildDescribeImageFromBase64(base64Image, content);

    try {
        return await createOllamaChatStream({ modelName, messages, startTime });
    } catch (error) {
        const elapsed = Math.round(performance.now() - startTime);
        throw new Error(`describeImage ${elapsed}ms. Last: ${error.message}`);
    }
}

// Runs an existing chat message array and streams callbacks.
// Returns { modelName, accumulated } when streaming completes.
async function streamChatMessages({
    modelName,
    messages,
    onToken,
    onThinking
}) {
    const startTime = performance.now();
    let accumulated = '';

    try {
        const result = await createOllamaChatStream({ modelName, messages, startTime });
        console.log('streamChatMessages resolved, model:', result.modelName);

        await result.stream({
            onToken: (token, acc, meta) => {
                accumulated = acc ?? '';
                if (typeof onToken === 'function') onToken(token, accumulated, meta);
                return accumulated;
            },
            onThinking: (token, acc) => {
                accumulated = acc ?? '';
                if (typeof onThinking === 'function') onThinking(token, accumulated);
            }
        });

        return { modelName: result.modelName, accumulated };
    } catch (error) {
        const elapsed = Math.round(performance.now() - startTime);
        throw new Error(`stream chat failed after ${elapsed}ms. Last: ${error.message}`);
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

async function writeStory(words, modelName) {
    const startTime = performance.now();
    const messages = buildStoryMessages(words);

    try {
        const result = await createOllamaChatStream({ modelName, messages, startTime });
        return result;
    } catch (error) {
        const elapsed = Math.round(performance.now() - startTime);
        throw new Error(`Story generation failed after ${elapsed}ms. Last: ${error.message}`);
    }
}

async function getSynonumWords(word, modelName) {
    const startTime = performance.now();
    const messages = buildSynonymMessages(word);

    try {
        const result = await createOllamaChatStream({ modelName, messages, startTime });
        return result;
    } catch (error) {
        const elapsed = Math.round(performance.now() - startTime);
        throw new Error(`Synonym generation failed after ${elapsed}ms. Last: ${error.message}`);
    }
}

