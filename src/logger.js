let filters = [];

let log = function(priority,logger,args) {
  if(priority!='log' && console) {
    for(let filter in filters) {
      if(filter.test(this.type)) {
        console[priority].apply(console, [logger.prefix(args[0])]);
        break;
      }
    }
  }
};

class Log {
  constructor(type,namespace) {
    this.namespace = namespace||'';
    this.type = type;
  }

  log() {
    log('log',this,arguments);
    return this;
  }

  info() {
    log('info',this,arguments);
    return this;
  }

  warn() {
    log('warn',this,arguments);
    return this;
  }

  error() {
    log('error',this,arguments);
    return this;
  }

  assert(condition, msg) {
    typeof(condition)==='function' && (condition=condition());
    if(!condition) {
      typeof(msg)==='function' && (msg=msg());
      throw new Error(this.prefix(msg));
    }
    return this;
  }

  prefix(msg) {
    return `${this.type}${this.namespace ? ':' + this.namespace : ''}${msg ? ' : ' + msg : ''}`;
  }
}

const LOGGERS = new Map();

export default function Logger(type,namespace) {
  const KEY = `${type}:${namespace||''}`;

  LOGGERS.has(KEY) || LOGGERS.set(KEY, new Log(type, namespace));

  return LOGGERS.get(KEY);
}

Object.defineProperty(Logger, 'filter', {
  get : function() {
    return filters;
  },
  set : function(args) {
    if(!Array.isArray(args)) {
      args = [args];
    }

    for(let i in args) {
      if(!(args[i] instanceof RegExp)) {
        throw new Error(`Logger.filter(...args) : argument(s) expected to be regexp's but argument[${i}] was ${filter}`);
      }
    }

    filters = args;
  },
  configurable : false,
  enumerable   : true
});
