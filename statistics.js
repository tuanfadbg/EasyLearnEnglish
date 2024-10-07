let wordStatsGlobal = {};

document.addEventListener('DOMContentLoaded', function() {
    // Fetch statistics from chrome.storage.local
    chrome.storage.local.get(['gameStats', 'wordStats'], function(result) {
        const gameStats = result.gameStats || { totalGames: 0, totalQuestions: 0, totalCorrect: 0, recentAccuracy: [], lastUpdated: null };
        const wordStats = result.wordStats || {};
        console.log(wordStats)
        console.log(gameStats)

        // Update overall statistics
        updateOverallStats(gameStats, wordStats); // Call to update overall stats

        // Create accuracy chart
        createAccuracyChart(gameStats.recentAccuracy);

        // Populate word performance table
        wordStatsGlobal = wordStats || {};
        populateWordPerformanceTable(wordStatsGlobal);

        // Add event listeners for sorting
        document.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const sortBy = th.dataset.sort;
                sortWordPerformanceTable(sortBy);
            });
        });

        // Add event listener for reset button
        document.getElementById('resetStats').addEventListener('click', resetStatistics);

        // Add event listener for close button
        document.getElementById('closeButton').addEventListener('click', () => window.close());
    });
});

function createAccuracyChart(recentAccuracy) {
    const ctx = document.getElementById('accuracyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: recentAccuracy && recentAccuracy.length > 0 ? recentAccuracy.map((entry, index) => `Game ${index + 1}`) : [],
            datasets: [{
                label: 'Accuracy',
                data: recentAccuracy && recentAccuracy.length > 0 ? recentAccuracy.map(entry => entry.accuracy) : [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function populateWordPerformanceTable(wordStats) {
    const wordPerformanceTable = document.getElementById('wordPerformance');
    wordPerformanceTable.innerHTML = ''; // Clear existing rows

    for (const [word, stats] of Object.entries(wordStats)) {
        const row = wordPerformanceTable.insertRow();
        row.insertCell(0).textContent = word;
        row.insertCell(1).textContent = stats.correct;
        row.insertCell(2).textContent = stats.total;
        const accuracy = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(2) : 0;
        row.insertCell(3).textContent = accuracy + '%';
        
        // Get last attempt date
        const lastAttempt = stats.attempts && stats.attempts.length > 0 ? new Date(stats.attempts[stats.attempts.length - 1].timestamp).toLocaleString() : 'Never';
        row.insertCell(4).textContent = lastAttempt;

        // Store the numerical values for sorting
        row.dataset.correctAttempts = stats.correct;
        row.dataset.totalAttempts = stats.total;
        row.dataset.accuracy = accuracy;
        row.dataset.lastAttempt = stats.attempts && stats.attempts.length > 0 ? new Date(stats.attempts[stats.attempts.length - 1].timestamp).getTime() : 0; // Store timestamp for sorting
    }
}

function sortWordPerformanceTable(sortBy) {
    const table = document.getElementById('wordPerformance');
    const headers = document.querySelectorAll('th.sortable');
    const headerIndex = Array.from(headers).findIndex(th => th.dataset.sort === sortBy);
    const currentHeader = headers[headerIndex];

    // Determine sort order
    const currentOrder = currentHeader.classList.contains('sort-asc') ? 'desc' : 'asc';

    // Remove existing sort classes
    headers.forEach(header => header.classList.remove('sort-asc', 'sort-desc'));

    // Add new sort class
    currentHeader.classList.add(`sort-${currentOrder}`);

    // Sort the wordStatsGlobal object
    const sortedEntries = Object.entries(wordStatsGlobal).sort((a, b) => {
        let aValue, bValue;
        
        if (sortBy === 'correctAttempts') {
            aValue = a[1].correct;
            bValue = b[1].correct;
        } else if (sortBy === 'totalAttempts') {
            aValue = a[1].total;
            bValue = b[1].total;
        } else if (sortBy === 'accuracy') {
            aValue = a[1].total > 0 ? (a[1].correct / a[1].total) : 0;
            bValue = b[1].total > 0 ? (b[1].correct / b[1].total) : 0;
        } else if (sortBy === 'lastAttempt') { // New sorting condition
            aValue = a[1].attempts && a[1].attempts.length > 0 ? new Date(a[1].attempts[a[1].attempts.length - 1].timestamp).getTime() : 0;
            bValue = b[1].attempts && b[1].attempts.length > 0 ? new Date(b[1].attempts[b[1].attempts.length - 1].timestamp).getTime() : 0;
        }

        return currentOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Create a new sorted object
    const sortedWordStats = Object.fromEntries(sortedEntries);

    // Repopulate the table with sorted data
    populateWordPerformanceTable(sortedWordStats);
}

function resetStatistics() {
    if (confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
        chrome.storage.local.set({ gameStats: {}, wordStats: {} }, function() {
            console.log('Statistics reset');
            
            // Reset global variables
            wordStatsGlobal = {};
            
            // Update UI
            updateOverallStats({});
            populateWordPerformanceTable({});
            createAccuracyChart([]);
            
            // Update last updated time
            document.getElementById('lastUpdated').textContent = 'Never';
            
            alert('Statistics have been reset successfully.');
        });
    }
}

function updateOverallStats(gameStats, wordStats) {
    document.getElementById('totalGames').textContent = gameStats.totalGames || 0;
    document.getElementById('totalQuestions').textContent = gameStats.totalQuestions || 0;
    document.getElementById('totalCorrect').textContent = gameStats.totalCorrect || 0;
    const accuracy = gameStats.totalQuestions ? ((gameStats.totalCorrect / gameStats.totalQuestions) * 100).toFixed(2) : 0;
    document.getElementById('overallAccuracy').textContent = accuracy + '%';
    document.getElementById('lastUpdated').textContent = gameStats.lastUpdated ? new Date(gameStats.lastUpdated).toLocaleString() : 'Never'; // Update last updated time
}