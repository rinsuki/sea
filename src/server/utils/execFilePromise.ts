import { spawn, execFile } from "child_process"

export function execFilePromise(cmd: string, args: string[]) {
    return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        execFile(cmd, args, (err, stdout, stderr) => {
            if (err) return reject(err)
            resolve({ stdout, stderr })
        })
    })
}
