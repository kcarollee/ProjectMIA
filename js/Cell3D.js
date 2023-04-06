import * as THREE from 'three';


export default class Cell3D {
    constructor(value, pos, size) {
        this.collapsed = false;
        if(value instanceof Array){
            this.options = value;
        } else {
            this.options = new Array(value).fill(0).map((_, i) => i);
        }
        this.pos = pos;
        this.size = size;
    }

    setPos(pos) {
        this.pos = pos;
    }
};