$('#memoryGameModal').on('hidden.bs.modal', function () {
          collapseSaveContainer(); // Call collapseSaveContainer when the modal is closed
      });
      
      // Add event listener for close button to close the modal
      const memoryGameModal = document.getElementById('memoryGameModal');
      if (memoryGameModal) {
          const closeButton = memoryGameModal.querySelector('button.close[data-dismiss="modal"]');
          if (closeButton) {
              closeButton.addEventListener('click', function () {
                  $('#memoryGameModal').modal('hide');
              });
          }
      }

const checkGrammarButton = document.getElementById('checkGrammarButton');
const memoryGameTextArea = document.getElementById('memoryGameTextArea');
const grammarCheckResult = document.getElementById('grammarCheckResult');

let debounceTimeout;
let checkRealtimeFixEnglishDone = true
memoryGameTextArea.addEventListener('input', function () {
    const sentence = getMemoryGameInput();
    if (!sentence || sentence.length <= 10) return;

    if (checkRealtimeFixEnglishDone == false) 
        return;
    
    // if (debounceTimeout) clearTimeout(debounceTimeout);
    // debounceTimeout = setTimeout(() => {
    console.log('checkRealtimeFixEnglishDone:', checkRealtimeFixEnglishDone);
    checkRealtimeFixEnglishDone = false
    // Show the realtimeSpinner when starting grammar check
    showRealtimeSpinner()
    callAPIcheckRealtimeFixEnglish()
    // }, 300);
});


function callAPIcheckRealtimeFixEnglish() {
    console.log('Debounced input:', memoryGameTextArea.value);
    // Get the "randomWord" value for word, textarea value for sentence
    const word = document.getElementById('randomWord').textContent.trim();
    const sentence = getMemoryGameInput();

    const correctedVersionParagraph = document.getElementById('realtimeCorrectedVersion');
    
    if (word && sentence && correctedVersionParagraph) {
        checkRealtimeFixEnglish(word, sentence, MODEL_NAME_DEFAULT)
            .then(result => {
                return result.stream({
                    onToken: (token, accumulated, meta) => {
                        if (meta?.done) {
                            // Show the corrected/checked grammar result in the paragraph
                            console.log(meta);
                            console.log(markdownToHtml(accumulated));
                            if (accumulated.trim() === 'ok') {
                                correctedVersionParagraph.innerHTML = markCorrectionWords(sentence, sentence);
                            } else {
                                correctedVersionParagraph.innerHTML = markCorrectionWords(getMemoryGameInput(), accumulated);
                            }
                            
                            checkRealtimeFixEnglishDone = true
                        // Hide the realtimeSpinner when finished
                        hideRealtimeSpinner()
                        } else {
                            console.log(meta);
                            console.log(markdownToHtml(accumulated));
                            // Partial content as it's streaming in (optional)
                            correctedVersionParagraph.innerHTML = markCorrectionWords(getMemoryGameInput(), accumulated) + '<span class="typing-cursor">▌</span>';
                            
                        }
                    },
                    onThinking: (token, accumulated) => console.debug('[thinking]', token)
                });
            })
            .catch(() => {
                correctedVersionParagraph.textContent = 'Could not check grammar.';
                
                correctedVersionParagraph.style.color = 'red';
            });
    }
}

function getMemoryGameInput() {
    return memoryGameTextArea.value.trim();
}

