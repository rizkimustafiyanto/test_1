#!/usr/bin/env node
 
import inquirer from 'inquirer';
import { execa } from 'execa';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function getScopes() {
  const dirs = [];
  ['apps', 'packages', 'infrastructure', 'scripts'].forEach((root) => {
    const rootPath = path.join(repoRoot, root);
    if (!fs.existsSync(rootPath)) return;
    if (root === 'scripts') {
      dirs.push('scripts');
      return;
    }
    fs.readdirSync(rootPath).forEach((name) => {
      const folderPath = path.join(rootPath, name);
      if (fs.statSync(folderPath).isDirectory()) {
        dirs.push(`${root}/${name}`);
      }
    });
  });
  return dirs;
}

async function runCheck(name, cmd, args) {
  console.log(`Running ${name}...`);
  try {
    await execa(cmd, args, { stdio: 'inherit' });
    console.log(`${name} passed`);
  } catch {
    console.error(`${name} failed`);
    process.exit(1);
  }
}

async function getBranches() {
  const { stdout } = await execa('git', ['branch', '--list']);
  return stdout
    .split('\n')
    .map((b) => b.replace('*', '').trim())
    .filter(Boolean);
}

async function branchExists(name) {
  const branches = await getBranches();
  return branches.includes(name);
}

async function getCurrentBranch() {
  const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  return stdout.trim();
}

async function ensureCleanWorkingTree() {
  const { stdout } = await execa('git', ['status', '--porcelain']);
  if (stdout.trim().length === 0) return;
  console.error('Working tree is not clean. Please commit or stash changes first.');
  process.exit(1);
}

async function handleDirtyBeforeCheckout(targetBranch) {
  const { stdout } = await execa('git', ['status', '--porcelain']);
  if (stdout.trim().length === 0) return { stashed: false };

  const answer = await inquirer.prompt([
    {
      type: 'select',
      name: 'action',
      message: `Uncommitted changes detected. Switch to "${targetBranch}" how?`,
      choices: [
        { name: 'Stash changes and continue', value: 'stash' },
        { name: 'Cancel', value: 'cancel' },
      ],
    },
  ]);

  if (answer.action === 'cancel') {
    console.log('Canceled.');
    process.exit(0);
  }

  await execa('git', ['stash', 'push', '-u', '-m', 'commit.mjs auto-stash'], {
    stdio: 'inherit',
  });
  return { stashed: true };
}

async function selectBranch(message) {
  const branches = await getBranches();
  const branchAnswer = await inquirer.prompt([
    { type: 'select', name: 'branch', message, choices: [...branches, 'custom'] },
    {
      type: 'input',
      name: 'customBranch',
      message: 'Enter custom branch name:',
      when: (a) => a.branch === 'custom',
    },
  ]);

  return branchAnswer.branch === 'custom'
    ? branchAnswer.customBranch
    : branchAnswer.branch;
}

async function selectCommit(message, ref = 'HEAD') {
  const { stdout } = await execa('git', ['log', '--oneline', '-n', '20', ref]);
  const choices = stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash] = line.split(' ');
      return { name: line, value: hash };
    });

  if (choices.length === 0) {
    console.error('No commits found.');
    process.exit(1);
  }

  const answer = await inquirer.prompt([
    { type: 'select', name: 'hash', message, choices },
  ]);
  return answer.hash;
}

async function selectCommits(message, ref = 'HEAD') {
  const { stdout } = await execa('git', ['log', '--oneline', '-n', '20', ref]);
  const choices = stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash] = line.split(' ');
      return { name: line, value: hash };
    });

  if (choices.length === 0) {
    console.error('No commits found.');
    process.exit(1);
  }

  const answer = await inquirer.prompt([
    { type: 'checkbox', name: 'hashes', message, choices },
  ]);
  return answer.hashes;
}

