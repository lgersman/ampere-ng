var domain = window.Ampere.default.domain('mydomain', function(domain, createModule) {
  createModule('mymodule', function(module, createState) {
    createState('mystate', function(state, createView, createTransition) {
      createView('myview', function(view) {
        view.log("view created");

        view.promise.then(function(result) {
          view.log("fertig : " + result);
        });

        return new Promise(function(resolve,reject) {
          setTimeout(function() {
            resolve("supi!");
          }, 3000);
        });
      });
    });
  });
});

var app = window.Ampere.default.app(domain.modules['mymodule'].states['mystate'].views['myview'], function() {});
