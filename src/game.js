import Phaser from 'phaser';
import { gameState, playStopAudio } from './boot';
import * as fetchScoreData from './support_script/fetchData';
import 'regenerator-runtime/runtime';

// >>> ADD IMPORT FOR CAMERA CONTROLLER <<<
import CameraGestureController from './CameraGestureController.js'; // Ensure this path is correct relative to this file

// Helper functions (createPlatform, updatePlatform, moveBackgroundPlatform)
const createPlatform = (group, spriteWidth, myTexture, dist = 0) => {
  const platform = group.create(spriteWidth + dist, gameState.sceneHeight, myTexture)
    .setOrigin(0, 1)
    .setScale(0.5);
  if (myTexture === 'ground') {
    platform.setImmovable(true);
    platform.setSize(platform.displayWidth * 2, platform.displayHeight - 50);
  }

  switch (myTexture) {
    case 'ground':
      platform.setDepth(2);
      break;
    case 'plateau':
      platform.setDepth(1);
      break;
    default:
      // console.warn(`createPlatform: Unhandled texture type: ${myTexture}`); // Optional warning
      break;
  }
};

const updatePlatform = (group, spriteWidth, myTexture, dist = 0) => {
  const child = group.get(spriteWidth - dist, gameState.sceneHeight, myTexture);
  if (child) { // Add safety check if child is successfully retrieved
    child.setVisible(true);
    child.setActive(true);
    switch (myTexture) {
      case 'ground':
        child.setDepth(2);
        break;
      case 'plateau':
        child.setDepth(1);
        break;
      default:
        break;
    }
  }
};

const moveBackgroundPlatform = (group, platformWidth, myTexture, scrollFactor) => {
  group.children.iterate((child) => {
    if (child) { // Add safety check for child
      child.x -= scrollFactor;
      if (child.x < -(child.displayWidth)) {
        group.killAndHide(child);
        updatePlatform(group, platformWidth, myTexture, scrollFactor);
      }
    }
  });
};


