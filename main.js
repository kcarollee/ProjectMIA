import * as THREE from 'three';
import OrbitControls from './js/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import WFCFloorMesh from './js/WFCFloorMesh.js';
import WFC3D from "./js/WFC3D.js";




function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

// CAMERA
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 0, 10);
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

	
// CONTROLS
	
	const orbitControls = new OrbitControls(camera, renderer.domElement);
	
	orbitControls.enableZoom = false;
	orbitControls.enablePan = false;
	orbitControls.enableDamping = true;
	orbitControls.rotateSpeed = - 0.25;
	orbitControls.target.set(camera.position.x, camera.position.y, camera.position.z - 0.01);
	orbitControls.enabled = false;

	orbitControls.listenToKeyEvents(window);



	
// MINIMAP & MINIMAP CAMERA
	const minimapCamera = new THREE.OrthographicCamera( -5, 5, 5, -5, 1, 1000);
	const minimapRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
	const minimapCameraLookAt = new THREE.Vector3(0, 0, 0);
	let pointerIsInMiniMap = false;

	minimapCamera.position.set(0, 5, 0);
	minimapCamera.lookAt(0, 0, 0);

	function renderOntoRenderTarget(renderer, scene, renderTarget, camera){
		renderer.setRenderTarget(renderTarget);
		renderer.clear();
		renderer.render(scene, camera);
	}

	const minimapSizeCoef = 0.005;
	const minimapWidth = window.innerWidth * minimapSizeCoef;
	const minimapHeight = window.innerWidth * minimapSizeCoef;
	const minimapPlaneGeom = new THREE.PlaneGeometry(minimapWidth, minimapHeight);
	console.log(window.innerWidth * minimapSizeCoef, window.innerWidth * minimapSizeCoef);
	const minimapPlaneMat = new THREE.MeshBasicMaterial({
		map: minimapRenderTarget.texture,
		side: THREE.DoubleSide,
		depthTest: false,
		depthWrite: false
	})

	const minimapMesh = new THREE.Mesh(minimapPlaneGeom, minimapPlaneMat);
	minimapMesh.name = 'minimap';
	// set renderOrder to higher than any other objects so it always renders on the top of the screen
	minimapMesh.renderOrder = 999;
	
	//minimapMesh.onBeforeRender = function (renderer) { renderer.clearDepth(); };
	minimapMesh.scale.set(0.2, 0.2, 0.2);
	minimapMesh.position.set(3.5, 1.25, -3);






