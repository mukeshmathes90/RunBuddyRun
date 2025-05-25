// src/CameraGestureController.js
const COOLDOWN_JUMP_SECONDS = 0.8; // Adjust as needed

export default class CameraGestureController {
    constructor(scene, player) { // Phaser scene and player object
        this.scene = scene;
        this.player = player; // The Phaser Player game object
        this.videoElement = document.getElementById('webcamFeed');
        this.hands = null;
        this.lastActionTime = 0;
        this.active = false;
        // Add any other necessary properties like prevDirection, lastMoveTime if needed
    }

    async initialize() {
        if (typeof Hands === "undefined") {
            console.error("MediaPipe Hands script not loaded!");
            return false;
        }
        this.hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
        this.hands.setOptions({
            maxNumHands: 1, modelComplexity: 1,
            minDetectionConfidence: 0.7, minTrackingConfidence: 0.7
        });
        this.hands.onResults(this.onResults.bind(this));

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            this.videoElement.srcObject = stream;
            await new Promise((resolve) => { this.videoElement.onloadedmetadata = resolve; });
            const camera = new Camera(this.videoElement, {
                onFrame: async () => { if (this.videoElement.readyState >= 2) await this.hands.send({ image: this.videoElement }); },
                width: this.videoElement.videoWidth, height: this.videoElement.videoHeight
            });
            camera.start();
            this.isInitialized = true;
            console.log("CameraGestureController initialized for Phaser game.");
            return true;
        } catch (error) {
            console.error("Failed to initialize camera stream:", error);
            alert("Webcam access denied or failed. Please ensure permissions and try again.");
            return false;
        }
    }

    setActive(isActive) {
        this.active = isActive;
        if (isActive) console.log("Phaser Camera controls ACTIVATED");
        else {
            console.log("Phaser Camera controls DEACTIVATED");
            if (this.player && typeof this.player.stopHorizontalMovementByGesture === 'function') {
                this.player.stopHorizontalMovementByGesture();
            }
        }
    }

    onResults(results) {
        if (!this.active || !this.player || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            if (this.active && this.player && typeof this.player.stopHorizontalMovementByGesture === 'function') {
                this.player.stopHorizontalMovementByGesture();
            }
            return;
        }
        const handLandmarks = results.multiHandLandmarks[0];
        const currentTime = Date.now() / 1000;
        const fingerExtended = this.isIndexFingerExtended(handLandmarks); // You'll define this

        if (fingerExtended) {
            const base = handLandmarks[5]; // Index finger MCP
            const tip = handLandmarks[8];  // Index finger TIP
            const direction = this.getDirection(base.x, base.y, tip.x, tip.y); // You'll define this

            if (direction === 'up') {
                if (currentTime - this.lastActionTime > COOLDOWN_JUMP_SECONDS) {
                    if (typeof this.player.jumpByGesture === 'function') {
                        this.player.jumpByGesture();
                        this.lastActionTime = currentTime;
                    }
                }
            } else if (direction === 'left') {
                if (typeof this.player.moveLeftByGesture === 'function') this.player.moveLeftByGesture();
            } else if (direction === 'right') {
                if (typeof this.player.moveRightByGesture === 'function') this.player.moveRightByGesture();
            } else { // No specific direction recognized for game action
                if (typeof this.player.stopHorizontalMovementByGesture === 'function') {
                    this.player.stopHorizontalMovementByGesture();
                }
            }
        } else { // Hand not open or index finger not extended
            if (typeof this.player.stopHorizontalMovementByGesture === 'function') {
                this.player.stopHorizontalMovementByGesture();
            }
        }
    }

    // Helper function to get gesture direction
    getDirection(baseX, baseY, tipX, tipY) {
        const dX = tipX - baseX;
        const dY = tipY - baseY;
        const angle = Math.atan2(dY, dX) * (180 / Math.PI);
        const minMovementThreshold = 0.03; // Normalized threshold

        if (Math.abs(dX) > Math.abs(dY)) { // Horizontal
            if (dX > minMovementThreshold) return 'right';
            if (dX < -minMovementThreshold) return 'left';
        } else { // Vertical
            if (dY < -minMovementThreshold) return 'up';
        }
        return null;
    }

    // Helper function to check if index finger is extended
    isIndexFingerExtended(landmarks) {
        const tip = landmarks[8]; // INDEX_FINGER_TIP
        const pip = landmarks[6]; // INDEX_FINGER_PIP
        const distTipPip = Math.hypot(tip.x - pip.x, tip.y - pip.y);
        return distTipPip > 0.07; // Adjust this normalized distance threshold via testing
    }
}