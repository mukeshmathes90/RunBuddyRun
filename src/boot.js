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

// src/boot.js - Replace your ENTIRE create() method with this one.
// The constructor(), preload(), and exports remain the same as your current version.

  create() {
    console.log("[Boot.js] Create method started - SIMPLEST FIX ATTEMPT.");
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

    const formY = gameState.sceneHeight / 2 + 40; // Adjusted Y for a bit more space

    // --- START: SIMPLEST FIX - Create input field HTML directly ---
    console.log("[Boot.js] Attempting to create DOM element with direct HTML string.");
    const inputHTML = '<input type="text" name="name" id="nameFieldPlayer" placeholder="Enter your name here" style="width: 280px; padding: 10px; font-size: 18px; border-radius: 8px; border: 2px solid #0275d8; text-align: center; font-family: \'Akaya Telivigala\', cursive;">';
    
    this.nameInput = this.add.dom(gameState.sceneWidth / 2, formY).createFromHTML(inputHTML); 
    // OR, if createFromHTML gives issues (it can be finicky with just one element sometimes):
    // this.nameInput = this.add.dom(gameState.sceneWidth / 2, formY);
    // if (this.nameInput && this.nameInput.node) {
    //    this.nameInput.node.innerHTML = inputHTML;
    // }


    if (!this.nameInput || !this.nameInput.node) {
        console.error("[Boot.js] FAILED to create Phaser DOM element 'this.nameInput' even with direct HTML.");
        this.add.text(gameState.sceneWidth / 2, formY, 'Error: Could not create input field!', { color: 'red', fontSize: '16px' }).setOrigin(0.5);
        return; 
    }
    this.nameInput.setOrigin(0.5, 0.5); // Center the Phaser DOM wrapper
    console.log("[Boot.js] Phaser DOM element 'this.nameInput' created. Node:", this.nameInput.node);
    console.log("[Boot.js] Node tagName:", this.nameInput.node.tagName);
    console.log("[Boot.js] Node innerHTML:", "<<<" + this.nameInput.node.innerHTML + ">>>");


    // --- Attempt to get the input field ---
    let nameField = null;
    if (this.nameInput.node) {
        // If createFromHTML directly makes the input the node:
        if (this.nameInput.node.tagName === 'INPUT' && this.nameInput.node.getAttribute('name') === 'name') {
            nameField = this.nameInput.node;
            console.log("[Boot.js] Input field IS this.nameInput.node");
        } 
        // If createFromHTML wraps it in a div (Phaser's default for add.dom())
        else if (this.nameInput.node.querySelector) {
            nameField = this.nameInput.node.querySelector('input[name="name"]');
            if (nameField) console.log("[Boot.js] Input field found via querySelector on wrapper.");
        }
    }

    if (nameField) {
        console.log("[Boot.js] Input field (nameField) IDENTIFIED:", nameField);
        nameField.style.display = 'block'; // Ensure it's visible
        nameField.placeholder = "SUCCESS! Type Here";
         // You can add more styles directly to nameField.style if needed
    } else {
        console.error("[Boot.js] Input field STILL NOT identified even with direct HTML string.");
        if(this.nameInput.node) this.nameInput.node.style.border = "3px solid red"; // Make wrapper red if input not found
    }
    // --- END: SIMPLEST FIX ---


    const nameFieldForLogic = nameField; // Use the nameField we hopefully found

    if (nameFieldForLogic && typeof nameFieldForLogic.addEventListener === 'function') {
        nameFieldForLogic.addEventListener('focus', () => console.log("Name input focused"));
        nameFieldForLogic.addEventListener('blur', () => console.log("Name input blurred"));
    } else {
        console.warn("[Boot.js] Cannot add focus/blur listeners: nameFieldForLogic not valid.");
    }

    const proceedToNextScene = () => {
      let nameValue = "";
      if (nameFieldForLogic && typeof nameFieldForLogic.value !== 'undefined') {
          nameValue = nameFieldForLogic.value.trim();
      } else {
          console.error("[Boot.js] proceedToNextScene: nameFieldForLogic is not valid for getting value.");
      }
      
      if (nameValue !== '') {
        gameState.playerName = nameValue;
        console.log("[Boot.js] Proceeding to Preload scene with player name:", gameState.playerName);
        this.scene.stop('Boot');
        this.scene.start('Preload');
      } else {
        if (nameFieldForLogic && typeof nameFieldForLogic.style !== 'undefined') {
            nameFieldForLogic.style.borderColor = 'red';
            setTimeout(() => { if (nameFieldForLogic) nameFieldForLogic.style.borderColor = ''; }, 1000);
        }
        console.log("[Boot.js] Name is empty or input field not properly found. Cannot proceed.");
      }
    };

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.enterKey.on('down', proceedToNextScene);

    // --- Continue Button ---
    const buttonY = formY + 85; // Adjusted Y for more space from input
    const buttonWidth = 200; const buttonHeight = 50; const buttonRadius = 15;
    const buttonX = gameState.sceneWidth / 2 - (buttonWidth / 2);
    const continueButton = this.add.graphics();
    const originalButtonColor = 0x0275d8; const pressButtonColor = 0x005cbf;
    const drawButton = (color) => {
        continueButton.clear(); continueButton.fillStyle(color, 1);
        continueButton.fillRoundedRect(buttonX, buttonY - (buttonHeight / 2), buttonWidth, buttonHeight, buttonRadius);
    };
    drawButton(originalButtonColor); 
    this.add.text(gameState.sceneWidth / 2, buttonY, 'Continue', { fontSize: '24px', fill: '#ffffff', fontFamily: 'Akaya Telivigala'}).setOrigin(0.5);
    continueButton.setInteractive(new Phaser.Geom.Rectangle(buttonX, buttonY - (buttonHeight / 2), buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    continueButton.on('pointerdown', () => drawButton(pressButtonColor));
    continueButton.on('pointerup', () => { drawButton(originalButtonColor); proceedToNextScene(); });
    continueButton.on('pointerout', () => drawButton(originalButtonColor));

    console.log("[Boot.js] Create method finished - SIMPLEST FIX ATTEMPT.");
  }
// The rest of your Boot class (constructor, preload) and the exports should remain the same
// Make sure you only replace the create() method.
}

export { Boot, gameState, playStopAudio };