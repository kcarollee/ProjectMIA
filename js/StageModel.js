import * as THREE from "three";
import WFCFloorMesh from "./WFCFloorMesh.js";
import WFC3D from "./WFC3D.js";



export default class StageModel {
    constructor(difficulty) {
        this.difficulty = difficulty;
        console.log(this.difficulty);
        // TEMPORARY CITY MODELING
        this.meshGroup = new THREE.Group();
        this.meshGroup.name = "stageModel";

        // 난이도 관련
        this.WFCDim = this.difficulty[1];
        this.WFCFloorSize = [this.difficulty[2], this.difficulty[2]];

        // 난이도에서 각 모든 매개변수를 설정 할 수 있도록 하기
        // 룰북에 난이도 변수 추가하고, 각 난이도에 맞는 디멘션, Width, Height 등 설정하기

        this.stageRoadMesh = new WFCFloorMesh(
            this.WFCDim,
            this.WFCFloorSize,
            "assets/tiles/set1/",
            ".png"
        );

        this.stageRoadMesh.createFloor();

        this.buildingTransform =
            this.stageRoadMesh.calcBuildingTransform();

        this.buildingSpace = [];
        for(let i = 0; i < this.buildingTransform.length; i++) {
            this.buildingSpace.push([
                -(this.WFCDim - 2) * this.WFCFloorSize[0] * 0.5 + this.buildingTransform[i][0] - this.buildingTransform[i][2] * 0.5,
                -(this.WFCDim - 2) * this.WFCFloorSize[0] * 0.5 + this.buildingTransform[i][0] + this.buildingTransform[i][2] * 0.5,
                -(this.WFCDim - 2) * this.WFCFloorSize[1] * 0.5 + this.buildingTransform[i][1] - this.buildingTransform[i][3] * 0.5,
                -(this.WFCDim - 2) * this.WFCFloorSize[1] * 0.5 + this.buildingTransform[i][1] + this.buildingTransform[i][3] * 0.5,
            ]);
        }
        this.playerPosition = new THREE.Vector3(
            0, 0.05, 0
        );
        this.setPlayerPos(this.buildingSpace);

        this.stageRoadMesh.buildMesh();
        this.meshGroup.add(this.stageRoadMesh.getMeshGroup());

        

        this.buildingNum = this.buildingTransform.length;

        this.meshMaterial = new THREE.MeshNormalMaterial(); // TEMP MATERIAL

        this.placeRandomStructures();

        // WFC3D

        this.rulebook = rulebook;

        this.WFC3D = new WFC3D(
            this.rulebook,
            "assets/3Dtiles/Building/",
            ".glb"
        );


        this.WFC3D.setMaterials(this.difficulty[0]);

        

        
        Promise.all(this.WFC3D.promises).then(() => {
            console.log("ASDF");
            for (let i = 0; i < this.buildingNum; i++) {
                // let dim = [
                // 	Math.ceil(this.buildingTransform[i][2] * 8),
                // 	Math.ceil(this.buildingTransform[i][3] * 8),
                // 	Math.ceil((this.buildingTransform[i][2] * 8 + this.buildingTransform[i][3] * 8) * 0.5),
                // ];
                // x, y, z 순서대로
                // 난이도 관련
                let dim = this.difficulty[3];
                if (!this.buildingTransform[i][4]) continue;
                let size = [
                    this.buildingTransform[i][2],
                    this.difficulty[4] * (Math.random() + 0.5),      // 난이도 관련 difficulty의 0.5배 부터 1.5배까지
                    this.buildingTransform[i][3],
                ];

                let buildingMesh = this.WFC3D.createBuilding(dim, size);

                buildingMesh.position.set(
                    -(this.WFCDim - 2) * this.WFCFloorSize[0] * 0.5 +
                        this.buildingTransform[i][0],
                    0.001,
                    -(this.WFCDim - 2) * this.WFCFloorSize[1] * 0.5 +
                        this.buildingTransform[i][1]
                );

                this.meshGroup.add(buildingMesh);
                //console.log(buildingMesh);
                // const geometry = new THREE.BoxGeometry(
                //     buildingTransform[i][2],
                //     this.difficulty[4] * (Math.random() + 0.5),
                //     buildingTransform[i][3]
                // );
                //
                // const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
                // const cube = new THREE.Mesh( geometry, material );
                // cube.position.set(
                //     -(this.WFCDim - 2) * this.WFCFloorSize[0] * 0.5 +
                //     buildingTransform[i][0],
                //     0.001,
                //     -(this.WFCDim - 2) * this.WFCFloorSize[1] * 0.5 +
                //     buildingTransform[i][1]
                // );
                //
                // this.meshGroup.add( cube );
                this.meshGroup.num = i;
            }
            //this.meshGroup.scale.set(0.75 * this.WFCFloorSize[0] ,0.75 * this.WFCFloorSize[0], 0.75 * this.WFCFloorSize[1]);
            //this.meshGroup.updateWorldMatrix();
        });
        

        this.stageState = {
            score: 0,
            numberOfMoves: 0,
            unlocked: false,
        };

        
    }

