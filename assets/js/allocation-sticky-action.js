const updateActionBar = () => {
  let changeCount = 0
  document.querySelectorAll('select[name="selectStaffMember"]').forEach(dropdown => {
    if (dropdown.value) {
      changeCount++
    }
  })
  if (changeCount) {
    document.querySelector('.sticky-action-bar').style.display = 'flex'
    document.querySelector('.change-count').innerHTML = `${changeCount} change${changeCount === 1 ? '' : 's'} selected`
  } else {
    document.querySelector('.sticky-action-bar').style.display = 'none'
  }
}

export const initAllocateStickyAction = () => {
  document
    .querySelectorAll('select[name="selectStaffMember"]')
    .forEach(dropdown => dropdown.addEventListener('change', updateActionBar))

  document.querySelector('.clear-select')?.addEventListener('click', e => {
    document.querySelectorAll('select[name="selectStaffMember"]').forEach(dropdown => (dropdown.value = ''))
    updateActionBar()
  })
}
