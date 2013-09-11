exports.getObjectClass = function (obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    return /(\w+)\(/.exec(obj.constructor.toString())[1];
}

exports.getFunctionName = function (func) {
    if (typeof func !== 'function' || func === null) return false;
    return /(\w+)\(/.exec(func.toString())[1];
}

exports.getObjectName = function (obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    return obj.objectName;
}