// CITY MODEL
class StageModel {
	constructor(){
		this.stageNum;
		/*
		this.geometryArr = [];
		this.materialArr = [];	
		*/
		// TEMPORARY CITY MODELING
		this.meshGroup = new THREE.Group();

		this.WFCDim = 10;
		this.WFCWidth = 1.5;
		this.WFCHeight = 1.5;

		this.stageRoadMesh = new WFCFloorMesh(this.WFCDim, this.WFCWidth, this.WFCHeight, 'assets/tiles/set1/', '.png');
		let buildingTransform = this.stageRoadMesh.waveFunctionCollapseFullCycle();
		this.stageRoadMesh.buildMesh();

		this.meshGroup.add(this.stageRoadMesh.getMeshGroup())

		this.buildingNum = buildingTransform.length;

		this.meshMaterial = new THREE.MeshNormalMaterial(); // TEMP MATERIAL
		this.playerPosition = new THREE.Vector3(0, 0.1, 0);


		// WFC3D

		this.rulebook = rulebook;


		this.WFC3D = new WFC3D(
			25, this.rulebook,
			'assets/3Dtiles/Building/','.glb',
		);

		Promise.all(this.WFC3D.promises).then(() => {
			console.log("ASDF");
			for(let i = 0; i < this.buildingNum; i++){
				// let dim = [
				// 	Math.ceil(buildingTransform[i][2] * 8),
				// 	Math.ceil(buildingTransform[i][3] * 8),
				// 	Math.ceil((buildingTransform[i][2] * 8 + buildingTransform[i][3] * 8) * 0.5),
				// ];
				let dim = [3,3,3];
				let size = [
					buildingTransform[i][2],
					Math.random(),
					buildingTransform[i][3],
				];
				let buildingMesh = this.WFC3D.createBuilding(dim, size);
				buildingMesh.position.set(
					- (this.WFCDim - 2) * this.WFCWidth * 0.5 +
					buildingTransform[i][0],
					0,
					- (this.WFCDim - 2) * this.WFCHeight * 0.5 +
					buildingTransform[i][1],
				);
				this.meshGroup.add(buildingMesh);

				function animate(){
					requestAnimationFrame(animate);
					// buildingMesh.rotation.x += 0.001 * (i + 1);
					// buildingMesh.rotation.y += 0.002 * (i + 1);
				}
				animate();
			}
			// this.WFC3D.addToSceneDebug(currentScene);
			// this.WFC3D.addToScene(currentScene, grid, size);

			// this.WFC3D.addToScene(currentScene);
			// let buildingMesh = this.WFC3D.getBuilding("x,y,z", "w,d,h");
			// WFC3D
		});



		// for (let i = 0; i < this.buildingNum; i++){
		// 	// buildings will be spread across the XZ axis
		// 	// the Y axis determines the height of the building. if height = h yPos = h * 0.5
		// 	let width = buildingTransform[i][2];
		// 	let depth = buildingTransform[i][3];
		// 	let height = Math.random() + .5;
		//
		// 	let posx = buildingTransform[i][0] - this.WFCDim * this.WFCWidth * 0.5 + this.WFCWidth;
		// 	let posz = buildingTransform[i][1] - this.WFCDim * this.WFCHeight * 0.5 + this.WFCHeight;
		// 	let posy = height * 0.5;
		//
		// 	let buildingGeom =  new THREE.BoxGeometry(width, height, depth);
		// 	let buildingMesh = new THREE.Mesh(buildingGeom, this.meshMaterial);
		// 	buildingMesh.position.set(posx, posy, posz);
		// 	this.meshGroup.add(buildingMesh);
		// }

		this.stageState = {
			score: 0,
			numberOfMoves: 0,
			unlocked: false
		}
	}

	addToScene(scene){
		this.meshGroup.renderOrder = 0;
		//this.stageRoadMesh.addToScene(scene);
		scene.add(this.meshGroup);
	}

	getPlayerPos(){
		return this.playerPosition;
	}
}
	const stageArr = [];

	const titleScreenModel = new StageModel();
	titleScreenModel.meshGroup.scale.set(0.75, 0.75, 0.75);
	titleScreenModel.meshGroup.rotation.set(Math.PI * 0.5, 0, 0);
	titleScreenModel.meshGroup.position.set(4, .0, .0);
	titleScreenModel.addToScene(currentScene);


