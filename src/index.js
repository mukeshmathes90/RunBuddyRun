import '../stylesheets/styler.css';
import Phaser from 'phaser';
import Preload from './preload';
import { Boot } from './boot';
import Menu from './Menu';
import Options from './Options';
import Credits from './Credits';
import Game from './game';
import { GameOver } from './gameOver';
import LeaderBoard from './leaderBoard';
import Instructions from './instructions';

// Function to display control choice modal
async function showControlChoice() {
  console.log("showControlChoice() called");

  const modal = document.getElementById('controlChoiceModal');
  const keyboardBtn = document.getElementById('keyboardBtn');
  const cameraBtn = document.getElementById('cameraBtn');
  const gameContainer = document.getElementById('game');
  const toggleWebcamBtn = document.getElementById('toggleWebcamViewBtn');
  if (modal) {
    console.log("Modal found. Displaying modal.");
    modal.style.display = 'flex';
  } else {
    console.error("Modal not found!");
  }

  if (gameContainer) {
    console.log("Game container found. Hiding it initially.");
    gameContainer.style.display = 'none';
  } else {
    console.error("Game container not found!");
  }
  if (toggleWebcamBtn) {
    toggleWebcamBtn.style.display = 'none';
} else {
    console.error("Button #toggleWebcamViewBtn not found!");
}
  return new Promise((resolve) => {
    const handleChoice = (mode) => {
      console.log(`handleChoice called with mode: ${mode}`);
      window.currentControlMode = mode;

      if (modal) {
        console.log("Hiding modal...");
        modal.style.display = 'none';
      }

      if (gameContainer) {
        console.log("Showing game container...");
        gameContainer.style.display = 'block';
      }
      if (toggleWebcamBtn) { // Check if the button element exists
    if (mode === 'camera') {
        console.log("Camera mode selected. Showing toggleWebcamViewBtn.");
        toggleWebcamBtn.style.display = 'block'; // Make button visible

        toggleWebcamBtn.onclick = () => {
            const webcamFeedElement = document.getElementById('webcamFeed');
            if (webcamFeedElement) {
                if (webcamFeedElement.style.display === 'none' || webcamFeedElement.style.display === '') {
                    webcamFeedElement.style.display = 'block';
                    console.log("Webcam feed view toggled ON");
                } else {
                    webcamFeedElement.style.display = 'none';
                    console.log("Webcam feed view toggled OFF");
                }
            }
        };
    } else { // For 'keyboard' mode or any other future mode
        console.log("Non-camera mode selected. Hiding toggleWebcamViewBtn.");
        toggleWebcamBtn.style.display = 'none'; // Ensure it's hidden
    }
}
      resolve(mode);
    };

    if (keyboardBtn) {
      console.log("Attaching click listener to keyboardBtn.");
      keyboardBtn.onclick = () => handleChoice('keyboard');
    } else {
      console.error("keyboardBtn not found!");
    }

    if (cameraBtn) {
      console.log("Attaching click listener to cameraBtn.");
      cameraBtn.onclick = () => handleChoice('camera');
    } else {
      console.error("cameraBtn not found!");
    }
  });
}

// Phaser Game class
class EndlessRunnerGame extends Phaser.Game {
  constructor() {
    console.log("EndlessRunnerGame constructor started.");
    const config = {
      type: Phaser.AUTO,
      parent: 'game',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 960,
        height: 520,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      dom: {
        createContainer: true,
      },
      scene: [
        Boot,
        Preload,
        Menu,
        Options,
        Credits,
        Game,
        GameOver,
        LeaderBoard,
        Instructions,
      ],
    };
    super(config);
    console.log("Phaser.Game super(config) called. Game initialized.");
  }
}

// Entry point
window.onload = async () => {
  console.log("window.onload: Page loaded.");
  await showControlChoice();
  console.log(`Control mode selected: ${window.currentControlMode}`);
  window.phaserGame = new EndlessRunnerGame();
  console.log("Phaser game instance created.");
};
