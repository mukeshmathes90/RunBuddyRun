import Phaser from 'phaser';
import CustomButton from '../support_script/CustomButton'; // Corrected path if CustomButton is in support_script
import { gameState, playStopAudio } from '../boot'; // Corrected path if boot is in root of src

class Menu extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }

  create() {
    this.width = this.scale.width;
    this.height = this.scale.height;

    this.add.image(this.width / 2, this.height / 2, 'sky').setScale(0.5);
    this.add.image(this.width / 2, this.height / 2, 'logo2').setAlpha(0.2);

    this.hoverSound = this.sound.add('hoverBtnSound', { loop: false });
    this.clickSound = this.sound.add('clickBtnSound', { loop: false });

    // Check if gameState.theme1 is loaded and music is enabled before trying to set volume or play
    if (gameState.theme1 && typeof gameState.theme1.setVolume === 'function') {
        gameState.theme1.volume = 0.1; // Or setVolume(0.1) depending on Phaser version/API
        playStopAudio(gameState.music, gameState.theme1);
    } else {
        console.warn("Menu.js: gameState.theme1 is not available or not a sound object. Cannot play menu music.");
    }


    const startButton = new CustomButton(this, this.width / 2, this.height / 2, 'startGame', 'startGameHover');
    this.add.existing(startButton);

    startButton.setInteractive().on('pointerup', () => {
      if (this.clickSound && gameState.sound) playStopAudio(gameState.sound, this.clickSound); // Check sound object
      if (gameState.theme1 && typeof gameState.theme1.stop === 'function') gameState.theme1.stop();
      this.startScene('Game');
    }).on('pointerover', () => {
      if (this.hoverSound && gameState.sound) playStopAudio(gameState.sound, this.hoverSound); // Check sound object
    });

    const optionsButton = new CustomButton(this, this.width / 4, this.height / 4, 'options', 'optionsHover');
    this.add.existing(optionsButton);

    optionsButton.setInteractive().on('pointerup', () => {
      if (this.clickSound && gameState.sound) playStopAudio(gameState.sound, this.clickSound);
      this.startScene('Options');
    }).on('pointerover', () => {
      if (this.hoverSound && gameState.sound) playStopAudio(gameState.sound, this.hoverSound);
    });

    const leaderBoardBtn = new CustomButton(this, (this.width * 3) / 4, this.height / 4, 'leaderBoard', 'leaderBoardHover');
    this.add.existing(leaderBoardBtn);

    leaderBoardBtn.setInteractive().on('pointerup', () => {
      if (this.clickSound && gameState.sound) playStopAudio(gameState.sound, this.clickSound);
      this.scene.start('Leader'); // No need to call this.startScene for this one if it's direct
    }).on('pointerover', () => {
      if (this.hoverSound && gameState.sound) playStopAudio(gameState.sound, this.hoverSound);
    });

    const instructionsBtn = new CustomButton(this, (this.width * 3) / 4, (this.height * 3) / 4, 'instructions', 'instructionsHover');
    this.add.existing(instructionsBtn);

    instructionsBtn.setInteractive().on('pointerup', () => {
      if (this.clickSound && gameState.sound) playStopAudio(gameState.sound, this.clickSound);
      this.scene.start('instructions'); // No need to call this.startScene
    }).on('pointerover', () => {
      if (this.hoverSound && gameState.sound) playStopAudio(gameState.sound, this.hoverSound);
    });

    const creditsBtn = new CustomButton(this, (this.width) / 4, (this.height * 3) / 4, 'credits', 'creditsHover');
    this.add.existing(creditsBtn);

    creditsBtn.setInteractive().on('pointerup', () => {
      if (this.clickSound && gameState.sound) playStopAudio(gameState.sound, this.clickSound);
      this.startScene('Credits');
    }).on('pointerover', () => {
      if (this.hoverSound && gameState.sound) playStopAudio(gameState.sound, this.hoverSound);
    });

    // --- START: ADDED "Change Control Method" TEXT BUTTON ---
    const changeControlsTextY = this.height - 35; // Position Y near the bottom (e.g. 35px from bottom)
    const changeControlsText = this.add.text(
        this.width / 2,             // Centered Horizontally
        changeControlsTextY,
        'Change Controls',
        { 
            fontSize: '22px',       // Slightly larger for better touch target
            fill: '#FFFFFF',        // White text
            fontFamily: '"Akaya Telivigala"', // Consistent font
            stroke: '#00008B',      // Dark blue stroke for contrast
            strokeThickness: 4      // Stroke thickness
        }
    ).setOrigin(0.5, 0.5).setDepth(1); // Center origin, ensure on top

    changeControlsText.setInteractive({ useHandCursor: true });

    changeControlsText.on('pointerover', () => {
        changeControlsText.setFill('#FFD700'); // Gold text on hover
        // Optional: play hover sound if it's distinct and available
        if (this.hoverSound && gameState.sound) {
            // To avoid playing button hover sound and this at same time, you might want a different sound
            // or just rely on color change. For now, using existing hoverSound.
            playStopAudio(gameState.sound, this.hoverSound);
        }
    });

    changeControlsText.on('pointerout', () => {
        changeControlsText.setFill('#FFFFFF'); // Back to white
    });

    changeControlsText.on('pointerdown', () => {
        if (this.clickSound && gameState.sound) playStopAudio(gameState.sound, this.clickSound);
        
        console.log("Change Controls clicked. Reloading page.");
        window.location.reload();
    });
    // --- END: ADDED "Change Control Method" TEXT BUTTON ---

  } // End of create()

  startScene(newScene) {
    // It's good practice to stop the current scene's music if it's specific to this scene
    // However, theme1 seems to be a general menu theme you want to persist or stop specifically.
    // The stop call for theme1 is already in startButton's pointerup.

    // this.scene.stop('Menu'); // It's usually good to explicitly name the scene to stop.
    // However, 'this.scene.stop()' without args stops the current scene.
    this.scene.stop(); 
    this.scene.start(newScene);
  }
}

export default Menu;