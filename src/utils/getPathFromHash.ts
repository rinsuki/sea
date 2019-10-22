import path from "path"

export function getPathFromHash(hash: string): string {
    var pathList = ["files", "s5"]
    pathList.push(hash.slice(0, 2))
    pathList.push(hash.slice(2, 4))
    pathList.push(hash.slice(4))
    return path.join(...pathList)
}
