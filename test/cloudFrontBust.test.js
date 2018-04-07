const fromJS = require('immutable').fromJS
test('CloudFrontBustCommand has the correct command property', () => {
  const uiCloudFrontBustCommand = require('../cloudFrontBust.js')
  expect(uiCloudFrontBustCommand.command).toEqual('ui:bustCloudFront')
})

test('CloudFrontBustCommand has a usage property defined', () => {
  const uiCloudFrontBustCommand = require('../cloudFrontBust.js')
  expect(typeof uiCloudFrontBustCommand.usage).toBe('string')
  expect(uiCloudFrontBustCommand.usage.length).toBeGreaterThan(0)
})

test('executeInvalidateCommand will invoke the createInvalidation function on AWS', (done) => {
  const uiCloudFrontBustCommand = require('../cloudFrontBust.js')
  const mockAWS = {
    CloudFront: class {
      constructor (version) {
        expect(version).toEqual({apiVersion: '2017-10-30'})
      }
      createInvalidation () {
        done()
      }
    }
  }

  uiCloudFrontBustCommand.AWS = mockAWS
  uiCloudFrontBustCommand.executeInvalidateCommand()
})

test('CloudFrontBustCommand has callback which sets up and kicks off command execution', (done) => {
  const uiCloudFrontBustCommand = require('../cloudFrontBust.js')
  const mockExecuteInvalidateCommand = (command) => {
    expect(uiCloudFrontBustCommand.uiName).toEqual('uiname')
    expect(uiCloudFrontBustCommand.env).toEqual('test')
    expect(uiCloudFrontBustCommand.distributionId).toEqual('distribution_id')
    done()
  }

  const command = {
    printMessage: (message) => {
    }
  }
  uiCloudFrontBustCommand.executeInvalidateCommand = mockExecuteInvalidateCommand
  uiCloudFrontBustCommand.callback(['node', 'path', 'something', undefined, 'test', undefined], fromJS({}), command)
  uiCloudFrontBustCommand.callback(['node', 'path', 'something', 'uiname', 'test', undefined], fromJS({}), command)
  uiCloudFrontBustCommand.callback(['node', 'path', 'something', 'uiname', 'test', 'distribution_id'], fromJS({}), command)
  uiCloudFrontBustCommand.callback(['node', 'path', 'something', 'uiname', 'test', 'distribution_id'], fromJS({ environments: { test: { provider: { aws: {} } } } }), command)
})

test('callback function handles error and success conditions', () => {
  const uiCloudFrontBustCommand = require('../cloudFrontBust.js')
  const mockError = new Error('test error')
  const mockData = 'mockData'
  const command = {
    printMessage: (message) => {
      if (message !== mockError.message && message !== mockError.stack && message !== mockData) {
        throw new Error('Invalid message')
      }
    }
  }
  uiCloudFrontBustCommand.commandObject = command
  uiCloudFrontBustCommand.uploadCallback(mockError)
  uiCloudFrontBustCommand.uploadCallback(null, mockData)
})
