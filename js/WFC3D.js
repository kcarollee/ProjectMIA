import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import Tile3D from "./Tile3D.js";
import Cell3D from "./Cell3D.js";

export default class WFC3D {
    // 'assets/3Dtiles/Building/', '.glb'
    static #instance;

    constructor(rulebook, urlString, formatString) {
        if (WFC3D.#instance) return WFC3D.#instance;
        // 타일 로드
        this.modelKindCount = rulebook.length;
        this.meshes = [];
        this.promises = [];
        this.tiles3D = [];
        this.loadGLTFs(urlString, formatString, rulebook);
        this._WFC3DInit(this.modelKindCount, rulebook);
        WFC3D.#instance = this;
    }

    loadGLTFs(urlString, formatString, rulebook) {
        const loader = new GLTFLoader();
        let cnt = 0;
        for (let i = 0; i < this.modelKindCount; i++) {
            let variationCount = rulebook[i][0];
            for (let j = 0; j < variationCount; j++) {
                this.promises[cnt] = new Promise((resolve) => {
                    loader.load(
                        urlString + i + "/" + j + formatString,
                        resolve,
                        undefined,
                        function (error) {
                            console.log(error);
                        }
                    );
                });
                cnt++;
            }
        }
    }

    _WFC3DInit(modelKindCount, rulebook) {
        Promise.all(this.promises).then((gltf) => {
            // Add Empty model
            this.tiles3D.push(
                new Tile3D(
                    "OUT EMPTY MESH",
                    ["-1", "-1", "-1", "-1", "-1", "-1"],
                    0
                )
            );
            this.tiles3D.push(
                new Tile3D(
                    "IN EMPTY MESH",
                    ["-2", "-2", "-2", "-2", "-2", "-2"],
                    0
                )
            );

            let cnt = 2;
            // load Model to Tiles3D
            for (let i = 0; i < modelKindCount; i++) {
                let variationCount = rulebook[i][0];
                for (let j = 0; j < variationCount; j++) {
                    this.tiles3D[cnt] = new Tile3D(
                        gltf[cnt - 2].scene.children[0].clone(),
                        rulebook[i].slice(1),
                        0
                    );
                    cnt++;
                }
            }
            let tiles3DLength = this.tiles3D.length;
            // Rotate All model
            for (let i = 1; i < 4; i++) {
                for (let j = 0; j < tiles3DLength; j++) {
                    this.tiles3D.push(this.tiles3D[j].rotate(i));
                }
            }

            // Generate Constraints
            for (let i = 0; i < this.tiles3D.length; i++) {
                let tile3D = this.tiles3D[i];
                tile3D.analyze(this.tiles3D);
            }
        });
    }

    create3DArray(dim) {
        let arr = new Array(dim[2] + 2);
        for (let k = 0; k < dim[2] + 2; k++) {
            arr[k] = new Array(dim[1] + 2);
            for (let j = 0; j < dim[1] + 2; j++) {
                arr[k][j] = new Array(dim[0] + 2);
            }
        }
        return arr;
    }

    // 초기 세팅 그리드 크기 설정하고, 각 셀의 사이즈 크기 등등 모든 옵션 설정 후 맨 바깥 큐브 설정
    startOver(dim, size) {
        let grid = this.create3DArray(dim);
        for (let k = 0; k < dim[2] + 2; k++) {
            for (let j = 0; j < dim[1] + 2; j++) {
                for (let i = 0; i < dim[0] + 2; i++) {
                    // 맨 바깥은 빈 공간 삽입
                    if (
                        k === 0 ||
                        k === dim[2] + 1 ||
                        j === 0 ||
                        j === dim[1] + 1 ||
                        i === 0 ||
                        i === dim[0] + 1
                    ) {
                        grid[k][j][i] = new Cell3D(1, [i, j, k], size);
                        grid[k][j][i].collapsed = true;
                    } else {
                        grid[k][j][i] = new Cell3D(
                            this.tiles3D.length,
                            [i, j, k],
                            size
                        );
                    }
                }
            }
        }

        // console.log(grid);
        return this.propagateOnce(grid);
    }

    checkValid(options, validOptions) {
        for (let i = options.length - 1; i >= 0; i--) {
            let element = options[i];
            if (!validOptions[element]) {
                options.splice(i, 1);
            }
        }
    }

    deepCopy3DArray(arr) {
        return arr.map(function (layer) {
            return layer.map(function (row) {
                return row.slice();
            });
        });
    }

    // grid 전파
    propagateOnce(grid) {
        let nextGrid = this.deepCopy3DArray(grid);
        for (let k = 1; k < grid.length - 1; k++) {
            let xyGrid = grid[k];
            for (let j = 1; j < xyGrid.length - 1; j++) {
                let xGrid = xyGrid[j];
                for (let i = 1; i < xGrid.length - 1; i++) {
                    let cur = xGrid[i];
                    let curPos = cur.pos;
                    let options = new Array(this.tiles3D.length)
                        .fill(0)
                        .map((x, i) => i);

                    // 주변 6방향 타일 보고 갱신
                    // UD 따로 BRFL 따로 갱신해야함
                    for (let dir = 0; dir < 6; dir++) {
                        let pos = [
                            curPos[0] + WFC3D.dx[dir],
                            curPos[1] + WFC3D.dy[dir],
                            curPos[2] + WFC3D.dz[dir],
                        ];
                        if (nextGrid[pos[2]][pos[1]][pos[0]].collapsed) {
                            let value = nextGrid[pos[2]][pos[1]][pos[0]];
                            let validOptions = new Array(
                                this.tiles3D.length
                            ).fill(false);
                            for (let option of value.options) {
                                let valid;
                                if (dir < 2) {
                                    valid =
                                        this.tiles3D[option].constraint[
                                        (dir + 1) % 2
                                            ];
                                } else {
                                    valid =
                                        this.tiles3D[option].constraint[
                                        ((dir + 4) % 4) + 2
                                            ];
                                }
                                for (let l = 0; l < this.tiles3D.length; l++) {
                                    validOptions[valid[l]] = true;
                                }
                            }
                            this.checkValid(options, validOptions);
                        }
                    }
                    nextGrid[curPos[2]][curPos[1]][curPos[0]].options = options;
                }
            }
        }

        let toVisit = [];
        for (let j = 1; j < nextGrid[0].length - 1; j++) {
            for (let i = 1; i < nextGrid[0][0].length - 1; i++) {
                toVisit.push([1, j, i]);
                toVisit.push([nextGrid.length - 2, j, i]);
            }
        }

        for (let k = 2; k < nextGrid.length - 2; k++) {
            for (let i = 1; i < nextGrid[0][0].length - 1; i++) {
                toVisit.push([k, 1, i]);
                toVisit.push([k, nextGrid[0].length - 2, i]);
            }
        }

        for (let k = 2; k < nextGrid.length - 2; k++) {
            for (let j = 2; j < nextGrid[0].length - 2; j++) {
                toVisit.push([k, j, 1]);
                toVisit.push([k, j, nextGrid[0][0].length - 2]);
            }
        }
        return [nextGrid, toVisit];
    }

    // wfc3D 한 단계 돌리기기
    waveFunctionCollapse3DSingleIteration(grid, toVisit) {
        function flatten3DArray(arr) {
            let flat = [];
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++) {
                    flat = flat.concat(arr[i][j]);
                }
            }
            return flat;
        }

