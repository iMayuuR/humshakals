import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { verifyRelease } from '../scripts/verify-release.mjs'

const hash = (data) => createHash('sha256').update(data).digest('hex')

function fixture() {
  const tag = 'v9.0.0'
  const files = new Map([
    ['Humshakals-Setup-9.0.0.exe', 'windows binary'],
    ['Humshakals-Setup-9.0.0.exe.blockmap', 'windows blockmap'],
    ['Humshakals-9.0.0-universal.dmg', 'mac disk image'],
    ['Humshakals-9.0.0-universal.dmg.blockmap', 'mac disk image blockmap'],
    ['Humshakals-9.0.0-universal-mac.zip', 'mac zip'],
    ['Humshakals-9.0.0-universal-mac.zip.blockmap', 'mac zip blockmap'],
    ['latest.yml', 'version: 9.0.0\npath: Humshakals-Setup-9.0.0.exe\n'],
    ['latest-mac.yml', 'version: 9.0.0\npath: Humshakals-9.0.0-universal-mac.zip\n']
  ])
  const manifest = [...files].map(([name, data]) => `${hash(data)}  ${name}`).join('\n') + '\n'
  files.set('SHA256SUMS.txt', manifest)
  return {
    tag,
    release: {
      tag_name: tag,
      draft: true,
      prerelease: false,
      assets: [...files].map(([name, data]) => ({ name, size: Buffer.byteLength(data), state: 'uploaded', digest: `sha256:${hash(data)}` }))
    },
    manifest,
    winMetadata: files.get('latest.yml'),
    macMetadata: files.get('latest-mac.yml')
  }
}

test('accepts an exact release-asset set and matching updater metadata', () => {
  assert.equal(verifyRelease(fixture()).assetCount, 9)
})

test('rejects a published release or wrong tag', () => {
  const published = fixture()
  published.release.draft = false
  assert.throws(() => verifyRelease(published), /unpublished/)
  const wrongTag = fixture()
  wrongTag.tag = 'v9.0.1'
  assert.throws(() => verifyRelease(wrongTag), /unpublished/)
})

test('rejects tampered manifest, missing assets and wrong updater version', () => {
  const tampered = fixture()
  tampered.manifest += 'bad\n'
  assert.throws(() => verifyRelease(tampered), /Manifest digest/)
  const missing = fixture()
  missing.release.assets.pop()
  assert.throws(() => verifyRelease(missing), /exactly 9/)
  const wrongVersion = fixture()
  wrongVersion.winMetadata = 'version: 9.0.1\npath: Humshakals-Setup-9.0.0.exe\n'
  wrongVersion.release.assets.find((asset) => asset.name === 'latest.yml').digest = `sha256:${hash(wrongVersion.winMetadata)}`
  wrongVersion.manifest = wrongVersion.manifest.replace(
    /^([a-f0-9]{64})  latest\.yml$/m,
    `${hash(wrongVersion.winMetadata)}  latest.yml`
  )
  wrongVersion.release.assets.find((asset) => asset.name === 'SHA256SUMS.txt').digest = `sha256:${hash(wrongVersion.manifest)}`
  assert.throws(() => verifyRelease(wrongVersion), /Wrong updater version/)
})
