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
		value	: 'AMPERE_NAME',
		writable: false
	},
		// unique object namespace (derived from its name and parent name)
	'NAMESPACE' : {
		value	: 'AMPERE_NAMESPACE',
		writable: false
	},
		// object type (module,state,transition,...)
	'TYPE' : {
		value	: 'AMPERE_TYPE',
		writable: false
	},
		// the log instance for this object
	'LOG' : {
		value	: Symbol('AMPERE_LOG'),
		writable: false
	},
		// history related constants
	'HISTORY' : {
		value : {},
		writable : false
	},
		// ui relevant properties
	'UI' : {
		value	: { },
		writable: false
	},
});

Object.defineProperties(Constants.HISTORY, {
		// history limit (0=>no undo/redo, Number.POSITIVE_INFINITY>=no limit, >0=>count of stored undo/redo operations)
	'LIMIT' : {
		value	: Symbol('LIMIT'),
		writable: false
	}
});

Object.defineProperties(Constants.UI, {
		/**
		 transition option hinting the occurrence of the transition. can be one of
		 * 'global' transition should be rendered in the global transition list. this is the default for module transitions
		 * 'local'  transition should be rendered into the state related transition list, this is the default for regular transitions (of states).
		 * 'private' transitions should not be rendered in global and local transition list
		*/
	'SCOPE'	: {
		value	: Symbol('AMPERE_UI_SCOPE'),
		writable: false
	},
		/**
		* may be used by the ui to retrieve the application web site
		*/
	'HOMEPAGE'	: {
		value	: 'AMPERE_UI_HOMEPAGE',
		writable: false
	},
		/*
		* tells the ui that these view should be rendered on top of another view.
		* a stacked view will be rendered as dialog with the previous view as background.
		* stacking can have infinite levels.
		*/
	'PARENT'	: {
		value	: Symbol('AMPERE_UI_PARENT'),
		writable: false
	},
	'CAPTION'	: {
		value	: 'AMPERE_UI_CAPTION',
		writable: false
	},
	'DESCRIPTION'	: {
		value	: 'AMPERE_UI_DESCRIPTION',
		writable: false
	},
	'ICON'			: {
		value	: 'AMPERE_UI_ICON',
		writable: false
	}
});

`,
	/**
		can be used to group local/global transition together in a submenu
	*/
'GROUP'	: {
	value	: Symbol('GROUP'),
	writable: false
},
	/**
		brauchmer das ?
	*/
'KIND'	: {
	value	: Symbol('KIND'),
	writable: false
},
	/**
		brauchmer das ?
	*/
'APPEARANCE'	: {
	value	: Symbol('APPEARANCE'),
	writable: false
},
`

export default Constants;
