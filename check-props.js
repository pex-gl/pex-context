function checkProps (allowedProps, obj) {
  Object.keys(obj).forEach((prop) => {
    if (allowedProps.indexOf(prop) === -1) {
      throw new Error(`Unknown prop "${prop}"`)
    }
  })
}

module.exports = checkProps
