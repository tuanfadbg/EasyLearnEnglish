document.addEventListener('DOMContentLoaded', function () {
    const wordElement = document.getElementById('word');
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
            "word": "Date 0",
            "shuffledMeanings": [
                "A small red fruit",
                "A small red fruit",
                "A sweet fruit from palm trees",
                "A dark purple fruit"
            ],
            "correctAnswerIndex": 2
        }
    ];

    let currentWordIndex = 0;


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
        nextButton.disabled = true; // Disable the Next button until a question is answered
        currentWord = words[currentWordIndex];
        console.log(currentWord);

        wordElement.textContent = currentWord.word;
        const copyIcon = createCopyIcon(currentWord.word);
        wordElement.appendChild(copyIcon);

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

        // Display updated counts
        updateScore();
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

    document.addEventListener('keydown', function(event) {
        if (!nextButton.disabled) {
            if (event.key === 'Enter') {
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
});
