/**
  This file declares all Ampere constants.
*/

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
    value  : { },
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

Object.defineProperties(Constants.UI, {
    /**
     transition option hinting the occurrence of the transition. can be one of
     * 'global' transition should be rendered in the global transition list. this is the default for module transitions
     * 'local'  transition should be rendered into the state/view related transition list, this is the default for regular transitions (of states).
     * any other value can be used for your own occurence
    */
  'SCOPE'  : {
    value  : Symbol('AMPERE_UI_SCOPE'),
    writable: false
  },

    /**
    * priority can be used in conjunction with SCOPE to define the placement of the transition in its list (defined by SCOPE).
    * the polymer renderer for example uses this option to place the transition at the left or right side of the toolbars
    *
    * value can be one of
    * 'primary' transition should be rendered in the global transition list. this is the default for module transitions
    * 'secondary'  transition should be rendered into the state/view related transition list, this is the default for regular transitions (of states).
    * any other value can be used for your own occurence
    *
    * if no priority is set but a scope is given, scope group 'primary' will be assumed
    */
  'SCOPE_PRIORITY'  : {
    value  : Symbol('AMPERE_UI_SCOPE_PRIORITY'),
    writable: false
  },

    /**
    * group can be used in conjunction with SCOPE to define groups of transitions.
    * transitions of one group are placed together in the transition list (defined by SCOPE).
    * the polymer renderer for example uses this option also to to place the transition at the left or right side of the toolbars
    *
    * SCOPE_GROUP has lower impact than SCOPE_PRIORITY so that a transitions in same SCOPE but with different SCOPE_PRIORITY will not get grouped together.
    *
    * value can be any string or number
    */
  'SCOPE_GROUP'  : {
    value  : Symbol('AMPERE_UI_SCOPE_GROUP'),
    writable: false
  },

    /*
    * tells the ui that these view should be rendered on top of another view.
    * a stacked view will be rendered as dialog with the parent view as background.
    * stacking can have infinite levels.
    */
  'PARENT'  : {
    value  : Symbol('AMPERE_UI_PARENT'),
    writable: false
  },
  'CAPTION'  : {
    value  : Symbol('AMPERE_UI_CAPTION'),
    writable: false
  },
  'DESCRIPTION'  : {
    value  : Symbol('AMPERE_UI_DESCRIPTION'),
    writable: false
  },
  'ICON'      : {
    value  : Symbol('AMPERE_UI_ICON'),
    writable: false
  },
  'HOTKEY'      : {
    value  : Symbol('AMPERE_UI_HOTKEY'),
    writable: false
  }
});

`,
  /**
    can be used to group local/global transition together in a submenu
  */
'GROUP'  : {
  value  : Symbol('GROUP'),
  writable: false
},
  /**
    brauchmer das ?
  */
'KIND'  : {
  value  : Symbol('KIND'),
  writable: false
},
  /**
    brauchmer das ?
  */
'APPEARANCE'  : {
  value  : Symbol('APPEARANCE'),
  writable: false
},
`

export default Constants;
