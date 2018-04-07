'use strict'
global.fs = require('fs')
global.AWS = require('aws-sdk')
global.mime = require('mime-types')
const valueOrDefault = require('@source4society/scepter-utility-lib').valueOrDefault

const uiCloudFrontBustCommand = {
  command: 'ui:bustCloudFront',
  usage: 'ui:bustCloudFront <uiName> [<env>] [<distributionId>]',
  description: 'Invalidates the cloud front distribution cache associated with this environment',
  callback: callbackFunction,
  executeInvalidateCommand: executeInvalidateCommandFunction,
  uploadCallback: uploadCallbackFunction
}

function callbackFunction (args, credentials, command) {
  const uiName = args[3]
  const env = valueOrDefault(args[4], 'development')
  const distributionId = valueOrDefault(args[5], credentials.getIn(['parameters', 'environments', env, 'ui', uiName, 'cloudfrontDistributionId']))
  this.commandObject = command
  this.credentials = credentials
  this.distributionId = distributionId
  this.env = env
  this.uiName = uiName
  this.fs = global.fs
  this.AWS = global.AWS
  this.mime = global.mime
  if (typeof uiName === 'undefined') {
    command.printMessage('Usage: node bin/scepter ' + uiCloudFrontBustCommand.usage)
  } else if (typeof distributionId === 'undefined') {
    command.printMessage('You must specify the cloud front distribution id for this environment configuration or pass it as the third argument to the command.')
  } else {
    if (typeof credentials.getIn(['environments', env, 'provider', 'aws']) === 'undefined') {
      command.printMessage('You must add the AWS credentials object to the ' + env + ' environment configuration')
    } else {
      command.printMessage('Invalidating the cache stored in the "' + this.distributionId + '" distribution')
      uiCloudFrontBustCommand.executeInvalidateCommand(command)
    }
  }
}

function executeInvalidateCommandFunction (command) {
  const cloudfront = new this.AWS.CloudFront({apiVersion: '2017-10-30'})
  const params = {
    DistributionId: this.distributionId,
    InvalidationBatch: {
      CallerReference: Math.floor(new Date() / 1000).toString(),
      Paths: {
        Quantity: 1,
        Items: [
          '/'
        ]
      }
    }
  }

  cloudfront.createInvalidation(params, uiCloudFrontBustCommand.uploadCallback)
}

function uploadCallbackFunction (err, data) {
  if (err) {
    uiCloudFrontBustCommand.commandObject.printMessage(err.message)
    uiCloudFrontBustCommand.commandObject.printMessage(err.stack)
  } else {
    uiCloudFrontBustCommand.commandObject.printMessage(data)
  }
}

module.exports = uiCloudFrontBustCommand
