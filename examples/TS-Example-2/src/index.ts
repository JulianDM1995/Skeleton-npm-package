import * as path from "path";
import Skeleton, { FolderSkeleton } from "skeleton-code-generator";

const folderToGenerate = path.join(__dirname, "generationExample");
const folderSkeleton: FolderSkeleton = {
    name: 'RootFolder',
    files: [
        {
            name: "File 0-1.txt",
            content: "File 0-1 text content"
        },
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
        }
    ]
}
Skeleton.generateFromJSON(folderToGenerate, folderSkeleton)