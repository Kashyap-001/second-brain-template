#!/usr/bin/env node
// Cross-platform (Linux/macOS/Windows) scaffolder for this template.
// Pure Node stdlib — no dependencies, so `npx github:<owner>/<repo>` works
// with no install step.

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { execFileSync } = require('child_process');

const ALIAS_MARKER = 'ai-second-brain-template: secondbrain mode alias';

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

// Different CLIs load context in genuinely different ways — this isn't
// just "swap the binary name". Verified conventions (see docs/alias-modes.md
// for sources):
//   claude — flag-based: `claude --append-system-prompt "<text>"`.
//   agy (Antigravity) — no such flag; it auto-reads AGENTS.md from the
//     current working directory, so the alias just needs to cd into the
//     vault (which has AGENTS.md at its root) before launching it.
// Anything else: we don't have a verified convention, so we ask the user
// for their own invocation template rather than guess a flag that might
// not exist on their tool.
const CLI_PROFILES = {
  claude: { kind: 'flag', flag: '--append-system-prompt' },
  agy: { kind: 'cwd-autoread' },
};

function buildInvocation(shell, cliTool, customTemplate) {
  const profile = CLI_PROFILES[cliTool.toLowerCase()];
  const ctxVar = shell === 'bash' ? '"$ctx"' : '$ctx';
  const argsVar = shell === 'bash' ? '"$@"' : '@args';

  if (profile && profile.kind === 'flag') {
    return { needsCtx: true, line: `${cliTool} ${profile.flag} ${ctxVar} ${argsVar}` };
  }
  if (profile && profile.kind === 'cwd-autoread') {
    return {
      needsCtx: false,
      line:
        shell === 'bash'
          ? `(cd "$vault" && ${cliTool} ${argsVar})  # ${cliTool} auto-reads AGENTS.md from the working directory`
          : `Set-Location $vault; ${cliTool} ${argsVar}  # ${cliTool} auto-reads AGENTS.md from the working directory`,
    };
  }
  if (customTemplate) {
    return { needsCtx: true, line: `${customTemplate.split('{ctx}').join(ctxVar)} ${argsVar}` };
  }
  // No verified profile and no custom template supplied: fall back to the
  // same cd-and-run shape agy uses, since reading AGENTS.md from cwd is an
  // emerging convention several newer agent CLIs share. Not guaranteed
  // correct for every tool — the printed setup output says so.
  return {
    needsCtx: false,
    line:
      shell === 'bash'
        ? `(cd "$vault" && ${cliTool} ${argsVar})  # best-effort: adjust for ${cliTool}'s real context-loading convention`
        : `Set-Location $vault; ${cliTool} ${argsVar}  # best-effort: adjust for ${cliTool}'s real context-loading convention`,
  };
}

function bashAliasSnippet(vaultPath, cliTool, customTemplate) {
  const { needsCtx, line } = buildInvocation('bash', cliTool, customTemplate);
  const ctxBlock = needsCtx
    ? `\n  local ctx\n  ctx="$(cat "$vault/.agents/AGENTS.md" "$vault/.agents/claude-memory/core.md" "$vault/.agents/claude-memory/tooling.md" 2>/dev/null)"`
    : '';
  return `
# --- ${ALIAS_MARKER} (auto-added) ---
secondbrain() {
  local vault="${vaultPath}"${ctxBlock}
  ${line}
}
# --- end ${ALIAS_MARKER} ---
`;
}

