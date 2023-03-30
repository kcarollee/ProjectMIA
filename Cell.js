import * as THREE from 'three';

export default class Cell {
    constructor(value, width, height) {
        this.collapsed = false;
        if (value instanceof Array){
            this.options = value;
        }else {
            this.options = new Array(value).fill(0).map((_, i) => i);
        }
        this.geometry = new THREE.PlaneGeometry(width, height);
        this.material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});

    }

    setTexture(tex){
        this.material.map = tex;
    }

    setPos(pos){
        this.pos = pos;
    }

    setMeshPos(meshPos){
        this.meshPos = meshPos;
    }

    setRotationNum(num){
        this.rotationNum = num;
    
    }

    buildMesh(){
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        //console.log(this.rotationNum);
        this.mesh.rotateX(-Math.PI * 0.5);
        this.mesh.position.set(this.meshPos[0] , 0, this.meshPos[1]);
        this.mesh.rotateZ(-Math.PI * 0.5 * this.rotationNum);
    }

    getMesh(){
        return this.mesh;
    }

    addToScene(scene){
        scene.add(this.mesh);
    }
}