// STAGE SELECT
	class StageSelectPannel {
		constructor(posx, posy, mainImg){
			this.stageUnlocked = false;
			this.stageSelectPannelMaterial = new THREE.MeshBasicMaterial({color: 0xFF00FF});
			this.stageSelectPannelGeometry = new THREE.PlaneGeometry(3, 4);
			
			this.stageSelectMesh = new THREE.Mesh(this.stageSelectPannelGeometry, this.stageSelectPannelMaterial);
			this.stageSelectMesh.position.set(posx, posy, 0);
			this.stageSelectMesh.name = "just mesh";
			
			this.stageSelectMeshGroup = new THREE.Group();
			this.stageSelectMeshGroup.unlocked = false;
			this.stageSelectMeshGroup.name = "group";
			this.stageSelectMeshGroup.add(this.stageSelectMesh);
		}

		changeStatusToUnlocked(){
			
			this.stageUnlocked = true;
			this.stageSelectMeshGroup.unlocked = true;
			this.stageSelectMesh.material.color.setHex(0x00FF00);
		}

		addToScene(scene){
			console.log(this.stageSelectMesh);
			scene.add(this.stageSelectMeshGroup);
		}	
	}

	const stageUnlockedStatus = [
		true, false, false, false, false, false, false, false, false,
	];
	const lockedMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000})
	const unlockedMaterial = new THREE.MeshBasicMaterial({color: 0x0000FF});

	for (let i = 0; i < 9; i++){
		/*
		let tileGeom = new THREE.PlaneGeometry(1, 1);

		let mesh;
		if (stageUnlockedStatus[i]) mesh = new THREE.Mesh(tileGeom, unlockedMaterial);
		else mesh = new THREE.Mesh(tileGeom, lockedMaterial);
		mesh.position.set(-10 + i * 2.0, 0, 0);
		mesh.unlocked = stageUnlockedStatus[i];
		*/
		
		let stageSelectPannel = new StageSelectPannel(-12 + i * 3.5, 0, null);
		if (i == 0) {
			stageSelectPannel.changeStatusToUnlocked();
			console.log(stageSelectPannel.stageUnlocked);
		}
		stageSelectPannel.addToScene(stageSelectScene);
		//stageSelectScene.add(mesh);
	}