class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' }); // Ensure this key matches what's used in your main Phaser config
    this.timer = 0;
    this.secondTimer = 0;
    this.healthTimer = 0; // Kept from code 1, though its direct usage in reduceHealthTimely's callback was minimal
    this.missileScore = 0;

    // >>> INITIALIZE CAMERA CONTROLLER AND PLAYER PROPERTIES <<<
    this.cameraGestureController = null;
    this.player = null;
    this.isTouchDevice = false;
    this.mobileDuckButton = null;
    this.isMobileDucking = false;
  }

  // Start of create function
  create() {
    console.log(`Game.js: create() called. Control Mode: ${window.currentControlMode}`); // Debug log

    this.gameTheme = this.sound.add('theme2', { loop: true });
    this.gameTheme.volume = 0.1;

    playStopAudio(gameState.music, this.gameTheme);

    this.addSoundEffects(); // Defines sounds like this.jumpSound

    gameState.score = 0;
    this.health = 120; // Initial health

    this.scoreText = this.add.text(50, 25, 'Coins: ', {
      fontSize: '40px',
      fill: '#ffffff',
      fontFamily: '"Akaya Telivigala"',
      strokeThickness: 10,
      stroke: '#FFD700',
    }).setDepth(8);

    // Corrected template literal for scoreValue
    this.scoreValue = this.add.text(170, 25, `${gameState.score}`, {
      fontSize: '40px',
      fill: '#ffffff',
      fontFamily: '"Akaya Telivigala"',
      strokeThickness: 5,
      stroke: '#000',
    }).setDepth(8);

    this.healthText = this.add.text(50, 75, 'Health: ', {
      fontSize: '30px',
      fill: '#ffffff',
      strokeThickness: 8,
      fontFamily: '"Akaya Telivigala"',
      stroke: '#FF69B4',
    }).setDepth(8);

    this.progressBox = this.add.graphics().setDepth(8);
    this.progressBar = this.add.graphics().setDepth(8);

    this.progressBox.lineStyle(3, 0x0275d8, 1);
    // Use initial max health (e.g., 120) or a design width for the box border
    this.progressBox.strokeRect(170, 95, 120, 10);

    this.progressBar.fillStyle(0xFFD700, 1);
    this.progressBar.fillRect(170, 95, this.health, 10); // This will draw current health

    this.addGameBackground(); // This method must define this.groundGroup

    this.player = this.physics.add.sprite(200, gameState.sceneHeight - 300, 'player').setScale(0.2);

    this.physics.add.collider(this.player, this.groundGroup); // Assumes this.groundGroup is valid
    this.player.setGravityY(800);
    this.player.setDepth(6);
    this.player.body.setCollideWorldBounds(true); // Ensures player stays within game bounds
    this.player.setSize(this.player.width / 2, this.player.height - 30);
    this.player.setOffset(this.player.width / 2 - 20, 30);

    this.createAnimations('run', 'player', 0, 5, -1, 12);
    this.createAnimations('jump', 'player', 0, 0, -1, 1); // Frame 0 for jump animation

    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpTimes = 2; // Max allowed jumps (for double jump)
    this.jump = 0;      // Counter for current jumps performed

    // --- PLAYER GESTURE METHODS ---
    // Attached directly to the 'this.player' sprite object
    this.player.jumpByGesture = () => {
        // --- START OF THE VERY EASY FIX ---
        // First, check if 'this.player' and 'this.player.body' exist.
        // If either is missing, we can't proceed, so we just stop and print a message.
        if (!this.player || !this.player.body) {
            console.warn("Game.js: player.jumpByGesture() called, but player or player.body is not ready. Jump skipped.");
            return; // This line stops the function here, preventing the error.
        }
        // --- END OF THE VERY EASY FIX ---

        // If we reached here, 'this.player' and 'this.player.body' are available.
        console.log("Game.js: player.jumpByGesture() attempting jump.");

        // Now the rest of your original logic can run more safely:
        if (this.player.body.touching.down || (this.jump < this.jumpTimes && this.jump > 0)) {
            this.player.setVelocityY(-400); // Jump velocity
            if(this.jumpSound) this.jumpSound.play();

            this.jump += 1; // Increment current jump count
            console.log(`Game.js: Player jumped by gesture! Jump count: ${this.jump}`);
        } else {
            // The 'this.player.body' check at the top also protects this 'else' block's access.
            console.log(`Game.js: Player jumpByGesture() failed. On ground: ${this.player.body.touching.down}, Jumps: ${this.jump}/${this.jumpTimes}`);
        }
    };
    // These methods are placeholders as player horizontal movement is not controlled by direct input in this game
    this.player.moveLeftByGesture = () => { console.log("Player: moveLeftByGesture called (no action)"); };
    this.player.moveRightByGesture = () => { console.log("Player: moveRightByGesture called (no action)"); };
    this.player.stopHorizontalMovementByGesture = () => { console.log("Player: stopHorizontalMovementByGesture called (no action)"); };

    // Birds SECTION
    this.birdGroup = this.physics.add.group();
    const createBird = () => {
      const myY = Phaser.Math.Between(100, 300);
      const bird = this.birdGroup.create(gameState.sceneWidth + 100, myY, 'bird').setScale(0.3);
      bird.setVelocityX(-100);
      bird.flipX = true;
      bird.setDepth(6);
      bird.setSize(bird.displayWidth - 10, bird.displayHeight - 10);
    };
    this.createAnimations('fly', 'bird', 0, 8, -1, 7);
    this.birdCreationTime = this.time.addEvent({
      callback: createBird,
      delay: Phaser.Math.Between(2500, 5000),
      callbackScope: this,
      loop: true,
    });

    // Coins SECTION
    this.coinGroup = this.physics.add.group();
    const createCoinFromBird = () => { // Renamed for clarity, using arrow function
      this.createBirdDrop(this.coinGroup, 'coin');
    };
    this.physics.add.collider(this.coinGroup, this.groundGroup, (singleCoin) => {
      singleCoin.setVelocityX(-200);
    });
    this.physics.add.overlap(this.player, this.coinGroup, (player, singleCoin) => {
      this.pickCoin.play();
      singleCoin.destroy();
      gameState.score += 1;
      if (this.health < 120) this.health += 1; // Cap health gain
      this.scoreValue.setText(`${gameState.score}`);
      this.hoveringTextScore(player, '1+', '#0000ff');
      // Update health bar after health increase
      this.progressBar.clear();
      this.progressBar.fillStyle(0xFFD700, 1);
      this.progressBar.fillRect(170, 95, this.health, 10);
    });
    this.coinCreationTime = this.time.addEvent({
      callback: createCoinFromBird,
      delay: 1000,
      callbackScope: this,
      loop: true,
    });

    // Spikes SECTION
    this.spikeGroup = this.physics.add.group();
    const createSpikeFromBird = () => { // Renamed for clarity, using arrow function
      this.createBirdDrop(this.spikeGroup, 'spike');
    }
    this.spikeCreationTime = this.time.addEvent({
      callback: createSpikeFromBird,
      delay: 5000,
      callbackScope: this,
      loop: true,
    });
    this.physics.add.collider(this.spikeGroup, this.groundGroup, (singleSpike) => {
      singleSpike.setVelocityX(-200);
    });
    this.physics.add.overlap(this.player, this.spikeGroup, (player, singleSpike) => {
      this.spikeSound.play();
      singleSpike.destroy();
      this.health -= 15;
      this.hoveringTextScore(player, 'Spiked!', '#CCCC00', '#800080');
    });

    // Missiles SECTION
    this.missileGroup = this.physics.add.group();
    this.explosion = this.add.sprite(-100, -100, 'explosion').setScale(0.5).setDepth(8);
    this.createAnimations('explode', 'explosion', 0, 15, 0, 20);
    this.createAnimations('idle', 'explosion', 15, 15, -1, 1);
    if(this.explosion) this.explosion.play('idle', true); // Safety check

    this.physics.add.collider(this.player, this.missileGroup, (player, missile) => {
      if (player.body.touching.down && missile.body.touching.up) {
        this.killMissile.play();
        player.setVelocityY(-300);
        missile.setVelocityY(300);
        let message = '';
        if (missile.y < 350) {
          message += '+0.5';
          this.missileScore += 0.5;
        } else {
          message += '+0.25';
          this.missileScore += 0.25;
        }
        this.hoveringTextScore(player, message, '#00ff00');
      } else {
        this.explodeSound.play();
        if (missile.y < 350) {
          this.health -= 15;
        } else {
          this.health -= 10;
        }
        missile.destroy();
        player.setVelocityY(0); // Consider a small knockback if desired for game feel
        this.hoveringTextScore(player, 'Damage', '#ff0000', '#ff0000');

        this.explosion.x = player.x;
        this.explosion.y = player.y;
        this.explosion.play('explode', true);
      }
    });

    // Bounds SECTION
    this.leftBound = this.add.rectangle(-50, 0, 10, gameState.sceneHeight, 0x000000).setOrigin(0);
    this.bottomBound = this.add.rectangle(0, gameState.sceneHeight,
      gameState.sceneWidth, 10, 0x000000).setOrigin(0);
    this.boundGroup = this.physics.add.staticGroup();
    if(this.leftBound) this.boundGroup.add(this.leftBound); // Safety check
    if(this.bottomBound) this.boundGroup.add(this.bottomBound); // Safety check

    this.physics.add.collider(this.birdGroup, this.boundGroup, (singleBird) => {
      if(singleBird) singleBird.destroy(); // Safety check
    });
    this.physics.add.collider(this.coinGroup, this.boundGroup, (singleCoin) => {
      if(singleCoin) singleCoin.destroy(); // Safety check
    });
    this.physics.add.collider(this.spikeGroup, this.boundGroup, (singleSpike) => {
      if(singleSpike) singleSpike.destroy(); // Safety check
    });
    this.physics.add.collider(this.missileGroup, this.boundGroup, (singleMissile) => {
      if(singleMissile) singleMissile.destroy(); // Safety check
    });

    // --- CAMERA CONTROLLER INITIALIZATION ---
    if (window.currentControlMode === 'camera') {
        console.log("Game.js: create() - Camera mode selected. Initializing CameraGestureController.");
        if (this.player) { // Make sure player has been created
            this.cameraGestureController = new CameraGestureController(this, this.player);
            this.cameraGestureController.initialize().then(initialized => {
                if (initialized) {
                    this.cameraGestureController.setActive(true);
                    console.log("Game.js: Camera controls are active.");
                } else {
                    console.error("Game.js: CameraGestureController FAILED to initialize. Defaulting to keyboard.");
                    window.currentControlMode = 'keyboard'; // Fallback if camera fails
                    alert("Camera controller failed to initialize. Game will use keyboard controls.");
                }
            }).catch(error => {
                console.error("Game.js: Error during CameraGestureController initialization:", error);
                window.currentControlMode = 'keyboard'; 
                alert("Error initializing camera controller. Game will use keyboard controls.");
            });
        } else {
            console.error("Game.js: this.player is NOT defined when trying to init CameraGestureController!");
            window.currentControlMode = 'keyboard'; // Fallback
        }
    } else {
        console.log("Game.js: create() - Keyboard mode selected.");
    }

    // Health bar update timer
    const reduceHealthTimely = () => {
      if(this.health > 0) { // Only reduce if health is above 0
        this.health -= 1;
        this.progressBar.clear();
        this.progressBar.fillStyle(0xFFD700, 1);
        this.progressBar.fillRect(170, 95, this.health, 10);
      }
      // this.healthTimer = 0; // This line was in code 1, but seems redundant as per code 2's observation
    };
    this.time.addEvent({
      callback: reduceHealthTimely,
      delay: 500, // Reduce health every 0.5 seconds
      loop: true,
      callbackScope: this,
    });
        // --- START: Mobile Touch Controls for Keyboard Mode ---
    this.isTouchDevice = this.sys.game.device.input.touch; // Check if it's a touch-enabled device

    if (window.currentControlMode !== 'camera' && this.isTouchDevice) {
        console.log("Game.js: Keyboard mode on touch device. Enabling mobile touch controls.");

        // --- TAP SCREEN TO JUMP ---
        this.input.on('pointerdown', (pointer) => {
            // Only jump if not in camera mode AND the tap wasn't on our duck button
            if (window.currentControlMode !== 'camera' &&
                (!this.mobileDuckButton || !this.mobileDuckButton.getBounds().contains(pointer.x, pointer.y))) {

                if (this.player && this.player.body) { // Safety check for player
                    if (this.player.body.touching.down || (this.jump < this.jumpTimes && this.jump > 0)) {
                        this.player.setVelocityY(-400);
                        if (this.jumpSound) this.jumpSound.play();
                        this.jump += 1;
                    }
                }
            }
        }, this);


        // --- ON-SCREEN DUCK BUTTON ---
        this.mobileDuckButton = this.add.circle(
            gameState.sceneWidth - 70,  // X position (near bottom-right)
            gameState.sceneHeight - 70, // Y position (near bottom-right)
            45,                         // Radius of the circle
            0x0000FF,                   // Blue color
            0.6                        // Alpha (semi-transparent)
        ).setDepth(10).setScrollFactor(0); // Keep it fixed on screen, and on top

        this.add.text(this.mobileDuckButton.x, this.mobileDuckButton.y, 'FALL', {
            fontSize: '20px', fill: '#FFFFFF', fontFamily: '"Akaya Telivigala"'
        }).setOrigin(0.5).setDepth(11).setScrollFactor(0);

        this.mobileDuckButton.setInteractive();

        this.mobileDuckButton.on('pointerdown', () => {
            if (window.currentControlMode !== 'camera') {
                this.isMobileDucking = true;
            }
        });
        this.mobileDuckButton.on('pointerup', () => {
            this.isMobileDucking = false;
        });
        this.mobileDuckButton.on('pointerout', () => {
            this.isMobileDucking = false;
        });
    }
    // --- END: Mobile Touch Controls for Keyboard Mode ---
    console.log("Game.js: create() finished.");
  }
  // END of create function above

  createAnimations(animKey, spriteKey, startFrame, endFrame, loopTimes, frameRate) {
    return (this.anims.create({
      key: animKey,
      frames: this.anims.generateFrameNumbers(spriteKey, { start: startFrame, end: endFrame }),
      frameRate,
      repeat: loopTimes,
    }));
  }

  addGameBackground() {
    this.add.image(gameState.sceneWidth / 2, gameState.sceneHeight / 2, 'sky').setScale(0.5);

    this.mountainGroup = this.add.group();
    this.firstMountain = this.mountainGroup.create(0, gameState.sceneHeight, 'mountains').setScale(0.5).setOrigin(0, 1);
    if (this.firstMountain) {
      this.mountainWidth = this.firstMountain.displayWidth;
      createPlatform(this.mountainGroup, this.mountainWidth, 'mountains');
    } else {
        console.error("Failed to create first mountain platform!");
    }


    this.plateauGroup = this.add.group();
    this.firstPlateau = this.plateauGroup.create(0, gameState.sceneHeight, 'plateau').setScale(0.5).setOrigin(0, 1);
    if (this.firstPlateau) {
      this.plateauWidth = this.firstPlateau.displayWidth;
      createPlatform(this.plateauGroup, this.plateauWidth, 'plateau');
    } else {
        console.error("Failed to create first plateau platform!");
    }

    this.groundGroup = this.physics.add.group();
    // Use this.sys.game.config.height for initial ground platform's Y, as per code 2
    this.first = this.groundGroup.create(0, this.sys.game.config.height, 'ground')
      .setOrigin(0, 1)
      .setScale(0.5);
    
    if (this.first) {
      this.first.setImmovable(true);
      this.groundWidth = this.first.displayWidth;
      this.groundHeight = this.first.displayHeight;
      this.first.setSize(this.groundWidth * 2, this.groundHeight - 50);
      createPlatform(this.groundGroup, this.groundWidth, 'ground'); // Subsequent platforms use gameState.sceneHeight via createPlatform
    } else {
        console.error("Failed to create initial ground platform (this.first)!");
    }
  }


  createBirdDrop(group, texture) {
    // Changed condition from getLength() >= 2 to >= 1 as per code 2
    if (this.birdGroup && this.birdGroup.getLength() >= 1) {
      const children = this.birdGroup.getChildren();
      const child = children[Phaser.Math.Between(0, children.length - 1)];
      if (child) { // Ensure a bird (child) was actually selected
        const drop = group.create(child.x, child.y, texture).setScale(0.05);
        if (texture === 'spike') {
          drop.setScale(0.1);
        }
        drop.setGravityY(700);
        // drop.setGravityX(0); // Usually not needed if only Y gravity is intended
        drop.setDepth(6);
        drop.setBounce(1);
        // Adjust collision size, Math.max to prevent zero or negative sizes
        drop.setSize(Math.max(1, drop.width - 200), Math.max(1, drop.height - 200)); 
      }
    }
  }

  createMissile(height, texture) {
    const missile = this.missileGroup.create(gameState.sceneWidth + 100, height, texture);
    missile.setScale(0.1);
    missile.setDepth(6);
    // Adjust missile collision box, Math.max to prevent zero or negative sizes
    missile.setSize(Math.max(1, missile.width), Math.max(1, missile.height - 300)); 
    missile.setOffset(0, 150);
  }

  hoveringTextScore(player, message, strokeColor, fillColor = '#ffffff') {
    const singleScoreText = this.add.text(player.x, player.y, message, {
      fontSize: '30px',
      fill: fillColor,
      fontFamily: '"Akaya Telivigala"',
      strokeThickness: 2,
      stroke: strokeColor,
    }).setDepth(7);
    singleScoreText.setAlpha(1);

    this.tweens.add({
      targets: singleScoreText,
      repeat: 0,
      duration: 1000,
      ease: 'linear',
      alpha: 0,
      y: singleScoreText.y - 100,
      onComplete() {
        singleScoreText.destroy();
      },
    });
  }

  createSoundEffect(soundKey, volumeLevel, loopStatus = false) {
    const effect = this.sound.add(soundKey, { loop: loopStatus });
    effect.volume = volumeLevel;
    return effect;
  }

  addSoundEffects() {
    this.pickCoin = this.createSoundEffect('pickCoin', 0.3, false);
    this.explodeSound = this.createSoundEffect('explosion', 0.4, false);
    this.killMissile = this.createSoundEffect('killMissile', 0.1, false);
    this.jumpSound = this.createSoundEffect('jumpSound', 0.05, false); // Used for player jump
    this.spikeSound = this.createSoundEffect('spikeSound', 0.2, false);
  }

  update(time, delta) {
    // Safety check: If player is not active or body not set up, don't run update logic for it
    if (!this.player || !this.player.active || !this.player.body) {
        return; 
    }

    moveBackgroundPlatform(this.mountainGroup, this.mountainWidth, 'mountains', 0.5);
    moveBackgroundPlatform(this.plateauGroup, this.plateauWidth, 'plateau', 1.5);
    moveBackgroundPlatform(this.groundGroup, this.groundWidth, 'ground', 4);

    if (this.health <= 0) {
      if(this.scene.isActive('Game')) { // Check if scene is still active to prevent multiple stops/starts
        console.log("Game Over! Health depleted.");
        // URL construction as per code 2 (expression evaluated then embedded)
        const myUrl = `${fetchScoreData.apiUrl + fetchScoreData.apiKey}/scores`;
        fetchScoreData.postScores(myUrl, { user: gameState.playerName, score: gameState.score });
        if(this.gameTheme) this.gameTheme.stop();
        this.scene.stop('Game'); // Stop this current scene specifically
        this.scene.start('GameOver'); // Start the GameOver scene
      }
      return; // Important: stop further processing in this update frame
    }

    // Health regeneration from missileScore
    if (this.missileScore >= 1) {
      if(this.health < 120) { // Don't exceed max health (assuming 120 is max)
          this.health += 1;
          // Update health bar after health increase
          this.progressBar.clear();
          this.progressBar.fillStyle(0xFFD700, 1);
          this.progressBar.fillRect(170, 95, this.health, 10);
      }
      this.missileScore -= 1;
    }

    // Player Animation: run on ground, jump in air
    if (this.player.body.touching.down) {
      this.player.anims.play('run', true);
    } else {
      this.player.anims.play('jump', true);
    }
    
    // Bird animations
    this.birdGroup.children.iterate((child) => {
      if (child && child.active) child.anims.play('fly', true);
    });

    // Missile Movement
    this.missileGroup.children.iterate((child) => {
      if (child && child.active) child.x -= 5; // Constant speed missile
    });

    // Missile Creation Timers (preserved from code 1)
    this.timer += delta;
    if (this.timer >= 5000) {
      this.createMissile(415, 'missile');
      this.timer = 0;
    }

    this.secondTimer += delta;
    if (this.secondTimer >= 7000) {
      this.createMissile(300, 'missile2');
      this.secondTimer = 0;
    }

    // --- INPUT HANDLING (KEYBOARD OR GESTURE) ---
    // Allow keyboard if camera mode is not active, or if camera controller exists but is not active (e.g., failed init)
 // PASTE THIS NEW BLOCK IN PLACE OF THE OLD ONE
// --- INPUT HANDLING (KEYBOARD, MOBILE TOUCH, OR GESTURE) ---
if (window.currentControlMode !== 'camera' || (this.cameraGestureController && !this.cameraGestureController.isActive)) {

    // --- KEYBOARD JUMP (for physical keyboards) ---
    // The mobile tap-to-jump is handled in the 'pointerdown' event in create()
    if (!this.isTouchDevice && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        if (this.player.body.touching.down || (this.jump < this.jumpTimes && this.jump > 0)) {
            this.player.setVelocityY(-400);
            if (this.jumpSound) this.jumpSound.play();
            this.jump += 1;
        }
    }

    // --- DUCK / FAST FALL (handles both keyboard 'DOWN' arrow and mobile 'FALL' button) ---
    let isTryingToDuck = false;
    if (this.isTouchDevice && window.currentControlMode !== 'camera') {
        // If on mobile and in keyboard mode, use the mobile duck button state
        isTryingToDuck = this.isMobileDucking;
    } else if (!this.isTouchDevice) {
        // If not on mobile (i.e., has a physical keyboard), use the down arrow key
        isTryingToDuck = this.cursors.down.isDown;
    }
    // Note: If it's a touch device but camera mode is active, isTryingToDuck remains false here,
    // and camera controls would handle any duck/fall gestures if implemented there.


    if (isTryingToDuck) {
        if (this.player && this.player.body && !this.player.body.touching.down) { // Only fast fall if in air
            this.player.setGravityY(1300); // Stronger gravity
        }
    } else {
        // Reset gravity if not trying to duck
        if (this.player && this.player.body && this.player.body.velocity.y >= 0 && this.player.body.gravity.y !== 800) {
            this.player.setGravityY(800); // Normal gravity
        }
    }
}
// Note: The camera gesture logic (if window.currentControlMode === 'camera')
// would be handled separately if your CameraGestureController.js also manages ducking.
// END OF THE NEW BLOCK    
    // --- UNIVERSAL LOGIC (applies to both keyboard and camera control state) ---
    // Reset jump counter and ensure normal gravity when player is on the ground.
    if (this.player.body.touching.down) {
      this.jump = 0;
      if (this.player.body.gravity.y !== 800) { // If gravity was changed (e.g. by fast fall)
          this.player.setGravityY(800); // Reset to normal gravity
      }
    }
  } // --- END OF update() ---
}

export default Game;