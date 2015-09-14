import Base from './base'

  // hasOwnMember is Object.hasOwnProperty with symbol support
const hasOwnMember = (obj, property)=>
  Object.getOwnPropertySymbols(obj).concat(Object.getOwnPropertyNames(obj))
  .indexOf(property)!==-1
;


var Ui = {
  findOption(optionKey, object:Base, traversalProperties=[]) {
    if (!traversalProperties.length) {
      switch (object.type) {
        case 'transition' :
          traversalProperties = ['target'/*, 'state'*/];
          break;
        case 'view' :
            // inspect also view state if this view is stacked (aka is a dialog)
          traversalProperties = object.options[Ui.PARENT] ? [] : ['state'];
          break;
        case 'state' :
          traversalProperties = [];
          break;
        case 'module' :
          traversalProperties = ['app', 'domain'];
          break;
        case 'app' :
          traversalProperties = ['module', 'domain'];
          break;
        default :
          traversalProperties = ['transition', 'view', 'state', 'module', 'app', 'domain', 'Ampere'];
      }
    }

    let value;

    if (hasOwnMember(object.options || object, optionKey)) {
      value = (object.options || object)[optionKey];
    } else {
      if (object.type==='transition') {
        if (optionKey===Ui.CAPTION && object.name!==Ui.DEFAULT) {
          value=object.name;
        } else if (traversalProperties.indexOf('target')!==-1) {
          object = object.target;
        } else {
          object = {};
        }
      }

      if (object.type==='view') {
        if (hasOwnMember(object.options, optionKey)) {
          value = object.options[optionKey];
        } else if (traversalProperties.indexOf('state')!=-1) {
          object = object.state;
        } else {
          object = {};
        }
      }

      if (object.type==='state') {
        if (hasOwnMember(object.options, optionKey)) {
          value = object.options[optionKey];
        } else if (traversalProperties.indexOf('app')!=-1) {
          object = object.module.app;
        } else {
          object = {};
        }
      }

      if (object.type==='app') {
        if (hasOwnMember(object.options, optionKey)) {
          value = object.options[optionKey];
        } else if (traversalProperties.indexOf('module')!=-1) {
          object = object.view.state.module;
        } else {
          object = {};
        }
      }

      if (object.type==='module') {
        if (hasOwnMember(object.options, optionKey)) {
          value = object.options[optionKey];
        } else if (traversalProperties.indexOf('domain')!=-1) {
          object = object.domain;
        } else {
          object = {};
        }
      }

      if (object.type==='domain') {
        if (hasOwnMember(object.options, optionKey)) {
          value = object.options[optionKey];
        } else if (traversalProperties.indexOf('Ampere')!=-1) {
          object = object.Ampere;
        } else {
          object = {};
        }
      }

      if (object.type==='Ampere') {
        value = object.options[optionKey];
      } else {
        object = {};
      }

      if (value===undefined) {
        object = object.options || object;
        value = object[optionKey] || object.name;
      }
    }

    return typeof(value)==='function' ? value(object) : value;
  },

  caption(obj, defaultValue) {
    return Ui.findOption(Ui.CAPTION, obj) || defaultValue;
  },

  icon(obj, defaultValue) {
    return Ui.findOption(Ui.ICON, obj) || defaultValue;
  },

  description(obj, defaultValue) {
    return Ui.findOption(Ui.DESCRIPTION, obj) || defaultValue;
  },

  hotkey(obj, defaultValue) {
    return Ui.findOption(Ui.HOTKEY, obj) || defaultValue;
  },

    /**
    * @return array normalized location option 
    */
  location(obj) {
    let location = Ui.findOption(Ui.LOCATION, obj) || [];

    Array.isArray(location) || (location=location!==undefined ? [location] : []);

    return location;
  }
};

Object.defineProperties(Ui, {
    /**
    * can be used by ui implementors to keep a reference to a ui widget representing the ampere entity (app, view, etc.)
    */
  PEER    : {
    value  : Symbol('AMPERE_UI_PEER'),
    writable: false
  },
    /*
    * tells the ui that these view should be rendered on top of another view.
    * a stacked view will be rendered as dialog with the parent view as background.
    * stacking can have infinite levels.
    */
  PARENT  : {
    value  : Symbol('AMPERE_UI_PARENT'),
    writable: false
  },
  CAPTION  : {
    value  : Symbol('AMPERE_UI_CAPTION'),
    writable: false
  },
  DESCRIPTION  : {
    value  : Symbol('AMPERE_UI_DESCRIPTION'),
    writable: false
  },
  ICON      : {
    value  : Symbol('AMPERE_UI_ICON'),
    writable: false
  },
  HOTKEY      : {
    value  : Symbol('AMPERE_UI_HOTKEY'),
    writable: false
  },
    /*
    * provides the layout name/id to use when rendering a view
    */
  LAYOUT      : {
    value  : Symbol('AMPERE_UI_LAYOUT'),
    writable: false
  },

    /*
    * provides the position information of an object.
    * providing an array as value is also supported.
    *
    * can be used to give the renderer the ability to filter out which transitions
    * at which location (global toolbar, tab, local tololbar etc.) to render
    */
  LOCATION : {
    value  : Symbol('AMPERE_UI_LOCATION'),
    writable: false
  }
});

export default Ui;

`
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
  },`