    setPlayerPos(buildingSpaces){
        function isInBuilding(posXZ){
            let isIn = false;
            for(let i = 0; i < buildingSpaces.length; i++){
                if(posXZ[0] > buildingSpaces[i][0] && posXZ[0] < buildingSpaces[i][1] &&
                   posXZ[1] > buildingSpaces[i][2] && posXZ[1] < buildingSpaces[i][3]) {
                    isIn = true;
                    break;
                }
            }
            return isIn;
        }

        let posXZ;

        do{
            posXZ = [
                this.difficulty[1] * this.difficulty[2] * (Math.random() - 0.5),
                this.difficulty[1] * this.difficulty[2] * (Math.random() - 0.5)
            ];
            console.log(posXZ);
        }while (isInBuilding(posXZ))

        this.playerPosition = new THREE.Vector3(
            posXZ[0], 0.05, posXZ[1]
        );
        console.log("계산완료");
        console.log(this.playerPosition);
    }

    map(value,  min1,  max1,  min2,  max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    }

    placeRandomStructures(){
        //console.log(playerPosX, playerPosZ, this.buildingTransform);
        console.log(this.meshGroup);
        let randomCubeMeshMat = new THREE.MeshNormalMaterial();
        let randomCubeMeshGeom = new THREE.BoxGeometry(1, 1);
        for(let i = 0; i < this.buildingTransform.length; i++){
            let buildingAreaInfo = this.buildingTransform[i];
            //if (this.buildingTransform[i][4]) continue;
            let buildingPosX = -(this.WFCDim - 2) * this.WFCFloorSize[0] * 0.5 + buildingAreaInfo[0];
            let buildingPosZ = -(this.WFCDim - 2) * this.WFCFloorSize[1] * 0.5 + buildingAreaInfo[1];

            let sizeX = buildingAreaInfo[2];
            let sizeZ = buildingAreaInfo[3];

            let randomCubeNum = Math.random() * 50;
            for (let i = 0; i < randomCubeNum; i++){
                console.log("HELLO");
                let randomX = this.map(Math.random(), 0, 1, buildingPosX - sizeX * 0.5, buildingPosX + sizeX * 0.5);
                let randomY = this.map(Math.random, 0, 1, 0, 10);
                let randomZ = this.map(Math.random(), 0, 1, buildingPosZ - sizeZ * 0.5, buildingPosZ + sizeZ * 0.5);

                let randomCubeMesh = new THREE.Mesh(randomCubeMeshGeom, randomCubeMeshGeom);
                randomCubeMesh.position.set(0, 0, 0);
                this.meshGroup.add(randomCubeMesh);
            }
            
        }
        
        //console.log(playerPosX, playerPosZ, newBuildingTransformArr);
    }

    checkIfPlayerIsInBuilding(playerPosX, playerPosZ){
        //console.log(playerPosX, playerPosZ, this.buildingTransform);
        let newBuildingTransformArr = [];
        for(let i = 0; i < this.buildingTransform.length; i++){
            let buildingAreaInfo = this.buildingTransform[i];

            let buildingPosX = -(this.WFCDim - 2) * this.WFCFloorSize[0] * 0.5 + buildingAreaInfo[0];
            let buildingPosZ = -(this.WFCDim - 2) * this.WFCFloorSize[1] * 0.5 + buildingAreaInfo[1];

            let sizeX = buildingAreaInfo[2];
            let sizeZ = buildingAreaInfo[3];

            newBuildingTransformArr.push([buildingPosX, buildingPosZ, sizeX, sizeZ]);
            
            if (Math.abs(playerPosX - buildingPosX) < sizeX * 0.5){
                if (Math.abs(playerPosZ - buildingPosZ) < sizeZ * 0.5){
                    //console.log("HIT");
                    return [true, [buildingPosX, buildingPosZ, sizeX, sizeZ]];
                }
                else continue;
            }
            else continue;
            
        }
        return [false, null];
        //console.log(playerPosX, playerPosZ, newBuildingTransformArr);
    }

    addToScene(scene) {
        this.meshGroup.renderOrder = 0;
        //this.stageRoadMesh.addToScene(scene);
        scene.add(this.meshGroup);
    }

    getPlayerPos() {
        return this.playerPosition;
    }
}