import * as THREE from "three";
import WFCFloorMesh from "./WFCFloorMesh.js";
import WFC3D from "./WFC3D.js";

export default class StageModel {
    constructor() {
        // TEMPORARY CITY MODELING
        this.meshGroup = new THREE.Group();
        this.meshGroup.name = "stageModel";

        this.WFCDim = 10;
        this.WFCWidth = 1.5;
        this.WFCHeight = 1.5;

        this.stageRoadMesh = new WFCFloorMesh(
            this.WFCDim,
            this.WFCWidth,
            this.WFCHeight,
            "assets/tiles/set1/",
            ".png"
        );
        let buildingTransform =
            this.stageRoadMesh.waveFunctionCollapseFullCycle();
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

        Promise.all(this.WFC3D.promises).then(() => {
            console.log("ASDF");
            for (let i = 0; i < this.buildingNum; i++) {
                // let dim = [
                // 	Math.ceil(buildingTransform[i][2] * 8),
                // 	Math.ceil(buildingTransform[i][3] * 8),
                // 	Math.ceil((buildingTransform[i][2] * 8 + buildingTransform[i][3] * 8) * 0.5),
                // ];
                // x, y, z 순서대로
                let dim = [3, 3, 3];
                let size = [
                    buildingTransform[i][2],
                    Math.random() * 0.5 + 0.5,
                    buildingTransform[i][3],
                ];
                let buildingMesh = this.WFC3D.createBuilding(dim, size);

                buildingMesh.position.set(
                    -(this.WFCDim - 2) * this.WFCWidth * 0.5 +
                        buildingTransform[i][0],
                    0,
                    -(this.WFCDim - 2) * this.WFCHeight * 0.5 +
                        buildingTransform[i][1]
                );
                this.meshGroup.add(buildingMesh);

                function animate() {
                    requestAnimationFrame(animate);
                    // buildingMesh.rotation.x += 0.001 * (i + 1);
                    // buildingMesh.rotation.y += 0.002 * (i + 1);
                }

                animate();
            }
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
