function mymodule() {
  var module;
  window.Ampere.default.domain('mydomain', function(domain, createModule) {
    module = createModule('mymodule', function(module, createState, createTransition) {
      module.options[domain.Ampere.UI.ICON] = 'send';
      module.options[domain.Ampere.UI.HOMEPAGE] = 'http://web.de';

      var mystate = createState('mystate', function(state, createView, createTransition) {
        state.options[domain.Ampere.UI.ICON] = 'refresh';
        state.foo = 'bar';

        var view = createView(null, function(view, createTemplate) {
          view.log("view created");

          view.promise.then(function(result) {
            view.log("fertig : " + result);
          });
          view.options[domain.Ampere.UI.DESCRIPTION]="hilfe!!";
            // TODO : view template laden
          //createTemplate(document.querySelector('#mystate_view'));

          return new Promise(function(resolve,reject) {
            setTimeout(function() {
              resolve("supi!");
            }, 300);
          });
        });

        var view1 = createView('view1', function(view, createTemplate) {
            // TODO : view template laden
          createTemplate(document.querySelector('#mystate_view1'));
        });

        createTransition('a', function(transition) {
          transition.options[domain.Ampere.UI.SCOPE] = 'local';
          transition.transaction = function(transition) {
          };
        }, view1);

        createTransition('b', function(transition) {
          transition.options[domain.Ampere.UI.SCOPE] = 'global';
          transition.transaction = function(transition) {
          };
          transition.disabled = function() {
            return new Promise(function(resolve,reject) {
              setTimeout(function() {
                // console.warn("i was called");
                resolve();
              }, 3000)
            });
          }
        });

        createTransition('c', function(transition) {
          transition.options[domain.Ampere.UI.SCOPE] = 'global';
          transition.options[domain.Ampere.UI.ICON] = '';
          transition.options[domain.Ampere.UI.DESCRIPTION] = 'Sowas aber auch';
          transition.transaction = function(transition) {
          };
        });

        createTransition('undoable', function(transition) {
          transition.options[domain.Ampere.UI.SCOPE] = 'local';
          transition.transaction = function(transition) {
            transition.log("transaction() called");

            var undo = function() {
              transition.log("undo() called");
              return redo;
            };

            var redo = function() {
              transition.log("redo() called");
              return undo;
            };

            return redo;
          };
        }, view);

        createTransition('e', function(transition) {
          transition.transaction = function(transition) {
          };
        }, view);
      });

      createTransition( 'eins', function(transition) {
        transition.options[domain.Ampere.UI.SCOPE] = 'global';
        transition.options[domain.Ampere.UI.ICON] = 'settings';
      }, mystate);
      createTransition( 'zwo', function(transition) {
        transition.options[domain.Ampere.UI.SCOPE] = 'global';
        transition.options[domain.Ampere.UI.ICON] = 'menu';
        transition.options[domain.Ampere.UI.CAPTION] = '';
      }, mystate);
      createTransition( 'drei', function(transition) {
        transition.options[domain.Ampere.UI.SCOPE] = 'global';
      }, mystate);
      createTransition( 'throwexbefore', function(transition) {
        transition.options[domain.Ampere.UI.SCOPE] = 'global';
        transition.options[domain.Ampere.UI.ICON] = '';
        transition.transaction = function(transition) {
          throw new Error("hier ging was schief");
        };
      }, mystate);
      createTransition( 'fünf', function(transition) {
        transition.options[domain.Ampere.UI.SCOPE] = 'local';
        transition.options[domain.Ampere.UI.ICON] = '';
      }, mystate);
    });
  });

  return module;
};
