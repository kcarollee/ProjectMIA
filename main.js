import * as THREE from "three";
import OrbitControls from "./js/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";


// import { mix, range, normalWorld, oscSine, timerLocal } from 'three/nodes';
// import WebGPU from 'three/addons/capabilities/WebGPU.js';
// import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

import StageModel from "./js/StageModel.js";

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    // const renderer = new WebGPURenderer({ canvas, antialias: true });

    // CAMERA
    const fov = 75;
    const aspect = 2; // display aspect of the canvas
    const near = 0.001;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const cameraToFloorRay = new THREE.Raycaster();
    camera.prevPosition = new THREE.Vector3();
    camera.prevPosition2 = new THREE.Vector3();
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
    let gameMode = "TITLE_SCREEN"; // TITLE_SCREEN, STAGE_SELECT, MAIN_GAME, TUTORIAL
    
    const titleScene = new THREE.Scene();
    const stageSelectScene = new THREE.Scene();
    // const backgroundColor = 0x000000;
    const backgroundColor = 0xff6600;
    titleScene.background = new THREE.Color(0x000000);

    let alight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    let dlight = new THREE.DirectionalLight(0xFFFFFF, 1);
    // let dlHelper = new THREE.DirectionalLightHelper(dlight, 0.5, 0x00ff00);
    // dlight.position.set(0,10,0);
    // let dlHelper = new THREE.DirectionalLightHelper(dlight, 0.5, 0x00ff00);
    // dlight.position.set(0,10,0);

    


    titleScene.add(alight);
    // titleScene.add(dlight);
    // titleScene.add(dlHelper);

    let i = 0;
    function animate() {
        requestAnimationFrame(animate);
        i += 0.0025;
        dlight.position.set(0, 3 * Math.cos(i), 3 * Math.sin(i));
        //dlHelper.update();
    }
    animate();

    let rowRectNum = 40;
    let colRectNum = 40;
    let boxSide = 1;
    let boxDepth = 5;
    let titleSceneBoxGeom = new THREE.BoxGeometry(boxSide, boxSide, boxDepth);
    let titleSceneBoxMeshArr = [];
    let titleSceneBoxMeshArr2 = [];
    let titleSceneBoxGroup = new THREE.Group();
    let titleSceneBoxGroup2 = new THREE.Group();
    let xOffset = -rowRectNum * 0.5 + boxSide * 0.5;
    let yOffset = -colRectNum * 0.5 + boxSide * 0.5;
    for (let y = 0; y < colRectNum; y++){
        for (let x = 0; x < rowRectNum; x++){
            let titleSceneBoxMat = new THREE.MeshBasicMaterial({color: new THREE.Color(Math.random(), Math.random() * 0.25, 0.25)});
            let titleSceneBoxMesh = new THREE.Mesh(titleSceneBoxGeom, titleSceneBoxMat);
            titleSceneBoxMesh.position.set(xOffset + x * boxSide, yOffset + y * boxSide, Math.sin(x) * Math.cos(y));
            titleSceneBoxMeshArr.push(titleSceneBoxMesh);
            titleSceneBoxGroup.add(titleSceneBoxMesh);

            let titleSceneBoxMat2 = new THREE.MeshBasicMaterial({color: new THREE.Color(Math.random(), Math.random() * 0.25, 0.25)});
            let titleSceneBoxMesh2 = new THREE.Mesh(titleSceneBoxGeom, titleSceneBoxMat);
            titleSceneBoxMesh2.position.set(xOffset + x * boxSide, yOffset + y * boxSide, Math.sin(x) * Math.cos(y));

            titleSceneBoxMeshArr2.push(titleSceneBoxMesh2);
            titleSceneBoxGroup2.add(titleSceneBoxMesh2);
        }
    }
    titleSceneBoxGroup.position.set(0, 0, -10);
    titleSceneBoxGroup.scale.set(2.0, 2.0, 1.0);
    titleSceneBoxGroup.rotation.set(-Math.PI * 0.1, 0, -Math.PI * 0.1);
    titleScene.add(titleSceneBoxGroup);

    titleSceneBoxGroup2.position.set(0, 0, -3)
    //const titleSceneBoxGroupCopy = new THREE.Group().copy(titleSceneBoxGroup);
    stageSelectScene.add(titleSceneBoxGroup2);



    const mainGameScene = new THREE.Scene();
    mainGameScene.background = new THREE.Color(backgroundColor);
    //mainGameScene.fog = new THREE.Fog(0x000000, 1, 5);

    currentScene = titleScene;
    
    renderer.render(currentScene, camera);

    // LIGHT

    const ambientLight = new THREE.AmbientLight({color: 0xFFFFFF, intensity: 100});
    // const directionalLight = new THREE.DirectionalLight({color: 0xFFFFFF, intensity: 100});
    // directionalLight.position.set(1, 1, 1);

    mainGameScene.add(ambientLight);
    // mainGameScene.add(directionalLight);

    mainGameScene.add(dlight);
    //mainGameScene.add(dlHelper);

    // TIME LIMIT
    const DEFAULT_TIME_LIMIT = 120;
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

    const helperButton = document.getElementById("helper");
    let helperActive = false;
    helperButton.addEventListener("click", () => {
        toggleHelper();
    })

    menuButton.addEventListener("click", () => {
        toggleMenu();
    });

    const backToGameButton = document.getElementById("backToGame");
    backToGameButton.addEventListener("click", () => {
        untoggleMenu();
    });

    const backToGameButton2 = document.getElementById("backToGame2");
    backToGameButton2.addEventListener("click", () => {
        untoggleHelper();
    });

    function toggleMenu() {
        const menuScreen = document.getElementById("menu-screen");
        disableControls();
        menuScreen.style.display = "flex";
        menuActive = true;
    }

    function untoggleMenu() {
        const menuScreen = document.getElementById("menu-screen");
        enableControls();
        menuScreen.style.display = "none";
        menuActive = false;
    }

    function toggleHelper() {
        const helperScreen = document.getElementById("helper-screen");
        disableControls();
        helperScreen.style.display = "flex";
        helperActive = true;
    }

    function untoggleHelper() {
        const helperScreen = document.getElementById("helper-screen");
        enableControls();
        helperScreen.style.display = "none";
        helperActive = false;
    }

    function toggleChapterSelectMenu() {
        const chapterSelectContainer =
            document.getElementById("chapterContainer");
        //console.log(chapterSelectContainer.style);
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
        //console.log(stageSelectContainer.style);
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
        disableControls();
        const timeoutPannel = document.getElementById("timeout-screen");
        timeoutPannel.style.display = "flex";
    }

    function untoggleTimeoutPannel() {
        const timeoutPannel = document.getElementById("timeout-screen");
        timeoutPannel.style.display = "none";
    }

    function toggleFarawayPannel() {
        disableControls();
        const farawayPannel = document.getElementById("faraway-screen");
        farawayPannel.style.display = "flex";
    }

    function untoggleFarawayPannel() {
        const farawayPannel = document.getElementById("faraway-screen");
        farawayPannel.style.display = "none";
    }

    function toggleNearbyPannel() {
        disableControls();
        const nearbyPannel = document.getElementById("nearby-screen");
        nearbyPannel.style.display = "flex";
    }

    function untoggleNearbyPannel() {
        const nearbyPannel = document.getElementById("nearby-screen");
        nearbyPannel.style.display = "none";
    }

    /*
    const settingsButton = document.getElementById("settings");
    settingsButton.addEventListener("click", () => {
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "none";
        const settingsScreen = document.getElementById("settings-screen");
        settingsScreen.style.display = "flex";
    });
    */
    const backButton = document.getElementById("back");
    backButton.addEventListener("click", () => {
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "flex";
        const settingsScreen = document.getElementById("settings-screen");
        settingsScreen.style.display = "none";
    });

    const backToStagesButton = document.getElementById("backToStages");

    //const stats = new Stats();
    //stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
    //document.body.appendChild(stats.dom);

    const backToChaptersButton = document.getElementById("backToChapters");
    backToChaptersButton.addEventListener("click", () => {
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "none";
        const settingsScreen = document.getElementById("settings-screen");
        settingsScreen.style.display = "none";
        //toggleStageSelectMenu();
        untoggleStageSelectMenu();
        toggleChapterSelectMenu();
    });

    let currentStageModelInstance;

    function disposeStageModel(sceneToRemoveFrom) {
        const objectToRemove = sceneToRemoveFrom.getObjectByName("stageModel");
        objectToRemove.traverse((child) => {
            if (child.type === "Mesh") {
                if (child.material.map != undefined) {
                    child.material.map.dispose();
                    ////console.log("TEXTURE: ", child.material.map);
                }

                child.material.dispose();
                child.geometry.dispose();
            }
        });
        // reset main game scene: delete the stage model
        sceneToRemoveFrom.remove(objectToRemove);
        //console.log("RENDER INFO: ", renderer.info);
        currentStageModelInstance = null;
    }

    backToStagesButton.addEventListener("click", () => {
        const menuScreen = document.getElementById("menu-screen");
        menuScreen.style.display = "none";
        const settingsScreen = document.getElementById("settings-screen");
        settingsScreen.style.display = "none";
        //toggleStageSelectMenu();
        untoggleStageSelectMenu();
        toggleChapterSelectMenu();
        untoggleMiniMap();
        currentScene = stageSelectScene;
        gameMode = "STAGE_SELECT";
        tutorialMode = false;
        resetTutorial();
        // reset main game scene: delete the stage model
        disposeStageModel(mainGameScene);

        // might need to reset the camera as well
    });
    const zoomInButton = document.getElementById("zoomInButton");
    const zoomOutButton = document.getElementById("zoomOutButton");
    const homeButton = document.getElementById("homeButton");
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
        if (topDownCanvasDefaultSize.width < 40){
            topDownCanvasDefaultSize.width += 5;
            topDownCanvasDefaultSize.height += 5;
        }
        
        
        minimapElem.style.width = topDownCanvasDefaultSize.width + "vh";
        minimapElem.style.height = topDownCanvasDefaultSize.height + "vh";
    });

    zoomOutButton.addEventListener("click", () => {
        /*
        minimapCamera.zoom--;
        minimapCamera.updateProjectionMatrix();
        */
        const minimapElem = document.querySelector(".top-down-canvas");
        if (topDownCanvasDefaultSize.width > 25){
            topDownCanvasDefaultSize.width -= 5;
            topDownCanvasDefaultSize.height -= 5;
        }
        
        minimapElem.style.width = topDownCanvasDefaultSize.width + "vh";
        minimapElem.style.height = topDownCanvasDefaultSize.height + "vh";
    });

    homeButton.addEventListener("click", () => {
        camera.position.copy(currentStageModelInstance.getPlayerPos());
        orbitControls.target.set(
            camera.position.x,
            camera.position.y,
            camera.position.z + 0.01
        );

        if (tutorialMode && !homeButtonTriggered){
            homeButtonTriggered = true;
            tutorialElement.innerHTML = tutorialTextArr[3];
        }
    })

    const calcScore = () => {
        const maxClickScore = 500;
        const maxDistanceScore = 3000;
        const maxTimeScore = 1500;
        const min = (a, b) => {
            return a <= b ? a : b;
        }
        const max = (a, b) => {
            return a >= b ? a : b;
        }
        // 아무데나 찍어도 1000점이니까 이걸 거리나 특정 매개변수에 비례해서 깎아야하고
        const calcClickScore = (clickCnt) => {
            if(clickCnt === 1)
                return maxClickScore;
            else if(clickCnt < 5){
                return maxClickScore * (1 - 0.05 * (clickCnt - 1));
            }
            else{
                return max(0, maxClickScore * (0.85 - 0.1 * (clickCnt - 4)));
            }
        }

        const calcDistScore = (distance) => {
            let cellWidth = currentStageModelInstance.difficulty[2];
            if(distance < 0.25 * cellWidth){
                return maxDistanceScore;
            }
            else if(distance < cellWidth){
                return maxDistanceScore * (1 - 0.5 * (distance - 0.25 * cellWidth) / (0.75 * cellWidth));
            }
            else if(distance < 2 * cellWidth){
                return maxDistanceScore * (0.5 - 0.5 * (distance - cellWidth) / (cellWidth));
            }
            else
                return 0;
        }
        const calcTimeScore = (playTime) => {
            return min(
                maxTimeScore,
                4 * maxTimeScore * Math.sqrt(Math.pow(playerTime.defaultTimeLimit,2) - Math.pow(playTime,2)) /
                (Math.sqrt(15) * playerTime.defaultTimeLimit)
            );
        }
        
        return calcClickScore(playerAnswerData.clickCnt) + calcDistScore(playerAnswerData.distance) + calcTimeScore(playerTime.elapsedTime);
    }

    const getInfoFromCookies = (cookieKey) => {
        let result = "";
        const cookieArr = document.cookie.split("; ");

        ////console.log(cookieArr);

        for(let i = 0; i < cookieArr.length; i++) {
            if(cookieArr[i][0] === " ") {
                cookieArr[i] = cookieArr[i].substring(1);
            }

            if(cookieArr[i].indexOf(cookieKey) === 0) {
                result = cookieArr[i].slice(cookieKey.length, cookieArr[i].length);
                result = JSON.parse(result);

                ////console.log(result);
                ////console.log(typeof result);

                return result;
            }
        }
        ////console.log(result);
        ////console.log(typeof result);

        return result;
    }

    // 각 스테이지 점수들에 대한 쿠키를 가져와서 각 챕터별 배열로 만들어서 리턴
    // currentStageNum 변수 사용



    // 현재 스테이지 랭킹 인포 가져가기.
    // 1등부터 5등까지 내림차순으로 정렬되어 있다.
    const getStageRankingFromCookies = (stage) => {
        let cookieKey = "stage" + stage + "=";
        return getInfoFromCookies(cookieKey);
    }

    // 매개변수 : 해당 점수를 해당 스테이지에 삽입한다.
    // 최대점수와 동일한 경우에만 삽입하지 않고 나머지 경우에만 삽입한다.
    // 각 스테이지마다 점수는 5개 까지 저장할 될 수 있다.
    const setStageRankingToCookies = (stage, score) => {
        let stageRankings = getStageRankingFromCookies(stage);

        if(stageRankings.includes(score)) return;
        //console.log("ST RANK", stageRankings);
        if(stageRankings === '') stageRankings = [];

        stageRankings.push(score);
        stageRankings.sort(function (a,b){
            return b - a;
        });
        stageRankings = stageRankings.slice(0,5);

        stageRankings = JSON.stringify(stageRankings);

        let cookie = "";

        let expiration = new Date();
        expiration.setDate(expiration.getDate() + 100);

        cookie = `stage${stage}=${stageRankings}; expires=${expiration.toUTCString()};`
        document.cookie = cookie;
    }

    // 스테이지 언락 인포 가져가기
    const getStageUnlockInfoFromCookie = () => {
        let cookieKey = "stageUnlockInfo=";
        return getInfoFromCookies(cookieKey);
    }

    // 매개변수 : 언락할 스테이지 번호
    // 스테이지 언락 하기
    const setStageUnlockInfoFromCookie = (stage) => {
        let unlockInfo = getStageUnlockInfoFromCookie();
        if(unlockInfo === ''){
            unlockInfo = [
                true, false, false, false,
                false, false, false, false,
                false, false, false, false,
                false, false, false, false,
            ];
        }

        unlockInfo[stage - 1] = true;
        unlockInfo = JSON.stringify(unlockInfo);

        let cookie = "";

        let expiration = new Date();
        expiration.setDate(expiration.getDate() + 100);

        cookie = `stageUnlockInfo=${unlockInfo}; expires=${expiration.toUTCString()};`
        document.cookie = cookie;
    }

    guessButton.addEventListener("click", () => {
        /*
        guessModeEnabled = !guessModeEnabled;
        if (guessModeEnabled) {
            document.getElementById("guessButton").style.color = "red";
        } else {
            document.getElementById("guessButton").style.color = "black";
        }
        */

        if (tutorialMode){
            tutorialMode = false;
            resetTutorial();
        }


        // guessing is only allowed IF the player guessed at least ONCE
        if (guessMarkerCylinderMesh.clickedFirst) {
            // timer must stop
            playerTime.stop();

            // SHOW CORRECT ANSWER
            //console.log(playerAnswerData.playerPos);
            answerMarkerCylinderMesh.position.set(playerAnswerData.playerPos.x, 1, playerAnswerData.playerPos.y);
            answerMarkerCylinderMesh.visible = true;
            minimapCamera.position.set(0, 10, 0);
            minimapCamera.zoom = 0.5;
            minimapCamera.updateProjectionMatrix();
            
            // RESULTS TRIGGER EVENT
            let threshold = difficultyInfo[currentStageNum - 1][2];
            if (playerAnswerData.distance > threshold){
                toggleFarawayPannel();
            } else {
                // UNLOCK NEXT STAGE
                if (StageSelectPannel.unlockedStagesNum > 15)StageSelectPannel.unlockedStagesNum = 15;
                const nextStagePannel =
                    stagePannelArr[StageSelectPannel.unlockedStagesNum];
                //console.log("STAGES UNLOCK INFO ", currentStageNum, StageSelectPannel.unlockedStagesNum);
                if (currentStageNum == StageSelectPannel.unlockedStagesNum) {
                    
                    nextStagePannel.changeStateToUnlocked();
                    StageSelectPannel.unlockedStagesNum++;
                    setStageUnlockInfoFromCookie(StageSelectPannel.unlockedStagesNum);
                    //console.log(getInfoFromCookies());
                }

                checkIfChapterUnlocked();

                // SHOW RESULTS

                let score = calcScore();
                let previousScore = stagePannelArr[currentStageNum - 1].maxScore;
                const resultsInfo = document.getElementById("resultsInfo");
                //console.log(score, previousScore);
                // NEW MAX SCORE
                if (Math.floor(score) > Math.floor(previousScore)){
                    resultsInfo.style.color = 'lightgreen';    
                    resultsInfo.innerHTML =
                    "YOU WERE " +
                    playerAnswerData.distance.toFixed(2) +
                    " UNITS AWAY FROM THE ANSWER" +
                    "<br>NEW HIGH SCORE : " + Math.floor(score);
                }
                else {
                    resultsInfo.style.color = 'blue';
                    resultsInfo.innerHTML =
                    "YOU WERE " +
                    playerAnswerData.distance.toFixed(2) +
                    " UNITS AWAY FROM THE ANSWER" +
                    "<br>CURRENT SCORE : " + Math.floor(score) + 
                    "<br>HIGH SCORE : " + previousScore.toFixed(0);
                }
                
                toggleNearbyPannel();
                //console.log("getStageRankingFromCookies : ", getStageRankingFromCookies(currentStageNum));
                //console.log("getStageUnlockInfoFromCookies : ", getStageUnlockInfoFromCookie());
                setStageRankingToCookies(currentStageNum, Math.floor(score));
                stagePannelArr[currentStageNum - 1].setCurrentMaxScoresFromCookies();
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
        clickCnt: 0,
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
        let difficulty = difficultyInfo[currentStageNum - 1];
        if (currentStageNum == 1) tutorialMode = true;
        untoggleTimeoutPannel();
        untoggleConfirmSubPannel();
        toggleDefaultSubPannel();
        disposeStageModel(mainGameScene);
        generateStage(difficulty);
        minimapCameraReset();
        playerTime.start();
        playerAnswerData.clickCnt = 0;
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
        let difficulty = difficultyInfo[currentStageNum - 1];
        if (currentStageNum == 1) tutorialMode = true;
        untoggleFarawayPannel();
        untoggleConfirmSubPannel();
        toggleDefaultSubPannel();
        disposeStageModel(mainGameScene);
        generateStage(difficulty);
        minimapCameraReset();
        playerTime.start();
        playerAnswerData.clickCnt = 0;
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
        currentStageNum++;
        if (currentStageNum > 16) currentStageNum = 16;
        let difficulty = difficultyInfo[currentStageNum - 1];
        // reset main game scene: delete the stage model
        untoggleNearbyPannel();
        untoggleConfirmSubPannel();
        toggleDefaultSubPannel();
        disposeStageModel(mainGameScene);

        /*
        // MOVED TO WHERE A STAGE IS COMPLETED
        // 스테이지 선택 패널 관리
        // 만약 그다음 스테이지가 언락이 안된 상태라면
        const nextStagePannel =
            stagePannelArr[StageSelectPannel.unlockedStagesNum];
        if (currentStageNum == StageSelectPannel.unlockedStagesNum) {
            nextStagePannel.changeStateToUnlocked();
            StageSelectPannel.unlockedStagesNum++;
        }

        checkIfChapterUnlocked();
        */
        // 여기에서 난이도 조절을 위한 변수 패싱이 필요할듯 하다.
        generateStage(difficulty);
        minimapCameraReset();
        playerTime.start();
        playerAnswerData.clickCnt = 0;
    });

    retryFromNearbyButton.addEventListener("click", () => {
        let difficulty = difficultyInfo[currentStageNum - 1];
        if (currentStageNum == 1) tutorialMode = true;
        // reset main game scene: delete the stage model
        untoggleNearbyPannel();
        untoggleConfirmSubPannel();
        toggleDefaultSubPannel();
        disposeStageModel(mainGameScene);
        generateStage(difficulty);
        minimapCameraReset();
        playerTime.start();
        playerAnswerData.clickCnt = 0;
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

    const guessMarkerCylinderGeom = new THREE.TorusGeometry(0.5, 0.1);
    const guessMarkerCylinderMat = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
    });
    const guessMarkerCylinderMesh = new THREE.Mesh(
        guessMarkerCylinderGeom,
        guessMarkerCylinderMat
    );
    mainGameScene.add(guessMarkerCylinderMesh);
    guessMarkerCylinderMesh.rotateX(Math.PI * 0.5);
    guessMarkerCylinderMesh.visible = false;
    guessMarkerCylinderMesh.clickedFirst = false;
    guessMarkerCylinderMesh.layers.set(1);

    const answerMarkerCylinderGeom = new THREE.TorusGeometry(0.5, 0.1);;
    const answerMarkerCylinderMat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
    });
    const answerMarkerCylinderMesh = new THREE.Mesh(
        answerMarkerCylinderGeom,
        answerMarkerCylinderMat
    );
    mainGameScene.add(answerMarkerCylinderMesh);
    answerMarkerCylinderMesh.rotateX(Math.PI * 0.5);
    answerMarkerCylinderMesh.visible = false;
    answerMarkerCylinderMesh.clickedFirst = false;
    answerMarkerCylinderMesh.layers.set(1);

    const boxGeom = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const debugCameraMesh = new THREE.Mesh(boxGeom, boxMat);
    let dragMode = false;
    debugCameraMesh.visible = false;
    mainGameScene.add(debugCameraMesh);

    minimapCanvas.addEventListener("mouseover", () => {
        pointerIsInMiniMap = true;
        //console.log("MOUSE IN");
    });

    minimapCanvas.addEventListener("mouseout", () => {
        pointerIsInMiniMap = false;
        //console.log("MOUSE OUT");
    });

    minimapCanvas.addEventListener("mousedown", () => {
        dragMode = false;
        if (tutorialMode && !minimapClickedTriggered){
            tutorialElement.innerHTML = tutorialTextArr[4];
            minimapClickedTriggered = true;
        }
        
    });

    minimapCanvas.addEventListener("mouseup", () => {
        //console.log("MOUSE UP");
    });

    minimapCanvas.addEventListener("mousemove", () => {
        dragMode = true;
    });

    minimapCanvas.addEventListener("click", () => {
        if (!dragMode) {
            //console.log("CLICKED");
            if (tutorialMode && !minimapDraggedTriggered){
                minimapDraggedTriggered = true;
                tutorialElement.innerHTML = tutorialTextArr[5];
            }
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

            const playerInitialPosCoord = new THREE.Vector2(
                currentStageModelInstance.playerPosition.x,
                currentStageModelInstance.playerPosition.z
            )

            // if (guiControls.debugMode) {
            //     //console.log(debugCylinderMesh.visible);
            //     debugCylinderMesh.position.set(
            //         firstIntersect.x,
            //         0,
            //         firstIntersect.z
            //     );
            // }

            if (!guessMarkerCylinderMesh.clickedFirst) {
                guessMarkerCylinderMesh.visible = true;
                guessMarkerCylinderMesh.clickedFirst = true;
            }

            guessMarkerCylinderMesh.position.set(
                firstIntersect.x,
                1,
                firstIntersect.z
            );


            let distance = playerInitialPosCoord.distanceTo(selectedPointCoord);
            playerAnswerData.answerPos = selectedPointCoord;
            playerAnswerData.playerPos = playerInitialPosCoord;
            playerAnswerData.distance = distance;
            playerAnswerData.clickCnt++;
            
            confirmModeEnabled = true;
            guessModeEnabled = true;
            document.getElementById("guessButton").style.color = "red";
            //untoggleDefaultSubPannel();
            //toggleConfirmSubPannel();
        }
    });

    // MINIMAP & MINIMAP CAMERA
    const minimapCamera = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 1000);
    //const minimapCamera = new THREE.PerspectiveCamera(100);
    minimapCamera.layers.enable(1); // for the GUESS MARKER

    function minimapCameraReset() {
        answerMarkerCylinderMesh.visible = false;
        minimapCamera.zoom = 1;
        minimapCamera.position.set(0, 10, 0);
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

    minimapCamera.position.set(0, 10, 0);
    minimapCamera.lookAt(0, 0, 0);

    // GUI FOR DEBUGMODE

    // const gui = new dat.GUI();
    // const guiControls = new (function () {
    //     this.debugMode = false;
    // })();

    // gui.add(guiControls, "debugMode").onChange((e) => {
    //     //console.log("DEBUG MODE: ", guiControls.debugMode);
    //     debugCylinderMesh.visible = e;
    //     debugCameraMesh.visible = e;
    //     titleScreenModel.meshGroup.visible = e;
    // });

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

    const titleScreenModel = new StageModel(difficultyInfo[0]);
    titleScreenModel.meshGroup.scale.set(0.75, 0.75, 0.75);
    titleScreenModel.meshGroup.rotation.set(Math.PI * 0.5, 0, 0);
    titleScreenModel.meshGroup.position.set(4, 0.0, 0.0);
    titleScreenModel.meshGroup.visible = false;
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
            this.pannelNameElem = document.createElement("span");

            this.pannelNameElem.innerHTML = "STAGE" + this.stageNum;
            this.divElem.className = "rectangle";
            this.divElem.appendChild(this.pannelNameElem);
            this.stageContainer.appendChild(this.divElem);
        }
    }
    */

    // STAGE SELECT

    // generate stageselect pannels
    let chapterNum = 4;
    let chapterPannelArr = [];
    let stageNum = 16;
    let stageNumPerChapter = 4;
    let stagePannelArr = [];

    function checkIfChapterCompleted() {}
    // SKYBOX

    /*
    right left
    up  down
    front   back

    */

    function setSceneBackground(scene, chapterNum){
        const path = './assets/skybox/level' + chapterNum + '/';
        scene.background = new THREE.CubeTextureLoader()
            .setPath(path)
            .load([
                'bk.jpg',  'ft.jpg',
                'up.jpg', 'dn.jpg',
                'lf.jpg', 'rt.jpg',
        ]);
    }

    class StageSelectPannel {
        constructor(stageNum, stageUnlocked, isChapterPannel = false) {
            // this.stageContainer = document.getElementById("stageContainer");
            this.divElem = document.createElement("div");
            this.pannelNameElem = document.createElement("span");
            this.pannelScoreElem = document.createElement("span");
            this.imgElem = document.createElement("img");
            this.isChapterPannel = isChapterPannel;
            this.stageNum = stageNum;
            this.stageUnlocked = stageUnlocked;
            this.maxScore = null;
            this.setCurrentMaxScoresFromCookies();
            if (this.isChapterPannel) {

                this.stageContainer =
                    document.getElementById("chapterContainer");
                this.chapterUnlocked = stageUnlocked;
                this.chapterNum = stageNum;
                this.imgElem.src = './assets/chapterThumbnails/' + this.chapterNum + '.jpg';

                this.pannelNameElem.innerHTML = "CH." + this.stageNum;
                this.numberOfStages = 4;
                this.connectedStagePannels = [];
            } else {
                this.chapterNum = Math.floor((this.stageNum - 1) / stageNumPerChapter) + 1;
                this.imgElem.src = './assets/chapterThumbnails/' + this.chapterNum + '.jpg';
                this.stageContainer = document.getElementById("stageContainer");
                this.stageNum = stageNum;
                this.pannelNameElem.innerHTML = "STAGE" + ((this.stageNum - 1) % stageNumPerChapter + 1);
                this.pannelScoreElem.innerHTML = this.maxScore;
            }

            this.divElem.className = "rectangle";
            this.divElem.appendChild(this.pannelNameElem);
            

            //this.imgElem.style.objectFit = "fill";
            this.imgElem.style.width = "80%";

            this.divElem.appendChild(this.imgElem);
            if (!this.isChapterPannel)this.divElem.appendChild(this.pannelScoreElem);

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
                    if (currentStageNum == 1) tutorialMode = true;
                    currentScene = mainGameScene;
                    //camera.add(minimapMesh);
                    orbitControls.enabled = true;
                    currentScene.add(camera);
                    gameMode = "MAIN_GAME";
                    generateStage(difficultyInfo[this.stageNum - 1]);
                    raycasterIntersects = [];
                    untoggleStageSelectMenu();
                    playerTime.start();
                    toggleMiniMap();
                    toggleDefaultSubPannel();
                }
            }

            // untoggle divelements
        }

        setCurrentMaxScoresFromCookies(){
            let scoreArr = getStageRankingFromCookies(this.stageNum);
            if (scoreArr.length == 0) this.maxScore = 0;
            else this.maxScore = scoreArr[0];
            this.pannelScoreElem.innerHTML = this.maxScore;
            ////console.log("MAX SCORE OF STAGE " + this.stageNum + ": " + this.maxScore);
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
            return this.pannelNameElem;
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
    let unlockedStatusArr = getStageUnlockInfoFromCookie();
    
    // if no cookies
    if (unlockedStatusArr === ''){
        unlockedStatusArr = [
            true, false, false, false,
            false, false, false, false,
            false, false, false, false,
            false, false, false, false
        ]
        StageSelectPannel.unlockedStagesNum = 1;
    }
    else {
        StageSelectPannel.unlockedStagesNum = 0;
        unlockedStatusArr.forEach((unlocked) => {
            if (unlocked){
                StageSelectPannel.unlockedStagesNum++;
            }
        })
        //console.log("UNLOCKED STAGES NUM: ", StageSelectPannel.unlockedStagesNum);
    }
    
    for (let i = 0; i < stageNum; i++) {
        let unlocked = unlockedStatusArr[i];
        const stageSelectPannel = new StageSelectPannel(
            i + 1,
            unlocked
        );
        stageSelectPannel.setCurrentMaxScoresFromCookies();
        stagePannelArr.push(stageSelectPannel);

        if (i != 0 && i % stageNumPerChapter == 0) chapterIndex++;
        // connect stagepannel to corresponding chapter
        chapterPannelArr[chapterIndex].addToConnectedStagePannels(
            stageSelectPannel
        );

        ////console.log(chapterPannelArr[chapterIndex].connectedStagePannels);
    }

    checkIfChapterUnlocked();



   

    // check if a chapter is available to play

    // SO GET THIS, TRY TO MAKE IT SO THAT "COMPLETEING A STAGE" UNLOCKS THE NEXT LEVEL, RATHER THAN JUST "PRESSING NEXT"
    function checkIfChapterUnlocked() {
        chapterPannelArr.forEach((chapter) => {
            //console.log(chapter.chapterNum);
            // if even ONE of the stages of the chapter is unlocked, then the whole chapter is unlocked
            const stages = chapter.connectedStagePannels;
            let chapterIsOpen = false;
            stages.forEach((stage) => {
                //console.log(stage.stageUnlocked);
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
            size: 0.85,
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
        titleTextMesh.position.set(-5.5, 2.0, 3.0);
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
        playButtonMesh.position.set(-1.75, -3.0, 3.0);
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
        stageSelectMesh.position.set(-5.5, 3, 2);
        stageSelectMesh.name = "PLAY_MESH";
        stageSelectScene.add(stageSelectMesh);
    });

    let playerIsInBuilding = false;
    let buildingAreaInfo = null;

    // TUTORIAL
    let tutorialMode = false;
    const tutorialElement = document.getElementById("tutorial");
    tutorialElement.style.display = 'none';
    const tutorialTextArr = [
        "DRAG YOUR MOUSE TO LOOK AROUND",
        "MOVE USING WASD KEYS",
        "PRESS H TO GO BACK TO YOUR<br>STARTING POINT",
        "DRAG THE MINIMAP TO SEARCH AROUND",
        "CLICK YOUR GUESS OF THE<br>STARTING LOCATION ON THE MINIMAP",
        "PRESS THE GUESS BUTTON<br>TO SEE YOUR RESULTS!"
    ];
    let tutorialTextIndex = 0;
    
    let mouseDragTriggered = false;
    let wasdMovementTriggered = false;
    let homeButtonTriggered = false;
    let minimapDraggedTriggered = false;
    let minimapClickedTriggered = false;
    tutorialElement.innerHTML = tutorialTextArr[0];

    function resetTutorial(){
        mouseDragTriggered = false;
        wasdMovementTriggered = false;
        homeButtonTriggered = false;
        minimapDraggedTriggered = false;
        minimapClickedTriggered = false;
        tutorialElement.innerHTML = tutorialTextArr[0];
        tutorialElement.style.display = 'none';
    }
    function render(time) {
        //stats.begin();
        time *= 0.001;

        ////console.log(gameMode)
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
            if (tutorialMode){
                tutorialElement.style.display = "block";
            }

            timeLeft = Math.floor(
                playerTime.defaultTimeLimit - playerTime.getElapsedTime()
            );
            timeLimitElement.innerHTML = "TIME LEFT:" + timeLeft;

            // TRIGGER TIMEOUT EVENT
            if (timeLeft <= 0) {
                // SHOW CORRECT ANSWER
                //console.log(playerAnswerData.playerPos);
                answerMarkerCylinderMesh.position.set(playerAnswerData.playerPos.x, 1, playerAnswerData.playerPos.y);
                answerMarkerCylinderMesh.visible = true;
                minimapCamera.position.set(0, 10, 0);
                minimapCamera.zoom = 0.5;
                minimapCamera.updateProjectionMatrix();
                
                toggleTimeoutPannel();
                if (guessModeEnabled) guessModeEnabled = false;
                if (confirmModeEnabled) confirmModeEnabled = false;
                playerTime.stop();
            }
            currentStageModelInstance.update(minimapCamera.position);
            topDownRenderer.render(currentScene, minimapCamera);

            
            

            currentStageModelInstance.update(camera.position);
            renderer.setRenderTarget(null);
            renderer.clear();
            renderer.render(currentScene, camera);

            // if (guiControls.debugMode) {
            //     debugCameraMesh.position.set(
            //         camera.position.x,
            //         camera.position.y,
            //         camera.position.z
            //     );

            // }
            
            updateRaycaster();
        } else if (gameMode == "STAGE_SELECT") {

            let titleBoxIndex = 0;
            for (let y = 0; y < colRectNum; y++){
                for (let x = 0; x < rowRectNum; x++){
                    let titleSceneBoxMesh = titleSceneBoxMeshArr2[titleBoxIndex];
                    titleSceneBoxMesh.scale.set(1, 1, Math.sin(x * y + time));
                    titleBoxIndex++;
                }
            }
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

            let titleBoxIndex = 0;
            for (let y = 0; y < colRectNum; y++){
                for (let x = 0; x < rowRectNum; x++){
                    let titleSceneBoxMesh = titleSceneBoxMeshArr[titleBoxIndex];
                    titleSceneBoxMesh.scale.set(1, 1, Math.sin(x * y + time));
                    titleBoxIndex++;
                }
            }
            ////console.log("HERE")
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
        // firstPersonControls.update(clock.getDelta());
        // camera.prevPosition.set(camera.position.x, camera.position.y, camera.position.z);
        // if (camera.prevPosition.x != camera.prevPosition.x){
        //     if (camera.prevPosition.y != camera.prevPosition.y){
        //         if (camera.prevPosition.z != camera.prevPosition.z){
        //             camera.prevPosition2.set(camera.prevPosition.x, camera.prevPosition.y, camera.prevPosition.z);
        //         }
        //     }
        // }

        //orbitControls.update();



        updateMinimapCamera();
        //stats.end();
    }

    function disableControls(){
        orbitControls.keys = {
            LEFT: 0, RIGHT: 0, UP: 0, BOTTOM: 0 
        }
    }

    function enableControls(){
        orbitControls.keys = {
            LEFT: "KeyA", UP: "KeyW", RIGHT: "KeyD", BOTTOM: "KeyS"
        }
    }

    function updateMinimapCamera() {
        ////console.log(pointerIsInMiniMap, pointerDown);
        if (dragMode && pointerDown && pointerIsInMiniMap) {
            ////console.log("HELLO");
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
                    //console.log("STAGE SELECT ACTIVATED");
                    gameMode = "STAGE_SELECT";

                    currentScene = stageSelectScene;

                    toggleChapterSelectMenu();
                    //console.log("REMOVE MODEL FROM TITLE");
                    disposeStageModel(titleScene);
                    //toggleStageSelectMenu();
                    raycasterIntersects = [];
                    break;
                }
            }
        }
    }

    function generateStage(difficulty) {
        enableControls();
        // reset guess button color
        document.getElementById("guessButton").style.color = "aqua";
        //console.log("CHAPTER ", difficulty[0]);
        setSceneBackground(mainGameScene, difficulty[0]);
        // reset guess marker
        guessMarkerCylinderMesh.visible = false;
        guessMarkerCylinderMesh.clickedFirst = false;
        /*
        const newStage = new StageModel();
        newStage.addToScene(mainGameScene);
        */

        currentStageModelInstance = new StageModel(difficulty);
        currentStageModelInstance.addToScene(mainGameScene);

        camera.position.copy(currentStageModelInstance.getPlayerPos());
        orbitControls.target.set(
            camera.position.x,
            camera.position.y,
            camera.position.z + 0.01
        );
        //console.log(camera.position);
        ////console.log(mainGameScene.children);
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

        ////console.log(pointerIsInMiniMap);

        // disable/enable orbitcontrolsonly during maingame
        if (gameMode == "MAIN_GAME") {
            if (pointerIsInMiniMap) orbitControls.enabled = false;
            else {
                if(!playerIsInBuilding) orbitControls.enabled = true;
            }

            // CHANGE CAMERA POSITION BASED ON TERRAIN HEIGHT
            cameraToFloorRay.set(new THREE.Vector3(camera.position.x, 1, camera.position.z), new THREE.Vector3(0, -1, 0));
            let intersectObject = cameraToFloorRay.intersectObject(currentStageModelInstance.getMeshGroup())[0];
            if (intersectObject !== undefined){
                let intersectPoint = cameraToFloorRay.intersectObject(currentStageModelInstance.getMeshGroup())[0].point;
                orbitControls.update(intersectPoint.y + 0.1);
            }
            
            //camera.position.y = intersectPoint.y + 0.01;
            
            //orbitControls.setObjectPositionY(intersectPoint.y + 0.1);
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
        if (tutorialMode && !mouseDragTriggered){
            mouseDragTriggered = true;
            tutorialElement.innerHTML = tutorialTextArr[1];
        }
        
    }

    function onMouseUp() {
        pointerDown = false;

        ////console.log(pointerDown);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("click", onPointerClick);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keydown", (event) => {
        if (tutorialMode && !wasdMovementTriggered){
            if (event.key == "w" || event.key == "a" || event.key == "s" || event.key == "d"){
                wasdMovementTriggered = true;
                tutorialElement.innerHTML = tutorialTextArr[2];
            }
        }
    })
    requestAnimationFrame(render);
}

main();