        function randomFromArray(arr) {
            let randomIndex = Math.floor(Math.random() * arr.length);
            return arr[randomIndex];
        }

        // 그리드 복제
        let flattenGrid = flatten3DArray(grid);

        flattenGrid = flattenGrid.filter((a) => !a.collapsed);
        flattenGrid.sort((a, b) => {
            return a.options.length - b.options.length;
        });

        let len = flattenGrid[0].options.length;
        let stopIndex = 0;

        for (let i = 1; i < flattenGrid.length; i++) {
            if (flattenGrid[i].options.length > len) {
                stopIndex = i;
                break;
            }
        }
        if (stopIndex > 0) flattenGrid.splice(stopIndex);

        //선택 코드
        const selectedCell = randomFromArray(flattenGrid);
        selectedCell.collapsed = true;
        const pick = randomFromArray(selectedCell.options);

        if (pick === undefined) {
            return [undefined, undefined];
        }
        selectedCell.options = [pick];

        // 다음번 그리드 갱신하는 함수
        // 다음번에 방문할 타일 작성
        let nextGrid = this.deepCopy3DArray(grid);


        let nextVisitPos = selectedCell.pos;

        for(let i = 0; i < toVisit.length; i++){
            let isSame = true;
            for(let j = 0; j < toVisit[0].length; j++){
                if(toVisit[i][j] !== nextVisitPos[j]){
                    isSame = false;
                    break;
                }
            }
            if(isSame){
                toVisit.splice(i,1);
                break;
            }
        }

