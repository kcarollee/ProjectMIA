import * as THREE from "three";

export default class Cell {
    constructor(value, width, height) {
        this.collapsed = false;
        if (value instanceof Array) {
            this.options = value;
        } else {
            this.options = new Array(value).fill(0).map((_, i) => i);
        }
        this.geometry = new THREE.PlaneGeometry(width, height);
        this.material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            transparent: true,
        });
        // floorMesh 를 따로 두는 이유: 바닥까지 회전시켜버리면 Seamless texture가 무용지물됨
        this.floorMaterial = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
        });
        this.cellMeshGroup = new THREE.Group();
    }

    setTexture(tex) {
        this.material.map = tex;
    }

    setRoadTexture(tex) {
        this.floorMaterial.map = tex;
    }

    setPos(pos) {
        this.pos = pos;
    }

    setMeshPos(meshPos) {
        this.meshPos = meshPos;
    }

    setRotationNum(num) {
        this.rotationNum = num;
    }

    buildMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.name = "Cell";
        //this.cellMeshGroup.add(this.mesh, this.floorMesh);
        //console.log(this.rotationNum);
        this.mesh.rotateX(-Math.PI * 0.5);
        this.mesh.position.set(this.meshPos[0], 0, this.meshPos[1]);
        this.mesh.rotateZ(-Math.PI * 0.5 * this.rotationNum);

        // floorMesh 를 따로 두는 이유: 바닥까지 회전시켜버리면 Seamless texture가 무용지물됨
        this.floorMesh = new THREE.Mesh(this.geometry, this.floorMaterial);

        this.floorMesh.rotateX(-Math.PI * 0.5);
        this.floorMesh.position.set(this.meshPos[0], -0.01, this.meshPos[1]);

        this.cellMeshGroup.add(this.mesh);
        this.cellMeshGroup.add(this.floorMesh);
    }

    getMesh() {
        return this.cellMeshGroup;
    }

    addToScene(scene) {
        scene.add(this.mesh);
        scene.add(this.floorMesh);
    }
}
