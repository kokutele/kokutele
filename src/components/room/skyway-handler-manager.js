
class SkywayHandlerManager {
  _handler = null

  set handler( obj ) {
    this._handler = obj
  }

  get handler() {
    return this._handler
  }
}

const _skywayHandlerManager = new SkywayHandlerManager()

export function setSkywayHandler(handler) {
  _skywayHandlerManager.handler = handler
}

export function getSkywayHandler() {
  return _skywayHandlerManager.handler
}

