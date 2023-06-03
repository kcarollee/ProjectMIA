import * as THREE from "three";
export default class VolumetricSculpture {
    constructor(cameraPos, meshPos, meshScale){
        this.size = 32;
        this.data = new Uint8Array(this.size * this.size * this.size);
        this.init3DTexture();
        this.texture = new THREE.Data3DTexture(this.data, this.size, this.size, this.size);
        this.texture.format = THREE.RedFormat;
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.unpackAlignment = 1; // 4 b y default. 
        this.texture.needsUpdate = true;
        
        let vertexShader = VolumetricSculpture.vertexShader;
        let fragmentShader = VolumetricSculpture.fragmentShader;
        
        this.material = new THREE.RawShaderMaterial({
            glslVersion: THREE.GLSL3,
            uniforms:{
                map: {value: this.texture},
                cameraPos: {value: new THREE.Vector3(cameraPos.x, cameraPos.y, cameraPos.z)},
                threshold: {value: 0.5},
                steps: {value: 200}
            },
            vertexShader,
            fragmentShader,
            side: THREE.DoubleSide
        });
        
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.scale.set(meshScale.x, meshScale.y, meshScale.z);
        this.mesh.position.set(meshPos.x, meshPos.y, meshPos.z);
        
    }

    map(value,  min1,  max1,  min2,  max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    }

    init3DTexture(){
        let vector = new THREE.Vector3();
        let index = 0;
        // // type 1: random, threshold : 0.6
        // for (let z = 0; z < this.size; z++){
    	//     for (let y = 0; y < this.size; y++){
    	//         for (let x = 0; x < this.size; x++){
        //             this.data[index++] = this.map(Math.random(), 0, 1, 0, 256);
        //         }
    	//     }
    	// }

        // // type 2: random spheres threshold: 0.25
        // let randomPoints = [];
        // let randomPointsNum = 50;
        // for (let i = 0; i < randomPointsNum; i++){
        //     let randomPoint = new THREE.Vector3(
        //         this.map(Math.random(), 0, 1, 0, this.size),
        //         this.map(Math.random(), 0, 1, 0, this.size),
        //         this.map(Math.random(), 0, 1, 0, this.size)
        //     );
        //     randomPoints.push(randomPoint);
        // }
        // let radius = this.size * 0.2;
        // for (let z = 0; z < this.size; z++){
    	//     for (let y = 0; y < this.size; y++){
    	//         for (let x = 0; x < this.size; x++){
        //             let currentPoint = new THREE.Vector3(x, y, z);
        //             let distanceSum = 0;
        //             randomPoints.forEach((randomPoint) => {
        //                 let distance = randomPoint.distanceTo(currentPoint);
        //                 if (distance > radius){
        //                     distanceSum += 1;
        //                 }
        //                 else {
        //                     distanceSum += this.map(distance, 0, this.size, 0, 256);
        //                 }
        //             });
        //             this.data[index++] = distanceSum;

                   
        //         }
    	//     }
    	// }
        
        // type 3: random, threshold : 0.6
        for (let z = 0; z < this.size; z++){
    	    for (let y = 0; y < this.size; y++){
    	        for (let x = 0; x < this.size; x++){
                    this.data[index++] = this.map(noise.simplex3(x * 0.1, y * 0.1, z * 0.1), -1, 1, 0, 256);
                }
    	    }
    	}

        // // type 4: random, threshold : 0.6
        // let scale = 0.1
        // for (let z = 0; z < this.size; z++){
    	//     for (let y = 0; y < this.size; y++){
    	//         for (let x = 0; x < this.size; x++){
        //             const d = 1.0 - vector.set( x, y, z ).subScalar( this.size / 2 ).divideScalar( this.size ).length();
		// 			this.data[index++] = ( 128 + 128 * noise.simplex3( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
					
        //         }
    	//     }
    	// }
    }

    // camPos: THREE.Vector3
    updateUniforms(camPos){
        this.material.uniforms.cameraPos.value.copy(camPos);
    }

    

    addToGroup(group){
        if (group.type === 'Group'){
            group.add(this.mesh);
            //console.log("ADDED");
            
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

        //color.rgb = 1.0 - normal(p + 0.5);
        //color.rgb *= 0.75;
        if ( color.a == 0.0 ) discard;
    }
`;

VolumetricSculpture.models = [];