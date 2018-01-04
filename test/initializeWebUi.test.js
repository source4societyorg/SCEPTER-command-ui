const initializeWebCommand = require('../initializeWebUi.js')

test('initializeWebCommand has the correct command property', () => {
  expect(initializeWebCommand.command).toEqual('ui:initializeWeb')
})

test('initializeWebCommand has a usage property defined', () => {
  expect(typeof initializeWebCommand.usage).toBe('string')
  expect(initializeWebCommand.usage.length).toBeGreaterThan(0)
})

test('initializeWebCommand has callback which sets up and kicks off command execution', (done) => {
  const mockExecuteCommand = (commandString, successMessage, errorMessage, nextFunctionCall) => {
    expect(successMessage.length).toBeGreaterThan(0)
    expect(errorMessage.length).toBeGreaterThan(0)
    expect(typeof nextFunctionCall).toEqual('function')
    expect(initializeWebCommand.uiName).toEqual('uiname')
    expect(initializeWebCommand.targetRepository).toEqual('targetrepo')
    expect(initializeWebCommand.forkRepository).toEqual('forkrepo')
    done()
  }

  const command = {
    executeCommand: mockExecuteCommand
  }

  initializeWebCommand.callback(['node', 'path', 'something', 'uiname', 'targetrepo', 'forkrepo'], null, command)
})

test('initializeWebCommand executes commands in sequence', (done) => {
  function * testCommandsInSequence () {
    while (true) {
      let commandArguments = yield 'cloneCommandArguments'
      expect(commandArguments[0]).toEqual('git clone forkrepo ui/uiname --recursive')
      expect(commandArguments[1].length).toBeGreaterThan(0)
      expect(commandArguments[2].length).toBeGreaterThan(0)
      expect(commandArguments[3].name).toEqual('executeRepositoryModificationFunction')

      commandArguments = yield 'repositoryModificationCommandArguments'
      expect(commandArguments[0]).toEqual('cd ui/uiname; git remote rm origin')
      expect(commandArguments[1].length).toBeGreaterThan(0)
      expect(commandArguments[2].length).toBeGreaterThan(0)
      expect(commandArguments[3].name).toEqual('executeInitializeRepositoryFunction')

      commandArguments = yield 'initializeRepositoryCommandArguments'
      expect(commandArguments[0]).toEqual('cd ui/uiname;git remote add origin targetrepo; git push -f origin master')
      expect(commandArguments[1].length).toBeGreaterThan(0)
      expect(commandArguments[2].length).toBeGreaterThan(0)
      expect(commandArguments[3].name).toEqual('executeAddUiAsSubmoduleFunction')

      commandArguments = yield 'initializeRepositoryCommandArguments'
      expect(commandArguments[0]).toEqual('rm -rf ./ui/uiname; git submodule add --force targetrepo ui/uiname')
      expect(commandArguments[1].length).toBeGreaterThan(0)
      expect(commandArguments[2].length).toBeGreaterThan(0)
      expect(commandArguments[3].name).toEqual('executeInstallFunction')

      commandArguments = yield 'executeInstallFunction'
      expect(commandArguments[0]).toEqual('cd ui/uiname;yarn install')
      expect(commandArguments[1].length).toBeGreaterThan(0)
      expect(commandArguments[2].length).toBeGreaterThan(0)
      expect(commandArguments[3]).toBeUndefined()
      return
    }
  }

  const mockExecuteCommand = (commandString, successMessage, errorMessage, nextFunctionCall) => {
    testGenerator.next([commandString, successMessage, errorMessage, nextFunctionCall])
    if (typeof nextFunctionCall !== 'undefined') {
      nextFunctionCall(command)
    } else {
      done()
    }
  }

  const command = {
    executeCommand: mockExecuteCommand
  }

  const testGenerator = testCommandsInSequence()
  testGenerator.next() // Initialize generator to first yield
  initializeWebCommand.callback(['node', 'path', 'something', 'uiname', 'targetrepo', 'forkrepo'], null, command)
})

test('initializeWebCommand prints usage when uiname argument is not passed in', (done) => {
  const mockPrintMessage = (message) => {
    expect(message).toEqual('Usage: node bin/scepter ' + initializeWebCommand.usage)
    done()
  }

  const command = {
    printMessage: mockPrintMessage
  }

  initializeWebCommand.callback(['node', 'path', 'something', undefined, 'targetrepo', 'forkrepo'], null, command)
})

test('initializeWebCommand prints usage when target-repository argument is not passed in', (done) => {
  const mockPrintMessage = (message) => {
    expect(message).toEqual('Usage: node bin/scepter ' + initializeWebCommand.usage)
    done()
  }

  const command = {
    printMessage: mockPrintMessage
  }

  initializeWebCommand.callback(['node', 'path', 'something', 'uiname', undefined, 'forkrepo'], null, command)
})

test('initializeWebCommand fork-repository argument is optional and defaults to SCEPTER-webui', (done) => {
  const mockExecuteCommand = (commandString, successMessage, errorMessage, nextFunctionCall) => {
    expect(initializeWebCommand.forkRepository).toEqual('git@github.com:source4societyorg/SCEPTER-webui.git')
    done()
  }

  const command = {
    executeCommand: mockExecuteCommand
  }

  initializeWebCommand.callback(['node', 'path', 'something', 'uiname', 'targetrepo', undefined], null, command)
})