async function prepareTargetBranch({ allowCherryPick = true } = {}) {
  const currentBranch = await getCurrentBranch();
  const { targetType } = await inquirer.prompt([
    {
      type: 'select',
      name: 'targetType',
      message: 'Choose target branch:',
      choices: [
        { name: `Use current (${currentBranch})`, value: 'current' },
        { name: 'Switch to existing branch', value: 'existing' },
        { name: 'Create new branch', value: 'new' },
      ],
    },
  ]);

  if (targetType === 'current') {
    return { currentBranch, targetBranch: currentBranch };
  }

  if (targetType === 'new') {
    const { newBranch } = await inquirer.prompt([
      { type: 'input', name: 'newBranch', message: 'New branch name:' },
    ]);

    if (await branchExists(newBranch)) {
      const { useExisting } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useExisting',
          message: `"${newBranch}" already exists. Switch to it?`,
          default: true,
        },
      ]);
      if (!useExisting) {
        console.log('Canceled.');
        process.exit(0);
      }
      const stashState = await handleDirtyBeforeCheckout(newBranch);
      await execa('git', ['checkout', newBranch], { stdio: 'inherit' });
      if (stashState.stashed) {
        await execa('git', ['stash', 'pop'], { stdio: 'inherit' });
      }
      return { currentBranch, targetBranch: newBranch };
    }

    const stashState = await handleDirtyBeforeCheckout(newBranch);
    await execa('git', ['checkout', '-b', newBranch], { stdio: 'inherit' });
    if (stashState.stashed) {
      await execa('git', ['stash', 'pop'], { stdio: 'inherit' });
    }
    return { currentBranch, targetBranch: newBranch };
  }

  const targetBranch = await selectBranch('Select target branch:');
  if (targetBranch !== currentBranch) {
    const stashState = await handleDirtyBeforeCheckout(targetBranch);
    await execa('git', ['checkout', targetBranch], { stdio: 'inherit' });

    if (allowCherryPick) {
      const { doCherryPick } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'doCherryPick',
          message: `Cherry-pick commits from "${currentBranch}" into "${targetBranch}"?`,
          default: true,
        },
      ]);

      if (doCherryPick) {
        const hashes = await selectCommits(
          `Select commit(s) to cherry-pick from "${currentBranch}":`,
          currentBranch,
        );
        if (hashes.length > 0) {
          const ordered = [...hashes].reverse();
          for (const hash of ordered) {
            await execa('git', ['cherry-pick', hash], { stdio: 'inherit' });
          }
        }
      }
    }

    if (stashState.stashed) {
      await execa('git', ['stash', 'pop'], { stdio: 'inherit' });
    }
  }

  return { currentBranch, targetBranch };
}

async function createCommit() {
  const types = [
    { name: 'feat: New feature', value: 'feat' },
    { name: 'fix: Bug fix', value: 'fix' },
    { name: 'chore: Minor changes', value: 'chore' },
    { name: 'docs: Documentation', value: 'docs' },
    { name: 'refactor: Code refactor', value: 'refactor' },
    { name: 'test: Add/fix tests', value: 'test' },
    { name: 'style: Add/fix styles or formatting', value: 'style' },
  ];

  const scopes = getScopes();

  const answers = await inquirer.prompt([
    { type: 'select', name: 'type', message: 'Select the type of change:', choices: types },
    { type: 'select', name: 'scope', message: 'Select workspace:', choices: [...scopes, 'custom'] },
    { type: 'input', name: 'customScope', message: 'Enter custom workspace name:', when: (a) => a.scope === 'custom' },
    { type: 'input', name: 'subject', message: 'Write a short description:' },
  ]);

  const finalScope = answers.scope === 'custom' ? answers.customScope : answers.scope;
  const commitMessage = `${answers.type}(${finalScope}): ${answers.subject}`;

  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ok',
      message: `The following commit will be created:\n\n${commitMessage}\n\nContinue?`,
      default: true,
    },
  ]);

  if (!confirm.ok) {
    console.log('Commit canceled.');
    return false;
  }

  const checks = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runChecks',
      message: 'Run lint:fix and format before commit?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'runCheckAll',
      message: 'Run check (lint + type-check) before commit?',
      default: true,
    },
  ]);

  if (checks.runChecks) {
    await runCheck('Lint', 'npm', ['run', 'lint:fix']);
    await runCheck('Prettier Format', 'npm', ['run', 'format']);
  }

  if (checks.runCheckAll) {
    await runCheck('Check', 'npm', ['run', 'check']);
  }

  await execa('git', ['add', '.'], { stdio: 'inherit' });
  await execa('git', ['commit', '-m', commitMessage], { stdio: 'inherit' });

  console.log('Commit created successfully.');
  return true;
}

async function pushOnly() {
  const { targetBranch } = await prepareTargetBranch({ allowCherryPick: false });
  await execa('git', ['push', '-u', 'origin', targetBranch], { stdio: 'inherit' });
  console.log(`Pushed to branch "${targetBranch}" successfully.`);
}

