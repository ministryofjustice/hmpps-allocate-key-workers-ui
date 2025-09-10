import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import Card from './card'
import { nodeListForEach } from './utils'
import { initialiseDropdown } from './allocation-dropdown'
import { initAllocateStickyAction } from './allocation-sticky-action'

govukFrontend.initAll()
mojFrontend.initAll()
window.MojFrontend = mojFrontend
window.initialiseDropdown = initialiseDropdown
window.initAllocateStickyAction = initAllocateStickyAction

var $cards = document.querySelectorAll('.card--clickable')
nodeListForEach($cards, function ($card) {
  new Card($card)
})

Array.from(document.querySelectorAll('a')).forEach(link => {
  link.addEventListener('click', evt => {
    link.classList.add('disable-link')
    setTimeout(() => link.classList.remove('disable-link'), 1000)
  })
})
