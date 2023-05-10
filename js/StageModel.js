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

        let buildingTransform =
            this.stageRoadMesh.calcBuildingTransform();

        this.stageRoadMesh.buildMesh();

        this.meshGroup.add(this.stageRoadMesh.getMeshGroup());

        

        this.buildingNum = buildingTransform.length;

        this.meshMaterial = new THREE.MeshNormalMaterial(); // TEMP MATERIAL
        this.playerPosition = new THREE.Vector3(0, 0.1, 0);

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
                // 	Math.ceil(buildingTransform[i][2] * 8),
                // 	Math.ceil(buildingTransform[i][3] * 8),
                // 	Math.ceil((buildingTransform[i][2] * 8 + buildingTransform[i][3] * 8) * 0.5),
                // ];
                // x, y, z 순서대로
                // 난이도 관련
                let dim = this.difficulty[3];
                let size = [
                    buildingTransform[i][2],
                    this.difficulty[4] * (Math.random() + 0.5),      // 난이도 관련 difficulty의 0.5배 부터 1.5배까지
                    buildingTransform[i][3],
                ];
                let buildingMesh = this.WFC3D.createBuilding(dim, size);

                buildingMesh.position.set(
                    -(this.WFCDim - 2) * this.WFCFloorSize[0] * 0.5 +
                        buildingTransform[i][0],
                    0.001,
                    -(this.WFCDim - 2) * this.WFCFloorSize[1] * 0.5 +
                        buildingTransform[i][1]
                );
                this.meshGroup.add(buildingMesh);
                
                /*
                function animate() {
                    requestAnimationFrame(animate);
                    // buildingMesh.rotation.x += 0.001 * (i + 1);
                    // buildingMesh.rotation.y += 0.002 * (i + 1);
                }
                
                animate();
                */
            }
            //this.meshGroup.scale.set(2, 1, 2);
            //console.log(this.meshGroup);
        });

        this.stageState = {
            score: 0,
            numberOfMoves: 0,
            unlocked: false,
        };
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
