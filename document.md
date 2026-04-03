# Chrome Extension Project Document

## Project Structure

```
.
├── .vscode/settings.json
├── README.md
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── capture_preview.html
├── capture_preview.js
├── db.js
├── models.js
├── utils.js
├── olama.api.js
├── modal_edit_text.js
├── game.html
├── game.js
├── translator.html
├── translator.js
├── statistics.html
├── statistics.js
├── saved_words.html
├── saved_words.js
├── translate_line_by_line.html
├── backup.html
├── backup.js
├── wordbook.html
├── wordbook.js
├── wordbook-memory-game.js
├── golive.html
├── n8n/
│   ├── Spell check.json
│   ├── Grammar.json
│   └── Sentences generation.json
├── resources/
│   ├── bootstrap.min.css
│   ├── bootstrap.min.js
│   ├── chart.js
│   ├── game.css
│   ├── saved_words.css
│   ├── translator.css
│   ├── styles.css
│   ├── full-screen-modal.css
│   ├── wordbook.css
│   ├── jquery-3.5.1.slim.min.js
│   ├── popper.min.js
│   └── voicerss-tts.min.js
└── backup/
    ├── backup/vocabulary_backup_*.json
    ├── backup/a_files/api.js
    ├── backup/a_files/conversation-small-eplmind9.css
    └── backup/a_files/root-bb3bptah.css
```

## File Details

- `document.md`: This documentation file for the extension project.
- `.vscode/settings.json`: Local editor preferences for this project.
- `README.md`: Project description and how to use the extension.
- `manifest.json`: MV3 extension manifest (content scripts, popup, permissions, background service worker).
- `background.js`: Service worker handling context menu clicks, Google Translate opening, and screenshot capture requests (`CAPTURE_VISIBLE_TAB`).
- `content.js`: Main content script injected into pages; includes selection overlay UI and message handler for `START_CAPTURE_SELECTION`, plus crop/preview flow.
- `popup.html`: Extension popup UI (word/meaning/note inputs, list links, and the `Capture Area` button).
- `popup.js`: Popup logic for saving words and messaging the active tab (sends `START_CAPTURE_SELECTION` when the capture button is clicked).
- `capture_preview.html`: Preview page that displays the cropped screenshot after capture.
- `capture_preview.js`: Reads `lastCaptureDataUrl/lastCaptureMeta` from storage and renders the preview image.
- `db.js`: Data/storage helpers shared by multiple UI pages.
- `models.js`: Model configuration/constants used by the Ollama API integration.
- `utils.js`: Shared helper utilities for UI pages.
- `olama.api.js`: Ollama-compatible API client used for grammar checking/sample sentence generation.
- `modal_edit_text.js`: Modal editing logic used by the wordbook/saved-words UI.
- `game.html`: Vocabulary quiz UI page.
- `game.js`: Quiz/game logic (random word selection, options, scoring, UI wiring).
- `translator.html`: Translator UI page.
- `translator.js`: Translator logic and UI wiring.
- `statistics.html`: Statistics UI page.
- `statistics.js`: Statistics rendering and controls.
- `saved_words.html`: Saved words table UI page.
- `saved_words.js`: Saved words table rendering/sorting/controls.
- `translate_line_by_line.html`: Line-by-line translation helper UI page.
- `backup.html`: Backup management UI page.
- `backup.js`: Backup UI logic.
- `wordbook.html`: Wordbook management UI page.
- `wordbook.js`: Wordbook rendering/sorting/modal actions and wiring.
- `wordbook-memory-game.js`: Memory game logic for the wordbook UI (includes grammar check and modal interactions).
- `golive.html`: Live/test page for features.
- `n8n/Spell check.json`: N8N workflow definition (spell check).
- `n8n/Grammar.json`: N8N workflow definition (grammar check).
- `n8n/Sentences generation.json`: N8N workflow definition (sentence generation).
- `resources/bootstrap.min.css`: Bootstrap CSS library.
- `resources/bootstrap.min.js`: Bootstrap JS library.
- `resources/chart.js`: Charting library used by statistics UI.
- `resources/game.css`: Styling for the game page.
- `resources/saved_words.css`: Styling for saved-words table page.
- `resources/translator.css`: Styling for translator page.
- `resources/styles.css`: Shared styling for multiple pages.
- `resources/full-screen-modal.css`: Full-screen modal styling.
- `resources/wordbook.css`: Styling for wordbook pages.
- `resources/jquery-3.5.1.slim.min.js`: jQuery slim dependency.
- `resources/popper.min.js`: Popper.js dependency.
- `resources/voicerss-tts.min.js`: Voicerss TTS library.
- `backup.js`: Backup logic for extension backup functionality (loaded by `backup.html`).
- `backup/a_files/api.js`: Legacy/alternate API helper used by backup UI.
- `backup/a_files/conversation-small-eplmind9.css`: CSS dependency used by backup folder UI.
- `backup/a_files/root-bb3bptah.css`: CSS dependency used by backup folder UI.
- `backup/vocabulary_backup_2026-03-19_16-59-38.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2026-01-02_22-40-00.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2025-06-24_22-43-24.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-11-08_12-27-08.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-11-07_21-36-49.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-11-02_14-53-36.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-11-01_12-04-58.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-11-01_11-54-16.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-30_22-52-35.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-27_20-34-13.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-26_23-21-37.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-26_15-51-05.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-26_13-48-39.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-25_09-49-17.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-23_21-05-08.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-22_13-58-15.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-16_14-20-45.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-16_14-06-24.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-09_16-49-12.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-07_13-33-37.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-10-03_10-33-33.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-09-27_15-42-31.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-09-27_01-36-04.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-09-26_19-21-18.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-09-24_22-43-30 (1).json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-09-22_12-20-39.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-09-22_01-17-13.json`: Dated vocabulary snapshot export.
- `backup/vocabulary_backup_2024-09-17_14-26-09.json`: Dated vocabulary snapshot export.