        const isIncludeArrays = (arr, arrElem) => {
            return arr.some(a => arrElem.every((v,i) => v === a[i]));
        }

        for (let dir = 0; dir < 6; dir++) {
            let pos = [
                nextVisitPos[0] + WFC3D.dx[dir],
                nextVisitPos[1] + WFC3D.dy[dir],
                nextVisitPos[2] + WFC3D.dz[dir],
            ];
            // 중복 걸러야한다.
            if (!nextGrid[pos[2]][pos[1]][pos[0]].collapsed && !isIncludeArrays(toVisit, pos)) {
                toVisit.push(pos);
                break;
            }
        }

        // for (let k = 1; k < grid.length - 1; k++) {
        //     let xyGrid = grid[k];
        //     for (let j = 1; j < xyGrid.length - 1; j++) {
        //         let xGrid = xyGrid[j];
        //         for (let i = 1; i < xGrid.length - 1; i++) {
        //             // 현재 위치의 주변이 붕괴되어 있으면 방문 해야함
        //             let cur = xGrid[i];
        //             if (cur.collapsed) continue;
        //             let curPos = cur.pos;
        //             for (let dir = 0; dir < 6; dir++) {
        //                 let pos = [
        //                     curPos[0] + WFC3D.dx[dir],
        //                     curPos[1] + WFC3D.dy[dir],
        //                     curPos[2] + WFC3D.dz[dir],
        //                 ];
        //                 if (nextGrid[pos[2]][pos[1]][pos[0]].collapsed) {
        //                     toVisit.push(cur.pos);
        //                     break;
        //                 }
        //             }
        //         }
        //     }
        // }


