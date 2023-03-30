// Set up Three.js scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Define city parameters
var gridSize = 20;
var blockWidth = 2;
var numBuildingBlocks = 3;
var patterns = [
    [
        [1, 1],
        [1, 1]
    ],
    [
        [1, 1, 1],
        [0, 1, 0]
    ],
    [
        [1, 0],
        [1, 1]
    ],
];

// Create building blocks
var blocks = [];
for (var i = 0; i < numBuildingBlocks; i++) {
    var pattern = patterns[i];
    var blockGeometry = new THREE.BoxGeometry(blockWidth * pattern[0].length, blockWidth, blockWidth * pattern.length);
    var blockMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });
    var block = new THREE.Mesh(blockGeometry, blockMaterial);
    block.visible = false; // hide block until selected
    blocks.push({
        pattern: pattern,
        mesh: block
    });
}

// Create grid for WFC
var grid = [];
for (var i = 0; i < gridSize; i++) {
    grid.push([]);
    for (var j = 0; j < gridSize; j++) {
        grid[i].push(null);
    }
}

// WFC generation function
function generateGrid() {
    // Initialize grid with random block
    var startBlock = Math.floor(Math.random() * numBuildingBlocks);
    var startPattern = blocks[startBlock].pattern;
    for (var i = 0; i < gridSize; i++) {
        for (var j = 0; j < gridSize; j++) {
            grid[i][j] = startPattern;
        }
    }

    // Collapse wave of possibilities until only one solution remains
    while (true) {
        // Select the cell with the lowest entropy (i.e., fewest possible patterns)
        var lowestEntropy = null;
        var lowestCell = null;
        for (var i = 0; i < gridSize; i++) {
            for (var j = 0; j < gridSize; j++) {
                if (grid[i][j] === null) {
                    var possiblePatterns = getPossiblePatterns(i, j);
                    if (possiblePatterns.length === 0) {
                        return; // no possible solutions
                    }
                    var entropy = possiblePatterns.length;
                    if (lowestEntropy === null || entropy < lowestEntropy) {
                        lowestEntropy = entropy;
                        lowestCell
                            = {
                                x: i,
                                y: j
                            };
                    }
                }
            }
        }

        // If only one pattern is possible, select it and continue
        var possiblePatterns = getPossiblePatterns(lowestCell.x, lowestCell.y);
        if (possiblePatterns.length === 1) {
            var pattern = possiblePatterns[0];
            grid[lowestCell.x][lowestCell.y] = pattern;
            continue;
        }

        // Otherwise, randomly select one of the possible patterns and collapse the wave
        var patternIndex = Math.floor(Math.random() * possiblePatterns.length);
        var pattern = possiblePatterns[patternIndex];
        grid[lowestCell.x][lowestCell.y] = pattern;
        collapseWave(lowestCell.x, lowestCell.y, pattern);
    }
}

// Helper function to get possible patterns for a cell based on its neighbors
function getPossiblePatterns(x, y) {
    var possiblePatterns = [];
    for (var i = 0; i < numBuildingBlocks; i++) {
        var pattern = blocks[i].pattern;
        if (canFitPattern(x, y, pattern)) {
            possiblePatterns.push(pattern);
        }
    }
    return possiblePatterns;
}

// Helper function to check if a pattern can fit in a cell based on its neighbors
function canFitPattern(x, y, pattern) {
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) {
                continue;
            }
            var neighborX = x + i;
            var neighborY = y + j;
            if (neighborX < 0 || neighborX >= gridSize || neighborY < 0 || neighborY >= gridSize) {
                continue;
            }
            var neighborPattern = grid[neighborX][neighborY];
            if (neighborPattern === null) {
                continue;
            }
            if (!canPatternsCoexist(pattern, neighborPattern)) {
                return false;
            }
        }
    }
    return true;
}

// Helper function to check if two patterns can coexist based on their overlap
function canPatternsCoexist(pattern1, pattern2) {
    for (var i = -pattern1.length + 1; i < pattern2.length; i++) {
        for (var j = -pattern1[0].length + 1; j < pattern2[0].length; j++) {
            var overlap = false;
            for (var k = 0; k < pattern1.length; k++) {
                for (var l = 0; l < pattern1[0].length; l++) {
                    var x = i + k;
                    var y = j + l;
                    if (x < 0 || x >= pattern2.length || y < 0 || y >= pattern2[0].length) {
                        continue;
                    }
                    if (pattern1[k][l] === 1 && pattern2[x][y] === 1) {
                        overlap = true;
                        break;
                    }
                }
                if (overlap) {
                    break;
                }
            }
            if (overlap && i !== 0 && j !== 0) {
                return false;
            }
        }
    }
    return true;
}

// Helper function to collapse the wave based on a newly selected pattern
function collapseWave(x, y, pattern) {
    for (var i = 0; i < gridSize; i++) {
        for (var j = 0; j < gridSize; j++) {
            if (grid[i][j] === null) {
                var possiblePatterns = getPossiblePatterns(i, j);
                var patternExists = false;
                for (var k = 0; k < possiblePatterns.length; k++) {
                    if (patternsEqual(possiblePatterns[k], pattern)) {
                        patternExists = true;
                        break;
                    }
                }
                if (!patternExists) {
                    grid[i][j] = null;
                }
            }
        }
    }
}

// Helper function to check if two patterns are equal
function patternsEqual(pattern1, pattern2) {
    if (pattern1.length !== pattern2.length || pattern1[0].length !== pattern2[0].length) {
        return false;
    }
    for (var i = 0; i < pattern1.length; i++) {
        for (var j = 0; j < pattern1[0].length; j++) {
            if (pattern1[i][j] !== pattern2[i][j]) {
                return false;
            }
        }
    }
    return true;
}

// Helper function to convert the grid into building meshes
function buildCity() {
    for (var i = 0; i < gridSize; i++) {
        for (var j = 0; j < gridSize; j++) {
            if (grid[i][j] !== null) {
                var pattern = grid[i][j];
                var buildingMesh = buildBuildingMesh(pattern);
                buildingMesh.position.set(i * cellSize, 0, j * cellSize);
                scene.add(buildingMesh);
            }
        }
    }
}

// Helper function to convert a pattern into a building mesh
function buildBuildingMesh(pattern) {
    var geometry = new THREE.BoxGeometry(cellSize * pattern[0].length, cellSize * numFloors, cellSize * pattern.length);
    var material = new THREE.MeshPhongMaterial({
        color: getRandomColor()
    });
    var mesh = new THREE.Mesh(geometry, material);
    for (var i = 0; i < pattern.length; i++) {
        for (var j = 0; j < pattern[0].length; j++) {
            if (pattern[i][j] === 1) {
                var windowGeometry = new THREE.BoxGeometry(cellSize / 4, cellSize / 4, cellSize / 4);
                var windowMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff
                });
                var windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                windowMesh.position.set(
                    (j - (pattern[0].length - 1) / 2) * cellSize,
                    (i + 0.5) * cellSize,
                    (pattern.length / 2 - i - 0.5) * cellSize
                );
                mesh.add(windowMesh);
            }
        }
    }
    return mesh;
}

// Helper function to generate a random color
function getRandomColor() {
    return Math.random() * 0xffffff;
}

// Helper function to animate the scene
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    }
    
    // Initialize the scene
    function init() {
    // Create the scene
    scene = new THREE.Scene();
    
    // Create the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 15, 15);
    
    // Create the renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Create the controls
    //controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    // Add ambient light to the scene
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light to the scene
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    }
    
    // Call the buildCity function to generate the city
    buildCity();

init();
generateCity();
animate();