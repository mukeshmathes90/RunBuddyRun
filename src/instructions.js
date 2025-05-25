import Phaser from 'phaser';
import { gameState, playStopAudio } from './boot';
import CustomButton from './support_script/CustomButton';
import { setText } from './gameOver'; // Assuming this is correctly imported and works

class Instructions extends Phaser.Scene {
  constructor() {
    super({ key: 'instructions' }); // Key should match how you start this scene
  }

  create() {
    this.hoverSound = this.sound.add('hoverBtnSound', { loop: false });
    this.clickSound = this.sound.add('clickBtnSound', { loop: false });

    // Check if gameState.theme1 exists and is a valid sound object before playing
    if (gameState.theme1 && typeof gameState.theme1.stop === 'function') {
      // playStopAudio(gameState.music, gameState.theme1); // Often, instructions don't restart or control main theme
    }

    this.add.image(gameState.sceneWidth / 2, gameState.sceneHeight / 2, 'sky').setScale(0.5);

    this.add.rectangle(0, 0, gameState.sceneWidth,
      gameState.sceneHeight, 0x000000, 0.3).setOrigin(0); // Slightly increased opacity for better text readability

    // --- MODIFIED message STRING ---
    const message = `"Run Buddy Run" is a fun game about collecting coins
and taking down missiles. Your goal is to get a high
score before your Health depletes over time.
Collecting Coins & hitting Missiles boosts health.
A direct missile hit damages you.

--- KEYBOARD CONTROLS ---
  UP Arrow: Jump (tap twice for double jump)
  DOWN Arrow: Fast Fall

--- CAMERA CONTROLS (EXPERIMENTAL) ---
  1. Allow webcam access when prompted.
  2. Show your hand to the webcam.
  3. JUMP: Extend index finger & flick it UPWARDS.
  (Webcam view can be toggled in-game)
`; // Using backticks for multi-line string for readability in code

    const message2 = '!! NOW LET\'S GO HAVE SOME FUN !!';

    // --- Text Display ---
    // Title - Keeping original positioning logic
    setText(this, gameState.sceneWidth / 2, 40, 'INSTRUCTIONS', '45px', '#00ff00', '#ffffff', 0.5, 0.5); // Centered title, adjusted Y, smaller font

    // Main instructions message - Keeping original positioning logic, slightly smaller font
    // We need to provide a width for wordWrap to work effectively.
    // Let's calculate a width based on screen width, leaving some padding.
    const textBlockPadding = 30; // 30px padding on each side
    const instructionTextWidth = gameState.sceneWidth - (textBlockPadding * 2);

    const instructionTextObject = this.add.text(
        textBlockPadding, // X position (start with padding from left)
        85,             // Y position (below title)
        message,
        {
            fontSize: '18px', // Slightly smaller font to fit more text
            fill: '#ffffff',
            fontFamily: '"Akaya Telivigala"',
            stroke: '#000000',
            strokeThickness: 3, // Slightly reduced stroke
            wordWrap: { width: instructionTextWidth, useAdvancedWrap: true }, // Added word wrap
            lineSpacing: 4 // Added line spacing for readability
        }
    ).setOrigin(0, 0); // Top-left origin for wrapped text block

    // "Now let's go have some fun" message - position below the instruction block
    // We need to estimate its Y position. It might need adjustment after seeing it.
    // A simple way is to place it a fixed distance below the estimated end of instructionTextObject
    // Or, more robustly, if you could get instructionTextObject.displayHeight (which can be tricky if not yet rendered)
    // For simplicity here, let's use a Y relative to the bottom, but above the button.
    const message2Y = gameState.sceneHeight - 90; // Positioned above the back button
    setText(this, gameState.sceneWidth / 2, message2Y, message2, '20px', '#ffffff', '#ff00ff', 0.5, 0.5); // Centered

    // Back button - Keeping original positioning logic (bottom right-ish)
    const backBtn = new CustomButton(this, gameState.sceneWidth - 100, gameState.sceneHeight - 45, 'mainMenu', 'mainMenuHover');
    this.add.existing(backBtn);

    backBtn.setInteractive().on('pointerup', () => {
      if (this.clickSound && gameState.sound) playStopAudio(gameState.sound, this.clickSound);
      this.scene.stop('instructions'); // Ensure key is correct
      this.scene.start('Menu');
    }).on('pointerover', () => {
      if (this.hoverSound && gameState.sound) playStopAudio(gameState.sound, this.hoverSound);
    });
  }
}

export default Instructions;