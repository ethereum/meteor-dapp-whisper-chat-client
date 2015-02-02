HOWTO
=====

This document contains WIP documentation and references

##Node-webkit
Node webkit is a way of distributing an application - It cobines nodejs and DOM


###Installation
[Download the binaries](https://github.com/rogerwang/node-webkit#downloads)

Copy the `node-webkit.app` into `/Applications`

[Configure your alias to the app](https://github.com/rogerwang/node-webkit/wiki/How-to-run-apps#mac-os-x)

###Run your code
```
$ nw /path/to/packed/app
```

##Cordova
Cordova is a native shell that holds a webkit and serves a native api in javascript

###Installation

###Create app
```
$ cordova create hello com.domain.hello Hello
$ cd hello
$ cordova platform add android
$ cd www

$ packmeteor -a
or
$ packmeteor -ae // starts emulator android
``` 
