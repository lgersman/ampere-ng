/**
  This file declares all Ampere constants.
*/

import Ui from "./ui";

var Constants = {};

Object.defineProperties(Constants, {
    // default object name value
  'DEFAULT' : {
    value : '',
    writable: false
  },
    // unique object name
  'NAME' : {
    value  : Symbol('AMPERE_NAME'),
    writable: false
  },
    // unique object namespace (derived from its name and parent name)
  'NAMESPACE' : {
    value  : Symbol('AMPERE_NAMESPACE'),
    writable: false
  },
    // object type (module,state,transition,...)
  'TYPE' : {
    value  : Symbol('AMPERE_TYPE'),
    writable: false
  },
    // the log instance for this object
  'LOG' : {
    value  : Symbol('AMPERE_LOG'),
    writable: false
  },
    // history related constants
  'HISTORY' : {
    value : {},
    writable : false
  },
    // ui relevant properties
  'UI' : {
    value  : Ui,
    writable: false
  },
});

Object.defineProperties(Constants.HISTORY, {
    // history limit (0=>no undo/redo, Number.POSITIVE_INFINITY>=no limit, >0=>count of stored undo/redo operations)
  'LIMIT' : {
    value  : Symbol('LIMIT'),
    writable: false
  }
});

export default Constants;
