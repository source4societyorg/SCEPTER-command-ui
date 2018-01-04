'use strict'
const initializeWebCommand = {
  command: 'ui:initializeWeb',
  usage: 'ui:initializeWeb <ui-name> <target-repository> [<ui-repository>]',
  description: 'Initializes the target repository using git as a fork of SCEPTER-webui or the provided ui-repository uri, then adds it as a submodule into the target ui-name subfolder within the ui folder. A blank <target-repository> must be created first to receive the forked code.',
  callback: callbackFunction,
  executeCloneCommand: executeCloneCommandFunction,
  executeRepositoryModificationCommands: executeRepositoryModificationFunction,
  executeInitializeRepositoryCommand: executeInitializeRepositoryFunction,
  executeAddUiAsSubmoduleCommand: executeAddUiAsSubmoduleFunction,
  executeInstallCommand: executeInstallFunction

}

function callbackFunction (args, credentials, command) {
  const forkRepository = args[5] || 'git@github.com:source4societyorg/SCEPTER-webui.git'
  const targetRepository = args[4]
  const uiName = args[3]
  if (typeof uiName === 'undefined' || typeof targetRepository === 'undefined') {
    command.printMessage('Usage: node bin/scepter ' + initializeWebCommand.usage)
  } else {
    this.uiName = uiName
    this.targetRepository = targetRepository
    this.forkRepository = forkRepository
    this.executeCloneCommand(command)
  }
}

function executeCloneCommandFunction (command) {
  command.executeCommand(
    'git clone ' + initializeWebCommand.forkRepository + ' ui/' + initializeWebCommand.uiName + ' --recursive',
    'UI has been created successfully',
    'Failed to create the ui folder',
    initializeWebCommand.executeRepositoryModificationCommands
  )
}

function executeRepositoryModificationFunction (command) {
  command.executeCommand(
    'cd ui/' + initializeWebCommand.uiName + '; git remote rm origin',
    'Disconnected repository from the remote boilerplate repository',
    'Failed to disconnect from the remote repository',
    initializeWebCommand.executeInitializeRepositoryCommand
  )
}

function executeInitializeRepositoryFunction (command) {
  command.executeCommand(
    'cd ui/' + initializeWebCommand.uiName + ';git remote add origin ' + initializeWebCommand.targetRepository + '; git push -f origin master',
    'Successfully forked ' + initializeWebCommand.forkRepository + ' into ' + initializeWebCommand.targetRepository,
    'Failed to fork source repository',
    initializeWebCommand.executeAddUiAsSubmoduleCommand
  )
}

function executeAddUiAsSubmoduleFunction (command) {
  let commandStringArgument = ''
  const shell = typeof command.parameters !== 'undefined' ? command.parameters.shell : 'bash'
  switch (shell) {
    case 'powershell':
      commandStringArgument = 'o'
  }
  command.executeCommand(
    'rm -r -f' + commandStringArgument + ' ./ui/' + initializeWebCommand.uiName + '; git submodule add --force ' + initializeWebCommand.targetRepository + ' ui/' + initializeWebCommand.uiName,
    'Added UI as submodule to project under ui/' + initializeWebCommand.uiName,
    'Failed to add UI as submodule',
    initializeWebCommand.executeInstallCommand
  )
}

function executeInstallFunction (command) {
  command.executeCommand(
    'cd ui/' + initializeWebCommand.uiName + ';yarn install',
    'Dependencies installed',
    'Failed to install dependencies'
  )
}

module.exports = initializeWebCommand
