export const initMojFilter = (startHidden, showText, hideText) => {
  const filter = document.querySelector('[data-module="moj-filter"]')
  filter && window.MojFrontend && new window.MojFrontend.FilterToggleButton(filter, {
    bigModeMediaQuery: '(min-width: 48.063em)',
    startHidden,
    toggleButton: {
      showText,
      hideText,
      classes: 'govuk-button--primary'
    },
    toggleButtonContainer: {
      selector: '.moj-action-bar__filter'
    },
    closeButton: {
      text: 'Close'
    },
    closeButtonContainer: {
      selector: '.moj-filter__header-action'
    }
  })
}
