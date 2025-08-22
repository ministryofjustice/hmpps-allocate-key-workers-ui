export function initialiseDropdown(policyStaff, staff) {
  if (window['jsDisabled']) {
    return
  }

  function createOption(text, value, selected) {
    const option = document.createElement('option')
    option.text = text
    option.value = value
    if (selected) {
      option.selected = selected
    }
    return option
  }

  function conditionallyPopulateSelect(select) {
    if (select.children.length > 2) {
      console.warn(`Skipping populating select with ${select.children.length} children`)
      return
    }

    // Delete all children after the first
    select.innerHTML = ''

    const staffId = select.attributes['staff-id']?.value || ''
    const personId = select.attributes['person-id']?.value || ''
    const recommendedId = select.attributes['recommended-id']?.value || ''

    // Insert Select (policyName) as first option always
    select.appendChild(createOption(`Select ${policyStaff}`, ''))

    // Equal to conditionallyAddDeallocate
    if (staffId) {
      select.appendChild(createOption('Deallocate', `${personId}:deallocate:${staffId}`))
    }

    staff.forEach(option => {
      if (option.onlyFor && option.onlyFor !== personId) return

      let opt = createOption(option.text, option.value)

      // Equal to excludeCurrentStaffMember
      if (staffId && opt.value.includes(`:${staffId}`)) {
        return
      }

      if (recommendedId && opt.value.includes(`:${recommendedId}`)) {
        opt.selected = true
      }

      // Equal to mergePrisonerKeyworkerIds
      opt.value = `${personId}:${opt.value}`
      select.appendChild(opt)
    })
  }

  document.querySelectorAll('.placeholder-select').forEach((select, i) => {
    if (i == 0) {
      // Populate the first one so that table space gets reserved correctly
      conditionallyPopulateSelect(select)
    }

    select.addEventListener('focus', e => {
      conditionallyPopulateSelect(select)
    })
  })
}
