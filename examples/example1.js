[
    {
        "id": "2c344de681229d5c",
        "type": "inject",
        "z": "74b480323f56ea4f",
        "name": "inject msg.job",
        "props": [
            {
                "p": "job.payload",
                "v": "{\"some\":\"field\"}",
                "vt": "json"
            },
            {
                "p": "job.tube",
                "v": "default",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "x": 170,
        "y": 1380,
        "wires": [
            [
                "a4a520595b5f21be"
            ]
        ]
    },
    {
        "id": "bc91819b62c3d9c4",
        "type": "debug",
        "z": "74b480323f56ea4f",
        "name": "DEBUG",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 860,
        "y": 1440,
        "wires": []
    },
    {
        "id": "acb07c3edec11d6c",
        "type": "delete",
        "z": "74b480323f56ea4f",
        "name": "",
        "x": 690,
        "y": 1580,
        "wires": [
            [
                "bc91819b62c3d9c4"
            ],
            [
                "bc91819b62c3d9c4"
            ]
        ]
    },
    {
        "id": "a4a520595b5f21be",
        "type": "put",
        "z": "74b480323f56ea4f",
        "server": "8426c968fa33ed63",
        "tube": "cona",
        "name": "",
        "x": 410,
        "y": 1380,
        "wires": [
            [
                "bc91819b62c3d9c4"
            ],
            [
                "bc91819b62c3d9c4"
            ]
        ]
    },
    {
        "id": "66e25ce1cfe72958",
        "type": "release",
        "z": "74b480323f56ea4f",
        "name": "",
        "x": 600,
        "y": 1460,
        "wires": [
            [
                "bc91819b62c3d9c4"
            ],
            [
                "bc91819b62c3d9c4"
            ]
        ]
    },
    {
        "id": "f03b3e56bca02f71",
        "type": "change",
        "z": "74b480323f56ea4f",
        "name": "",
        "rules": [
            {
                "t": "set",
                "p": "job.delay",
                "pt": "msg",
                "to": "10",
                "tot": "num"
            }
        ],
        "action": "",
        "property": "",
        "from": "",
        "to": "",
        "reg": false,
        "x": 410,
        "y": 1460,
        "wires": [
            [
                "66e25ce1cfe72958"
            ]
        ]
    },
    {
        "id": "3c472c058092e85f",
        "type": "reserve job",
        "z": "74b480323f56ea4f",
        "server": "8426c968fa33ed63",
        "name": "",
        "x": 370,
        "y": 1560,
        "wires": [
            [
                "acb07c3edec11d6c"
            ],
            []
        ]
    },
    {
        "id": "bd49f8e747ac5653",
        "type": "inject",
        "z": "74b480323f56ea4f",
        "name": "inject msg.job",
        "props": [
            {
                "p": "job.id",
                "v": "84",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "x": 170,
        "y": 1560,
        "wires": [
            [
                "3c472c058092e85f"
            ]
        ]
    },
    {
        "id": "4ab27df935de2ae4",
        "type": "debug",
        "z": "74b480323f56ea4f",
        "name": "DEBUG 2",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 680,
        "y": 1780,
        "wires": []
    },
    {
        "id": "f05c9be3057e3560",
        "type": "reserve tube",
        "z": "74b480323f56ea4f",
        "server": "8426c968fa33ed63",
        "tube": "default",
        "name": "",
        "x": 190,
        "y": 1680,
        "wires": [
            [
                "176edc0ccf019245"
            ]
        ]
    },
    {
        "id": "176edc0ccf019245",
        "type": "bury",
        "z": "74b480323f56ea4f",
        "name": "",
        "x": 390,
        "y": 1780,
        "wires": [
            [
                "bc197db0a364280e"
            ],
            [
                "4ab27df935de2ae4"
            ]
        ]
    },
    {
        "id": "d5b67401ae3a47ac",
        "type": "kick job",
        "z": "74b480323f56ea4f",
        "name": "",
        "x": 400,
        "y": 1840,
        "wires": [
            [],
            [
                "4ab27df935de2ae4"
            ]
        ]
    },
    {
        "id": "bc197db0a364280e",
        "type": "delay",
        "z": "74b480323f56ea4f",
        "name": "",
        "pauseType": "delay",
        "timeout": "1",
        "timeoutUnits": "seconds",
        "rate": "1",
        "nbRateUnits": "1",
        "rateUnits": "second",
        "randomFirst": "1",
        "randomLast": "5",
        "randomUnits": "seconds",
        "drop": false,
        "allowrate": false,
        "outputs": 1,
        "x": 540,
        "y": 1680,
        "wires": [
            [
                "acb07c3edec11d6c"
            ]
        ]
    },
    {
        "id": "8426c968fa33ed63",
        "type": "beanstalkd_server",
        "host": "localhost",
        "port": "11300"
    }
]