// UI ELEMENT
	let raycaster = new THREE.Raycaster();
	let raycasterIntersects;
	const pointer = new THREE.Vector2();
	const pointerPrev = new THREE.Vector2();
	let pointerDown = false;
	const fontLoader = new FontLoader();
	let titleTextMesh, playButtonMesh, stageSelectMesh;

	
	fontLoader.load('assets/fonts/font_1.json', function(font){
		const titleGeometry = new TextGeometry('PROJECT MIA', {
			font: font,
			size: 0.5,
			height: 0.25,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 0.01,
			bevelSize: 0.01,
			bevelOffset: 0,
			bevelSegments: 5
		});

		titleGeometry.computeBoundingBox();
		titleTextMesh = new THREE.Mesh(titleGeometry, new THREE.MeshNormalMaterial());
		titleTextMesh.position.set(-10.0, 3.0, .0);
		titleTextMesh.name = "TITLE_MESH";
		currentScene.add(titleTextMesh);

		const playButtonGeometry = new TextGeometry('PLAY', {
			font: font,
			size: 0.75,
			height: 0.25,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 0.01,
			bevelSize: 0.01,
			bevelOffset: 0,
			bevelSegments: 5
		});

		playButtonGeometry.computeBoundingBox();
		playButtonMesh = new THREE.Mesh(playButtonGeometry, new THREE.MeshNormalMaterial());
		playButtonMesh.position.set(-8.5, -3.0, .0);
		playButtonMesh.name = "PLAY_MESH";
		currentScene.add(playButtonMesh);

		const stageSelectGeometry = new TextGeometry('STAGE SELECT', {
			font: font,
			size: 0.75,
			height: 0.25,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 0.01,
			bevelSize: 0.01,
			bevelOffset: 0,
			bevelSegments: 5
		});

		stageSelectGeometry.computeBoundingBox();
		stageSelectMesh = new THREE.Mesh(stageSelectGeometry, new THREE.MeshNormalMaterial());
		stageSelectMesh.position.set(-6, 5, 0);
		stageSelectMesh.name = "PLAY_MESH";
		stageSelectScene.add(stageSelectMesh);
	});

	function render(time){
		time *= 0.001;

		renderer.setRenderTarget(null);
		renderer.clear();
		renderer.render(currentScene, camera);
		requestAnimationFrame(render);


		updateRaycaster();
		if (gameMode == "MAIN_GAME") renderOntoRenderTarget(renderer, currentScene, minimapRenderTarget, minimapCamera);
		else if (gameMode == "STAGE_SELECT"){

		}
		else if (gameMode == "TITLE_SCREEN" && titleTextMesh != undefined){

			if (titleTextMesh != undefined){
				titleTextMesh.rotateX(Math.sin(time) * 0.0003);
				titleTextMesh.rotateY(Math.cos(time) * 0.00005);
			}

			if (playButtonMesh != undefined){
				playButtonMesh.rotateX(Math.cos(time) * 0.0005);
				playButtonMesh.rotateY(Math.sin(time) * 0.0003);
			}
		}

		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		

		// update fps controls
		//firstPersonControls.update(clock.getDelta());
		orbitControls.update();
		updateMinimapCamera();
	}

	function updateMinimapCamera(){
		
		if (pointerIsInMiniMap && pointerDown){
			let movingVelCoef = 4;

			let dx = pointerPrev.x - pointer.x;
			let dz = pointer.y - pointerPrev.y;

			minimapCamera.position.x += dx * movingVelCoef;
			minimapCamera.position.z += dz * movingVelCoef;
			//minimapCamera.zoom += 0.001;
			minimapCamera.updateProjectionMatrix();
		}
		
	}

	function map(value, min1, max1, min2, max2) {
		return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
	}

	function onPointerMove( event ) {
		raycasterIntersects = raycaster.intersectObjects( currentScene.children );
		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components

		pointerPrev.copy(pointer);

		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}


	function onPointerClick(event){
		if (gameMode == "TITLE_SCREEN"){
			for (let i = 0; i < raycasterIntersects.length; i++){
				if (raycasterIntersects[i].object.name == "PLAY_MESH") {
					console.log("STAGE SELECT ACTIVATED");
					gameMode = "STAGE_SELECT";
					currentScene = stageSelectScene;

					raycasterIntersects = [];
					break;
				}
			}
		}
		else if (gameMode == "STAGE_SELECT"){
			console.log(raycasterIntersects);
			for (let i = 0; i < raycasterIntersects.length; i++){
				// object.parent: the GROUP the pannel mesh belongs in 
				if (raycasterIntersects[i].object.parent.unlocked){
					currentScene = mainGameScene;
					camera.add(minimapMesh);
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

	function generateStage(){
		const newStage = new StageModel();
		newStage.addToScene(mainGameScene);
		camera.position.copy(newStage.getPlayerPos());
		orbitControls.target.set(camera.position.x, camera.position.y, camera.position.z + 0.01);
		console.log(camera.position);
		//console.log(mainGameScene.children);
	}

	function updateRaycaster(){
		// update the picking ray with the camera and pointer position
		raycaster.setFromCamera( pointer, camera );

		// calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects( currentScene.children );
		if (intersects.length == 0) pointerIsInMiniMap = false;
		for ( let i = 0; i < intersects.length; i ++ ) {
			if (intersects[i].object.name === 'minimap') pointerIsInMiniMap = true;
			else pointerIsInMiniMap = false;
		}
		
		//console.log(pointerIsInMiniMap);

		// disable/enable orbitcontrolsonly during maingame
		if (gameMode == "MAIN_GAME"){
			if (pointerIsInMiniMap) orbitControls.enabled = false;
			else orbitControls.enabled = true;
		}
		
	}	



	function resizeRenderToDisplaySize(renderer){
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = canvas.clientWidth * pixelRatio | 0; // or 0
		const height = canvas.clientHeight * pixelRatio | 0; // 0
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize){
			renderer.setSize(width, height, false);
		}

		//firstPersonControls.handleResize();

		return needResize;
	}

	function onMouseDown(){
		pointerDown = true;
		console.log(pointerDown);
	}

	function onMouseUp(){
		pointerDown = false;
		console.log(pointerDown);
	}




	window.addEventListener( 'pointermove', onPointerMove );
	window.addEventListener('click', onPointerClick);
	window.addEventListener('mousedown', onMouseDown);
	window.addEventListener('mouseup', onMouseUp);
	requestAnimationFrame(render);
}

main();