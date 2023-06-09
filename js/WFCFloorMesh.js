import * as THREE from "three";
import Tile from "./Tile.js";
import Cell from "./Cell.js";

export default class WFCFloorMesh {
    // 20, 'assets/tiles/crosswalk/', '.png'
    // static #instance; 
    constructor(
        dim,
        cellSize,
        spawnProbablity,
        urlString,
        formatString,
        //default rulesets
        sc1Str = "ABAAAABA",
        sc2Str = "AABAABAA",
        snStr = "AAAAAAAA",
        sbStr = "CCCCCCCC",
        sb1Str = "ACCCCCCC",
        sb2Str = "CCCCCCCA",
        sbc1Str = "AACCCCCC",
        sbc2Str = "CCCCCCAA"
    ) {
        // if(WFCFloorMesh.#instance) return WFCFloorMesh.#instance;

        this.tileImages = [];
        // load road textures
        for (let i = 0; i < 54; i++) {
            let tex = new THREE.TextureLoader().load(
                urlString + i + formatString
            );
            this.tileImages.push(tex);
        }

        this.roadTileTexture = new THREE.TextureLoader().load(
            urlString + "roadTileTexture" + formatString
        );

        this.tiles = [];

        this.setSize(dim, cellSize);

        this.grid = [];
        // array of selected cells
        this.selectedArr = [];
        this.wfcIterCount = 0;

        this.spawnProbablity = spawnProbablity;

        this.sc1 = sc1Str;
        this.sc2 = sc2Str;
        this.sn = snStr;
        this.sb = sbStr;
        this.sb1 = sb1Str;
        this.sb2 = sb2Str;
        this.sbc1 = sbc1Str;
        this.sbc2 = sbc2Str;

        this.cellMeshGroup = new THREE.Group();

        this._wfcInit();

        // WFCFloorMesh.#instance = this;
    }

    setSize(dim, cellSize){
        this.DIM = dim;
        this.cellSize = cellSize;

        // buildingSpace
        // Tile의 스태틱 변수에 cellSize를 저장해서 그걸 갖다가 쓰도록 한다.
        // 아니면 얕은 복사로 어디에 저장을 해서 그걸 다 참조하도록 하는것도 괜찮다.

        this.rbs = [cellSize[0] * 0.5, cellSize[0] * 0.375, cellSize[0] * 0.25];
        this.ubs = [cellSize[1] * 0.5, cellSize[1] * 0.375, cellSize[1] * 0.25];

        // 회전 할 경우, 순서는 변경 되는데 사이즈는 변경하면 안되서 나중에 셀 사이즈를 곱하도록 할 것

        this.r0 = cellSize[0] * 0.5;
        this.r1 = cellSize[0] * 0.375;
        this.r2 = cellSize[0] * 0.25;

        this.u0 = cellSize[1] * 0.5;
        this.u1 = cellSize[1] * 0.375;
        this.u2 = cellSize[1] * 0.25;
    }

