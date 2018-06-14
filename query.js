const checkProps = require('./check-props')
const assert = require('assert')

const allowedProps = [
  'target'
]

function createQuery (ctx, opts) {
  const gl = ctx.gl
  opts = opts || {}
  checkProps(allowedProps, opts)

  const query = Object.assign({
    class: 'query',
    handle: gl.createQuery(),
    target: null,
    state: ctx.QueryState.Ready,
    result: null,
    _begin: begin,
    _end: end,
    _available: available,
    _dispose: function () {
      gl.deleteQuery(this.handle)
      this.handle = null
    }
  }, opts)

  if (!query.target) {
    query.target = ctx.QueryTarget.TimeElapsed
  }

  return query
}

function begin (ctx, q) {
  if (q.state !== ctx.QueryState.Ready) return false
  ctx.gl.beginQuery(q.target, q.handle)
  q.state = ctx.QueryState.Active
  q.result = null
  return true
}

function end (ctx, q) {
  if (q.state !== ctx.QueryState.Active) return false
  ctx.gl.endQuery(q.target)
  q.state = ctx.QueryState.Pending
  return true
}

function available (ctx, q) {
  var available = ctx.gl.getQueryObject(q.handle, ctx.gl.QUERY_RESULT_AVAILABLE)
  if (available) {
    q.result = ctx.gl.getQueryObject(q.handle, ctx.gl.QUERY_RESULT)
    q.state = ctx.QueryState.Ready
    return true
  } else {
    return false
  }
}

module.exports = createQuery
