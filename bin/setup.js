#!/usr/bin/env node
// Cross-platform (Linux/macOS/Windows) scaffolder for this template.
// Pure Node stdlib — no dependencies, so `npx github:<owner>/<repo>` works
// with no install step.

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execFileSync } = require('child_process');

const SOURCE_DIR = path.resolve(__dirname, '..');
const EXCLUDE = new Set(['.git', 'node_modules', 'bin', 'package.json', 'package-lock.json']);

// A single shared async-iterator over stdin lines, consumed one prompt at a
// time. Using repeated rl.question() calls is fragile with non-interactive
// stdin (piped input, CI, automation): the interface can auto-close on EOF
// between calls even when a later line is still buffered, silently killing
// every prompt after the one in flight. Pulling from the iterator directly
// avoids that race and degrades to the fallback if input runs out early.
function makePrompter(rl) {
  const lines = rl[Symbol.asyncIterator]();
  return async function ask(question, fallback) {
    process.stdout.write(fallback ? `${question} [${fallback}]: ` : `${question}: `);
    const { value, done } = await lines.next();
    return (done ? '' : value.trim()) || fallback || '';
  };
}

function copyTemplate(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (srcDir === SOURCE_DIR && EXCLUDE.has(entry.name)) continue;
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyTemplate(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function isProbablyText(filePath) {
  return !/\.(png|jpg|jpeg|gif|ico|zip|graphify_version)$/i.test(filePath);
}

function replacePlaceholders(destDir, replacements) {
  for (const file of walkFiles(destDir)) {
    if (!isProbablyText(file)) continue;
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue; // binary file, skip
    }
    let changed = false;
    for (const [placeholder, value] of replacements) {
      if (content.includes(placeholder)) {
        content = content.split(placeholder).join(value);
        changed = true;
      }
    }
    if (changed) fs.writeFileSync(file, content, 'utf8');
  }
}

function promoteExamples(destDir) {
  const memDir = path.join(destDir, '.agents', 'claude-memory');
  if (!fs.existsSync(memDir)) return;
  for (const file of fs.readdirSync(memDir)) {
    if (file.endsWith('.example')) {
      const real = path.join(memDir, file.replace(/\.example$/, ''));
      if (!fs.existsSync(real)) fs.copyFileSync(path.join(memDir, file), real);
    }
  }
  const mcpExample = path.join(destDir, '.mcp.json.example');
  const mcpReal = path.join(destDir, '.mcp.json');
  if (fs.existsSync(mcpExample) && !fs.existsSync(mcpReal)) {
    fs.copyFileSync(mcpExample, mcpReal);
  }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = makePrompter(rl);

  console.log('AI Second Brain — setup\n');
  const targetArg = process.argv[2];
  const targetDir = path.resolve(
    targetArg || (await ask('Where should your vault be created?', './second-brain'))
  );

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    const proceed = await ask(`'${targetDir}' already exists and is not empty. Continue anyway? (y/N)`, 'N');
    if (!/^y/i.test(proceed)) {
      console.log('Aborted.');
      rl.close();
      return;
    }
  }

  const name = await ask('Your name (for memory files / LICENSE)', '<YOUR_NAME>');
  const includeOdoo = await ask('Keep the Odoo example skill pack? (y/N)', 'N');
  const doGitInit = await ask('Run git init + first commit here? (Y/n)', 'Y');
  rl.close();

  console.log(`\nCopying template into ${targetDir} ...`);
  copyTemplate(SOURCE_DIR, targetDir);

  if (!/^y/i.test(includeOdoo)) {
    const odooDir = path.join(targetDir, '.agents', 'skills', 'examples', 'odoo');
    if (fs.existsSync(odooDir)) fs.rmSync(odooDir, { recursive: true, force: true });
  }

  console.log('Filling in placeholders ...');
  replacePlaceholders(targetDir, [
    ['<YOUR_NAME>', name],
    ['<VAULT_ROOT>', targetDir],
  ]);

  console.log('Setting up memory files and MCP config from *.example templates ...');
  promoteExamples(targetDir);

  if (/^y/i.test(doGitInit)) {
    try {
      execFileSync('git', ['init'], { cwd: targetDir, stdio: 'ignore' });
      execFileSync('git', ['add', '-A'], { cwd: targetDir, stdio: 'ignore' });
      execFileSync('git', ['commit', '-m', 'Initial vault setup from ai-second-brain-template'], {
        cwd: targetDir,
        stdio: 'ignore',
      });
      console.log('Initialized a local git repo with one commit.');
    } catch (err) {
      console.log('git init/commit skipped (git not available or failed):', err.message);
    }
  }

  console.log(`
Done. Your vault is at: ${targetDir}

Next steps:
  1. Review .agents/claude-memory/*.md — fill in your real preferences.
  2. Read docs/alias-modes.md and set up shell aliases (or a PowerShell
     function on Windows) for the modes you want.
  3. Optional: install graphify if you want codebase knowledge-graph
     queries, then fill in .mcp.json with real paths.
  4. Run .agents/scripts/link-brain.sh (bash/zsh) from inside any project
     to wire this vault into it. Windows users: run it under WSL or Git
     Bash — it's a bash script.
`);
}

main().catch((err) => {
  console.error('setup failed:', err);
  process.exitCode = 1;
});
