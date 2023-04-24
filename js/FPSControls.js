import * as THREE from "three";
class FPSControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement || document.body;

        this.movementSpeed = 10;
        this.lookSpeed = 0.005;
        this.constrainVerticalLook = true;
        this.verticalMin = -Math.PI / 2;
        this.verticalMax = Math.PI / 2;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        this.mouseX = 0;
        this.mouseY = 0;

        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(camera);

        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 10;
        this.yawObject.add(this.pitchObject);

        this.domElement.addEventListener("keydown", this.onKeyDown.bind(this));
        this.domElement.addEventListener("keyup", this.onKeyUp.bind(this));
        this.domElement.addEventListener(
            "mousemove",
            this.onMouseMove.bind(this)
        );
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;

            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                this.moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;

            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                this.moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;
        }
    }

    onMouseMove(event) {
        this.mouseX += event.movementX * this.lookSpeed;
        this.mouseY += event.movementY * this.lookSpeed;

        if (this.constrainVerticalLook) {
            this.mouseY = Math.max(
                -this.verticalMax,
                Math.min(this.verticalMin, this.mouseY)
            );
        }
    }

    update(deltaTime) {
        const actualMoveSpeed = deltaTime * this.movementSpeed;

        if (this.moveForward) {
            this.yawObject.translateZ(-actualMoveSpeed);
        }
        if (this.moveBackward) {
            this.yawObject.translateZ(actualMoveSpeed);
        }
        if (this.moveLeft) {
            this.yawObject.translateX(-actualMoveSpeed);
        }
        if (this.moveRight) {
            this.yawObject.translateX(actualMoveSpeed);
        }

        const pitchObject = this.pitchObject;
        const yawObject = this.yawObject;

        this.camera.position.copy(yawObject.position);
        this.camera.position.y += 1.8;

        yawObject.rotation.y -= this.mouseX;
        pitchObject.rotation.x -= this.mouseY;

        this.mouseX = 0;
        this.mouseY = 0;
    }
}
export default FPSControls;