async function commitOnly() {
  await prepareTargetBranch();
  await createCommit();
}

async function commitAndPush() {
  const { targetBranch } = await prepareTargetBranch();
  const committed = await createCommit();
  if (!committed) return;
  await execa('git', ['push', '-u', 'origin', targetBranch], { stdio: 'inherit' });
  console.log(`Pushed to branch "${targetBranch}" successfully.`);
}

async function renameLastCommit() {
  await ensureCleanWorkingTree();
  const answer = await inquirer.prompt([
    { type: 'input', name: 'message', message: 'New commit message:' },
  ]);
  await execa('git', ['commit', '--amend', '-m', answer.message], {
    stdio: 'inherit',
  });
  console.log('Commit message updated.');
}

async function deleteLastCommit() {
  await ensureCleanWorkingTree();
  const answer = await inquirer.prompt([
    {
      type: 'select',
      name: 'mode',
      message: 'How do you want to delete the last commit?',
      choices: [
        { name: 'Keep changes (soft reset)', value: 'soft' },
        { name: 'Discard changes (hard reset)', value: 'hard' },
      ],
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'This will rewrite history. Continue?',
      default: false,
    },
  ]);

  if (!answer.confirm) {
    console.log('Canceled.');
    return;
  }

  if (answer.mode === 'soft') {
    await execa('git', ['reset', '--soft', 'HEAD~1'], { stdio: 'inherit' });
  } else {
    await execa('git', ['reset', '--hard', 'HEAD~1'], { stdio: 'inherit' });
  }
  console.log('Last commit removed.');
}

async function squashCommits() {
  await ensureCleanWorkingTree();
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'count',
      message: 'How many last commits to squash into one?',
      validate: (value) => {
        const n = Number(value);
        if (Number.isInteger(n) && n > 1) return true;
        return 'Enter an integer greater than 1.';
      },
    },
    { type: 'input', name: 'message', message: 'New commit message:' },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'This will rewrite history. Continue?',
      default: false,
    },
  ]);

  if (!answer.confirm) {
    console.log('Canceled.');
    return;
  }

  await execa('git', ['reset', '--soft', `HEAD~${answer.count}`], {
    stdio: 'inherit',
  });
  await execa('git', ['commit', '-m', answer.message], { stdio: 'inherit' });
  console.log('Commits squashed.');
}

async function cherryPickCommit() {
  const currentBranch = await getCurrentBranch();
  const targetBranch = await inquirer.prompt([
    {
      type: 'select',
      name: 'target',
      message: 'Cherry-pick onto which branch?',
      choices: ['current', 'select another'],
    },
  ]);

  let checkoutBranch = currentBranch;
  if (targetBranch.target === 'select another') {
    checkoutBranch = await selectBranch('Select target branch:');
  }

  if (checkoutBranch !== currentBranch) {
    const stashState = await handleDirtyBeforeCheckout(checkoutBranch);
    await execa('git', ['checkout', checkoutBranch], { stdio: 'inherit' });
    if (stashState.stashed) {
      await execa('git', ['stash', 'pop'], { stdio: 'inherit' });
    }
  }

  const hash = await selectCommit('Select commit to cherry-pick:');
  await execa('git', ['cherry-pick', hash], { stdio: 'inherit' });

  if (checkoutBranch !== currentBranch) {
    await execa('git', ['checkout', currentBranch], { stdio: 'inherit' });
  }

  console.log('Cherry-pick complete.');
}

async function main() {
  const { action } = await inquirer.prompt([
    {
      type: 'select',
      name: 'action',
      message: 'Choose an action:',
      choices: [
        { name: 'Commit only', value: 'commit-only' },
        { name: 'Push only', value: 'push-only' },
        { name: 'Commit and push', value: 'commit-push' },
        { name: 'Rename last commit', value: 'rename' },
        { name: 'Delete last commit', value: 'delete' },
        { name: 'Squash last commits', value: 'squash' },
        { name: 'Cherry-pick a commit', value: 'cherry-pick' },
      ],
    },
  ]);

  if (action === 'commit-only') await commitOnly();
  if (action === 'push-only') await pushOnly();
  if (action === 'commit-push') await commitAndPush();
  if (action === 'rename') await renameLastCommit();
  if (action === 'delete') await deleteLastCommit();
  if (action === 'squash') await squashCommits();
  if (action === 'cherry-pick') await cherryPickCommit();
}

main();
