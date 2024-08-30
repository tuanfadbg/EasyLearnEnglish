document.addEventListener('DOMContentLoaded', function() {
    const exportButton = document.getElementById('exportButton');
    const importButton = document.getElementById('importButton');
    const importFile = document.getElementById('importFile');
    const downloadLink = document.getElementById('downloadLink');

    // Export function
    exportButton.addEventListener('click', function() {
        chrome.storage.local.get(null, function(items) {
            const jsonString = JSON.stringify(items);
            const blob = new Blob([jsonString], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            
            const dateTime = getCurrentDateTime();
            downloadLink.href = url;
            downloadLink.download = `vocabulary_backup_${dateTime}.json`;
            downloadLink.style.display = 'inline';
            downloadLink.click();
            
            URL.revokeObjectURL(url);
        });
    });

    // Import function
    importButton.addEventListener('click', function() {
        const file = importFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    chrome.storage.local.set(data, function() {
                        alert('Data imported successfully!');
                    });
                } catch (error) {
                    alert('Error importing data. Please make sure the file is valid.');
                }
            };
            reader.readAsText(file);
        } else {
            alert('Please select a file to import.');
        }
    });

    // Night mode toggle
    const nightModeButton = document.getElementById('nightMode');
    nightModeButton.addEventListener('click', function() {
        document.body.classList.toggle('night-mode');
    });
});

// Function to get current date and time in a formatted string
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}
