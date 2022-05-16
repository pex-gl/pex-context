import { checkProps } from "./utils.js";

const allowedProps = ["target"];

function createQuery(ctx, opts = {}) {
  checkProps(allowedProps, opts);

  const gl = ctx.gl;

  const query = Object.assign(
    {
      class: "query",
      handle: gl.createQuery(),
      target: null,
      state: ctx.QueryState.Ready,
      result: null,
      _begin: begin,
      _end: end,
      _available: available,
      _dispose() {
        gl.deleteQuery(this.handle);
        this.handle = null;
      },
    },
    opts
  );

  if (!query.target) {
    query.target = ctx.capabilities.disjointTimerQuery
      ? ctx.QueryTarget.TimeElapsed
      : ctx.QueryTarget.AnySamplesPassed;
  }

  return query;
}

function begin({ QueryState, gl }, q) {
  if (q.state !== QueryState.Ready) return false;
  gl.beginQuery(q.target, q.handle);
  q.state = QueryState.Active;
  q.result = null;
  return true;
}

function end({ QueryState, gl }, q) {
  if (q.state !== QueryState.Active) return false;
  gl.endQuery(q.target);
  q.state = QueryState.Pending;
  return true;
}

function available({ gl, QueryState }, q) {
  const available = gl.getQueryParameter(q.handle, gl.QUERY_RESULT_AVAILABLE);
  if (available) {
    q.result = gl.getQueryParameter(q.handle, gl.QUERY_RESULT);
    q.state = QueryState.Ready;
    return true;
  } else {
    return false;
  }
}

export default createQuery;
