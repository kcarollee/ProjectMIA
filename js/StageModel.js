import * as THREE from "three";
import WFCFloorMesh from "./WFCFloorMesh.js";
import WFC3D from "./WFC3D.js";


class VolumetricSculpture {
    constructor(cameraPos, meshPos){
        this.size = 32;
        this.data = new Uint8Array(this.size * this.size * this.size);
        this.init3DTexture();
        this.texture = new THREE.Data3DTexture(this.data, this.size, this.size, this.size);
        let vertexShader = VolumetricSculpture.vertexShader;
        let fragmentShader = VolumetricSculpture.fragmentShader;
        this.material = new THREE.RawShaderMaterial({
            glslVersion: THREE.GLSL3,
            uniforms:{
                map: {value: this.texture},
                cameraPos: {value: new THREE.Vector3(0, 0, 0)},
                threshold: {value: 0.25},
                steps: {value: 100}
            },
            vertexShader,
            fragmentShader
        });
        
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        //this.mesh.position.copy(meshPos);
    }

    map(value,  min1,  max1,  min2,  max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    }

    init3DTexture(){
        let vector = new THREE.Vector3();
        let index = 0;
        for (let z = 0; z < this.size; z++){
    	    for (let y = 0; y < this.size; y++){
    	        for (let x = 0; x < this.size; x++){
    	           this.data[index++] = this.map(Math.random(), 0, 1, 0, 256);
                }
    	    }
    	}
        
    }

    update3DTexture(){

    }

    addToGroup(group){
        if (group.type === 'Group'){
            group.add(this.mesh);
            console.log("ADDED");
        }
    }
}


VolumetricSculpture.vertexShader = `
    in vec3 position;
    uniform mat4 modelMatrix;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec3 cameraPos;

    // view origin (camera position) and view direction must be sent to the fragment shader.
    out vec3 vOrigin;
    out vec3 vDirection;
    void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
        vDirection = position - vOrigin;
        gl_Position = projectionMatrix * mvPosition;
    }
`;

