(function () {
  'use strict';

  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var Handlebars = window.flatworld_libraries.Handlebars;

  window.flatworld.UIs = window.flatworld.UIs || {};
  window.flatworld.UIs.default = window.flatworld.UIs.default || {};
  window.flatworld.UIs.default.templates = {
    multiSelection: Handlebars.compile(`
      <span style='font-size:200%;display:block;margin-bottom:20px;'>
        {{title}}
      </span>
      <ul>
        {{#each objects}}
        <li>
          {{this.data.typeData.name}}
        </li>
        {{/each}}
      </ul>`),
    singleSelection: Handlebars.compile(`
      <span style='font-size:200%;display:block;margin-bottom:20px;'>
        {{title}}
      </span>
      <ul>
        <li>
          {{object.name}}
        </li>
      </ul>`)
  };
})();