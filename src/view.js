import {Diary} from '../lib/diary/diary';
Diary.logger('view').info( "loaded");

import Base from "./base";

	/**
		helper function to create a view template
	*/
function createTemplate(value) {
	var template;
	if(value instanceof HTMLTemplateElement) {
		template = value.cloneNode(true);
	} else if(value instanceof DocumentFragment) {
		template = document.createElement('template');
		template.content = value;
	} else if(value instanceof Element) {
		let f = document.createDocumentFragment();
		f.appendChild(value.cloneNode(true));
		content  = f;

		template = document.createElement('template');
		template.content = value;
	} else {
		var nl = new DOMParser().parseFromString(content.trim(), 'text/html').body.childNodes,
				f  = document.createDocumentFragment();

		for(var i=0; i<nl.length; i++) {
			f.appendChild(nl[i].cloneNode(true));
		};

		value = f;
		template = document.createElement('template');
		template.content = value;
	}

	Object.defineProperties(this,{
		'template'	: {
			value			: template,
			writable : false
		}
	});
}

/**
	View is a dedicated screen of a State. A State has always >= 1 views.

	Multiple views can be used to have different user interfaces for the same state
	(think about desktop versus print or mobile screen of a website).
*/
export default class View extends Base {
	constructor(state:State, name:string, cb:Function) {
		super(name, 'view', state.options);

		Object.defineProperties(this, {
			'state' : {
				value    : state,
				writable : false
			}
		});

			// we wrap the callback argument to ensure that the
			// promise property will reflect also the warning
			// when no template was assigned to the view were registered
		let cbWithAssertion = ()=>{
			return new Promise((resolve,reject)=>{
				try {
					return Promise.resolve(
						cb(this, createTemplate.bind(this))
					).then(retval=>{
						!('template' in this) && this.log.warn("no template was assigned.");
						return retval;
					})
					.then(resolve, reject);
				} catch(ex) {
					reject(ex);
				}
			})
		};

		this.options[Base._PROMISIFY](cbWithAssertion);
	}
}

import State from "./state";