        // 방문해야 하는 모든 타일 방문
        for (let i = 0; i < toVisit.length; i++) {
            let cur = nextGrid[toVisit[i][2]][toVisit[i][1]][toVisit[i][0]];
            let curPos = cur.pos;
            let options = new Array(this.tiles3D.length)
                .fill(0)
                .map((x, i) => i);

            // 주변 6방향 타일 보고 갱신
            // UD 따로 BRFL 따로 갱신해야함
            for (let dir = 0; dir < 6; dir++) {
                let pos = [
                    curPos[0] + WFC3D.dx[dir],
                    curPos[1] + WFC3D.dy[dir],
                    curPos[2] + WFC3D.dz[dir],
                ];
                if (nextGrid[pos[2]][pos[1]][pos[0]].collapsed) {
                    let value = nextGrid[pos[2]][pos[1]][pos[0]];
                    let validOptions = new Array(this.tiles3D.length).fill(
                        false
                    );
                    for (let option of value.options) {
                        let valid;
                        if (dir < 2) {
                            valid =
                                this.tiles3D[option].constraint[(dir + 1) % 2];
                        } else {
                            valid =
                                this.tiles3D[option].constraint[
                                ((dir + 4) % 4) + 2
                                    ];
                        }
                        for (let l = 0; l < this.tiles3D.length; l++) {
                            validOptions[valid[l]] = true;
                        }
                    }
                    this.checkValid(options, validOptions);
                }
            }
            nextGrid[curPos[2]][curPos[1]][curPos[0]].options = options;
        }
        return [nextGrid, selectedCell, toVisit];
    }

    // 실제 건물 부르는 함수
    createBuilding(dim, size) {
        let grid = [];
        let toVisit = [];
        [grid, toVisit] = this.startOver(dim, size);
        // console.log("Grid", grid);
        let wfc3dIterCnt = dim[0] * dim[1] * dim[2];
        let selectedArr = [];
        let failCnt = 0;
        while (wfc3dIterCnt--) {
            [grid, selectedArr[wfc3dIterCnt], toVisit] =
                this.waveFunctionCollapse3DSingleIteration(grid, toVisit);

            if (grid === undefined) {
                [grid, toVisit] = this.startOver(dim, size);
                wfc3dIterCnt = dim[0] * dim[1] * dim[2];
                selectedArr = [];
                failCnt++;
                //console.log(wfc3dIterCnt);
            }
        }
        // console.log(selectedArr);

        //console.log(failCnt);
        // return selectedArr;

        return this.makeBuildingMesh(grid, size);
    }

    isFloating(grid) {
        let isEmpty = true;
        let maximum = grid.length - 3;
        while (isEmpty && maximum--) {
            // 1층이 비었는지 확인
            for (let j = 1; j < grid[0].length - 1; j++) {
                for (let i = 1; i < grid[0][0].length - 1; i++) {
                    if (this.tiles3D[grid[1][j][i].options[0]].mesh !== "OUT EMPTY MESH") {
                        isEmpty = false;
                        break;
                    }
                }
            }
            // 1층이 비었으면 전부 다 한칸 내림
            if (isEmpty) {
                for (let k = 2; k < grid.length; k++) {
                    for (let j = 1; j < grid[0].length - 1; j++) {
                        for (let i = 1; i < grid[0][0].length - 1; i++) {
                            grid[k - 1][j][i] = grid[k][j][i];
                        }
                    }
                }
            }
        }
    }

    setMaterials(chapterNumber) {

        function colorRandom(color, strength = 256) {
            const clampNumber = (num, a, b) =>
                Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

            return Math.floor(
                Math.floor(clampNumber(color / 0x10000 + (Math.random() - 0.5) * strength, 0, 0xff)) * 0x10000 +
                Math.floor(clampNumber((color / 0x100) % 0x100 + (Math.random() - 0.5) * strength, 0, 0xff)) * 0x100 +
                Math.floor(clampNumber(color % 0x100 + (Math.random() - 0.5) * strength, 0, 0xff))
            );
        }

        this.buildingMatsParams = [
            {
                color: materialInfo[chapterNumber - 1][0][0],
                opacity : materialInfo[chapterNumber - 1][0][1],
                metalness : materialInfo[chapterNumber - 1][0][2],
                roughness : materialInfo[chapterNumber - 1][0][3],
            },
            {
                color: materialInfo[chapterNumber - 1][1][0],
                opacity : materialInfo[chapterNumber - 1][1][1],
                metalness : materialInfo[chapterNumber - 1][1][2],
                roughness : materialInfo[chapterNumber - 1][1][3],
            },
            {
                color: materialInfo[chapterNumber - 1][2][0],
                opacity : materialInfo[chapterNumber - 1][2][1],
                metalness : materialInfo[chapterNumber - 1][2][2],
                roughness : materialInfo[chapterNumber - 1][2][3],
            },
            {
                color: materialInfo[chapterNumber - 1][3][0],
                opacity : materialInfo[chapterNumber - 1][3][1],
                metalness : materialInfo[chapterNumber - 1][3][2],
                roughness : materialInfo[chapterNumber - 1][3][3],
            },
        ]

        this.buildingMat = [
            new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
                color: colorRandom(this.buildingMatsParams[0].color, 100),
                metalness : this.buildingMatsParams[0].metalness,
                roughness : this.buildingMatsParams[0].roughness,
            }),
            new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
                color: colorRandom(this.buildingMatsParams[1].color, 100),
                metalness : this.buildingMatsParams[1].metalness,
                roughness : this.buildingMatsParams[1].roughness,
            }),
            new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
                color: colorRandom(this.buildingMatsParams[2].color, 100),
                metalness : this.buildingMatsParams[2].metalness,
                roughness : this.buildingMatsParams[2].roughness,
            }),
            new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
                color: colorRandom(this.buildingMatsParams[3].color, 100),
                metalness : this.buildingMatsParams[3].metalness,
                roughness : this.buildingMatsParams[3].roughness,
            }),
        ];
    }

    makeBuildingMesh(grid, size) {

        function colorRandom(color, strength = 256) {
            const clampNumber = (num, a, b) =>
                Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

            return Math.floor(
                Math.floor(clampNumber(color / 0x10000 + (Math.random() - 0.5) * strength, 0, 0xff)) * 0x10000 +
                Math.floor(clampNumber((color / 0x100) % 0x100 + (Math.random() - 0.5) * strength, 0, 0xff)) * 0x100 +
                Math.floor(clampNumber(color % 0x100 + (Math.random() - 0.5) * strength, 0, 0xff))
            );
        }

        let buildingMesh = new THREE.Group();
        Promise.all(this.promises).then(() => {
            let tileMeshGroup = new THREE.Group();
            // console.log("Start");
            // console.log(grid);

            // this.buildingMat = [
            //     new THREE.MeshPhongMaterial({
            //         side: THREE.DoubleSide, color: 0xFFFFFF * Math.random()
            //     }),
            //     new THREE.MeshPhongMaterial({
            //         side: THREE.DoubleSide, color: 0xFFFFFF * Math.random()
            //     }),
            // ];

            this.buildingMat = [
                new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide,
                    color: colorRandom(this.buildingMatsParams[0].color, 100),
                    transparent : true,
                    opacity : (Math.random() + 0.5) * this.buildingMatsParams[0].opacity,
                    metalness : (Math.random() + 0.5) * this.buildingMatsParams[0].metalness,
                    roughness : (Math.random() + 0.5) * this.buildingMatsParams[0].roughness,
                }),
                new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide,
                    color: colorRandom(this.buildingMatsParams[1].color, 100),
                    transparent : true,
                    opacity : (Math.random() + 0.5) * this.buildingMatsParams[1].opacity,
                    metalness : (Math.random() + 0.5) * this.buildingMatsParams[1].metalness,
                    roughness : (Math.random() + 0.5) * this.buildingMatsParams[1].roughness,
                }),
                new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide,
                    color: colorRandom(this.buildingMatsParams[2].color, 100),
                    transparent : true,
                    opacity : (Math.random() + 0.5) * this.buildingMatsParams[2].opacity,
                    metalness : (Math.random() + 0.5) * this.buildingMatsParams[2].metalness,
                    roughness : (Math.random() + 0.5) * this.buildingMatsParams[2].roughness,
                }),
                new THREE.MeshStandardMaterial({
                    side: THREE.DoubleSide,
                    transparent : true,
                    color: colorRandom(this.buildingMatsParams[3].color, 100),
                    opacity : (Math.random() + 0.5) * this.buildingMatsParams[3].opacity,
                    metalness : (Math.random() + 0.5) * this.buildingMatsParams[3].metalness,
                    roughness : (Math.random() + 0.5) * this.buildingMatsParams[3].roughness,
                }),
            ];

            // console.log(this.buildingMat[1].color);

            this.isFloating(grid);

            for (let k = 1; k < grid.length - 1; k++) {
                for (let j = 1; j < grid[0].length - 1; j++) {
                    let y = grid[0].length - 2;

                    for (let i = 1; i < grid[0][0].length - 1; i++) {
                        let curMesh = this.tiles3D[grid[k][j][i].options[0]].mesh;
                        if (curMesh === "OUT EMPTY MESH" || curMesh === "IN EMPTY MESH")
                            continue;

                        curMesh = curMesh.clone();
                        let curMeshRotationNum =
                            this.tiles3D[grid[k][j][i].options[0]]
                                .meshRotationNum;
                        curMesh.rotation.x = Math.PI * 0.5;
                        curMesh.rotation.y =
                            -Math.PI * 0.5 * curMeshRotationNum;

                        curMesh.position.set(
                            i - 1 - (grid[0][0].length - 3) / 2,
                            (y + 1) * 0.5 - (j - 1) - 1,
                            k - 1 - (grid.length - 3) / 2
                        );
                        //console.log(curMesh.position);

                        curMesh.scale.set(0.25, 0.25, 0.25);

                        // curMesh.material.emissive = curMesh.material.color;
                        // curMesh.material.side = THREE.DoubleSide;

                        if (curMesh.children.length !== 0) {
                            for (let i = 0; i < curMesh.children.length; i++) {
                                /*
                                curMesh.children[i].material =
                                    new THREE.MeshNormalMaterial({
                                        side: THREE.DoubleSide,
                                    });
                                */
                                curMesh.children[i].material = this.buildingMat[i];
                            }
                        } else {
                            /*
                            curMesh.material = new THREE.MeshNormalMaterial({
                                side: THREE.DoubleSide,
                            });
                            */
                            curMesh.material = this.buildingMat[0];
                        }

                        tileMeshGroup.add(curMesh);
                    }
                }
            }

            tileMeshGroup.rotation.x = -Math.PI * 0.5;
            tileMeshGroup.position.set(
                0,
                (1 / (grid.length - 3)) * size[1] * (grid.length - 3) * 0.5,
                0
            );

            tileMeshGroup.scale.set(
                (1 / (grid[0][0].length - 3)) * size[0],
                (1 / (grid[0].length - 3)) * size[2],
                (1 / (grid.length - 3)) * size[1]
            );

            buildingMesh.add(tileMeshGroup);
        });
        return buildingMesh;
    }
}

WFC3D.dx = [0, 0, 0, 1, 0, -1];
WFC3D.dy = [0, 0, -1, 0, 1, 0];
WFC3D.dz = [1, -1, 0, 0, 0, 0];