VolumetricSculpture.fragmentShader = `
    precision highp float;
    precision highp sampler3D;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    // sent from the vert shader with appropriate matrix multiplications
    in vec3 vOrigin;
    in vec3 vDirection;

    out vec4 color;

    // 3d texture sent from 'const texture = new THREE.DataTexture3D(data, size, size, size);''
    uniform sampler3D map;


    uniform float threshold;
    uniform float steps;

    vec2 hitBox( vec3 orig, vec3 dir ) {
        const float range = 0.5;
        const vec3 box_min = vec3( -range ); // lower bound
        const vec3 box_max = vec3(range); // upper bound
        
        vec3 inv_dir = 1.0 / dir; // inverse of ray direction
        
        vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
        vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
        
        vec3 tmin = min( tmin_tmp, tmax_tmp );
        vec3 tmax = max( tmin_tmp, tmax_tmp );
        
        float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
        float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
        
        return vec2( t0, t1 );
    }

    // return the r value of the texture at position p
    float sample1( vec3 p ) {
        return texture( map, p ).r;
    }

    #define epsilon .00001

    vec3 normal( vec3 coord ) {
        if ( coord.x < epsilon ) return vec3( 1.0, 0.0, 0.0 );
        if ( coord.y < epsilon ) return vec3( 0.0, 1.0, 0.0 );
        if ( coord.z < epsilon ) return vec3( 0.0, 0.0, 1.0 );
        
        if ( coord.x > 1.0 - epsilon ) return vec3( - 1.0, 0.0, 0.0 );
        if ( coord.y > 1.0 - epsilon ) return vec3( 0.0, - 1.0, 0.0 );
        if ( coord.z > 1.0 - epsilon ) return vec3( 0.0, 0.0, - 1.0 );
        
        float step = 0.01;
        
        float x = sample1( coord + vec3( - step, 0.0, 0.0 ) ) - sample1( coord + vec3( step, 0.0, 0.0 ) );
        float y = sample1( coord + vec3( 0.0, - step, 0.0 ) ) - sample1( coord + vec3( 0.0, step, 0.0 ) );
        float z = sample1( coord + vec3( 0.0, 0.0, - step ) ) - sample1( coord + vec3( 0.0, 0.0, step ) );
        
        return normalize( vec3( x, y, z ) );
    }
    void main(){
        vec3 rayDir = normalize( vDirection );
        
        vec2 bounds = hitBox( vOrigin, rayDir );
        
        if ( bounds.x > bounds.y ) discard;
        
        bounds.x = max( bounds.x, 0.0 );
        
        vec3 p = vOrigin + bounds.x * rayDir;
        
        vec3 inc = 1.0 / abs( rayDir );
        
        float delta = min( inc.x, min( inc.y, inc.z ) );
        
        delta /= steps;
        
        for ( float t = bounds.x; t < bounds.y; t += delta ) {
            
            float d = sample1( p + 0.5 );
            if ( d > threshold ) {
                //color.rgb = normal( p + 0.5 ) * 0.5 + ( p * 1.5 + 0.25 );
                color.rgb = normal(p + 0.5) + p;

                color.a = 1.;
                break;
            }
            p += rayDir * delta;

        }

        float gs = (color.r + color.g + color.b) / 2.0;

        color.rgb = 1.0 - normal(p + 0.5);
        color.rgb *= 0.75;
        if ( color.a == 0.0 ) discard;
    }
`;


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

        // structure 0: grass
        let grassDummy = new THREE.Object3D();
        let grassGeom = new THREE.PlaneGeometry(0.05, 1, 1, 4);
        
        
        
        // structure 1: cube clusters
        let randomCubeMeshMat = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
        let randomCubeMeshGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2);

        

        
        for(let i = 0; i < this.buildingTransform.length; i++){
            let buildingAreaInfo = this.buildingTransform[i];
            
            let buildingPosX = -(this.WFCDim - 2) * this.WFCFloorSize[0] * 0.5 + buildingAreaInfo[0];
            let buildingPosZ = -(this.WFCDim - 2) * this.WFCFloorSize[1] * 0.5 + buildingAreaInfo[1];

            let sizeX = buildingAreaInfo[2];
            let sizeZ = buildingAreaInfo[3];

            // structure 0: grass
            /*
            {
                let grassDensity = 0.05;
                let patchScale = 1;
                let startX = buildingPosX - sizeX * 0.5 * patchScale;
                let startZ = buildingPosZ - sizeZ * 0.5 * patchScale;

                let endX = buildingPosX + sizeX * 0.5 * patchScale;
                let endZ = buildingPosZ + sizeZ * 0.5 * patchScale;

                let grassCount = 0;
                let grassPos = [];
                for (let x = startX; x < endX; x += grassDensity){
                    for (let z = startZ; z < endZ; z+= grassDensity){
                        grassPos.push([x, z]);
                        grassCount++;
                    }
                }
                
                let dummy = new THREE.Object3D;
                let grassGeom = new THREE.PlaneGeometry(0.01, 0.1, 1, 1);
                let instancedMesh = new THREE.InstancedMesh(grassGeom, new THREE.MeshBasicMaterial({color: 0x00FF00, side: THREE.DoubleSide}), grassCount);

                grassPos.forEach((gPos, i) => {
                    dummy.position.set(gPos[0], 0, gPos[1]);
                    //dummy.scale.setScalar( 0.5 + Math.random() * 0.5 );
                    dummy.rotation.y = Math.random() * Math.PI;
                    dummy.updateMatrix();
                    instancedMesh.setMatrixAt(i, dummy.matrix);
                })

                this.meshGroup.add(instancedMesh);
            }
            */

            
            if (this.buildingTransform[i][4]) continue;
            
            //structure 1: cube clusters
            // {
            //     let randomCubeNum = Math.random() * 100;
            //     for (let i = 0; i < randomCubeNum; i++){
            //         let rangeScaleX = 0.5;
            //         let rangeScaleZ = 0.5;
            //         let randomX = this.map(Math.random(), 0, 1, buildingPosX - sizeX * 0.5 * rangeScaleX, buildingPosX + sizeX * 0.5 * rangeScaleX);
            //         let randomY = this.map(Math.random(), 0, 1, 0, 5);
            //         //console.log(randomY);
            //         let randomZ = this.map(Math.random(), 0, 1, buildingPosZ - sizeZ * 0.5 * rangeScaleZ, buildingPosZ + sizeZ * 0.5 * rangeScaleZ);

            //         let randomCubeMesh = new THREE.Mesh(randomCubeMeshGeom, randomCubeMeshMat);
            //         randomCubeMesh.position.set(randomX, randomY, randomZ);
            //         randomCubeMesh.rotateX(Math.random());
            //         randomCubeMesh.rotateZ(Math.random());
            //         this.meshGroup.add(randomCubeMesh);
            //     }
            // }


            // // structure 2: torus Knot 
            
            // {   
            //     let radius = Math.min(sizeX, sizeZ) * this.map(Math.random(), 0, 1, 0.1, 0.5);
            //     let tube = this.map(Math.random(), 0, 1, 0.1, 0.5);
            //     let tubularSegNum = this.map(Math.random(), 0, 1, 32, 64);
            //     let radialSegNum = this.map(Math.random(), 0, 1, 3, 7);
            //     let p = this.map(Math.random(), 0, 1, 1, 5);
            //     let q = this.map(Math.random(), 0, 1, 1, 5);
            //     let torusKnotGeom = new THREE.TorusKnotGeometry(radius, tube, tubularSegNum, radialSegNum, p, q);
            //     let torusKnotMesh = new THREE.Mesh(torusKnotGeom, randomCubeMeshMat);
            //     torusKnotMesh.position.set(buildingPosX, radius, buildingPosZ);
            //     this.meshGroup.add(torusKnotMesh);
            // }
            

            // // structure 3: box towers
            // {
            //     let randomCubeNum = Math.random() * 100;
            //     for (let i = 0; i < randomCubeNum; i++){
            //         let rangeScaleX = 0.2;
            //         let rangeScaleZ = 0.2;
            //         let randomX = this.map(Math.random(), 0, 1, buildingPosX - sizeX * 0.5 * rangeScaleX, buildingPosX + sizeX * 0.5 * rangeScaleX);
            //         let randomY = this.map(Math.random(), 0, 1, 0, 5);
            //         //console.log(randomY);
            //         let randomZ = this.map(Math.random(), 0, 1, buildingPosZ - sizeZ * 0.5 * rangeScaleZ, buildingPosZ + sizeZ * 0.5 * rangeScaleZ);

            //         let randomCubeMesh = new THREE.Mesh(randomCubeMeshGeom, randomCubeMeshMat);
            //         randomCubeMesh.position.set(randomX, randomY, randomZ);
            //         randomCubeMesh.scale.set(1, this.map(Math.random(), 0, 1, 4, 6), 1);
            //         this.meshGroup.add(randomCubeMesh);
            //     }
            // }
            
            // structure 4: building
            /*
            {
                let buildingHeight = 1;
                let buildingGeom = new THREE.BoxGeometry(1, buildingHeight, 1);

                let buildingSegNum = Math.random() * 5 + 5;
                let yPos = buildingHeight * 0.5;
                
                for (let i = 0; i < buildingSegNum; i++){
                    let buildingMesh = new THREE.Mesh(buildingGeom, randomCubeMeshMat);
                    
                    buildingMesh.position.set(buildingPosX, yPos, buildingPosZ);
                    let scaleFactorX = this.map(Math.random(), 0, 1, 0.5, 0.9);
                    let scaleFactorZ = this.map(Math.random(), 0, 1, 0.5, 0.9);
                    buildingMesh.scale.set(sizeX * Math.pow(scaleFactorX, i), 1, sizeZ * Math.pow(scaleFactorZ, i));
                    
                    yPos += buildingHeight * 0.5;
                    buildingHeight = this.map(Math.random(), 0, 1, 0.5, 0.9);
                    yPos += buildingHeight * 0.5;
                    this.meshGroup.add(buildingMesh);
                }
                
            }
            */
            // structure 5: Noise structure
            
            

            {
                
                

                noise.seed(Math.random())
                console.log(noise.simplex3(1.2, 1.4, 2.4));

                let totalDim = Math.min(sizeX, sizeZ);
                let dimScale = 0.9;
                totalDim *= dimScale;

                let divNum = Math.floor(this.map(Math.random(), 0, 1, 5, 8));
                let cubeDim = totalDim / divNum;
                
                let startX = buildingPosX - sizeX * 0.5 + cubeDim;
                let startZ = buildingPosZ - sizeZ * 0.5 + cubeDim;
                let startY = cubeDim;

                let cubeGeom = new THREE.BoxGeometry(1, 1, 1);

                let dummy = new THREE.Object3D();
                let cubeGroup = new THREE.Group();
                let cubeInstancedMesh = new THREE.InstancedMesh(cubeGeom, randomCubeMeshMat, divNum * divNum * divNum);
                let index = 0;
                for (let yNum = 0; yNum < divNum; yNum++){
                    for (let zNum = 0; zNum < divNum; zNum++){
                        for (let xNum = 0; xNum < divNum; xNum++){
                            let cubePosX = startX + cubeDim * xNum;
                            let cubePosY = startY + cubeDim * yNum;
                            let cubePosZ = startZ + cubeDim * zNum;
                            //let cubeMesh = new THREE.Mesh(cubeGeom, randomCubeMeshMat);
                            
                            let noiseCoef = 2.0;
                            let scale = noise.simplex3(cubePosX * noiseCoef, cubePosY * noiseCoef, cubePosZ * noiseCoef);
                            //console.log(scale);
                            scale = this.map(scale, -1, 1, 0, 0.25);
                            /*
                            cubeMesh.scale.set(scale, scale, scale);
                            cubeMesh.position.set(cubePosX, cubePosY, cubePosZ);
                            cubeGroup.add(cubeMesh);
                            */

                            dummy.position.set(cubePosX, cubePosY, cubePosZ);
                            dummy.scale.set(scale, scale, scale);
                            dummy.updateMatrix();
                            cubeInstancedMesh.setMatrixAt(index++, dummy.matrix);
                        }
                    }
                }
                this.meshGroup.add(cubeInstancedMesh);

                
                
                
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