// src/scenes/Credits.js
import Phaser from 'phaser';
import CustomButton from './support_script/CustomButton';
import { gameState, playStopAudio } from './boot';

class Credits extends Phaser.Scene {
  constructor() {
    super({ key: 'Credits' });
  }

  create() {
    this.width = this.scale.width;
    this.height = this.scale.height;

    this.hoverSound = this.sound.add('hoverBtnSound', { loop: false });
    this.clickSound = this.sound.add('clickBtnSound', { loop: false });

    this.add.image(0, 0, 'sky').setOrigin(0).setScale(0.5);
    this.add.image(this.width / 2, this.height / 2, 'logo2').setAlpha(0.2);
    // This is your background rectangle
    this.add.rectangle(this.width / 2, this.height / 2,
      (this.width * 3) / 4, (this.height * 3) / 4, 0x000000, 0.3);

    // New helper function to create text, allowing for style overrides and word wrap
    const createText = (x, y, message, size, fillColor, strokeColor, originX = 0, originY = 0.5, wrapWidth = 0) => {
      const style = {
        fontSize: `${size}px`,
        fill: fillColor,
        fontFamily: '"Akaya Telivigala"',
        strokeThickness: 5,
        stroke: strokeColor,
        align: (wrapWidth > 0 && (originX === 0.5 || originX === 'center')) ? 'center' : 'left', // Center align wrapped text if its origin is centered
      };
      if (wrapWidth > 0) {
        style.wordWrap = { width: wrapWidth, useAdvancedWrap: true };
      }
      return this.add.text(x, y, message, style).setOrigin(originX, originY);
    };

    const labelX = this.width / 2 - 15; // X for labels (right aligned) - moved slightly left
    const valueX = this.width / 2 + 15; // X for values (left aligned) - moved slightly left
    
    // Calculate max width for value text to fit inside the rectangle
    // Rectangle left edge: this.width / 2 - (this.width * 3) / 8 = this.width / 8
    // Rectangle right edge: this.width / 2 + (this.width * 3) / 8 = this.width * 7 / 8
    // So, valueWrapWidth = (this.width * 7 / 8) - valueX;
    const valueWrapWidth = (this.width * 7 / 8) - valueX - 10; // -10 for a little padding from the edge

    const mainFontSize = 28; // Slightly reduced main font size
    const descFontSize = 24; // Smaller font size for descriptions/lists
    const sectionSpacing = 40; // Space between major sections
    const lineItemSpacing = 8; // Smaller space between items in a list or a label and its multi-line value

    let currentY = this.height / 2 - 150; // Starting Y, adjusted higher

    // --- Developer Credits ---
    createText(labelX, currentY, 'ORIGINAL GAME BY:', mainFontSize, '#ff0000', '#ffffff', 1); // originX = 1 (right align)
    createText(valueX, currentY, 'Roy Ntaate', mainFontSize, '#ffffff', '#0275d8', 0); // originX = 0 (left align)
    currentY += mainFontSize + lineItemSpacing;

    createText(labelX, currentY, 'ENHANCED & MODIFIED BY:', mainFontSize, '#00ff00', '#ffffff', 1);
    createText(valueX, currentY, 'Mukesh M', mainFontSize, '#ffffff', '#00aa00', 0);
    currentY += mainFontSize * 0.8; // Tighter spacing for the description line

    // Your description, wrapped (originY = 0 for top-alignment of wrapped text)
    const yourDescText = createText(valueX, currentY, '(Camera Gesture Controls, UI/UX Fixes, Layout Adjustments)', descFontSize, '#cccccc', '#0275d8', 0, 0, valueWrapWidth);
    currentY = yourDescText.y + yourDescText.displayHeight; // Update Y to be below the description

    // --- Built With ---
    currentY += sectionSpacing; // Add space before the next section
    createText(labelX, currentY, 'BUILT WITH:', mainFontSize, '#ff0000', '#ffffff', 1);
    createText(valueX, currentY, 'Phaser 3', mainFontSize, '#ffffff', '#0275d8', 0);

    // --- Assets Source ---
    currentY += sectionSpacing;
    createText(labelX, currentY, 'ASSETS SOURCE:', mainFontSize, '#ff0000', '#ffffff', 1);

    // Asset items - dynamic Y based on previous item's height (originY = 0 for wrapped text)
    let assetItemText;
    assetItemText = createText(valueX, currentY, 'CoolText.com, Kenney.nl,', descFontSize, '#ffffff', '#0275d8', 0, 0, valueWrapWidth);
    currentY = assetItemText.y + assetItemText.displayHeight + lineItemSpacing / 2;

    assetItemText = createText(valueX, currentY, 'marwamj.itch.io,', descFontSize, '#ffffff', '#0275d8', 0, 0, valueWrapWidth);
    currentY = assetItemText.y + assetItemText.displayHeight + lineItemSpacing / 2;

    createText(valueX, currentY, 'OpenGameArt', descFontSize, '#ffffff', '#0275d8', 0, 0, valueWrapWidth);

    // Back Button (ensure its Y position is still appropriate, e.g., near the bottom of the screen/rectangle)
    const backBtnY = Math.min(this.height - 40, (this.height / 2) + ((this.height * 3) / 4) / 2 - 40); // Place it near bottom of rectangle or screen
    const backBtn = new CustomButton(this, this.width / 8 + 60, backBtnY, 'mainMenu', 'mainMenuHover'); // Positioned more to the left
    this.add.existing(backBtn);

    backBtn.setInteractive().on('pointerup', () => {
      playStopAudio(gameState.sound, this.clickSound);
      this.scene.stop();
      this.scene.start('Menu');
    }).on('pointerover', () => {
      playStopAudio(gameState.sound, this.hoverSound);
    });
  }
}

export default Credits;