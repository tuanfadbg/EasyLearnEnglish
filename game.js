document.addEventListener('DOMContentLoaded', function () {
    const wordElement = document.getElementById('word');
    const answersContainer = document.getElementById('answers');
    const nextButton = document.getElementById('nextButton');
    const resultElement = document.getElementById('result');

    
    const words = [
        { word: 'Apple', meanings: ['A fruit', 'A computer brand', 'A color', 'A city'] },
        { word: 'Banana', meanings: ['A yellow fruit', 'A type of clothing', 'A vehicle', 'A planet'] },
        { word: 'Cherry', meanings: ['A red fruit', 'A musical instrument', 'A flower', 'A type of dance'] }
    ];

    let currentWordIndex = 0;
    let correctAnswerIndex;

    function loadQuestion() {
        const currentWord = words[currentWordIndex];
        wordElement.textContent = currentWord.word;

        // Shuffle meanings
        const shuffledMeanings = shuffle(currentWord.meanings);
        correctAnswerIndex = shuffledMeanings.indexOf(currentWord.meanings[0]); // Assuming the first meaning is correct

        answersContainer.innerHTML = '';
        shuffledMeanings.forEach((meaning, index) => {
            const button = document.createElement('button');
            button.textContent = meaning;
            button.classList.add('btn', 'btn-light', 'answer-button');
            button.addEventListener('click', () => checkAnswer(index));
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
        if (selectedIndex === correctAnswerIndex) {
            resultElement.textContent = 'Correct!';
            resultElement.classList.add('text-success');
        } else {
            resultElement.textContent = 'Incorrect. The correct answer is: ' + words[currentWordIndex].meanings[correctAnswerIndex];
            resultElement.classList.add('text-danger');
        }
        resultElement.classList.remove('text-success', 'text-danger');
        nextButton.disabled = false; // Enable the Next button
    }

    nextButton.addEventListener('click', function () {
        currentWordIndex = (currentWordIndex + 1) % words.length;
        loadQuestion();
        nextButton.disabled = true; // Disable the Next button until a question is answered
    });

    // Load the first question
    loadQuestion();
});
