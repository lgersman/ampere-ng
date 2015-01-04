// http://pag.forbeslindesay.co.uk/#/22

function async(makeGenerator){
  return function (){
    var generator = makeGenerator.apply(this, arguments)

    function handle(result){ // { done: [Boolean], value: [Object] }
      if (result.done) return result.value

      return result.value.then(function (res){
        return handle(generator.next(res))
      }, function (err){
        return handle(generator.throw(err))
      })
    }

    return handle(generator.next())
  }
}

# polymer

* notify readonly properties : http://www.html5rocks.com/en/tutorials/es7/observe/?redirect_from_locale=de#toc-synth-change-records

* water detail example : http://www.clipdog.co.uk/masterdetail/html/docs.html

* http://stackoverflow.com/questions/24347119/how-to-tell-when-polymer-is-done-with-all-the-data-binding?rq=1

# paper-toast

this.$.toast.addEventListener('core-overlay-open', function() {
    // prevent automatic dismiss
  if(this.$.toast.opened) {
    this.$.toast.dismissJob.stop();
  }
}.bind(this));

## ampere-module

* default template
````
  <ampere-module controller="{{controller}}"></ampere-module>
````

* custom template
````
<polymer-element name="my-ampere-module" extends="ampere-module" noscript>
  <template>
    my template(module={{view.state.module.name}})
  </template>
</polymer-element>

<my-ampere-module controller="{{controller}}"></my-ampere-module>
````
