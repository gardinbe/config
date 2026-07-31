import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const cwd = join(import.meta.dirname, '..')
const packageJsonPath = join(cwd, 'package.json')

const run = (command: string, args: Array<string> = []) => {
  console.log(`> ${command} ${args.join(' ')}`)
  execFileSync(command, args, { cwd, stdio: 'inherit' })
}

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

run(pnpm, ['build'])

const contents = readFileSync(packageJsonPath, 'utf8')

type Package = {
  author: string
  name: string
  version: string
}

// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const pkg = JSON.parse(contents) as Package

if (pkg.version === undefined) {
  throw new Error('package.json must contain a valid version')
}

const match = pkg.version.match(/^(\d+)\.(\d+)\.(\d+)$/)

if (!match) {
  throw new Error(`Invalid version: ${pkg.version}`)
}

const [, major, minor, patch] = match
const newVersion = `${major}.${minor}.${Number(patch) + 1}`

pkg.version = newVersion

writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`)

run('git', ['add', '-A'])
run('git', ['commit', '-m', `version ${newVersion}`])
run('git', ['tag', `v${newVersion}`])

console.log(`Created version ${newVersion}. Nothing was pushed.`)