function powershellAliasSnippet(vaultPath, cliTool, customTemplate) {
  const winPath = vaultPath.replace(/\//g, '\\');
  const { needsCtx, line } = buildInvocation('pwsh', cliTool, customTemplate);
  const ctxBlock = needsCtx
    ? `\n    $ctx = Get-Content "$vault\\.agents\\AGENTS.md", "$vault\\.agents\\claude-memory\\core.md", "$vault\\.agents\\claude-memory\\tooling.md" -Raw -ErrorAction SilentlyContinue -join "\`n"`
    : '';
  return `
# --- ${ALIAS_MARKER} (auto-added) ---
function secondbrain {
    $vault = "${winPath}"${ctxBlock}
    ${line}
}
# --- end ${ALIAS_MARKER} ---
`;
}

function resolvePowerShellProfile() {
  for (const bin of ['pwsh', 'powershell']) {
    try {
      return execFileSync(bin, ['-NoProfile', '-Command', '$PROFILE'], { encoding: 'utf8' }).trim();
    } catch {
      // try the next binary, or fall through to the default guess below
    }
  }
  return path.join(os.homedir(), 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1');
}

// Appends a starter "secondbrain" mode alias/function to the user's shell
// config (~/.bashrc, ~/.zshrc, or PowerShell $PROFILE). Idempotent — skips
// if a previous run already added it. This is the one step setup.js takes
// outside the scaffolded vault directory, so it's opt-in and never silent.
function installShellAlias(vaultPath, cliTool, customTemplate) {
  const isWindows = process.platform === 'win32';
  const targetFile = isWindows
    ? resolvePowerShellProfile()
    : path.join(os.homedir(), /zsh/i.test(process.env.SHELL || '') ? '.zshrc' : '.bashrc');
  const snippet = isWindows
    ? powershellAliasSnippet(vaultPath, cliTool, customTemplate)
    : bashAliasSnippet(vaultPath, cliTool, customTemplate);

  const existing = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8') : '';
  if (existing.includes(ALIAS_MARKER)) {
    return { targetFile, status: 'already-present' };
  }
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.appendFileSync(targetFile, snippet, 'utf8');
  return { targetFile, status: 'added' };
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
  const addAlias = await ask(
    'Add a starter "secondbrain" shell alias to your shell config now? (y/N)',
    'N'
  );
  let cliTool = 'claude';
  let customTemplate = '';
  if (/^y/i.test(addAlias)) {
    cliTool = await ask('Which CLI should the alias launch? (claude/agy/other)', 'claude');
    if (!CLI_PROFILES[cliTool.trim().toLowerCase()]) {
      customTemplate = await ask(
        `No verified context-loading convention for "${cliTool}" — enter the command ` +
          'to run, using {ctx} where loaded context should go (blank = just cd into ' +
          'the vault and run it plainly)',
        ''
      );
    }
  }
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

  let aliasNote = `  2. Read docs/alias-modes.md and set up shell aliases (or a PowerShell
     function on Windows) for the modes you want.`;
  if (/^y/i.test(addAlias)) {
    try {
      const { targetFile, status } = installShellAlias(targetDir, cliTool.trim(), customTemplate.trim());
      const unverified = !CLI_PROFILES[cliTool.trim().toLowerCase()] && !customTemplate.trim();
      const caveat = unverified
        ? `\n     "${cliTool}" has no verified context-loading convention — the generated
     function just cds into the vault and runs it plainly. Check ${cliTool}'s own
     docs and adjust the function in ${targetFile} if it needs a specific flag.`
        : '';
      aliasNote =
        status === 'added'
          ? `  2. Added a "secondbrain" alias (${cliTool}) to ${targetFile} — restart your
     shell (or \`source ${targetFile}\` / reopen PowerShell) then run \`secondbrain\`.${caveat}
     Add more modes by copying/editing that function — see docs/alias-modes.md.`
          : `  2. ${targetFile} already has a secondbrain alias from a previous run —
     left it alone. See docs/alias-modes.md to add more modes.`;
    } catch (err) {
      aliasNote = `  2. Couldn't auto-add a shell alias (${err.message}) — see
     docs/alias-modes.md to set one up by hand.`;
    }
  }

  console.log(`
Done. Your vault is at: ${targetDir}

Next steps:
  1. Review .agents/claude-memory/*.md — fill in your real preferences.
${aliasNote}
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
