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

    function toggleChapterSelectMenu() {
        const chapterSelectContainer =
            document.getElementById("chapterContainer");
        console.log(chapterSelectContainer.style);
        chapterSelectContainer.style.display = "flex";
        chapterPannelArr.forEach(function (pannel) {
            pannel.toggle();
        });
    }

    function untoggleChapterSelectMenu() {
        const chapterSelectContainer =
            document.getElementById("chapterContainer");
        chapterSelectContainer.style.display = "none";
        chapterPannelArr.forEach(function (pannel) {
            pannel.untoggle();
        });
    }

    function toggleStageSelectMenu(chapterStagePannelArr) {
        const stageSelectContainer = document.getElementById("stageContainer");
        console.log(stageSelectContainer.style);
        stageSelectContainer.style.display = "flex";
        chapterStagePannelArr.forEach(function (pannel) {
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
    const stats = new Stats();
    stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    let currentStageModelInstance;
    function disposeStageModel(sceneToRemoveFrom) {
        const objectToRemove = sceneToRemoveFrom.getObjectByName("stageModel");
        objectToRemove.traverse((child) => {
            if (child.type === "Mesh") {
                if (child.material.map != undefined) {
                    child.material.map.dispose();
                    //console.log("TEXTURE: ", child.material.map);
                }
                //console.log("ISMESH");
                child.material.dispose?.();
                child.geometry.dispose?.();
            }
        });
        // reset main game scene: delete the stage model
        sceneToRemoveFrom.remove(objectToRemove);
        console.log("RENDER INFO: ", renderer.info);
        currentStageModelInstance = null;
    }

    backToStagesButton.addEventListener("click", () => {
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "none";
        const settingsScreen = document.getElementById("settings-screen");
        settingsScreen.style.display = "none";
        //toggleStageSelectMenu();
        toggleChapterSelectMenu();
        untoggleMiniMap();
        currentScene = stageSelectScene;
        gameMode = "STAGE_SELECT";

        // reset main game scene: delete the stage model
        disposeStageModel(mainGameScene);

        // might need to reset the camera as well
    });
    const zoomInButton = document.getElementById("zoomInButton");
    const zoomOutButton = document.getElementById("zoomOutButton");
    const guessButton = document.getElementById("guessButton");
    let guessModeEnabled = false;
    let confirmModeEnabled = false;

    const topDownCanvasDefaultSize = {
        width: 30,
        height: 30,
    };

    zoomInButton.addEventListener("click", () => {
        /*
        minimapCamera.zoom++;
        minimapCamera.updateProjectionMatrix();
        */
        const minimapElem = document.querySelector(".top-down-canvas");
        topDownCanvasDefaultSize.width += 10;
        topDownCanvasDefaultSize.height += 10;
        minimapElem.style.width = topDownCanvasDefaultSize.width + "vh";
        minimapElem.style.height = topDownCanvasDefaultSize.height + "vh";
    });

    zoomOutButton.addEventListener("click", () => {
        /*
        minimapCamera.zoom--;
        minimapCamera.updateProjectionMatrix();
        */
        const minimapElem = document.querySelector(".top-down-canvas");
        topDownCanvasDefaultSize.width -= 10;
        topDownCanvasDefaultSize.height -= 10;
        minimapElem.style.width = topDownCanvasDefaultSize.width + "vh";
        minimapElem.style.height = topDownCanvasDefaultSize.height + "vh";
    });

    guessButton.addEventListener("click", () => {
        /*
        guessModeEnabled = !guessModeEnabled;
        if (guessModeEnabled) {
            document.getElementById("guessButton").style.color = "red";
        } else {
            document.getElementById("guessButton").style.color = "black";
        }
        */

        // guessing is only allowed IF the player guessed at least ONCE
        if (guessMarkerCylinderMesh.clickedFirst) {
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
        // MOVED TO GUESS BUTTON
        /*
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
        */
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
        disposeStageModel(mainGameScene);
        generateStage();
        minimapCameraReset();
        playerTime.start();
    });

    backToStagesFromTimeoutButton.addEventListener("click", () => {
        untoggleTimeoutPannel();
        //toggleStageSelectMenu();
        toggleChapterSelectMenu();
        untoggleMiniMap();
        untoggleConfirmSubPannel();
        currentScene = stageSelectScene;
        gameMode = "STAGE_SELECT";

        // reset main game scene: delete the stage model
        disposeStageModel(mainGameScene);
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
        disposeStageModel(mainGameScene);
        generateStage();
        minimapCameraReset();
        playerTime.start();
    });

    backToStagesFromFarawayButton.addEventListener("click", () => {
        untoggleFarawayPannel();
        //toggleStageSelectMenu();
        toggleChapterSelectMenu();
        untoggleMiniMap();
        untoggleConfirmSubPannel();
        currentScene = stageSelectScene;
        gameMode = "STAGE_SELECT";

        // reset main game scene: delete the stage model
        disposeStageModel(mainGameScene);
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
        disposeStageModel(mainGameScene);

        // 스테이지 선택 패널 관리
        // 만약 그다음 스테이지가 언락이 안된 상태라면
        const nextStagePannel =
            stagePannelArr[StageSelectPannel.unlockedStagesNum];
        if (currentStageNum == StageSelectPannel.unlockedStagesNum) {
            nextStagePannel.changeStateToUnlocked();
            StageSelectPannel.unlockedStagesNum++;
        }

        checkIfChapterUnlocked();

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
        disposeStageModel(mainGameScene);
        generateStage();
        minimapCameraReset();
        playerTime.start();
    });

    backToStagesFromNearbyButton.addEventListener("click", () => {
        untoggleNearbyPannel();
        //toggleStageSelectMenu();
        toggleChapterSelectMenu();
        untoggleMiniMap();
        untoggleConfirmSubPannel();
        currentScene = stageSelectScene;
        gameMode = "STAGE_SELECT";

        // reset main game scene: delete the stage model
        disposeStageModel(mainGameScene);
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

    const guessMarkerCylinderGeom = new THREE.BoxGeometry(1, 1, 1);
    const guessMarkerCylinderMat = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
    });
    const guessMarkerCylinderMesh = new THREE.Mesh(
        guessMarkerCylinderGeom,
        guessMarkerCylinderMat
    );
    mainGameScene.add(guessMarkerCylinderMesh);
    guessMarkerCylinderMesh.visible = false;
    guessMarkerCylinderMesh.clickedFirst = false;
    guessMarkerCylinderMesh.layers.set(1);

    const boxGeom = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const debugCameraMesh = new THREE.Mesh(boxGeom, boxMat);
    let dragMode = false;
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

    minimapCanvas.addEventListener("mousedown", () => {
        dragMode = false;
        console.log("MOUSE DOWN");
    });

    minimapCanvas.addEventListener("mouseup", () => {
        console.log("MOUSE UP");
    });

    minimapCanvas.addEventListener("mousemove", () => {
        dragMode = true;
    });

    minimapCanvas.addEventListener("click", () => {
        if (!dragMode) {
            console.log("CLICKED");
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

            if (!guessMarkerCylinderMesh.clickedFirst) {
                guessMarkerCylinderMesh.visible = true;
                guessMarkerCylinderMesh.clickedFirst = true;
            }

            guessMarkerCylinderMesh.position.set(
                firstIntersect.x,
                1,
                firstIntersect.z
            );

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
            guessModeEnabled = true;
            document.getElementById("guessButton").style.color = "red";
            //untoggleDefaultSubPannel();
            //toggleConfirmSubPannel();
        }
    });

    // MINIMAP & MINIMAP CAMERA
    const minimapCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 1000);
    minimapCamera.layers.enable(1); // for the GUESS MARKER

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
    // main screen scroll control
    document.addEventListener("mousewheel", onDocumentMouseWheel);
    function onDocumentMouseWheel(event) {
        if (pointerIsInMiniMap) {
            // zoom max: 8
            // zoom min: 0.5
            minimapCamera.zoom += event.wheelDeltaY * 0.001;
            minimapCamera.zoom = Math.min(Math.max(minimapCamera.zoom, 0.5), 8);
            minimapCamera.updateProjectionMatrix();
        } else {
            let fovMAX = 75;
            let fovMIN = 1;

            camera.fov -= event.wheelDeltaY * 0.01;
            camera.fov = Math.max(Math.min(camera.fov, fovMAX), fovMIN);
            camera.updateProjectionMatrix();
        }
    }

    // CITY MODELS

    const titleScreenModel = new StageModel();
    titleScreenModel.meshGroup.scale.set(0.75, 0.75, 0.75);
    titleScreenModel.meshGroup.rotation.set(Math.PI * 0.5, 0, 0);
    titleScreenModel.meshGroup.position.set(4, 0.0, 0.0);
    titleScreenModel.addToScene(currentScene);

    function removeTitleScreenModel() {
        const objectToRemove = titleScene.getObjectByName();
    }

    // CHAPTER SELECT
    /*
    let chapterNum = 4;
    let chapterPannelArr = [];

    class ChapterSelectPannel {
        constructor(chapterNum, chapterUnlocked) {
            this.chapterNum = chapterNum;
            this.chapterUnlocked = chapterUnlocked;

            this.chapterContianer = document.getElementById("chapterContainer");

            this.divElem = document.createElement("div");
            this.spanElem = document.createElement("span");

            this.spanElem.innerHTML = "STAGE" + this.stageNum;
            this.divElem.className = "rectangle";
            this.divElem.appendChild(this.spanElem);
            this.stageContainer.appendChild(this.divElem);
        }
    }
    */

    // STAGE SELECT

    // generate stageselect pannels
    let chapterNum = 8;
    let chapterPannelArr = [];
    let stageNum = 16;
    let stageNumPerChapter = 2;
    let stagePannelArr = [];

    function checkIfChapterCompleted() {}

    class StageSelectPannel {
        constructor(stageNum, stageUnlocked, isChapterPannel = false) {
            // this.stageContainer = document.getElementById("stageContainer");
            this.divElem = document.createElement("div");
            this.spanElem = document.createElement("span");
            this.isChapterPannel = isChapterPannel;
            this.stageNum = stageNum;
            this.stageUnlocked = stageUnlocked;
            if (this.isChapterPannel) {
                this.stageContainer =
                    document.getElementById("chapterContainer");
                this.chapterUnlocked = stageUnlocked;
                this.chapterNum = stageNum;
                this.spanElem.innerHTML = "CH." + this.stageNum;
                this.numberOfStages = 4;
                this.connectedStagePannels = [];
            } else {
                this.stageContainer = document.getElementById("stageContainer");
                this.stageNum = stageNum;
                this.spanElem.innerHTML = "STAGE" + this.stageNum;
            }

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

        // FOR CHAPTER PANNLES ONLY
        addToConnectedStagePannels(stagePannel) {
            this.connectedStagePannels.push(stagePannel);
        }
        // TRIGGER STAGE
        onDivClick() {
            if (this.stageUnlocked) {
                if (this.isChapterPannel) {
                    untoggleChapterSelectMenu();
                    toggleStageSelectMenu(this.connectedStagePannels);
                } else {
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

    for (let i = 0; i < chapterNum; i++) {
        const chapterSelectPannel = new StageSelectPannel(
            i + 1,
            i == 0 ? true : false,
            true
        );
        chapterPannelArr.push(chapterSelectPannel);
    }

    let chapterIndex = 0;
    for (let i = 0; i < stageNum; i++) {
        const stageSelectPannel = new StageSelectPannel(
            i + 1,
            i == 0 ? true : false
        );
        stagePannelArr.push(stageSelectPannel);

        if (i != 0 && i % stageNumPerChapter == 0) chapterIndex++;
        // connect stagepannel to corresponding chapter
        chapterPannelArr[chapterIndex].addToConnectedStagePannels(
            stageSelectPannel
        );

        console.log(chapterPannelArr[chapterIndex].connectedStagePannels);
    }

    // keep track of stages that are unlocked
    StageSelectPannel.unlockedStagesNum = 1;

    // check if a chapter is available to play

    // SO GET THIS, TRY TO MAKE IT SO THAT "COMPLETEING A STAGE" UNLOCKS THE NEXT LEVEL, RATHER THAN JUST "PRESSING NEXT"
    function checkIfChapterUnlocked() {
        chapterPannelArr.forEach((chapter) => {
            console.log(chapter.chapterNum);
            // if even ONE of the stages of the chapter is unlocked, then the whole chapter is unlocked
            const stages = chapter.connectedStagePannels;
            let chapterIsOpen = false;
            stages.forEach((stage) => {
                console.log(stage.stageUnlocked);
                if (stage.stageUnlocked) chapterIsOpen = true;
            });
            if (chapterIsOpen) {
                chapter.changeStateToUnlocked();
            }
        });
    }

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
        stats.begin();
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
        stats.end();
    }

    function updateMinimapCamera() {
        //console.log(pointerIsInMiniMap, pointerDown);
        if (dragMode && pointerDown && pointerIsInMiniMap) {
            //console.log("HELLO");
            //if (!guessModeEnabled && !confirmModeEnabled) {
            let movingVelCoef = 8;

            let dx = pointerPrev.x - pointer.x;
            let dz = pointer.y - pointerPrev.y;

            minimapCamera.position.x += dx * movingVelCoef;
            minimapCamera.position.z += dz * movingVelCoef;
            //minimapCamera.zoom += 0.001;
            minimapCamera.updateProjectionMatrix();
            //}
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

                    toggleChapterSelectMenu();
                    console.log("REMOVE MODEL FROM TITLE");
                    disposeStageModel(titleScene);
                    //toggleStageSelectMenu();
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
        // reset guess button color
        document.getElementById("guessButton").style.color = "black";
        // reset guess marker
        guessMarkerCylinderMesh.visible = false;
        guessMarkerCylinderMesh.clickedFirst = false;
        /*
        const newStage = new StageModel();
        newStage.addToScene(mainGameScene);
        */

        currentStageModelInstance = new StageModel();
        currentStageModelInstance.addToScene(mainGameScene);

        camera.position.copy(currentStageModelInstance.getPlayerPos());
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