checkGrammarButton.addEventListener('click', function () {
          // Get the "randomWord" value for word, textarea value for sentence
          const word = document.getElementById('randomWord').textContent.trim();
          const sentence = memoryGameTextArea.value.trim();
      
          if (!word || !sentence) {
              grammarCheckResult.textContent = 'Please enter a note to check grammar.';
              grammarCheckResult.style.color = 'red';
              return;
          }
      
          // Call the checkGrammar function defined in JS
          if (typeof checkGrammar === 'function') {
              grammarCheckResult.textContent = 'Checking...';
              grammarCheckResult.style.color = '';
          
              checkGrammar(word, sentence, MODEL_NAME_DEFAULT)
              .then(result => {
                  console.log('checkGrammar resolved, model:', result.model);
                  grammarCheckResult.innerHTML = '';
                  document.getElementById('grammar-stats').style.display = 'none'; // hide previous stats
                  return result.stream({
                    onToken: (token, accumulated, meta) => {
                        if (meta?.done) {
                            // ✅ Final render — no cursor, show stats
                            grammarCheckResult.innerHTML = markdownToHtml(accumulated, true);
        
                            // show token usage + model + time
                            const stats = document.getElementById('grammar-stats');
                            document.getElementById('grammar-model').textContent = `Model: ${result.model}`;
                            document.getElementById('grammar-tokens').textContent = `Tokens: ${meta.usage.prompt_tokens} prompt · ${meta.usage.completion_tokens} completion · ${meta.usage.total_tokens} total`;
                            document.getElementById('grammar-time').textContent = `First token: ${result.processingTime}ms`;
                            stats.style.display = 'block';
                        } else {
                            // ✅ While streaming — show cursor
                            grammarCheckResult.innerHTML = markdownToHtml(accumulated, true) + '<span class="typing-cursor">▌</span>';
                        }
                    },
                    onThinking: (token, accumulated) => console.debug('[thinking]', token)
                  });
              })

              
              .then(finalText => {
                  console.log('stream fully complete:', finalText);
              })
              .catch(err => {
                  console.error('checkGrammar error:', err);
                  grammarCheckResult.textContent = 'Could not check grammar.';
                  grammarCheckResult.style.color = 'red';
              });
          } else {
              grammarCheckResult.textContent = 'Grammar check function not available.';
              grammarCheckResult.style.color = 'red';
          }
      });
      
      const addContextButton = document.getElementById('addContextButton');
      addContextButton.addEventListener('click', function () {
          // Get the word from randomWord and context from textarea
          const word = document.getElementById('randomWord').textContent.trim();
          const context = memoryGameTextArea.value.trim();
      
          if (!word) {
              alert('Please select a word first.');
              return;
          }
      
          if (!context) {
              alert('Please enter a context/note to add.');
              return;
          }
      
          // Call the addContextToWordbook function from db.js
          if (typeof addContextToWordbook === 'function') {
              addContextToWordbook(word, context)
                  .then(({ text, previousWord }) => {
                      console.log(`Context added to word: ${text}, previous word: ${previousWord}`);
                      // alert('Context added successfully!');
                      // Optionally clear the textarea after successful add
                      memoryGameTextArea.value = '';
                  })
                  .catch(err => {
                      console.error('Error adding context:', err);
                      // alert('Error adding context. Please try again.');
                  });
          } else {
              alert('addContextToWordbook function not available.');
          }
      });
      
function displayExampleSentences(word, previousWord = null) {
    console.log('displayExampleSentences', word, previousWord);
    // Show the example sentences box if hidden
    const exampleBox = document.getElementById('exampleSentencesBox');
    if (exampleBox) exampleBox.style.display = '';

    const contentDiv = document.getElementById('exampleSentencesContent');
    if (contentDiv) {
        contentDiv.innerHTML = "<span style='opacity:0.6;'>Loading example sentences...</span>";
        return makeSampleSentences([word, previousWord ?? ''], MODEL_NAME_DEFAULT)
            .then(result => {
                return result.stream({
                    onToken: (token, accumulated, meta) => {
                        contentDiv.innerHTML = markdownToHtml(accumulated, true);
                    },
                    onThinking: (token, accumulated) => console.debug('[thinking]', token)
                });
            })
            .catch(err => {
                contentDiv.innerHTML = "<span style='color:red'>Could not fetch example sentences.</span>";
                console.error('displayExampleSentences error:', err);
                throw err;
            });
    }
    return Promise.resolve();
}

function displayMeaningInEnglish(word) {
    console.log('displayMeaningInEnglish', word);
    // Show the meaning in English box if hidden
    const meaningBox = document.getElementById('meaningEnglishBox');
    if (meaningBox) meaningBox.style.display = '';

    const contentDiv = document.getElementById('meaningEnglishContent');
    if (contentDiv) {
        contentDiv.innerHTML = "<span style='opacity:0.6;'>Loading meaning in English...</span>";
        return getMeaningInEnglish(word, MODEL_NAME_DEFAULT)
            .then(result => {
                return result.stream({
                    onToken: (token, accumulated, meta) => {
                        contentDiv.innerHTML = markdownToHtml(accumulated, true);
                    },
                    onThinking: (token, accumulated) => console.debug('[thinking]', token)
                });
            })
            .catch(err => {
                contentDiv.innerHTML = "<span style='color:red'>Could not fetch meaning.</span>";
                console.error('displayMeaningInEnglish error:', err);
                throw err;
            });
    }
    return Promise.resolve();
}


function showRealtimeSpinner() {
    const realtimeSpinner = document.getElementById('realtimeSpinner');
    if (realtimeSpinner) {
        realtimeSpinner.style.display = 'block';
    }
}

function hideRealtimeSpinner() {
    const realtimeSpinner = document.getElementById('realtimeSpinner');
    if (realtimeSpinner) {
        realtimeSpinner.style.display = 'none';
    }
}