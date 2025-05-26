// src/preload.js
import Phaser from 'phaser';
import { gameState } from './boot';

class Preload extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' });
  }

  preload() {
    this.width = this.scale.width;
    this.height = this.scale.height;
    const progressBoxWidth = 320;
    const progressBoxHeight = 50;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect((this.width / 2) - (progressBoxWidth / 2),
      (this.height / 2) - (progressBoxHeight / 2),
      progressBoxWidth, progressBoxHeight, 25);

    const loadingText = this.add.text(this.width / 2, this.height / 2, 'Loading ...', {
      fontSize: '30px',
      fill: '#ffffff',
      fontFamily: '"Akaya Telivigala"',
    }).setOrigin(0.5);

    const progressBarWidth = progressBoxWidth - 20;
    const progressBarHeight = progressBoxHeight - 20;

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xf0ad4e, 1);
      let myProgress = progressBarWidth * value;
      if (value < 0.1) {
        myProgress = progressBarWidth * 0.1;
      }
      progressBar.fillRoundedRect((this.width / 2) - (progressBarWidth / 2),
        (this.height / 2) - (progressBarHeight / 2),
        myProgress, progressBarHeight, {
          tl: 15, bl: 15, tr: 15, br: 15,
        });
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // --- ADD CACHE BUSTER ---
    const cb = `?v=${Date.now()}`;

    // --- CORRECTED ASSET PATHS WITH CACHE BUSTER ---
    // Loading of the assets
    this.load.image('logo', `assets/gameLogo.png${cb}`);
    this.load.image('logo2', `assets/gameLogoTransparent.png${cb}`);
    this.load.image('startGame', `assets/startButton.png${cb}`);
    this.load.image('startGameHover', `assets/startButtonOver.png${cb}`);
    this.load.image('options', `assets/optionsButton.png${cb}`);
    this.load.image('optionsHover', `assets/optionsButtonHover.png${cb}`);
    this.load.image('leaderBoard', `assets/leaderBoard.png${cb}`);
    this.load.image('leaderBoardHover', `assets/leaderBoardHover.png${cb}`);
    this.load.image('instructions', `assets/instructions.png${cb}`);
    this.load.image('instructionsHover', `assets/instructionsHover.png${cb}`);
    this.load.image('credits', `assets/credits.png${cb}`);
    this.load.image('creditsHover', `assets/creditsHover.png${cb}`);
    this.load.image('mainMenu', `assets/mainMenu.png${cb}`);
    this.load.image('mainMenuHover', `assets/mainMenuHover.png${cb}`);
    this.load.image('playAgain', `assets/playAgain.png${cb}`);
    this.load.image('playAgainHover', `assets/playAgainHover.png${cb}`);

    this.load.image('sky', `assets/sky.png${cb}`);
    this.load.image('mountains', `assets/mountains.png${cb}`);
    this.load.image('plateau', `assets/plateau.png${cb}`);
    this.load.image('ground', `assets/ground.png${cb}`);

    this.load.image('checkbox', `assets/checkbox2.png${cb}`);
    this.load.image('tick', `assets/tick2.png${cb}`);

    this.load.spritesheet('player', `assets/playersprite.png${cb}`, { frameWidth: 250, frameHeight: 250 });
    this.load.spritesheet('bird', `assets/birdSprite.png${cb}`, { frameWidth: 290, frameHeight: 300 });
    this.load.spritesheet('explosion', `assets/explosion.png${cb}`, { frameWidth: 64, frameHeight: 63 });
    this.load.image('coin', `assets/coin.png${cb}`);
    this.load.image('spike', `assets/spike.png${cb}`);
    this.load.image('missile', `assets/missile.png${cb}`);
    this.load.image('missile2', `assets/missile2.png${cb}`);

    this.load.audio('hoverBtnSound', `assets/rollover1.ogg${cb}`);
    this.load.audio('clickBtnSound', `assets/switch3.ogg${cb}`);

    this.load.audio('theme1', `assets/theme1.ogg${cb}`);
    this.load.audio('theme2', `assets/theme2.ogg${cb}`);
    this.load.audio('pickCoin', `assets/pickCoin.wav${cb}`);
    this.load.audio('explosion', `assets/explode.wav${cb}`);
    this.load.audio('killMissile', `assets/killMissile.ogg${cb}`);
    this.load.audio('jumpSound', `assets/jumpSound.mp3${cb}`);
    this.load.audio('spikeSound', `assets/spikeSound.mp3${cb}`);
    // --- END OF CORRECTED ASSET PATHS WITH CACHE BUSTER ---
  }

  create() {
    this.add.image(this.width / 2, this.height / 2, 'logo');

    this.message = this.add.text(this.scale.width / 2, 30, 'PRESS "ENTER" TO CONTINUE TO MAIN MENU', {
      fontSize: '25px',
      fill: '#ffffff',
      fontFamily: '"Akaya Telivigala"',
    }).setOrigin(0.5);

    this.message.setAlpha(0);

    this.tweens.add({
      targets: this.message,
      repeat: -1,
      duration: 1000,
      delay: 1000,
      ease: 'linear',
      alpha: 1,
      yoyo: true,
    });

    if (!gameState.theme1) {
        try {
            // Ensure theme1 is added to the sound manager. 
            // Playing it will be handled by the Menu scene.
            if (this.sound.get('theme1')) { // Check if already added perhaps by an earlier attempt
                gameState.theme1 = this.sound.get('theme1');
            } else {
                gameState.theme1 = this.sound.add('theme1', { loop: true });
            }
        } catch (e) {
            console.error("Error adding/getting theme1 to sound cache in Preload:", e);
        }
    } else {
        console.log("theme1 already in gameState.");
    }


    this.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.input.on('pointerdown', () => {
      if (this.scene.isActive('Preload')) {
        console.log("Preload scene tapped, starting Menu scene.");
        this.scene.stop('Preload');
        this.scene.start('Menu');
      }
    });

    this.message.setText("PRESS 'ENTER' OR TAP TO CONTINUE");
  }

  update() {
    if (!this.scene.isActive('Preload')) {
        return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.enter)) {
      console.log("ENTER pressed in Preload scene, starting Menu scene.");
      this.scene.stop('Preload');
      this.scene.start('Menu');
    }
  }
}

export default Preload;