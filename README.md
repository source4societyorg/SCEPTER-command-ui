# SCEPTER-command-ui

[![scepter-logo](http://res.cloudinary.com/source-4-society/image/upload/v1514622047/scepter_hzpcqt.png)](https://github.com/source4societyorg/SCEPTER-core)

[![js-standard-style](https://cdn.rawgit.com/standard/standard/master/badge.svg)](http://standardjs.com)
[![Build Status](https://travis-ci.org/source4societyorg/SCEPTER-command-ui.svg?branch=master)](https://travis-ci.org/source4societyorg/SCEPTER-command-ui)


A SCEPTER framework command plugin to initialize, connect and deploy various user interface sub-projects.

# Installation

1. Setup a SCEPTER project by following the instructions from [SCEPTER-Core](https://github.com/source4societyorg/SCEPTER-core).
2. Be sure to recursively install the SCEPTER-Core boilerplates submodules. You can do this by cloning SCEPTER-Core with the --recursive flag or by issuing the `git submodule update --init` command from the project directory.
3. Execute `node bin/scepter.js list:all` to display a list of installed commands to verify this command has been installed.

# Commands

`ui:initializeWeb <ui-name> <target-repository> [<ui-repository>]`

  This command will fork the [SCEPTER-webui](https://github.com/source4societyorg/SCEPTER-webui) repository by default, and add the fork as submodule to your projects `ui` folder as the name specified by the `ui-name` argument. The `target-repository` argument should consist of the uri of the repository you wish to receive the fork of SCEPTER-webui. You can substitute a different boilerplate by providing the optional `ui-repository` argument. 

`ui:deployWebS3 <ui-name> [<env>] [<bucket>]`

  This command will automatically deploy the `build` directory within the specified ui/<ui-name> folder to the S3 bucket passed in via the command line or defined in config/parameters.json within the SCEPTER project. The parameters configuration should look similar to the following with the values of yourenv and uiName replaced with the corresponding values of the env and uiName variables you will pass in via command line:
  
    {
      environments: {
        yourenv: {
          ui: {
            uiName: {
              bucket: 'your-bucket-name'
            }
          }
        }
      }
    }
