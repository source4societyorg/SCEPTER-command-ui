'use strict'
global.fs = require('fs')
global.AWS = require('aws-sdk')
global.mime = require('mime-types')

const uiDeployWebS3Command = {
  command: 'ui:deployWebS3',
  usage: 'ui:deployWebS3 <bucket> <ui-name> [<env>]',
  description: 'Deploys target ui to the specified S3 bucket',
  callback: callbackFunction,
  executeBuildCommand: executeBuildFunction,
  executeDeployCommand: executeDeployFunction,
  executeAwsDeployCommand: executeAwsDeployFunction,
  uploadCallback: uploadCallbackFunction
}

function callbackFunction (args, credentials, command) {
  const env = args[5] || 'dev'
  const uiName = args[4]
  const bucket = args[3] || credentials.environments[env].bucket
  this.commandObject = command
  this.credentials = credentials
  this.bucket = bucket
  this.env = env
  this.uiName = uiName
  this.fs = global.fs
  this.AWS = global.AWS
  this.mime = global.mime
  if (typeof bucket === 'undefined' || typeof uiName === 'undefined') {
    command.printMessage('Usage: node bin/scepter ' + uiDeployWebS3Command.usage)
  } else {
    command.printMessage('Deploy would take place to ' + credentials.environments[env].provider + ' provider')
    uiDeployWebS3Command.executeBuildCommand(command)
  }
}

function executeBuildFunction (command) {
  command.executeCommand(
    'cd ui; cd ' + uiDeployWebS3Command.uiName + '; yarn build; cd ../',
    'User interface build successful',
    'Failed to build user interface',
    uiDeployWebS3Command.executeDeployCommand
  )
}

function executeDeployFunction (command) {
  if (uiDeployWebS3Command.credentials.environments[uiDeployWebS3Command.env].provider === 'aws') {
    uiDeployWebS3Command.executeAwsDeployCommand(command)
  }
}

function executeAwsDeployFunction (command) { // eslint-disable-line no-unused-vars
  const files = uiDeployWebS3Command.fs.readdirSync('./ui/' + uiDeployWebS3Command.uiName + '/build')
  const s3 = new uiDeployWebS3Command.AWS.S3()
  command.printMessage('Uploading ' + files.length + ' objects.')
  for (var index = 0; index < files.length; index++) {
    (function (file) {
      const mimeType = uiDeployWebS3Command.mime.lookup('./ui/' + uiDeployWebS3Command.uiName + '/build/' + file)
      command.printMessage('Uploaded ' + file)
      uiDeployWebS3Command.fs.readFile('./ui/' + uiDeployWebS3Command.uiName + '/build/' + file, function (err, data) {
        if (typeof err !== 'undefined' && err !== null) {
          command.printMessage(err.message)
        } else {
          let params = {
            Body: data,
            Bucket: uiDeployWebS3Command.bucket,
            ContentType: mimeType,
            Key: file,
            ACL: 'public-read',
            Tagging: 'env=' + uiDeployWebS3Command.env
          }

          s3.putObject(params, uiDeployWebS3Command.uploadCallback)
        }
      })
    })(files[index])
  }
}

function uploadCallbackFunction (err, data) {
  if (err) {
    uiDeployWebS3Command.commandObject.printMessage(err.message)
    uiDeployWebS3Command.commandObject.printMessage(err.stack)
  } else {
    uiDeployWebS3Command.commandObject.printMessage(data)
  }
}

module.exports = uiDeployWebS3Command
