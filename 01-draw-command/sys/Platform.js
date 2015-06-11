module.exports.isPlask = typeof window === 'undefined' && typeof process === 'object';
module.exports.isBrowser = typeof window === 'object' && typeof document === 'object';
module.exports.isEjecta = typeof ejecta === 'object' && typeof ejecta.include === 'function';
module.exports.isiOS = module.exports.isBrowser && typeof navigator === 'object' && /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
module.exports.isMobile = module.exports.isiOS;
