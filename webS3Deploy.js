'use strict'
global.fs = require('fs')
global.AWS = require('aws-sdk')
global.mime = require('mime-types')

const uiDeployWebS3Command = {
  command: 'ui:deployWebS3',
  usage: 'ui:deployWebS3 <ui-name> [<env>] [<bucket>]',
  description: 'Deploys target ui to the specified S3 bucket',
  callback: callbackFunction,
  executeBuildCommand: executeBuildFunction,
  executeAwsDeployCommand: executeAwsDeployFunction,
  uploadCallback: uploadCallbackFunction
}

function callbackFunction (args, credentials, command) {
  const uiName = args[3]
  const env = args[4] || 'dev'
  const bucket = args[5] || credentials.getIn(['parameters', 'environments', env, 'ui', uiName, 'bucket'])
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
    if (typeof credentials.getIn(['environments', env, 'provider', 'aws']) === 'undefined') {
      command.printMessage('You must add the AWS credentials object to the ' + env + ' environment configuration')
    } else {
      command.printMessage('Deploy will take place to aws provider')
      uiDeployWebS3Command.executeBuildCommand(command)
    }
  }
}

function executeBuildFunction (command) {
  command.executeCommand(
    'cd ui; cd ' + uiDeployWebS3Command.uiName + '; yarn build:' + uiDeployWebS3Command.env + '; cd ../',
    'User interface build successful',
    'Failed to build user interface',
    uiDeployWebS3Command.executeAwsDeployCommand
  )
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