    _wfcInit() {
        this.tiles[0] = new Tile(
            this.tileImages[0],
            [this.sc1, this.sc1, this.sc1, this.sc1],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[1] = new Tile(
            this.tileImages[1],
            [this.sc1, this.sc1, this.sc1, this.sn],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[2] = new Tile(
            this.tileImages[2],
            [this.sc1, this.sc1, this.sn, this.sn],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[3] = new Tile(
            this.tileImages[3],
            [this.sc1, this.sn, this.sc1, this.sn],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[4] = new Tile(
            this.tileImages[4],
            [this.sc1, this.sn, this.sn, this.sn],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[5] = new Tile(
            this.tileImages[5],
            [this.sn, this.sn, this.sn, this.sn],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[6] = new Tile(
            this.tileImages[6],
            [this.sc1, this.sc1, this.sb1, this.sb2],
            [this.u1, this.r1, this.u0, this.r0]
        );
        this.tiles[7] = new Tile(
            this.tileImages[7],
            [this.sc1, this.sn, this.sb1, this.sb2],
            [this.u1, this.r1, this.u0, this.r0]
        );
        this.tiles[8] = new Tile(
            this.tileImages[8],
            [this.sn, this.sc1, this.sb1, this.sb2],
            [this.u1, this.r1, this.u0, this.r0]
        );
        this.tiles[9] = new Tile(
            this.tileImages[9],
            [this.sn, this.sn, this.sb1, this.sb2],
            [this.u1, this.r1, this.u0, this.r0]
        );
        this.tiles[10] = new Tile(
            this.tileImages[10],
            [this.sc1, this.sb1, this.sb, this.sb2],
            [this.u1, this.r0, this.u0, this.r0]
        );
        this.tiles[11] = new Tile(
            this.tileImages[11],
            [this.sn, this.sb1, this.sb, this.sb2],
            [this.u1, this.r0, this.u0, this.r0]
        );
        this.tiles[12] = new Tile(
            this.tileImages[12],
            [this.sc2, this.sc1, this.sc2, this.sc1],
            [this.u1, this.r2, this.u1, this.r2]
        );
        this.tiles[13] = new Tile(
            this.tileImages[13],
            [this.sc2, this.sc1, this.sc2, this.sn],
            [this.u1, this.r2, this.u1, this.r2]
        );
        this.tiles[14] = new Tile(
            this.tileImages[14],
            [this.sc2, this.sc1, this.sn, this.sc1],
            [this.u1, this.r2, this.u1, this.r2]
        );
        this.tiles[15] = new Tile(
            this.tileImages[15],
            [this.sc2, this.sc1, this.sn, this.sn],
            [this.u1, this.r2, this.u1, this.r2]
        );
        this.tiles[16] = new Tile(
            this.tileImages[16],
            [this.sc2, this.sn, this.sc2, this.sn],
            [this.u1, this.r2, this.u1, this.r2]
        );
        this.tiles[17] = new Tile(
            this.tileImages[17],
            [this.sc2, this.sn, this.sn, this.sc1],
            [this.u1, this.r2, this.u1, this.r2]
        );
        this.tiles[18] = new Tile(
            this.tileImages[18],
            [this.sn, this.sc1, this.sn, this.sc1],
            [this.u1, this.r2, this.u1, this.r2]
        );
        this.tiles[19] = new Tile(
            this.tileImages[19],
            [this.sc2, this.sn, this.sn, this.sn],
            [this.u1, this.r2, this.u1, this.r2]
        );
        this.tiles[20] = new Tile(
            this.tileImages[20],
            [this.sn, this.sc1, this.sn, this.sn],
            [this.u1, this.r2, this.u1, this.r2]
        );
        this.tiles[21] = new Tile(
            this.tileImages[21],
            [this.sn, this.sn, this.sn, this.sn],
            [this.u1, this.r2, this.u1, this.r2]
        );
        this.tiles[22] = new Tile(
            this.tileImages[22],
            [this.sc2, this.sc1, this.sbc1, this.sb2],
            [this.u1, this.r2, this.u0, this.r0]
        );
        this.tiles[23] = new Tile(
            this.tileImages[23],
            [this.sc2, this.sn, this.sbc1, this.sb2],
            [this.u1, this.r2, this.u0, this.r0]
        );
        this.tiles[24] = new Tile(
            this.tileImages[24],
            [this.sn, this.sc1, this.sbc1, this.sb2],
            [this.u1, this.r2, this.u0, this.r0]
        );
        this.tiles[25] = new Tile(
            this.tileImages[25],
            [this.sn, this.sn, this.sbc1, this.sb2],
            [this.u1, this.r2, this.u0, this.r0]
        );
        this.tiles[26] = new Tile(
            this.tileImages[26],
            [this.sc1, this.sc2, this.sb1, this.sbc2],
            [this.u2, this.r1, this.u0, this.r0]
        );
        this.tiles[27] = new Tile(
            this.tileImages[27],
            [this.sc1, this.sn, this.sb1, this.sbc2],
            [this.u2, this.r1, this.u0, this.r0]
        );
        this.tiles[28] = new Tile(
            this.tileImages[28],
            [this.sn, this.sc2, this.sb1, this.sbc2],
            [this.u2, this.r1, this.u0, this.r0]
        );
        this.tiles[29] = new Tile(
            this.tileImages[29],
            [this.sn, this.sn, this.sb1, this.sbc2],
            [this.u2, this.r1, this.u0, this.r0]
        );
        this.tiles[30] = new Tile(
            this.tileImages[30],
            [this.sc2, this.sc2, this.sc2, this.sc2],
            [this.u2, this.r2, this.u2, this.r2]
        );
        this.tiles[31] = new Tile(
            this.tileImages[31],
            [this.sc2, this.sc2, this.sc2, this.sn],
            [this.u2, this.r2, this.u2, this.r2]
        );
        this.tiles[32] = new Tile(
            this.tileImages[32],
            [this.sc2, this.sc2, this.sn, this.sn],
            [this.u2, this.r2, this.u2, this.r2]
        );
        this.tiles[33] = new Tile(
            this.tileImages[33],
            [this.sc2, this.sn, this.sc2, this.sn],
            [this.u2, this.r2, this.u2, this.r2]
        );
        this.tiles[34] = new Tile(
            this.tileImages[34],
            [this.sc2, this.sn, this.sn, this.sn],
            [this.u2, this.r2, this.u2, this.r2]
        );
        this.tiles[35] = new Tile(
            this.tileImages[35],
            [this.sn, this.sn, this.sn, this.sn],
            [this.u2, this.r2, this.u2, this.r2]
        );
        this.tiles[36] = new Tile(
            this.tileImages[36],
            [this.sc2, this.sc2, this.sbc1, this.sbc2],
            [this.u2, this.r2, this.u0, this.r0]
        );
        this.tiles[37] = new Tile(
            this.tileImages[37],
            [this.sc2, this.sn, this.sbc1, this.sbc2],
            [this.u2, this.r2, this.u0, this.r0]
        );
        this.tiles[38] = new Tile(
            this.tileImages[38],
            [this.sn, this.sc2, this.sbc1, this.sbc2],
            [this.u2, this.r2, this.u0, this.r0]
        );
        this.tiles[39] = new Tile(
            this.tileImages[39],
            [this.sn, this.sn, this.sbc1, this.sbc2],
            [this.u2, this.r2, this.u0, this.r0]
        );
        this.tiles[40] = new Tile(
            this.tileImages[40],
            [this.sc1, this.sbc1, this.sb, this.sbc2],
            [this.u2, this.r0, this.u0, this.r0]
        );
        this.tiles[41] = new Tile(
            this.tileImages[41],
            [this.sn, this.sbc1, this.sb, this.sbc2],
            [this.u2, this.r0, this.u0, this.r0]
        );
        this.tiles[42] = new Tile(
            this.tileImages[42],
            [this.sb, this.sb, this.sb, this.sb],
            [this.u0, this.r0, this.u0, this.r0]
        );
        this.tiles[43] = new Tile(
            this.tileImages[43],
            [this.sc1, this.sn, this.sc2, this.sn],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[44] = new Tile(
            this.tileImages[44],
            [this.sc2, this.sc1, this.sc1, this.sc1],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[45] = new Tile(
            this.tileImages[45],
            [this.sc2, this.sc2, this.sc1, this.sc1],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[46] = new Tile(
            this.tileImages[46],
            [this.sc2, this.sc2, this.sc2, this.sc1],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[47] = new Tile(
            this.tileImages[47],
            [this.sn, this.sc1, this.sc1, this.sc2],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[48] = new Tile(
            this.tileImages[48],
            [this.sn, this.sc1, this.sc2, this.sc2],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[49] = new Tile(
            this.tileImages[49],
            [this.sn, this.sc2, this.sc1, this.sc1],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[50] = new Tile(
            this.tileImages[50],
            [this.sn, this.sc2, this.sc2, this.sc1],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[51] = new Tile(
            this.tileImages[51],
            [this.sn, this.sn, this.sc1, this.sc2],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[52] = new Tile(
            this.tileImages[52],
            [this.sn, this.sn, this.sc2, this.sc1],
            [this.u1, this.r1, this.u1, this.r1]
        );
        this.tiles[53] = new Tile(
            this.tileImages[53],
            [this.sc2, this.sb1, this.sb, this.sb2],
            [this.u1, this.r0, this.u0, this.r0]
        );

        for (let i = 1; i < 4; i++) {
            for (let j = 0; j < 54; j++) {
                this.tiles.push(this.tiles[j].rotate(i));
            }
        }

        // Generate the adjacency rules based on edges
        for (let i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i];
            tile.analyze(this.tiles);
        }

        this.startOver();
    }

    startOver() {
        this.wfcIterCount = 0;
        this.selectedArr = [];

        let xOffset = this.cellSize[0] * (this.DIM - 1) * 0.5;
        let yOffset = this.cellSize[1] * (this.DIM - 1) * 0.5;
        // Create cell for each spot on the grid
        for (let i = 0; i < this.DIM * this.DIM; i++) {
            this.grid[i] = new Cell(
                this.tiles.length,
                this.cellSize[0],
                this.cellSize[1]
            );
            let pos = [i % this.DIM, parseInt(i / this.DIM)];
            //console.log(pos);
            this.grid[i].setPos([pos[0], pos[1]]);
            this.grid[i].setMeshPos([
                pos[0] * this.cellSize[0] - xOffset,
                pos[1] * this.cellSize[1] - yOffset,
            ]);
        }
    }

    checkValid(options, validOptions) {
        for (let i = options.length - 1; i >= 0; i--) {
            // VALID: [BLANK, RIGHT]
            // ARR : [BLANK, UP, RIGHT, DOWN, LEFT]
            // result in removing UP, DOWN, LEFT
            let element = options[i];
            if (!validOptions[element]) {
                options.splice(i, 1);
            }
        }
    }

    isInGrid(pos) {
        return (
            pos[0] >= 0 && pos[0] < this.DIM && pos[1] >= 0 && pos[1] < this.DIM
        );
    }

    randomFromArray(arr) {
        let randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    }

    waveFunctionCollapseSingleIteration() {
        this.wfcIterCount++;
        // Pick cell with least entropy
        // 그리드 분리 코드
        let gridCopy = this.grid.slice();
        gridCopy = gridCopy.filter((a) => !a.collapsed);
        gridCopy.sort((a, b) => {
            return a.options.length - b.options.length;
        });

        if (gridCopy.length === 0) {
            return;
        }

        let len = gridCopy[0].options.length;
        let stopIndex = 0;
        for (let i = 1; i < gridCopy.length; i++) {
            if (gridCopy[i].options.length > len) {
                stopIndex = i;
                break;
            }
        }
        if (stopIndex > 0) gridCopy.splice(stopIndex);

        // 선택 코드
        const cell = this.randomFromArray(gridCopy);
        this.selectedArr.push(cell);
        cell.collapsed = true;
        const pick = this.randomFromArray(cell.options);

        if (pick === undefined) {
            this.startOver();
            return;
        }

        cell.options = [pick];
        // cell의 옵션이 선택됐으므로 바로 그리면 됨.
        //image(tiles[cell.options[0]].img, cell.pos[0] * w, cell.pos[1] * h, w, h);
        // 일단 붕괴한 거의 주변 타일을 전부 고른다.
        // 붕괴한 주위 타일만 갱신함

        // 다음번 그리드 갱신하는 함수
        // 다음번에 방문할 타일 작성
        const nextGrid = this.grid.slice();
        const toVisit = [];
        for (let j = 0; j < this.DIM; j++) {
            for (let i = 0; i < this.DIM; i++) {
                for (let dir = 0; dir < 4; dir++) {
                    let pos = [
                        i + WFCFloorMesh.dx[dir],
                        j + WFCFloorMesh.dy[dir],
                    ];
                    let index = pos[0] + pos[1] * this.DIM;
                    if (
                        this.isInGrid(pos) &&
                        !nextGrid[index].collapsed &&
                        !toVisit.includes(index)
                    ) {
                        toVisit.push(index);
                    }
                }
            }
        }

        // 방문할 타일 전부 순회하면서 갱신
        for (let i = 0; i < toVisit.length; i++) {
            let cur = nextGrid[toVisit[i]];
            let curPos = cur.pos;
            let curIndex = curPos[0] + curPos[1] * this.DIM;

            let options = new Array(this.tiles.length).fill(0).map((x, i) => i);
            // 주변 4방향 타일 보고 갱신
            // 주위 타일이 붕괴 안했어도 원래는 체크 해야하는데
            // 안하고 다시 그리는게 훨씬 빨리 그려지네
            // 사실 변화가 모든 타일에 있을것이나
            // BFS 마냥 검색할거기 때문에 주위타일은 나중에 갱신해도 됨
            for (let dir = 0; dir < 4; dir++) {
                let pos = [
                    curPos[0] + WFCFloorMesh.dx[dir],
                    curPos[1] + WFCFloorMesh.dy[dir],
                ];
                let index = pos[0] + pos[1] * this.DIM;
                if (this.isInGrid(pos) && nextGrid[index].collapsed) {
                    let value = nextGrid[index];
                    let validOptions = new Array(this.tiles.length).fill(false);
                    for (let option of value.options) {
                        let valid =
                            this.tiles[option].constraint[(dir + 2) % 4];
                        // validOptions = validOptions.concat(valid);
                        for (let k = 0; k < this.tiles.length; k++) {
                            validOptions[valid[k]] = true;
                        }
                    }
                    this.checkValid(options, validOptions);
                }
            }

            // nextGrid[curIndex] = new Cell(options);
            nextGrid[curIndex].options = options;
            // 내부코드는 여기까지
        }
        this.grid = nextGrid;
    }

    calcBuildingTransform() {
        let buildingTransform = [];
        let visited = new Array(this.DIM * this.DIM).fill().map(() => false);

        for (let j = 0; j < this.DIM; j++) {
            for (let i = 0; i < this.DIM; i++) {
                let index = i + j * this.DIM;
                let gridCnt = [0, 0];
                let buildingPos = [0, 0];
                let buildingSpace = [0, 0];

                // 방문안한 타일이면 방문한다 했으면 스킵
                if (visited[index]) continue;

                if (
                    this.tiles[this.grid[index].options[0]].buildingSpace[1] ===
                    this.r0
                ) {
                    let insideIndex = index;
                    do {
                        if (insideIndex >= (j + 1) * this.DIM) break;
                        gridCnt[0]++;
                        buildingSpace[0] +=
                            this.tiles[this.grid[insideIndex].options[0]]
                                .buildingSpace[1] +
                            this.tiles[this.grid[insideIndex].options[0]]
                                .buildingSpace[3];
                    } while (
                        this.tiles[this.grid[insideIndex++].options[0]]
                            .buildingSpace[1] === this.r0
                    );
                } else {
                    buildingSpace[0] =
                        this.tiles[this.grid[index].options[0]]
                            .buildingSpace[1] +
                        this.tiles[this.grid[index].options[0]]
                            .buildingSpace[3];
                }
                if (
                    this.tiles[this.grid[index].options[0]].buildingSpace[2] ===
                    this.u0
                ) {
                    let insideIndex = index - this.DIM;
                    do {
                        insideIndex += this.DIM;
                        if (insideIndex >= this.DIM * this.DIM) break;
                        gridCnt[1]++;
                        buildingSpace[1] +=
                            this.tiles[this.grid[insideIndex].options[0]]
                                .buildingSpace[0] +
                            this.tiles[this.grid[insideIndex].options[0]]
                                .buildingSpace[2];
                    } while (
                        this.tiles[this.grid[insideIndex].options[0]]
                            .buildingSpace[2] === this.u0
                    );
                } else {
                    buildingSpace[1] =
                        this.tiles[this.grid[index].options[0]]
                            .buildingSpace[0] +
                        this.tiles[this.grid[index].options[0]]
                            .buildingSpace[2];
                }

                let cellMaxHeight = this.grid[index].maxHeight;
                let cellMinHeight = this.grid[index].minHeight;
                if (gridCnt[0] > 0 || gridCnt[1] > 0) {
                    let iMax = Math.max(1, gridCnt[0]);
                    let jMax = Math.max(1, gridCnt[1]);
                    for (let jj = 0; jj < jMax; jj++) {
                        for (let ii = 0; ii < iMax; ii++) {
                            visited[i + ii + (j + jj) * this.DIM] = true;
                            cellMaxHeight = Math.max(cellMaxHeight,this.grid[i + ii + (j + jj) * this.DIM].maxHeight);
                            cellMinHeight = Math.min(cellMinHeight,this.grid[i + ii + (j + jj) * this.DIM].minHeight);
                        }
                    }
                    buildingPos = [
                        (i - 0.5) * this.cellSize[0] -
                            this.tiles[this.grid[index].options[0]].buildingSpace[3] +
                            buildingSpace[0] * 0.5,
                        (j - 0.5) * this.cellSize[1] -
                            this.tiles[this.grid[index].options[0]].buildingSpace[0] +
                            buildingSpace[1] * 0.5,
                    ];
                } else {
                    buildingPos = [
                        (i - 0.5) * this.cellSize[0],
                        (j - 0.5) * this.cellSize[1],
                    ];
                }

                buildingTransform.push([
                    buildingPos[0],
                    buildingPos[1],
                    buildingSpace[0],
                    buildingSpace[1],
                    Math.random() < this.spawnProbablity,
                    cellMaxHeight, cellMinHeight
                ]);
            }
        }
        //console.log(buildingTransform);
        return buildingTransform;
    }

    createFloor() {
        this.startOver();
        while (this.wfcIterCount !== this.DIM * this.DIM)
            this.waveFunctionCollapseSingleIteration();
    }

    buildMesh() {
        //console.log(selectedArr);
        for (let i = 0; i < this.selectedArr.length; i++) {
            let currentCell = this.selectedArr[i];
            // image to be used as texture
            let currentCellTile = this.tiles[currentCell.options[0]];

            // number of rotation the cell mesh should have
            let currentCellTileRotation = currentCellTile.imageRotationNum;
            //console.log(currentCellTileRotation);
            currentCell.setTexture(currentCellTile.img);

            // 도로 텍스쳐 타일은 따로 세팅해줘야함 -> 같이 회전시켜주면 seamless texture가 쓸모없게 됨
            currentCell.setRoadTexture(this.roadTileTexture);
            currentCell.setRotationNum(currentCellTileRotation);
            currentCell.buildMesh();

            this.cellMeshGroup.add(currentCell.getMesh());
            //currentCell.addToScene(currentScene);
        }
    }

    getMeshGroup() {
        return this.cellMeshGroup;
    }

    addToScene(scene) {
        /*
        for (let i = 0; i < this.selectedArr.length; i++){
			let currentCell = this.selectedArr[i];
			currentCell.addToScene(scene);
		}
        */
        scene.add(this.cellMeshGroup);
    }
}

WFCFloorMesh.dx = [0, 1, 0, -1];
WFCFloorMesh.dy = [-1, 0, 1, 0];
