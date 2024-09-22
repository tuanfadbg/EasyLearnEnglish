document.addEventListener('DOMContentLoaded', function () {
    const wordElement = document.getElementById('wordQuestion');
    const answersContainer = document.getElementById('answers');
    const nextButton = document.getElementById('nextButton');
    const resultElement = document.getElementById('result');

    // Buttons
    const allButton = document.getElementById('allButton');
    const allRandomButton = document.getElementById('allRandomButton');
    const newestButton20 = document.getElementById('newestButton20');
    const randomNewestButton20 = document.getElementById('randomNewestButton20');
    const random20Button = document.getElementById('random20Button');

    var isRandom = false;
    var count = -1;
    var newWord = false;

    let totalQuestions = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    let words = [
        {
            "meaning": "A sweet fruit from palm trees",
            "note": "Often eaten dried",
            "timestamp": "2024-08-18T06:51:41.179Z",
            "word": "Date",
            "shuffledMeanings": [
                "A small red fruit",
                "A sweet fruit from palm trees",
                "A tropical yellow fruit",
                "A dark purple fruit"
            ],
            "correctAnswerIndex": 1
        },
        {
            "meaning": "A large, orange-colored fruit",
            "note": "Often used in pies",
            "timestamp": "2024-08-19T10:30:00.000Z",
            "word": "Pumpkin",
            "shuffledMeanings": [
                "A large, orange-colored fruit",
                "A small, round green vegetable",
                "A red, heart-shaped fruit",
                "A purple berry"
            ],
            "correctAnswerIndex": 0
        },
        {
            "meaning": "A green fruit with a fuzzy brown exterior",
            "note": "Native to New Zealand",
            "timestamp": "2024-08-20T14:15:00.000Z",
            "word": "Kiwi",
            "shuffledMeanings": [
                "A citrus fruit with yellow skin",
                "A green fruit with a fuzzy brown exterior",
                "A tropical fruit with spiky skin",
                "A small, round red fruit"
            ],
            "correctAnswerIndex": 1
        },
        {
            "meaning": "A tropical fruit with yellow flesh and spiky skin",
            "note": "Contains an enzyme that can tenderize meat",
            "timestamp": "2024-08-21T09:45:00.000Z",
            "word": "Pineapple",
            "shuffledMeanings": [
                "A small, tart berry",
                "A large, green melon",
                "A tropical fruit with yellow flesh and spiky skin",
                "A purple fruit with smooth skin"
            ],
            "correctAnswerIndex": 2
        },
        {
            "meaning": "A small, sweet berry",
            "note": "Often used in jams and pies",
            "timestamp": "2024-08-22T16:20:00.000Z",
            "word": "Strawberry",
            "shuffledMeanings": [
                "A large, yellow tropical fruit",
                "A small, sweet berry",
                "A green, sour fruit",
                "A brown nut with a hard shell"
            ],
            "correctAnswerIndex": 1
        }
    ];

    let currentWordIndex = 0;

    wordElement.addEventListener('click', () => {
        openGoogleTranslate(currentWord.word);
    });

    function getRandomMeanings(currentWordIndex) {
        const meanings = [];

        // Add the correct meaning
        meanings.push(words[currentWordIndex].meaning);

        // Get other random meanings
        const otherIndices = [...Array(words.length).keys()].filter(i => i !== currentWordIndex);
        shuffle(otherIndices);

        for (let i = 0; i < 3; i++) {
            meanings.push(words[otherIndices[i]].meaning);
        }

        // Shuffle the array to mix the correct answer with the incorrect ones
        return shuffle(meanings);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    var currentWord;

    function loadQuestion() {
        document.querySelector('.question-card').style.display = 'block';
        nextButton.disabled = true; // Disable the Next button until a question is answered
        currentWord = words[currentWordIndex];
        console.log(currentWord);

        wordElement.textContent = currentWord.word;
        const copyIcon = createCopyIcon(currentWord.word);
        wordElement.appendChild(copyIcon);

        // Hide the note container when loading a new question
        const noteContainer = document.getElementById('noteContainer');
        noteContainer.style.display = 'none'; // Hide the note text area

        // Get the array of meanings
        answersContainer.innerHTML = '';
        currentWord.shuffledMeanings.forEach((meaning, index) => {
            const button = document.createElement('button');
            button.textContent = meaning;
            button.classList.add('btn', 'btn-light', 'answer-button');
            button.addEventListener('click', () => {
                copyToClipboard(meaning);
                checkAnswer(index);
            });
            answersContainer.appendChild(button);
        });

        resultElement.textContent = '';
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    function checkAnswer(selectedIndex) {
        if (nextButton.disabled) {
            totalQuestions++; // Increment total questions   
            if (selectedIndex === currentWord.correctAnswerIndex) {
                correctAnswers++; // Increment correct answers
            } else {
                wrongAnswers++; // Increment wrong answers
            }

            // Update stats for the current word
            updateStats(currentWord.word, selectedIndex === currentWord.correctAnswerIndex);
        }

        console.log("checkAnswer " + selectedIndex)
        if (selectedIndex === currentWord.correctAnswerIndex) {
            resultElement.textContent = 'Correct!';
            resultElement.innerHTML = 'Correct!<br/>' + currentWord.note;
            resultElement.classList.add('text-success');
        } else {
            resultElement.innerHTML = 'Incorrect. The correct answer is: ' + currentWord.meaning + "<br/>" + currentWord.note;
            resultElement.classList.add('text-danger');
        }
        resultElement.classList.remove('text-success', 'text-danger');
        nextButton.disabled = false; // Enable the Next button

        // Populate the note input with the current note
        const noteInput = document.getElementById('noteInput');
        noteInput.value = currentWord.note; // Set the current note in the input box

        // Show the note container
        const noteContainer = document.getElementById('noteContainer');
        noteContainer.style.display = 'block'; // Show the note text area

        // Display updated counts
        updateScore();
    }

    function updateStats(word, isCorrect) {
        // Define the structure for gameStats and wordStats
        // gameStats structure:
        // {
        //     totalGames: number,       // Total number of games played
        //     totalQuestions: number,   // Total number of questions answered across all games
        //     totalCorrect: number,     // Total number of correct answers across all games
        //     recentAccuracy: array,    // Array of recent game accuracies
        //     lastUpdated: string       // Timestamp of last update
        // }

        // wordStats structure:
        // {
        //     [word]: {
        //         correct: number,      // Number of times this word was answered correctly
        //         total: number,        // Total number of times this word was presented
        //         attempts: array       // Array of recent attempts for this word
        //     }
        // }

        chrome.storage.local.get(['gameStats', 'wordStats'], function(result) {
            let gameStats = result.gameStats || { 
                totalGames: 0, 
                totalQuestions: 0, 
                totalCorrect: 0, 
                recentAccuracy: [],
                lastUpdated: null
            };
            let wordStats = result.wordStats || {};

            const now = new Date();
            const timestamp = now.toISOString();

            // Update game stats
            gameStats.totalQuestions++;
            if (isCorrect) {
                gameStats.totalCorrect++;
            }
            gameStats.lastUpdated = timestamp;

            // Update word stats
            if (!wordStats[word]) {
                wordStats[word] = { correct: 0, total: 0, attempts: [] };
            }
            wordStats[word].total++;
            if (isCorrect) {
                wordStats[word].correct++;
            }
            wordStats[word].attempts.push({
                timestamp: timestamp,
                isCorrect: isCorrect
            });

            // Limit attempts array to last 50 entries
            if (wordStats[word].attempts.length > 50) {
                wordStats[word].attempts = wordStats[word].attempts.slice(-50);
            }

            // Calculate and update recent accuracy
            const currentGameAccuracy = (correctAnswers / totalQuestions) * 100;
            if (!gameStats.recentAccuracy) {
                gameStats.recentAccuracy = [];
            }
            if (gameStats.recentAccuracy.length >= 10) {
                gameStats.recentAccuracy.shift(); // Remove the oldest entry if we have 10 already
            }
            gameStats.recentAccuracy.push({
                accuracy: currentGameAccuracy,
                timestamp: timestamp
            });

            // Save updated stats
            chrome.storage.local.set({ gameStats: gameStats, wordStats: wordStats }, function() {
                console.log('Stats updated for word:', word);
            });
        });
    }

    function updateScore() {
        const totalElement = document.getElementById('totalQuestions');
        const correctElement = document.getElementById('correctAnswers');
        const wrongElement = document.getElementById('wrongAnswers');

        totalElement.textContent = `Total Questions: ${totalQuestions}`;
        correctElement.textContent = `Correct Answers: ${correctAnswers}`;
        wrongElement.textContent = `Wrong Answers: ${wrongAnswers}`;
    }
    function resetScore() {
        totalQuestions = 0;
        correctAnswers = 0;
        wrongAnswers = 0;
        updateScore();
    }

    nextButton.addEventListener('click', function () {
        currentWordIndex = (currentWordIndex + 1) % words.length;
        loadQuestion();
    });

    document.addEventListener('keydown', function (event) {
        if (!nextButton.disabled) {
            if (event.key === 'Enter' && event.metaKey) {
                currentWordIndex = (currentWordIndex + 1) % words.length;
                loadQuestion();
            }
        }
    });

    allButton.addEventListener('click', function () {
        isRandom = false;
        count = -1;
        newWord = true;
        prepareData();
    });

    allRandomButton.addEventListener('click', function () {
        isRandom = true;
        count = -1;
        newWord = false;
        prepareData();
    });

    newestButton20.addEventListener('click', function () {
        isRandom = false;
        count = 20;
        newWord = true;
        prepareData();
    });

    randomNewestButton20.addEventListener('click', function () {
        isRandom = true;
        count = 20;
        newWord = true;
        prepareData();
    });
    random20Button.addEventListener('click', function () {
        isRandom = true;
        count = 20;
        newWord = false;
        prepareData();
    });


    //isRandom = true;
    // count = -1;
    // newWord = false;
    
    function prepareData() {
        resetScore();
        chrome.storage.local.get({ words: [] }, function (result) {
            words = result.words;
            console.log(words);
            if (newWord) {
                words.sort(function (a, b) {
                    return !newWord
                        ? new Date(a.timestamp) - new Date(b.timestamp)
                        : new Date(b.timestamp) - new Date(a.timestamp);
                });
                if (count == -1) { // all

                } else {
                    words = words.slice(0, count);
                }
                shuffleWordsIfRandom();
            } else {
                shuffleWordsIfRandom();
                if (count == -1) { // all

                } else {
                    words = words.slice(0, count);
                }
            }


            // add suffledMeanings
            words.forEach((word, index) => {
                word.shuffledMeanings = getRandomMeanings(index);
                word.correctAnswerIndex = word.shuffledMeanings.indexOf(word.meaning); // Assuming the correct meaning is in the array
            });
            console.log(words);
            loadQuestion();
        });
    }

    function shuffleWordsIfRandom() {
        if (isRandom) {
            for (let i = words.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [words[i], words[j]] = [words[j], words[i]]; // Swap elements
            }
        }
    }


    // prepareData();

    // At the end of each game:
    function finishGame() {
        chrome.storage.local.get(['gameStats'], function (result) {
            let gameStats = result.gameStats || { totalGames: 0, totalQuestions: 0, totalCorrect: 0, recentAccuracy: [] };
            gameStats.totalGames++;
            const accuracy = (correctAnswers / totalQuestions) * 100;
            gameStats.recentAccuracy.push(accuracy);
            if (gameStats.recentAccuracy.length > 10) gameStats.recentAccuracy.shift(); // Keep only last 10 games

            chrome.storage.local.set({ gameStats: gameStats });
        });
    }

    // Add click event for the Save Note button
    const saveNoteButton = document.getElementById('saveNoteButton');
    saveNoteButton.addEventListener('click', () => {
        const noteInput = document.getElementById('noteInput');
        const newNote = noteInput.value;
        currentWord.note = newNote;
        updateWord(currentWord);

        // Show success message
        const saveNoteMessage = document.getElementById('saveNoteMessage');
        saveNoteMessage.style.display = 'block'; // Show the message
        setTimeout(() => {
            saveNoteMessage.style.display = 'none'; // Hide after 3 seconds
        }, 3000);
    });

    // Add click event for the Edit button
    const editButton = document.getElementById('editButton');
    editButton.addEventListener('click', () => {
        console.log(currentWord);
        showDialogEditAndFillData(currentWord);
    
    });

    const editAndSaveWord = document.getElementById('editAndSaveWord');
    editAndSaveWord.addEventListener('click', function () {
        chrome.storage.local.get({ words: [] }, function (result) {
            result.words.forEach(word => {
                if (word.word == wordInput.value) {
                    console.log(word);
                    word.meaning = meaningInput.value;
                    word.note = noteInput.value;
                }
            });
            updateWordInStorage(result.words);
            
        });
    });

document.querySelector('.question-card').style.display = 'none';

});


