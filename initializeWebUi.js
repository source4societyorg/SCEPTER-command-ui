'use strict'
const initializeWebUiCommand = {
  command: 'ui:initializeWebUi',
  usage: 'ui:initializeWebUi <ui-name> <target-repository> [<ui-repository>]',
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
  if (typeof uiName === 'undefined') {
    command.printMessage('Usage: node bin/scepter ' + initializeWebUiCommand.usage)
  } else {
    this.uiName = uiName
    this.targetRepository = targetRepository
    this.forkRepository = forkRepository
    this.executeCloneCommand(command)
  }
}

function executeCloneCommandFunction (command) {
  command.executeCommand(
    'git clone ' + initializeWebUiCommand.forkRepository + ' ui/' + initializeWebUiCommand.uiName + ' --recursive',
    'UI has been created successfully',
    'Failed to create the ui folder',
    initializeWebUiCommand.executeRepositoryModificationCommands
  )
}

function executeRepositoryModificationFunction (command) {
  command.executeCommand(
    'cd ui/' + initializeWebUiCommand.uiName + '; git remote rm origin',
    'Disconnected repository from the remote boilerplate repository',
    'Failed to disconnect from the remote repository',
    initializeWebUiCommand.executeInitializeRepositoryCommand
  )
}

function executeInitializeRepositoryFunction (command) {
  command.executeCommand(
    'cd ui/' + initializeWebUiCommand.uiName + ';git remote add origin ' + initializeWebUiCommand.targetRepository + '; git push -f origin master',
    'Successfully forked ' + initializeWebUiCommand.forkRepository + ' into ' + initializeWebUiCommand.targetRepository,
    'Failed to fork source repository',
    initializeWebUiCommand.executeAddUiAsSubmoduleCommand
  )
}

function executeAddUiAsSubmoduleFunction (command) {
  command.executeCommand(
    'rm -rf ./ui/' + initializeWebUiCommand.uiName + '; git submodule add --force ' + initializeWebUiCommand.targetRepository + ' ui/' + initializeWebUiCommand.uiName,
    'Added UI as submodule to project under ui/' + initializeWebUiCommand.uiName,
    'Failed to add UI as submodule',
    initializeWebUiCommand.executeInstallCommand
  )
}

function executeInstallFunction (command) {
  command.executeCommand(
    'cd ui/' + initializeWebUiCommand.uiName + ';yarn install',
    'Dependencies installed',
    'Failed to install dependencies'
  )
}

module.exports = initializeWebUiCommand
