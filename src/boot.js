import Phaser from 'phaser';
import WebFontFile from './support_script/webfontloader';
import 'regenerator-runtime/runtime';

const gameState = {
  sceneWidth: 0,
  sceneHeight: 0,
  score: 0,
  music: true,
  sound: true,
  // playerName will be added when set
};

const playStopAudio = (status, audio) => {
  if (status) {
    if (!audio.isPlaying) {
      audio.play();
    }
  } else {
    audio.stop();
  }
};

class Boot extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    console.log("[Boot.js] Preloading started...");
    this.load.html('form', 'assets/form.html'); // Path to your simplified form.html
    this.load.addFile(new WebFontFile(this.load, 'Akaya Telivigala'));
    console.log("[Boot.js] Preloading finished for form.html and webfont.");
  }

  create() {
    console.log("[Boot.js] Create method started.");
    gameState.sceneWidth = this.scale.width;
    gameState.sceneHeight = this.scale.height;

    this.add.text(gameState.sceneWidth / 2, gameState.sceneHeight / 2 - 100, 'Hullo There!', {
      fontSize: '40px',
      fill: '#ffffff',
      fontFamily: 'Akaya Telivigala',
    }).setOrigin(0.5);

    const promptTextY = gameState.sceneHeight / 2 - 30;
    this.add.text(gameState.sceneWidth / 2, promptTextY, 'Please enter your username', {
      fontSize: '30px',
      fill: '#ffffff',
      fontFamily: 'Akaya Telivigala',
    }).setOrigin(0.5);

    const formY = gameState.sceneHeight / 2 + 30;
    
    // --- Check if 'form' is in cache ---
    if (this.cache.html.has('form')) {
        console.log("[Boot.js] 'form' key FOUND in HTML cache.");
        const formHTMLContent = this.cache.html.get('form');
        console.log("[Boot.js] Content of cached 'form':", formHTMLContent); // Log the actual HTML string
    } else {
        console.error("[Boot.js] CRITICAL: 'form' key NOT FOUND in HTML cache. form.html likely did not load.");
        this.add.text(gameState.sceneWidth / 2, formY, 'Error: Form HTML not loaded!', { color: 'red', fontSize: '16px' }).setOrigin(0.5);
        // If form HTML isn't loaded, don't proceed to create DOM element from it
        return; // Stop further execution in create if form is missing
    }

    console.log("[Boot.js] Attempting to create DOM element from cache 'form'.");
    this.nameInput = this.add.dom(gameState.sceneWidth / 2, formY).createFromCache('form');
    if (this.nameInput) { // Check if nameInput was successfully created
        this.nameInput.setOrigin(0.5, 0.5); // Center the Phaser DOM wrapper if it exists
        console.log("[Boot.js] Phaser DOM element 'this.nameInput' created:", this.nameInput);
    } else {
        console.error("[Boot.js] FAILED to create Phaser DOM element 'this.nameInput'.");
        // If DOM element creation fails, don't try to access .node or .getChildByName
        return; 
    }


    // --- START: Aggressive DOM Element Debugging ---
    if (this.nameInput && this.nameInput.node) { // Check again for this.nameInput and its node
        console.log('[Boot.js] Phaser DOM wrapper (this.nameInput.node) EXISTS:', this.nameInput.node);
        this.nameInput.node.style.display = 'block'; // Force display
        this.nameInput.node.style.border = "5px solid hotpink";
        this.nameInput.node.style.backgroundColor = "rgba(255, 105, 180, 0.2)";
        this.nameInput.node.style.width = "320px"; // Give it a definite size
        this.nameInput.node.style.height = "80px"; // Give it a definite size
        this.nameInput.node.style.overflow = "visible";
        this.nameInput.node.style.zIndex = "20000"; // Very high z-index
        console.log('[Boot.js] Phaser DOM wrapper styles applied.');
        console.log('[Boot.js] Inner HTML of wrapper AFTER creation:', this.nameInput.node.innerHTML);

        // Try both getChildByName and querySelector for robustness
        let nameField = this.nameInput.getChildByName('name');
        if (!nameField && this.nameInput.node) { // If getChildByName fails, try querySelector
            console.log("[Boot.js] getChildByName('name') failed, trying querySelector('input[name=\"name\"]') on wrapper node.");
            nameField = this.nameInput.node.querySelector('input[name="name"]');
        }
        // Also try querying from the element itself, as createFromCache might directly return the input if form.html is just the input
        if (!nameField && this.nameInput.node && this.nameInput.node.getAttribute && this.nameInput.node.getAttribute('name') === 'name') {
            console.log("[Boot.js] Wrapper node itself seems to be the input field.");
            nameField = this.nameInput.node;
        }
        
        if (nameField) {
            console.log('[Boot.js] Input field (nameField) FOUND:', nameField);
            nameField.style.display = 'block !important';
            nameField.style.visibility = 'visible !important';
            nameField.style.opacity = '1 !important';
            nameField.style.width = '280px'; // Make sure this fits within the 320px wrapper
            nameField.style.padding = '10px';
            nameField.style.fontSize = '18px';
            nameField.style.border = '3px solid darkorange';
            nameField.style.color = 'black';
            nameField.style.backgroundColor = 'white';
            nameField.placeholder = "DEBUG: Type Here";
            console.log('[Boot.js] Input field styles applied.');
        } else {
            console.error("[Boot.js] Input field with name='name' STILL NOT FOUND within the Phaser DOM wrapper. Check logged innerHTML and structure of cached form.html.");
            if (this.nameInput.node) { // Check if node exists before trying to modify its innerHTML
                 this.nameInput.node.innerHTML += "<p style='color:red; font-size:10px; border: 1px dotted white;'>DEBUG: Input 'name' not found!</p>";
            }
        }
    } else {
        console.error("[Boot.js] Phaser DOM element 'this.nameInput' or 'this.nameInput.node' is NULL or invalid after creation attempt.");
    }
    // --- END: Aggressive DOM Element Debugging ---

    // Only add event listeners if nameField was actually found and is an element
    const nameFieldForLogic = this.nameInput && this.nameInput.node ? (this.nameInput.getChildByName('name') || this.nameInput.node.querySelector('input[name="name"]') || (this.nameInput.node.getAttribute && this.nameInput.node.getAttribute('name') === 'name' ? this.nameInput.node : null)) : null;
    if (nameFieldForLogic && typeof nameFieldForLogic.addEventListener === 'function') {
        nameFieldForLogic.addEventListener('focus', () => {
            console.log("Name input focused (mobile keyboard likely appeared)");
        });
        nameFieldForLogic.addEventListener('blur', () => {
            console.log("Name input blurred (mobile keyboard likely dismissed)");
        });
    } else {
        console.warn("[Boot.js] Cannot add focus/blur listeners: nameFieldForLogic not found or not an element.");
    }

    const proceedToNextScene = () => {
      const nameInputElement = this.nameInput && this.nameInput.node ? (this.nameInput.getChildByName('name') || this.nameInput.node.querySelector('input[name="name"]') || (this.nameInput.node.getAttribute && this.nameInput.node.getAttribute('name') === 'name' ? this.nameInput.node : null)) : null;
      
      if (nameInputElement && typeof nameInputElement.value !== 'undefined' && nameInputElement.value.trim() !== '') {
        gameState.playerName = nameInputElement.value.trim();
        console.log("[Boot.js] Proceeding to Preload scene with player name:", gameState.playerName);
        this.scene.stop('Boot');
        this.scene.start('Preload');
      } else {
        if (nameInputElement && typeof nameInputElement.style !== 'undefined') { // Check if it's an HTML element
            nameInputElement.style.transition = 'border-color 0.1s ease-in-out';
            nameInputElement.style.borderColor = 'red';
            setTimeout(() => {
                if (nameInputElement) nameInputElement.style.borderColor = '';
            }, 1000);
        } else if (!nameInputElement) {
            console.error("[Boot.js] proceedToNextScene: nameInputElement is null, cannot get value.");
        } else {
            console.warn("[Boot.js] proceedToNextScene: nameInputElement found, but value is empty or it's not a proper input element.");
        }
        console.log("[Boot.js] Name is empty or input field not properly found. Cannot proceed.");
      }
    };

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on('down', proceedToNextScene);

    const buttonY = formY + 75; 
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonRadius = 15;
    const buttonX = gameState.sceneWidth / 2 - (buttonWidth / 2);

    const continueButton = this.add.graphics();
    const originalButtonColor = 0x0275d8; 
    const pressButtonColor = 0x005cbf; 

    const drawButton = (color) => {
        continueButton.clear();
        continueButton.fillStyle(color, 1);
        continueButton.fillRoundedRect(buttonX, buttonY - (buttonHeight / 2), buttonWidth, buttonHeight, buttonRadius);
    };
    
    drawButton(originalButtonColor); 

    this.add.text(gameState.sceneWidth / 2, buttonY, 'Continue', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Akaya Telivigala',
    }).setOrigin(0.5);

    continueButton.setInteractive(new Phaser.Geom.Rectangle(buttonX, buttonY - (buttonHeight / 2), buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

    continueButton.on('pointerdown', () => {
      drawButton(pressButtonColor); 
    });

    continueButton.on('pointerup', () => {
      drawButton(originalButtonColor); 
      proceedToNextScene(); 
    });

    continueButton.on('pointerout', () => {
      drawButton(originalButtonColor); 
    });

    console.log("[Boot.js] Create method finished.");
  }
}

export { Boot, gameState, playStopAudio };