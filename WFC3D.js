import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import Tile3D from './Tile3D.js';
import Cell3D from './Cell3D.js';

export default class WFC3D {
    // [x,y,z], [w,d,h], 'assets/3Dtiles/Building/', '.glb'
    constructor(dim, cellScale, options, urlString, formatString) {
        // 타일 로드
        this.meshes = [];
        this.ms = 1;
        const loader = new GLTFLoader();

        function loadGLTF() {
            return new Promise(function (resolve, reject) {
                for (let i = 0; i < 30; i++) {
                    loader.load(urlString + i + formatString, function (gltf) {
                        gltf.scene.scale.set(this.ms, this.ms, this.ms);

                        this.meshes[i] = gltf.scene.children[0].clone();
                        resolve();
                        console.log("in loader" + i , this.meshes[i]);
                    });
                }
            });
        }
        loadGLTF().then(function (){
            console.log("out Loader", this.meshes);
        })
    }
};