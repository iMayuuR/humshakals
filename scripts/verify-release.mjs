import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex')
}

export function verifyRelease({ tag, release, manifest, winMetadata, macMetadata }) {
  assert(/^v\d+\.\d+\.\d+$/.test(tag), 'Expected a stable vX.Y.Z release tag')
  assert(release.tag_name === tag && release.draft === true && release.prerelease === false,
    'Release must be the requested unpublished stable draft')

  const version = tag.slice(1)
  const windowsInstaller = `Humshakals-Setup-${version}.exe`
  const macDmg = `Humshakals-${version}-universal.dmg`
  const macZip = `Humshakals-${version}-universal-mac.zip`
  const manifestName = 'SHA256SUMS.txt'
  const expected = new Set([
    windowsInstaller, `${windowsInstaller}.blockmap`,
    macDmg, `${macDmg}.blockmap`,
    macZip, `${macZip}.blockmap`,
    'latest.yml', 'latest-mac.yml', manifestName
  ])
  assert(Array.isArray(release.assets) && release.assets.length === expected.size,
    `Expected exactly ${expected.size} public release assets`)
  const assets = new Map()
  for (const asset of release.assets) {
    assert(expected.has(asset.name) && !assets.has(asset.name), `Unexpected or duplicate asset: ${asset.name}`)
    assert(asset.state === 'uploaded' && Number.isSafeInteger(asset.size) && asset.size > 0,
      `Asset is not fully uploaded: ${asset.name}`)
    assert(/^sha256:[a-f0-9]{64}$/.test(asset.digest), `Missing SHA-256 digest: ${asset.name}`)
    assets.set(asset.name, asset)
  }

  const manifestBytes = Buffer.isBuffer(manifest) ? manifest : Buffer.from(manifest)
  assert(`sha256:${sha256(manifestBytes)}` === assets.get(manifestName).digest,
    'Manifest digest differs from the uploaded asset')
  const listed = new Map()
  for (const line of manifestBytes.toString('utf8').trimEnd().split('\n')) {
    const match = /^([a-f0-9]{64})  ([A-Za-z0-9._-]+)$/.exec(line)
    assert(match, 'Manifest contains a malformed checksum line')
    const [, digest, name] = match
    assert(name !== manifestName && expected.has(name) && !listed.has(name),
      `Manifest contains an unexpected or duplicate file: ${name}`)
    listed.set(name, digest)
  }
  assert(listed.size === expected.size - 1, 'Manifest does not cover every non-manifest asset')
  for (const [name, digest] of listed) {
    assert(`sha256:${digest}` === assets.get(name).digest, `Checksum mismatch: ${name}`)
  }

  for (const [name, data, requiredFile] of [
    ['latest.yml', winMetadata, windowsInstaller],
    ['latest-mac.yml', macMetadata, macZip]
  ]) {
    const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data)
    assert(`sha256:${sha256(bytes)}` === assets.get(name).digest, `Downloaded metadata mismatch: ${name}`)
    const text = bytes.toString('utf8')
    const match = /^version:\s*([^\r\n]+)$/m.exec(text)
    assert(match && match[1].trim().replace(/^['"]|['"]$/g, '') === version,
      `Wrong updater version in ${name}`)
    assert(text.includes(requiredFile), `Expected installer is absent from ${name}`)
  }

  return { tag, assetCount: assets.size }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [, , tag, releaseFile, manifestFile, winFile, macFile] = process.argv
    assert(tag && releaseFile && manifestFile && winFile && macFile,
      'Usage: node verify-release.mjs TAG RELEASE_JSON SHA256SUMS latest.yml latest-mac.yml')
    const result = verifyRelease({
      tag,
      release: JSON.parse(readFileSync(releaseFile, 'utf8')),
      manifest: readFileSync(manifestFile),
      winMetadata: readFileSync(winFile),
      macMetadata: readFileSync(macFile)
    })
    console.log(`Verified ${result.tag}: ${result.assetCount} draft assets and updater metadata`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
