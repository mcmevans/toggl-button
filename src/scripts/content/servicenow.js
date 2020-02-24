'use strict';

/* global togglbutton, $ */

const iframe = document.getElementById('gsft_main');

if (iframe) {
  iframe.addEventListener('load', function () {
    // #todo: check for iFrame and handle accordingly
    const targetDocument = document.getElementById('gsft_main').contentWindow.document;
    const targetElement = $('.navbar-right', targetDocument);
    const link = togglbutton.createTimerLink({
      className: 'servicenow',
      description: getDescription(targetDocument),
      projectName: getProject(targetDocument),
      tags: ''
    });
    targetElement.classList.add('toggl');
    targetElement.prepend(link);
    togglbutton.queryAndUpdateTimerLink();
  });
} else {
  togglbutton.render(
    '.navbar-right:not(.toggl)',
    { observe: true },
    $container => {
      const descriptionSelector = () => {
        return getDescription();
      };
      const projectSelector = () => {
        getProject();
      };
      const tagsSelector = () => {
        return [];
      };
      const link = togglbutton.createTimerLink({
        className: 'servicenow',
        description: descriptionSelector,
        projectName: projectSelector,
        tags: tagsSelector
      });
      $container.prepend(link);
    },
    '.navbar-right'
  );
}

function getDescription (targetDocument) {
  // Return the ServiceNow "Display Value" of the Record with
  // the Record "Number" prepended if there is one available.
  // If the Display Value is just the Number then look for a
  // "Short description" to append.

  // This allows us to handle the iFrame issue
  targetDocument = targetDocument || document;

  // This is the string name of the ServiceNow Table for the Record
  // eg incident, sc_req_item, rm_story etc
  const recordTableName = $('.form_title', targetDocument).id.split('.')[0];
  let $description = $('.navbar-title-display-value', targetDocument).firstChild.textContent;
  const $recordNumberElement = targetDocument.getElementById(recordTableName + '.number');
  let $recordNumber;
  if ($recordNumberElement) {
    $recordNumber = $recordNumberElement.value;
  }
  if ($recordNumber && $description.indexOf($recordNumber) === -1) {
    $description = $recordNumber + ' - ' + $description;
  } else if ($recordNumber === $description) {
    // Just Number isn't much help, append short_description if it's there
    const $shortDescriptionElement = targetDocument.getElementById(recordTableName + '.short_description');
    if ($shortDescriptionElement) {
      $description = $description + ' - ' + $shortDescriptionElement.value;
    }
  }
  return $description;
}

function getProject (targetDocument) {
  // This allows us to handle the iFrame issue
  targetDocument = targetDocument || document;
  const recordTableName = $('.form_title', targetDocument).id.split('.')[0];
  let projectName;
  switch (recordTableName) {
    case 'incident':
    case 'sc_req_item':
      projectName = 'ServiceNow Support';
      break;
    default:
      projectName = 'ServiceNow Development';
      break;
  }
  return projectName;
}
