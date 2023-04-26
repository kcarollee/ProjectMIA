import * as THREE from "three";
import OrbitControls from "./js/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import StageModel from "./js/StageModel.js";

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

    // CAMERA
    const fov = 75;
    const aspect = 2; // display aspect of the canvas
    const near = 0.001;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 10);

    const stageSelectCamera = new THREE.PerspectiveCamera(
        fov,
        aspect,
        near,
        far
    );
    stageSelectCamera.position.set(0, 0, 10);
    //camera.lookAt(new THREE.Vector3(0, 0, 0));

    // SCENES AND GAME MODES
    let currentScene;
    let gameMode = "TITLE_SCREEN"; // TITLE_SCREEN, STAGE_SELECT, MAIN_GAME
    const titleScene = new THREE.Scene();
    const backgroundColor = 0x000000;
    titleScene.background = new THREE.Color(backgroundColor);

    const stageSelectScene = new THREE.Scene();
    stageSelectScene.background = new THREE.Color(backgroundColor);

    const mainGameScene = new THREE.Scene();
    mainGameScene.background = new THREE.Color(backgroundColor);
    currentScene = titleScene;
    renderer.render(currentScene, camera);

    // TIME LIMIT
    const DEFAULT_TIME_LIMIT = 200;
    const playerTime = new THREE.Clock(false); // autostart: false
    playerTime.defaultTimeLimit = DEFAULT_TIME_LIMIT;
    const timeLimitElement = document.getElementById("timeLimit");
    let timeLeft;
    // MENU
    const menuButton = document.getElementById("menu");
    let menuActive = false;
    menuButton.addEventListener("click", () => {
        toggleMenu();
    });

    const backToGameButton = document.getElementById("backToGame");
    backToGameButton.addEventListener("click", () => {
        untoggleMenu();
    });

    function toggleMenu() {
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "flex";
        menuActive = true;
    }

    function untoggleMenu() {
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "none";
        menuActive = false;
    }

    function toggleStageSelectMenu() {
        const stageSelectContainer = document.getElementById("stageContainer");
        console.log(stageSelectContainer.style);
        stageSelectContainer.style.display = "flex";
        stagePannelArr.forEach(function (pannel) {
            pannel.toggle();
        });
    }

    function untoggleStageSelectMenu() {
        const stageSelectContainer = document.getElementById("stageContainer");
        stageSelectContainer.style.display = "none";
        stagePannelArr.forEach(function (pannel) {
            pannel.untoggle();
        });
    }

    function toggleMiniMap() {
        const minimapBox = document.getElementById("minimap");
        minimapBox.style.display = "list-item";
    }

    function untoggleMiniMap() {
        const minimapBox = document.getElementById("minimap");
        minimapBox.style.display = "none";
    }

    function toggleDefaultSubPannel() {
        const defaultSubPannel = document.getElementById("defaultSubPannel");
        defaultSubPannel.style.display = "inline";
    }

    function untoggleDefaultSubPannel() {
        const defaultSubPannel = document.getElementById("defaultSubPannel");
        defaultSubPannel.style.display = "none";
    }

    function toggleConfirmSubPannel() {
        const confirmSubPannel = document.getElementById("confirmSubPannel");
        confirmSubPannel.style.display = "inline";
    }

    function untoggleConfirmSubPannel() {
        const confirmSubPannel = document.getElementById("confirmSubPannel");
        confirmSubPannel.style.display = "none";
    }

    function toggleTimeoutPannel() {
        const timeoutPannel = document.getElementById("timeout-screen");
        timeoutPannel.style.display = "flex";
    }

    function untoggleTimeoutPannel() {
        const timeoutPannel = document.getElementById("timeout-screen");
        timeoutPannel.style.display = "none";
    }

    function toggleFarawayPannel() {
        const farawayPannel = document.getElementById("faraway-screen");
        farawayPannel.style.display = "flex";
    }

    function untoggleFarawayPannel() {
        const farawayPannel = document.getElementById("faraway-screen");
        farawayPannel.style.display = "none";
    }

    function toggleNearbyPannel() {
        const nearbyPannel = document.getElementById("nearby-screen");
        nearbyPannel.style.display = "flex";
    }

    function untoggleNearbyPannel() {
        const nearbyPannel = document.getElementById("nearby-screen");
        nearbyPannel.style.display = "none";
    }

    const settingsButton = document.getElementById("settings");
    settingsButton.addEventListener("click", () => {
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "none";
        const settingsScreen = document.getElementById("settings-screen");
        settingsScreen.style.display = "flex";
    });

    const backButton = document.getElementById("back");
    backButton.addEventListener("click", () => {
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "flex";
        const settingsScreen = document.getElementById("settings-screen");
        settingsScreen.style.display = "none";
    });

    const backToStagesButton = document.getElementById("backToStages");
    backToStagesButton.addEventListener("click", () => {
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "none";
        const settingsScreen = document.getElementById("settings-screen");
        settingsScreen.style.display = "none";
        toggleStageSelectMenu();
        untoggleMiniMap();
        currentScene = stageSelectScene;
        gameMode = "STAGE_SELECT";

        // reset main game scene: delete the stage model
        mainGameScene.remove(mainGameScene.getObjectByName("stageModel"));

        // might need to reset the camera as well
    });
    const zoomInButton = document.getElementById("zoomInButton");
    const zoomOutButton = document.getElementById("zoomOutButton");
    const guessButton = document.getElementById("guessButton");
    let guessModeEnabled = false;
    let confirmModeEnabled = false;

    zoomInButton.addEventListener("click", () => {
        minimapCamera.zoom++;
        minimapCamera.updateProjectionMatrix();
    });

    zoomOutButton.addEventListener("click", () => {
        minimapCamera.zoom--;
        minimapCamera.updateProjectionMatrix();
    });

    guessButton.addEventListener("click", () => {
        guessModeEnabled = !guessModeEnabled;
        if (guessModeEnabled) {
            document.getElementById("guessButton").style.color = "red";
        } else {
            document.getElementById("guessButton").style.color = "black";
        }
    });

    // confirm answer button
    const yesButton = document.getElementById("yesButton");
    const noButton = document.getElementById("noButton");
    const playerAnswerData = {
        playerPos: null,
        answerPos: null,
        distance: null,
    };

    yesButton.addEventListener("click", () => {
        // timer must stop
        playerTime.stop();

        // RESULTS TRIGGER EVENT
        if (playerAnswerData.distance > 3.0) {
            toggleFarawayPannel();
        } else {
            const resultsInfo = document.getElementById("resultsInfo");
            resultsInfo.innerHTML =
                "YOU WERE " +
                playerAnswerData.distance.toFixed(2) +
                " AWAY FROM THE ANSWER";
            toggleNearbyPannel();
        }
    });
    noButton.addEventListener("click", () => {
        toggleDefaultSubPannel();
        untoggleConfirmSubPannel();
        guessModeEnabled = false;
        confirmModeEnabled = false;
    });

    // from TIMEOUT pannel
    const retryFromTimeoutButton = document.getElementById("retryFromTimeout");
    const backToStagesFromTimeoutButton = document.getElementById(
        "backToStagesFromTimeout"
    );

    retryFromTimeoutButton.addEventListener("click", () => {
        // reset main game scene: delete the stage model
        untoggleTimeoutPannel();
        untoggleConfirmSubPannel();
        toggleDefaultSubPannel();
        mainGameScene.remove(mainGameScene.getObjectByName("stageModel"));
        generateStage();
        minimapCameraReset();
        playerTime.start();
    });

    backToStagesFromTimeoutButton.addEventListener("click", () => {
        untoggleTimeoutPannel();
        toggleStageSelectMenu();
        untoggleMiniMap();
        untoggleConfirmSubPannel();
        currentScene = stageSelectScene;
        gameMode = "STAGE_SELECT";

        // reset main game scene: delete the stage model
        mainGameScene.remove(mainGameScene.getObjectByName("stageModel"));
    });

    //from FARAWAY pannel
    const retryFromFarawayButton = document.getElementById("retryFromFaraway");
    const backToStagesFromFarawayButton = document.getElementById(
        "backToStagesFromFaraway"
    );

    retryFromFarawayButton.addEventListener("click", () => {
        // reset main game scene: delete the stage model
        untoggleFarawayPannel();
        untoggleConfirmSubPannel();
        toggleDefaultSubPannel();
        mainGameScene.remove(mainGameScene.getObjectByName("stageModel"));
        generateStage();
        minimapCameraReset();
        playerTime.start();
    });

    backToStagesFromFarawayButton.addEventListener("click", () => {
        untoggleFarawayPannel();
        toggleStageSelectMenu();
        untoggleMiniMap();
        untoggleConfirmSubPannel();
        currentScene = stageSelectScene;
        gameMode = "STAGE_SELECT";

        // reset main game scene: delete the stage model
        mainGameScene.remove(mainGameScene.getObjectByName("stageModel"));
    });

    //from NEARBY pannel
    const retryFromNearbyButton = document.getElementById("retryFromNearby");
    const backToStagesFromNearbyButton = document.getElementById(
        "backToStagesFromNearby"
    );
    const nextFromNearbyButton = document.getElementById("nextFromNearby");

    // CREATE NEXT STAGE

    let currentStageNum;
    nextFromNearbyButton.addEventListener("click", () => {
        // reset main game scene: delete the stage model
        untoggleNearbyPannel();
        untoggleConfirmSubPannel();
        toggleDefaultSubPannel();
        mainGameScene.remove(mainGameScene.getObjectByName("stageModel"));

        // 스테이지 선택 패널 관리
        // 만약 그다음 스테이지가 언락이 안된 상태라면
        const nextStagePannel =
            stagePannelArr[StageSelectPannel.unlockedStagesNum];
        if (currentStageNum == StageSelectPannel.unlockedStagesNum) {
            nextStagePannel.changeStateToUnlocked();
            StageSelectPannel.unlockedStagesNum++;
        }

        // 여기에서 난이도 조절을 위한 변수 패싱이 필요할듯 하다.
        generateStage();
        minimapCameraReset();
        playerTime.start();
    });

    retryFromNearbyButton.addEventListener("click", () => {
        // reset main game scene: delete the stage model
        untoggleNearbyPannel();
        untoggleConfirmSubPannel();
        toggleDefaultSubPannel();
        mainGameScene.remove(mainGameScene.getObjectByName("stageModel"));
        generateStage();
        minimapCameraReset();
        playerTime.start();
    });

    backToStagesFromNearbyButton.addEventListener("click", () => {
        untoggleNearbyPannel();
        toggleStageSelectMenu();
        untoggleMiniMap();
        untoggleConfirmSubPannel();
        currentScene = stageSelectScene;
        gameMode = "STAGE_SELECT";

        // reset main game scene: delete the stage model
        mainGameScene.remove(mainGameScene.getObjectByName("stageModel"));
    });

    const minimapCanvas = document.getElementById("minimapCanvas");
    const minimapRaycaster = new THREE.Raycaster();
    const minimapRaycasterIntersects = [];
    const pointer2 = new THREE.Vector2(); // pointer vector to be used on the minimap

    const cylinderGeom = new THREE.CylinderGeometry(0.1, 0.1, 10);
    const cylinderMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const debugCylinderMesh = new THREE.Mesh(cylinderGeom, cylinderMat);
    debugCylinderMesh.visible = false;
    mainGameScene.add(debugCylinderMesh);

    const boxGeom = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const debugCameraMesh = new THREE.Mesh(boxGeom, boxMat);
    debugCameraMesh.visible = false;
    mainGameScene.add(debugCameraMesh);

    minimapCanvas.addEventListener("mouseover", () => {
        pointerIsInMiniMap = true;
        console.log("MOUSE IN");
    });

    minimapCanvas.addEventListener("mouseout", () => {
        pointerIsInMiniMap = false;
        console.log("MOUSE OUT");
    });

    minimapCanvas.addEventListener("click", () => {
        if (guessModeEnabled) {
            const minimapIntersects = minimapRaycaster.intersectObjects(
                currentScene.children
            );
            const firstIntersect = minimapIntersects[0].point;
            const selectedPointCoord = new THREE.Vector2(
                firstIntersect.x,
                firstIntersect.z
            );
            const playerPosCoord = new THREE.Vector2(
                camera.position.x,
                camera.position.z
            );

            if (guiControls.debugMode) {
                console.log(debugCylinderMesh.visible);
                debugCylinderMesh.position.set(
                    firstIntersect.x,
                    0,
                    firstIntersect.z
                );
            }

            let distance = playerPosCoord.distanceTo(selectedPointCoord);
            playerAnswerData.answerPos = selectedPointCoord;
            playerAnswerData.playerPos = playerPosCoord;
            playerAnswerData.distance = distance;
            console.log(
                "selected point: ",
                selectedPointCoord,
                " player pos: ",
                playerPosCoord,
                " distance: ",
                distance
            );
            confirmModeEnabled = true;
            guessModeEnabled = false;
            document.getElementById("guessButton").style.color = "black";
            untoggleDefaultSubPannel();
            toggleConfirmSubPannel();
        }
    });

    // MINIMAP & MINIMAP CAMERA
    const minimapCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 1000);

    function minimapCameraReset() {
        minimapCamera.zoom = 1;
        minimapCamera.position.set(0, 5, 0);
        minimapCamera.lookAt(0, 0, 0);
        minimapCamera.updateProjectionMatrix();
    }

    const topDownRenderer = new THREE.WebGLRenderer({
        canvas: minimapCanvas,
    });

    //topDownRenderer.setSize(100, 100);

    const minimapRenderTarget = new THREE.WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight
    );
    const minimapCameraLookAt = new THREE.Vector3(0, 0, 0);
    let pointerIsInMiniMap = false;

    minimapCamera.position.set(0, 5, 0);
    minimapCamera.lookAt(0, 0, 0);

    /*
  function renderOntoRenderTarget(renderer, scene, renderTarget, camera) {
    renderer.setRenderTarget(renderTarget);
    renderer.clear();
    renderer.render(scene, camera);
  }
  */
    const minimapSizeCoef = 0.005;
    const minimapWidth = window.innerWidth * minimapSizeCoef;
    const minimapHeight = window.innerWidth * minimapSizeCoef;
    const minimapPlaneGeom = new THREE.PlaneGeometry(
        minimapWidth,
        minimapHeight
    );
    //console.log(window.innerWidth * minimapSizeCoef, window.innerWidth * minimapSizeCoef);
    const minimapPlaneMat = new THREE.MeshBasicMaterial({
        map: minimapRenderTarget.texture,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
    });

    /*
  const minimapMesh = new THREE.Mesh(minimapPlaneGeom, minimapPlaneMat);
  minimapMesh.name = "minimap";
  // set renderOrder to higher than any other objects so it always renders on the top of the screen
  minimapMesh.renderOrder = 999;

  //minimapMesh.onBeforeRender = function (renderer) { renderer.clearDepth(); };
  let minimapScale = window.innerHeight * 0.00025;
  minimapMesh.scale.set(minimapScale, minimapScale, minimapScale);
  minimapMesh.position.set(window.innerWidth * 0.00175, 1.25, -3);
  */
    // GUI FOR DEBUGMODE

    const gui = new dat.GUI();
    const guiControls = new (function () {
        this.debugMode = false;
    })();

    gui.add(guiControls, "debugMode").onChange((e) => {
        console.log("DEBUG MODE: ", guiControls.debugMode);
        debugCylinderMesh.visible = e;
        debugCameraMesh.visible = e;
    });

    // CONTROLS

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableZoom = false;
    orbitControls.enablePan = false;
    orbitControls.enableDamping = true;
    orbitControls.rotateSpeed = -0.25;
    orbitControls.target.set(
        camera.position.x,
        camera.position.y,
        camera.position.z - 0.01
    );
    orbitControls.enabled = false;

    orbitControls.listenToKeyEvents(window);
    // CITY MODELS

    const stageArr = [];

    const titleScreenModel = new StageModel();
    titleScreenModel.meshGroup.scale.set(0.75, 0.75, 0.75);
    titleScreenModel.meshGroup.rotation.set(Math.PI * 0.5, 0, 0);
    titleScreenModel.meshGroup.position.set(4, 0.0, 0.0);
    titleScreenModel.addToScene(currentScene);

    // STAGE SELECT

    // generate stageselect pannels
    let stageNum = 12;
    let stagePannelArr = [];
    class StageSelectPannel {
        constructor(stageNum, stageUnlocked) {
            this.stageUnlocked = stageUnlocked;

            this.stageNum = stageNum;

            this.stageContainer = document.getElementById("stageContainer");
            this.divElem = document.createElement("div");
            this.spanElem = document.createElement("span");

            this.spanElem.innerHTML = "STAGE" + this.stageNum;
            this.divElem.className = "rectangle";
            this.divElem.appendChild(this.spanElem);
            this.stageContainer.appendChild(this.divElem);

            if (this.stageUnlocked) {
                this.divElem.style.backgroundColor = "#ccc";
            } else this.divElem.style.backgroundColor = "#FF0000";

            this.divElem.addEventListener("click", () => {
                this.onDivClick();
            });
        }

        // TRIGGER STAGE
        onDivClick() {
            if (this.stageUnlocked) {
                currentStageNum = this.stageNum;
                currentScene = mainGameScene;
                //camera.add(minimapMesh);
                orbitControls.enabled = true;
                currentScene.add(camera);
                gameMode = "MAIN_GAME";
                generateStage();
                raycasterIntersects = [];
                untoggleStageSelectMenu();
                playerTime.start();
                toggleMiniMap();
                toggleDefaultSubPannel();
            }

            // untoggle divelements
        }

        changeStateToUnlocked() {
            this.stageUnlocked = true;
            this.divElem.style.backgroundColor = "#ccc";
        }

        toggle() {
            this.divElem.style.display = "flex";
        }

        untoggle() {
            this.divElem.style.display = "none";
        }

        getDivElement() {
            return this.divElem;
        }

        getSpanElement() {
            return this.spanElem;
        }
    }

    for (let i = 0; i < stageNum; i++) {
        console.log(i == 0 ? true : false);
        const stageSelectPannel = new StageSelectPannel(
            i + 1,
            i == 0 ? true : false
        );
        stagePannelArr.push(stageSelectPannel);
    }

    // keep track of stages that are unlocked
    StageSelectPannel.unlockedStagesNum = 1;

    // UI ELEMENT
    let raycaster = new THREE.Raycaster();
    let raycasterIntersects;
    const pointer = new THREE.Vector2();
    const pointerPrev = new THREE.Vector2();
    let pointerDown = false;
    const fontLoader = new FontLoader();
    let titleTextMesh, playButtonMesh, stageSelectMesh;

    fontLoader.load("assets/fonts/font_1.json", function (font) {
        const titleGeometry = new TextGeometry("PROJECT MIA", {
            font: font,
            size: 0.5,
            height: 0.25,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5,
        });

        titleGeometry.computeBoundingBox();
        titleTextMesh = new THREE.Mesh(
            titleGeometry,
            new THREE.MeshNormalMaterial()
        );
        titleTextMesh.position.set(-10.0, 3.0, 0.0);
        titleTextMesh.name = "TITLE_MESH";
        currentScene.add(titleTextMesh);

        const playButtonGeometry = new TextGeometry("PLAY", {
            font: font,
            size: 0.75,
            height: 0.25,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5,
        });

        playButtonGeometry.computeBoundingBox();
        playButtonMesh = new THREE.Mesh(
            playButtonGeometry,
            new THREE.MeshNormalMaterial()
        );
        playButtonMesh.position.set(-8.5, -3.0, 0.0);
        playButtonMesh.name = "PLAY_MESH";
        currentScene.add(playButtonMesh);

        const stageSelectGeometry = new TextGeometry("STAGE SELECT", {
            font: font,
            size: 0.75,
            height: 0.25,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5,
        });

        stageSelectGeometry.computeBoundingBox();
        stageSelectMesh = new THREE.Mesh(
            stageSelectGeometry,
            new THREE.MeshNormalMaterial()
        );
        stageSelectMesh.position.set(-6, 5.5, 0);
        stageSelectMesh.name = "PLAY_MESH";
        stageSelectScene.add(stageSelectMesh);
    });

    function render(time) {
        time *= 0.001;

        //console.log(gameMode)
        if (gameMode == "MAIN_GAME") {
            /*
      renderOntoRenderTarget(
        renderer,
        currentScene,
        minimapRenderTarget,
        minimapCamera
      );
      */
            //playerTime.defaultTimeLimit;
            timeLeft = Math.floor(
                playerTime.defaultTimeLimit - playerTime.getElapsedTime()
            );
            timeLimitElement.innerHTML = "TIME LEFT:" + timeLeft;

            // TRIGGER TIMEOUT EVENT
            if (timeLeft == 0) {
                toggleTimeoutPannel();
                if (guessModeEnabled) guessModeEnabled = false;
                if (confirmModeEnabled) confirmModeEnabled = false;
                playerTime.stop();
            }

            topDownRenderer.render(currentScene, minimapCamera);

            renderer.setRenderTarget(null);
            renderer.clear();
            renderer.render(currentScene, camera);

            if (guiControls.debugMode) {
                debugCameraMesh.position.set(
                    camera.position.x,
                    camera.position.y,
                    camera.position.z
                );
            }

            updateRaycaster();
        } else if (gameMode == "STAGE_SELECT") {
            renderer.setRenderTarget(null);
            renderer.clear();
            renderer.render(currentScene, stageSelectCamera);
        } else if (gameMode == "TITLE_SCREEN" && titleTextMesh != undefined) {
            if (titleTextMesh != undefined) {
                titleTextMesh.rotateX(Math.sin(time) * 0.0003);
                titleTextMesh.rotateY(Math.cos(time) * 0.00005);
            }

            if (playButtonMesh != undefined) {
                playButtonMesh.rotateX(Math.cos(time) * 0.0005);
                playButtonMesh.rotateY(Math.sin(time) * 0.0003);
            }
            //console.log("HERE")
            renderer.setRenderTarget(null);
            renderer.clear();
            renderer.render(currentScene, camera);

            updateRaycaster();
        }

        if (resizeRenderToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();

            stageSelectCamera.aspect = canvas.clientWidth / canvas.clientHeight;
            stageSelectCamera.updateProjectionMatrix();
            //minimapMesh.position.set(window.innerWidth * 0.00175, 1.25, -3);
        }

        requestAnimationFrame(render);

        // update fps controls
        //firstPersonControls.update(clock.getDelta());
        orbitControls.update();
        updateMinimapCamera();
    }

    function updateMinimapCamera() {
        //console.log(pointerIsInMiniMap, pointerDown);
        if (pointerIsInMiniMap && pointerDown) {
            //console.log("HELLO");
            if (!guessModeEnabled && !confirmModeEnabled) {
                let movingVelCoef = 8;

                let dx = pointerPrev.x - pointer.x;
                let dz = pointer.y - pointerPrev.y;

                minimapCamera.position.x += dx * movingVelCoef;
                minimapCamera.position.z += dz * movingVelCoef;
                //minimapCamera.zoom += 0.001;
                minimapCamera.updateProjectionMatrix();
            }
        }
        pointerPrev.copy(pointer);
    }

    function map(value, min1, max1, min2, max2) {
        return min2 + ((value - min1) * (max2 - min2)) / (max1 - min1);
    }

    function onPointerMove(event) {
        raycasterIntersects = raycaster.intersectObjects(currentScene.children);
        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const rect = topDownRenderer.domElement.getBoundingClientRect();
        pointer2.x =
            ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1;
        pointer2.y =
            -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
    }

    function onPointerClick(event) {
        if (gameMode == "TITLE_SCREEN") {
            for (let i = 0; i < raycasterIntersects.length; i++) {
                if (raycasterIntersects[i].object.name == "PLAY_MESH") {
                    console.log("STAGE SELECT ACTIVATED");
                    gameMode = "STAGE_SELECT";

                    currentScene = stageSelectScene;
                    toggleStageSelectMenu();
                    raycasterIntersects = [];
                    break;
                }
            }
        } else if (gameMode == "STAGE_SELECT") {
            console.log(raycasterIntersects);
            for (let i = 0; i < raycasterIntersects.length; i++) {
                // object.parent: the GROUP the pannel mesh belongs in
                if (raycasterIntersects[i].object.parent.unlocked) {
                    currentScene = mainGameScene;
                    //camera.add(minimapMesh);
                    orbitControls.enabled = true;
                    currentScene.add(camera);
                    gameMode = "MAIN_GAME";
                    //firstPersonControls.enabled = true;
                    raycasterIntersects = [];
                    generateStage();
                    break;
                }
            }
        }
    }

    function generateStage() {
        const newStage = new StageModel();
        newStage.addToScene(mainGameScene);
        camera.position.copy(newStage.getPlayerPos());
        orbitControls.target.set(
            camera.position.x,
            camera.position.y,
            camera.position.z + 0.01
        );
        console.log(camera.position);
        //console.log(mainGameScene.children);
    }

    function updateRaycaster() {
        // update the picking ray with the camera and pointer position
        raycaster.setFromCamera(pointer, camera);
        minimapRaycaster.setFromCamera(pointer2, minimapCamera);

        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(currentScene.children);
        /*
    if (intersects.length == 0) pointerIsInMiniMap = false;
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object.name === "minimap") pointerIsInMiniMap = true;
      else pointerIsInMiniMap = false;
    }
    */

        //console.log(pointerIsInMiniMap);

        // disable/enable orbitcontrolsonly during maingame
        if (gameMode == "MAIN_GAME") {
            if (pointerIsInMiniMap) orbitControls.enabled = false;
            else orbitControls.enabled = true;
        }
    }

    function resizeRenderToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = (canvas.clientWidth * pixelRatio) | 0; // or 0
        const height = (canvas.clientHeight * pixelRatio) | 0; // 0
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }

        //firstPersonControls.handleResize();

        return needResize;
    }

    function onMouseDown() {
        pointerDown = true;
        //console.log(pointerDown);
    }

    function onMouseUp() {
        pointerDown = false;
        //console.log(pointerDown);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("click", onPointerClick);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    requestAnimationFrame(render);
}

main();
