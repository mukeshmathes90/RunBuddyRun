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
    this.load.html('form', 'form.html');
    this.load.addFile(new WebFontFile(this.load, 'Akaya Telivigala'));
  }

  create() {
    gameState.sceneWidth = this.scale.width;
    gameState.sceneHeight = this.scale.height;

    this.add.text(gameState.sceneWidth / 2, gameState.sceneHeight / 2 - 100, 'Hullo There!', {
      fontSize: '40px',
      fill: '#ffffff',
      fontFamily: 'Akaya Telivigala',
    }).setOrigin(0.5);

    // --- MODIFIED TEXT PROMPT (slightly) ---
    // Y position for the main prompt text, moved up a little
    const promptTextY = gameState.sceneHeight / 2 - 30; 
    this.add.text(gameState.sceneWidth / 2, promptTextY, 'Please enter your username', { // Removed "and press ENTER" from this main visual
      fontSize: '30px',
      fill: '#ffffff',
      fontFamily: 'Akaya Telivigala',
    }).setOrigin(0.5);

    // Y position for the HTML form input, adjusted
    const formY = gameState.sceneHeight / 2 + 30; 
    this.nameInput = this.add.dom(gameState.sceneWidth / 2, formY).createFromCache('form');

    // --- Optional: Add focus listener for mobile keyboard debugging/handling ---
    const nameField = this.nameInput.getChildByName('name');
    if (nameField) {
        nameField.addEventListener('focus', () => {
            console.log("Name input focused (mobile keyboard likely appeared)");
            // Potential advanced logic: if keyboard obscures input, try to adjust view
            // This is complex and usually handled by browser automatically or needs more elaborate UI changes.
        });
        nameField.addEventListener('blur', () => {
            console.log("Name input blurred (mobile keyboard likely dismissed)");
            // Potential advanced logic: restore view if it was adjusted on focus
        });
    }

    // --- START: Reusable function to proceed ---
    const proceedToNextScene = () => {
      const nameInputElement = this.nameInput.getChildByName('name'); // Renamed variable for clarity
      if (nameInputElement && nameInputElement.value.trim() !== '') {
        gameState.playerName = nameInputElement.value.trim();
        this.scene.stop('Boot'); // Explicitly stop this scene
        this.scene.start('Preload');
      } else {
        // Optional: Visual feedback for empty name - e.g., make input border red
        if (nameInputElement) {
            nameInputElement.style.transition = 'border-color 0.1s ease-in-out';
            nameInputElement.style.borderColor = 'red';
            setTimeout(() => {
                if (nameInputElement) nameInputElement.style.borderColor = ''; // Reset border color
            }, 1000);
        }
        console.log("Name is empty. Cannot proceed.");
      }
    };
    // --- END: Reusable function to proceed ---

    // --- ENTER Key listener (for desktop) ---
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on('down', proceedToNextScene);


    // --- START: Mobile-Friendly Continue Button ---
    // Position button below the input form
    const buttonY = formY + 75; // Adjusted spacing
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonRadius = 15;
    const buttonX = gameState.sceneWidth / 2 - (buttonWidth / 2);

    const continueButton = this.add.graphics();
    const originalButtonColor = 0x0275d8; // Blue
    const pressButtonColor = 0x005cbf; // Darker Blue

    const drawButton = (color) => {
        continueButton.clear();
        continueButton.fillStyle(color, 1);
        continueButton.fillRoundedRect(buttonX, buttonY - (buttonHeight / 2), buttonWidth, buttonHeight, buttonRadius);
    };
    
    drawButton(originalButtonColor); // Draw initial button

    this.add.text(gameState.sceneWidth / 2, buttonY, 'Continue', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Akaya Telivigala',
    }).setOrigin(0.5);

    // Make the graphics object interactive using its drawn bounds
    continueButton.setInteractive(new Phaser.Geom.Rectangle(buttonX, buttonY - (buttonHeight / 2), buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

    continueButton.on('pointerdown', () => {
      drawButton(pressButtonColor); // Change color on press
    });

    continueButton.on('pointerup', () => {
      drawButton(originalButtonColor); // Restore color on release
      proceedToNextScene(); // Call the same proceed function
    });

    // Also handle pointerout in case the user drags finger off the button after pressing
    continueButton.on('pointerout', () => {
      drawButton(originalButtonColor); // Restore color if pointer leaves while pressed
    });
    // --- END: Mobile-Friendly Continue Button ---
  }
}

export { Boot, gameState, playStopAudio };