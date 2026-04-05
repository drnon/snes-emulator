const dropZone = document.getElementById('drop-zone');
const romInput = document.getElementById('rom-input');
const browseBtn = document.getElementById('browse-btn');
const emulatorContainer = document.getElementById('emulator-container');
const resetBtn = document.getElementById('reset-btn');
let currentBlobUrl = null;

// Allow entire drop-zone click to open file dialog
dropZone.addEventListener('click', (e) => {
    // Prevent triggering twice if user managed to click exactly on button
    if (e.target !== browseBtn) {
        romInput.click();
    }
});
browseBtn.addEventListener('click', () => romInput.click());

// Drag and drop events setup
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
});

dropZone.addEventListener('drop', (e) => {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
});

romInput.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        const validExtensions = ['.sfc', '.smc', '.zip'];
        const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        if (isValid) {
            startEmulator(file);
        } else {
            alert('Please select a valid Super Famicom / SNES ROM file (.sfc, .smc, .zip)');
        }
    }
}

function startEmulator(file) {
    // Clean up previous blob if it exists
    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
    }

    // Create a new object URL for the uploaded file
    currentBlobUrl = URL.createObjectURL(file);
    
    // Hide upload zone, show emulator
    dropZone.classList.add('hidden');
    emulatorContainer.classList.remove('hidden');

    // Wipe previous #game contents if any
    document.getElementById('game').innerHTML = '';

    // Initialize EmulatorJS configuration globally
    window.EJS_player = '#game';
    window.EJS_core = 'snes'; // Setup explicitly for SNES/Super Famicom
    window.EJS_gameUrl = currentBlobUrl;
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_color = '#5c6bc0'; // Match our primary UI theme
    window.EJS_startOnLoaded = true;

    // Load the EmulatorJS script dynamically
    // Check if script exists to prevent multiple injections
    const existingLoader = document.getElementById('ejs-loader');
    if (existingLoader) {
        existingLoader.remove();
    }
    
    const script = document.createElement('script');
    script.id = 'ejs-loader';
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    document.body.appendChild(script);
}

resetBtn.addEventListener('click', () => {
    // Cleanup URL
    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
    }
    
    // Stop Emulator and Clear DOM
    const gameContainer = document.getElementById('game');
    gameContainer.innerHTML = '';
    
    // Switch Views
    emulatorContainer.classList.add('hidden');
    dropZone.classList.remove('hidden');
    romInput.value = ''; // reset file input
});
