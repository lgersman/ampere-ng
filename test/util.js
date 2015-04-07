import View from "../src/view";

function createMockTemplate(view:View, template) {
  Object.defineProperties(view,{
    'template'  : {
      value      : template,
      writable  : false
    }
  });
}

export default {
  createMockTemplate
}
