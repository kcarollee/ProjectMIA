function reverseString(s) {
    let arr = s.split("");
    arr = arr.reverse();
    return arr.join("");
}

function compareEdge(a, b) {
    return a === reverseString(b);
}

export default class Tile {
    static size = [0, 0];
    constructor(img, edges, buildingSpace, imageRotationNum = 0) {
        this.img = img;
        this.edges = edges;
        this.buildingSpace = buildingSpace;
        this.constraint = [[], [], [], []];
        this.imageRotationNum = imageRotationNum;
    }

    rotate(num) {
        const newEdges = [];
        const newBuildingSpace = [];
        let len = this.edges.length;
        for (let i = 0; i < len; i++) {
            newEdges[i] = this.edges[(i - num + len) % len];
            newBuildingSpace[i] = this.buildingSpace[(i - num + len) % len];
        }
        return new Tile(this.img, newEdges, newBuildingSpace, num);
    }

    analyze(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];
            for (let j = 0; j < 4; j++) {
                if (compareEdge(tile.edges[(j + 2) % 4], this.edges[j])) {
                    this.constraint[j].push(i);
                }
            }
        }
    }
}
