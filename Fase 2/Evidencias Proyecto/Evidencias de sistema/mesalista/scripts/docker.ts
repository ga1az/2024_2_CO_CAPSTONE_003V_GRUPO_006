import { $, type ShellPromise } from 'bun'

const ops = <ShellPromise[]>[]

ops.push($`bun run docker:web`)
ops.push($`bun run docker:server`)
ops.push($`bun run docker:admin`)

await Promise.all(ops)
