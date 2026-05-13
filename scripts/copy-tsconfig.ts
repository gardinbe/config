import { cp, mkdir } from 'node:fs/promises'

await mkdir('dist/tsconfig', { recursive: true })
await cp('src/tsconfig', 'dist/tsconfig', { recursive: true })
