let rulebook = [
    // 0
    [4, "1a", "1a", "-1", "1", "-2", "1f"],
    [4, "2a", "2a", "-1", "-1", "1", "1f"],
    [1, "-2", "-1", "2s", "2s", "2s", "2s"],
    [3, "1a", "-1", "-1", "3", "2s", "3f"],
    [5, "1d", "2d", "3", "4", "1f", "-1"],
    // 5
    [5, "3a", "1d", "1", "-2", "4f", "3f"],
    [3, "2a", "-1", "-1", "-1", "3", "3f"],
    [3, "3a", "-1", "3", "2s", "2s", "3f"],
    [3, "-2", "2b", "4f", "2s", "2s", "4"],
    [5, "1b", "2a", "3f", "-1", "1", "4f"],
    // 10
    [5, "3b", "1b", "1f", "3", "4", "-2"],
    [5, "3b", "3b", "1f", "1", "-2", "-2"],
    [4, "-2", "1a", "2s", "4", "-2", "4f"],
    [3, "-2", "3b", "4f", "4", "-2", "-2"],
    [3, "1a", "-2", "5s", "6", "-2", "6f"],
    // 15
    [3, "3b", "-2", "6f", "6", "-2", "-2"],
    [1, "-1", "-2", "5s", "5s", "5s", "5s"],
    [3, "-1", "1a", "-1", "7", "5s", "7f"],
    [5, "2d", "1d", "7", "6", "1f", "-1"],
    [5, "1d", "3a", "1", "-2", "6f", "7f"],
    // 20
    [3, "-1", "2a", "-1", "-1", "7", "7f"],
    [3, "-1", "3a", "7", "5s", "5s", "7f"],
    [3, "2a", "-2", "5s", "5s", "6", "6f"],
    [5, "2a", "1b", "7f", "-1", "1", "6f"],
    [5, "1b", "3b", "1f", "7", "6", "-2"],
];

let difficultyInfo = [
    // chapterNum, floorDim, floorSize, buildingDim, buildingHeight

    // 전체 지도 크기 고정 쉬움(챕터별로 하면됨)
    // 이거는 근데 매 스테이지 마다 건물 크기가 바뀌어서 플레이어가 어지러울 수 있다.
    // 12
    [1, 6, 2, [3,3,3], 1.0, 0.9],
    [1, 8, 1.5, [3,3,3], 1.1, 0.9],
    [1, 10, 1.2, [3,3,3], 1.2, 0.7],
    [1, 12, 1, [3,3,3], 1.3, 0.7],

    // 15
    [2, 8, 1.875, [3,3,3], 1.1, 0.6],
    [2, 10, 1.5, [3,3,3], 1.2, 0.6],
    [2, 12, 1.25, [3,3,3], 1.3, 0.5],
    [2, 15, 1, [3,3,3], 1.4, 0.5],

    // 18
    [3, 10, 1.8, [3,3,3], 1.2, 0.4],
    [3, 12, 1.5, [3,3,3], 1.3, 0.4],
    [3, 15, 1.2, [3,3,3], 1.4, 0.3],
    [3, 18, 1, [3,3,3], 1.5, 0.3],

    // 20
    [4, 12, 1.666, [3,3,3], 1.3, 0.2],
    [4, 15, 1.333, [3,3,3], 1.4, 0.2],
    [4, 18, 1.111, [3,3,3], 1.5, 0.1],
    [4, 20, 1, [3,3,3], 1.6, 0.1],
]

let materialInfo = [
    [
        // chapter 1
        [
            0x1D3F9B, 2, 0.1, 0.1,
        ],
        [
            0x01BDEF, 2, 0.1, 0.1,
        ],
        [
            0x4ED612, 2, 0.1, 0.1,
        ],
        [
            0xECCD3F, 2, 0.1, 0.1,
        ],
    ],
    [
        [
            0xA3FFAF, 1.3, 0.2, 0.2,
        ],
        [
            0xFF99D6, 1.3, 0.2, 0.2,
        ],
        [
            0xC5BDFF, 1.3, 0.2, 0.2,
        ],
        [
            0xFFAF94, 1.3, 0.2, 0.2,
        ],
    ],
    [
        [
            0xF9D852, 0.8, 0.2, 0.2,
        ],
        [
            0x280F34, 0.8, 0.2, 0.2,
        ],
        [
            0xB30753, 0.8, 0.2, 0.2,
        ],
        [
            0x07750C, 0.8, 0.2, 0.2,
        ],
    ],
    [
        [
            0x94EFC2, 0.3, 0.3, 0.3,
        ],
        [
            0xA099FF, 0.3, 0.3, 0.3,
        ],
        [
            0x73C8EF, 0.3, 0.3, 0.3,
        ],
        [
            0xFFD0CE, 0.3, 0.3, 0.3,
        ],
    ]
]
