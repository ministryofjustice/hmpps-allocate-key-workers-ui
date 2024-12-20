// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom'

// @ts-expect-error setImmediate args have any types
globalThis.setImmediate = globalThis.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args))

// Reset JSDOM

type AddEventListenerParams = Parameters<Document['addEventListener']>
const sideEffects = {
  document: {
    addEventListener: {
      fn: document.addEventListener,
      refs: [] as {
        type: AddEventListenerParams['0']
        listener: AddEventListenerParams['1']
        options: AddEventListenerParams['2']
      }[],
    },
    keys: Object.keys(document) as unknown as (keyof typeof document)[],
  },
  window: {
    addEventListener: {
      fn: window.addEventListener,
      refs: [] as {
        type: AddEventListenerParams['0']
        listener: AddEventListenerParams['1']
        options: AddEventListenerParams['2']
      }[],
    },
    keys: Object.keys(window) as unknown as (keyof typeof window)[],
  },
}

// Lifecycle Hooks
// -----------------------------------------------------------------------------
beforeAll(async () => {
  // Spy addEventListener
  ;['document', 'window'].forEach(_obj => {
    const obj: 'document' | 'window' = _obj as 'document' | 'window'
    const { fn } = sideEffects[obj].addEventListener
    const { refs } = sideEffects[obj].addEventListener

    const addEventListenerSpy: Document['addEventListener'] = (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options: boolean | EventListenerOptions,
    ) => {
      // Store listener reference so it can be removed during reset
      refs.push({ type, listener, options })
      // Call original window.addEventListener
      fn(type, listener, options)
    }

    // Add to default key array to prevent removal during reset
    sideEffects[obj].keys.push('addEventListener')

    // Replace addEventListener with mock
    global[obj].addEventListener = addEventListenerSpy
  })
})

// Reset JSDOM. This attempts to remove side effects from tests, however it does
// not reset all changes made to globals like the window and document
// objects. Tests requiring a full JSDOM reset should be stored in separate
// files, which is only way to do a complete JSDOM reset with Jest.
beforeEach(async () => {
  const rootElm = document.documentElement

  // Remove attributes on root element
  ;[...rootElm.attributes].forEach(attr => rootElm.removeAttribute(attr.name))

  // Remove elements (faster than setting innerHTML)
  while (rootElm.firstChild) {
    rootElm.removeChild(rootElm.firstChild)
  }

  // Remove global listeners and keys
  ;['document', 'window'].forEach(_obj => {
    const obj: 'document' | 'window' = _obj as 'document' | 'window'
    const { refs } = sideEffects[obj].addEventListener

    refs.forEach(ref => {
      const { type, listener, options } = ref
      global[obj].removeEventListener(type, listener, options)
    })

    // need a semicolon to start here because we have semis turned off and ASI won't work and eslint tries to blend the two together
    ;(Object.keys(global[obj]) as unknown as (keyof (typeof global)[typeof obj])[])
      .filter(key => !sideEffects[obj].keys.includes(key) && !key.includes('coverage'))
      .forEach(key => {
        delete global[obj][key]
      })
  })

  // Restore base elements
  rootElm.innerHTML = '<head></head><body></body>'
})

export {}
