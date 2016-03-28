'use strict';

export var templates = {
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