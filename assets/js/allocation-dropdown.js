export function initialiseDropdown(policyStaff, staff, allocationOrder) {
  function createOption(text, value, selected) {
    const option = document.createElement('option')
    option.text = text
    option.value = value
    if (selected) {
      option.selected = selected
    }
    return option
  }

  function sortStaff(staffList, order) {
    const sortedStaff = [...staffList]

    function extractAllocationCount(text) {
      const match = text.match(/\(allocations:\s*(\d+)\)/)
      return match ? parseInt(match[1], 10) : 0
    }

    if (order === 'BY_NAME') {
      return sortedStaff.sort((a, b) => a.text.localeCompare(b.text))
    } else if (order === 'BY_ALLOCATIONS') {
      return sortedStaff.sort((a, b) => {
        const aCount = extractAllocationCount(a.text)
        const bCount = extractAllocationCount(b.text)
        return aCount - bCount
      })
    } else {
      return sortedStaff
    }
  }

  function conditionallyPopulateSelect(select) {
    if (select.children.length > 2) {
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

    const sortedStaff = sortStaff(staff, allocationOrder)

    sortedStaff.forEach(option => {
      if (option.onlyFor && option.onlyFor !== personId) return
      if (!option.onlyFor && option.value.endsWith(`:${recommendedId}`)) return

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
