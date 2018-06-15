const { errors } = require('arsenal');

const { config } = require('../../../Config');
const { listLocationMetric, pushLocationMetric } =
    require('../../../utapi/utilities');

function _gbToBytes(gb) {
    return gb * 1024 * 1024 * 1024;
}

function locationStorageCheck(request, objMD, location, log, cb) {
    const newByteLength = request.parsedContentLength;
    const sizeLimitGB = config.locationConstraints[location].sizeLimitGB;
    if (sizeLimitGB === undefined) {
        return cb();
    }
    return listLocationMetric(location, log, (err, bytesStored) => {
        if (err) {
            log.error(`Error listing metrics from Utapi: ${err.message}`);
            return cb(err);
        }
        const newStorageSize = bytesStored + newByteLength;
        const sizeLimitBytes = _gbToBytes(sizeLimitGB);
        if (sizeLimitBytes < newStorageSize) {
            return cb(errors.AccessDenied.customizeDescription(
                `The assigned storage space limit for location ${location} ` +
                'will be exceeded'));
        }
        if ((newStorageSize / sizeLimitBytes) > 0.8) {
            log.warn(`${location} location storage space is above 80% ` +
                'capacity');
        }
        return pushLocationMetric(location, newByteLength, log, cb);
    });
}

module.exports = locationStorageCheck;
