const webS3DeployCommand = require('../webS3Deploy.js')
const mockReaddirSync = (folder) => ['afile.html', 'afile.js', 'anotherfile.jpg']
const mockMimeLookup = (filepath) => 'test/filemime'

test('webS3DeployCommand has the correct command property', () => {
  expect(webS3DeployCommand.command).toEqual('ui:deployWebS3')
})

test('webS3DeployCommand has a usage property defined', () => {
  expect(typeof webS3DeployCommand.usage).toBe('string')
  expect(webS3DeployCommand.usage.length).toBeGreaterThan(0)
})

test('webS3DeployCommand has callback which sets up and kicks off command execution', (done) => {
  const mockExecuteCommand = (commandString, successMessage, errorMessage, nextFunctionCall) => {
    expect(successMessage.length).toBeGreaterThan(0)
    expect(errorMessage.length).toBeGreaterThan(0)
    expect(typeof nextFunctionCall).toEqual('function')
    expect(webS3DeployCommand.env).toEqual('test')
    expect(webS3DeployCommand.uiName).toEqual('uiname')
    expect(webS3DeployCommand.bucket).toEqual('bucket')
    done()
  }

  const mockPrintCommand = (message) => {
    expect(message).toEqual('Deploy would take place to test provider')
  }

  const command = {
    executeCommand: mockExecuteCommand,
    printMessage: mockPrintCommand
  }

  webS3DeployCommand.callback(['node', 'path', 'something', 'bucket', 'uiname', 'test'], { environments: { test: { provider: 'test' } } }, command)
})

test('webS3DeployCommand executes commands in sequence (with aws provider)', (done) => {
  function * countPrintCalls () {
    for (let i = 0; i < 7; i++) {
      yield i
    }

    done()
  }

  const printCallsIterator = countPrintCalls()

  const mockExecuteCommand = (commandString, successMessage, errorMessage, nextFunctionCall) => {
    expect(commandString).toEqual('cd ui; cd uiname; yarn build:test; cd ../')
    expect(successMessage.length).toBeGreaterThan(0)
    expect(errorMessage.length).toBeGreaterThan(0)
    expect(nextFunctionCall.name).toEqual('executeDeployFunction')
    this.commandObject = command
    nextFunctionCall(command)
  }

  const mockPrintMessage = (message) => {
    expect(message.length).toBeGreaterThan(0)
    printCallsIterator.next()
  }

  const command = {
    executeCommand: mockExecuteCommand,
    printMessage: mockPrintMessage
  }

  const mockReadFile = (filepath, callback) => callback(null, 'mock file contents')

  global.fs = {
    readdirSync: mockReaddirSync,
    readFile: mockReadFile
  }

  const mockPutObjectCallback = (params, callback) => callback(null, 'Test upload success')
  const mockS3 = class S3 { constructor () { return { putObject: mockPutObjectCallback } } }

  global.AWS = {
    S3: mockS3
  }

  global.mime = {
    lookup: mockMimeLookup
  }

  webS3DeployCommand.callback(['node', 'path', 'something', 'bucket', 'uiname', 'test'], { environments: { test: { provider: 'aws' } } }, command)
})

test('webS3DeployCommand prints usage when bucket argument is not passed in', (done) => {
  const mockPrintMessage = (message) => {
    expect(message).toEqual('Usage: node bin/scepter ' + webS3DeployCommand.usage)
    done()
  }

  const command = {
    printMessage: mockPrintMessage
  }

  webS3DeployCommand.callback(['node', 'path', 'something', undefined, 'uiname', 'test'], { environments: { test: { provider: 'test' } } }, command)
})

test('webS3DeployCommand prints usage when uiname argument is not passed in', (done) => {
  const mockPrintMessage = (message) => {
    expect(message).toEqual('Usage: node bin/scepter ' + webS3DeployCommand.usage)
    done()
  }

  const command = {
    printMessage: mockPrintMessage
  }

  webS3DeployCommand.callback(['node', 'path', 'something', 'bucket', undefined, 'test'], { environments: { test: { provider: 'test' } } }, command)
})

test('webS3DeployCommand environment argument is optional and defaults to dev', (done) => {
  const mockPrintMessage = (message) => {
    expect(webS3DeployCommand.env).toEqual('dev')
    done()
  }

  const command = {
    printMessage: mockPrintMessage,
    executeCommand: mockPrintMessage
  }

  webS3DeployCommand.callback(['node', 'path', 'something', 'bucket', 'uiname', undefined], { environments: { dev: { provider: 'test' } } }, command)
})

test('webS3DeployCommand handles error during file reading', (done) => {
  const mockExecuteCommand = (commandString, successMessage, errorMessage, nextFunctionCall) => {
    this.commandObject = command
    nextFunctionCall(command)
  }

  const mockPrintCommand = (message) => {
    if (message === 'error handled') {
      done()
    }
  }

  const command = {
    executeCommand: mockExecuteCommand,
    printMessage: mockPrintCommand
  }

  const mockReadFile = (filepath, callback) => callback(new Error('error handled'))

  global.fs = {
    readdirSync: mockReaddirSync,
    readFile: mockReadFile
  }

  const mockPutObjectCallback = (params, callback) => callback(null, 'Test upload success')
  const mockS3 = class S3 { constructor () { return { putObject: mockPutObjectCallback } } }

  global.AWS = {
    S3: mockS3
  }

  global.mime = {
    lookup: mockMimeLookup
  }

  webS3DeployCommand.callback(['node', 'path', 'something', 'bucket', 'uiname', 'test'], { environments: { test: { provider: 'aws' } } }, command)
})

test('webS3DeployCommand handles error during file upload', (done) => {
  const mockExecuteCommand = (commandString, successMessage, errorMessage, nextFunctionCall) => {
    this.commandObject = command
    nextFunctionCall(command)
  }

  const mockPrintCommand = (message) => {
    if (message === 'error handled') {
      done()
    }
  }

  const command = {
    executeCommand: mockExecuteCommand,
    printMessage: mockPrintCommand
  }

  const mockReadFile = (filepath, callback) => callback(null, 'mock file contents')

  global.fs = {
    readdirSync: mockReaddirSync,
    readFile: mockReadFile
  }

  const mockPutObjectCallback = (params, callback) => callback(new Error('error handled'))
  const mockS3 = class S3 { constructor () { return { putObject: mockPutObjectCallback } } }

  global.AWS = {
    S3: mockS3
  }

  global.mime = {
    lookup: mockMimeLookup
  }

  webS3DeployCommand.callback(['node', 'path', 'something', 'bucket', 'uiname', 'test'], { environments: { test: { provider: 'aws' } } }, command)
})
