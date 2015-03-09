/*
  macro removes statements of the following form

  console.log(...)
  this.log(...)
  this.<subsequent calls>.log( ...).<more subsequent calls> (just the log(...) call gets removed)

  debugger(;?)
*/
macro log {
  case infix { console . | $log ( $args ... ); } => {
    return #{
    }
  }
  case infix { this . | $log ( $args ... ); } => {
    return #{
    }
  }
  case infix { . | $log ( $args ... ) } => {
    return #{
    }
  }
  case { _ } => {
    return #{
      _
    }
  }
}

macro debugger {
  rule { ; } => {
  }
  rule { } => {
  }
}
export log;
export debugger;
