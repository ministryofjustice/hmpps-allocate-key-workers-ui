#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const { sep } = require('path')

const FORBIDDEN_HARDCODES = /(key worker|personal officer)/i
const FILE_INCLUDES = [/\.ts$/i, /\.njk$/i]
const FILE_EXCLUDES = [/integration_tests/i, /\.cy\.ts$/i, /\.d\.ts$/i]

const IGNORE_PATTERNS = fs.existsSync(`${__dirname}${sep}.hardcodecheckignore`)
  ? fs
      .readFileSync(`${__dirname}${sep}.hardcodecheckignore`, 'utf-8')
      .split('\n')
      .slice(1)
      .filter(Boolean)
      .map(line => new RegExp(line))
  : []

try {
  const output = execSync('git ls-files', { encoding: 'utf-8' })
  const files = output
    .split('\n')
    .map(f => f.trim())
    .filter(f => FILE_INCLUDES.some(re => re.test(f)) && !FILE_EXCLUDES.some(re => re.test(f)))

  const matches = []

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n')
    lines.forEach((line, i) => {
      if (FORBIDDEN_HARDCODES.test(line) && !shouldIgnore(file, line)) {
        matches.push(`${file}:${i + 1}: ${line.trim()}`)
      }
    })
  }

  if (matches.length > 0) {
    console.error(`❌ Found ${matches.length} hardcoded policy names in the following files:`)
    matches.forEach(m => console.error(m))
    process.exit(1)
  } else {
    console.log('✅ No hardcoded policy names found.')
    process.exit(0)
  }
} catch (err) {
  console.error('⚠️ Error checking for hardcoded policy names:', err.message)
  process.exit(1)
}

function shouldIgnore(filePath, line) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath) || pattern.test(line))
}
