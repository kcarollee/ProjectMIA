import * as THREE from "three";

function compareFaceUD(a, b) {
    return a === b;
}

function compareFaceBRFL(a, b) {
    // -1 인 경우
    if (a.includes("-") && b.includes("-")) {
        return true;
    }
    // 시메트릭한 경우
    if (a.includes("s") && b.includes("s") && a === b) {
        return true;
    }
    // 1, 1f 인경우 어느 둘 중 하나는 무조건 만족 이것도 아닌 경우에는 매칭 안되는 경우
    return a + "f" === b || a === b + "f";
}

export default class Tile3D {
    constructor(mesh, faces, meshRotationNum = 0) {
        this.mesh = mesh;
        this.faces = faces;
        this.constraint = [[], [], [], [], [], []];
        this.meshRotationNum = meshRotationNum;
    }

    rotate(num) {
        const newFaces = [];
        let len = this.faces.length;

        // UD Rotation
        for (let i = 0; i < 2; i++) {
            // -1이면 돌릴 필요 없음
            if (this.faces[i] !== "-1") {
                newFaces[i] =
                    this.faces[i].slice(0, -1) +
                    String.fromCharCode(
                        ((this.faces[i].slice(-1).charCodeAt(0) -
                            "a".charCodeAt(0) +
                            num) %
                            4) +
                            "a".charCodeAt(0)
                    );
            } else {
                newFaces[i] = "-1";
            }
        }
        // BRFL Rotation
        for (let i = 2; i < len; i++) {
            newFaces[i] = this.faces[((i + len - num) % 4) + 2];
        }
        return new Tile3D(this.mesh, newFaces, num);
    }

    analyze(tiles3D) {
        for (let i = 0; i < tiles3D.length; i++) {
            let tile3D = tiles3D[i];
            // UD Setting
            for (let j = 0; j < 2; j++) {
                if (compareFaceUD(tile3D.faces[(j + 1) % 2], this.faces[j])) {
                    this.constraint[j].push(i);
                }
            }
            // BRFL Setting
            for (let j = 2; j < 6; j++) {
                if (
                    compareFaceBRFL(
                        tile3D.faces[((j + 4) % 4) + 2],
                        this.faces[j]
                    )
                ) {
                    this.constraint[j].push(i);
                }
            }
        }
    }
}
