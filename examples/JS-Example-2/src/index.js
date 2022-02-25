var path = require("path");
var Skeleton = require("skeleton-code-generator");

const folderToGenerate = path.join(__dirname, "generationExample");
const folderSkeleton = {
    name: 'RootFolder',
    files: [

    ],
    subfolders: [
        {
            name: 'ChildFolder1',
            files: [
                {
                    name: "File 1-1.txt",
                    content: "File 1-1 text content"
                },
                {
                    name: "File 1-2.txt",
                    content: "File 1-2 text content"
                }
            ],
        },
        {
            name: 'ChildFolder2',
            files: [
                {
                    name: "File 2-1.txt",
                    content: "File 2- 1 text content"
                },
                {
                    name: "File 2-2.txt",
                    content: "File 2-2 text content"
                },
                {
                    name: "File 2-3.txt",
                    content: "File 2-3 text content"
                },
                {
                    name: "File 2-4.txt",
                    content: "File 2-4 text content"
                }
            ],
        },
        {
            name: 'ChildFolder3',
            files: [
                {
                    name: "File 3-1.txt",
                    content: "File 3- 1 text content"
                }
            ],
            subfolders: [
                {
                    name: 'ChildFolder31',
                    files: [
                        {
                            name: "File 31-1.txt",
                            content: "File 31-1 text content"
                        },
                        {
                            name: "File 31-2.txt",
                            content: "File 31-2 text content"
                        }
                    ],
                }
            ]
        }
    ]
}
Skeleton.generateFromJSON(folderToGenerate, folderSkeleton)