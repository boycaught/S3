const { errors } = require('arsenal');

const { config } = require('../../../Config');
const { listLocationMetric, pushLocationMetric } =
    require('../../../utapi/utilities');

function locationStorageCheck(request, objMD, location, log, cb) {
    const newByteLength = request.parsedContentLength;
    // const oldByteLength = objMD && objMD['content-length']
    //     !== undefined ? objMD['content-length'] : null;
    const storageSizeLimit =
        config.locationConstraints[location].storageSizeLimit;
    if (storageSizeLimit === undefined) {
        return cb();
    }
    return listLocationMetric(location, log, bytesStored => {
        const newStorageSize = bytesStored + newByteLength;
        if (storageSizeLimit < newStorageSize) {
            return cb(errors.AccessDenied.customizeDescription(
                `The assigned storage space limit for location ${location} ` +
                'will be exceeded'));
        }
        if ((newStorageSize / storageSizeLimit) > 0.8) {
            log.warn(`${location} location storage space is above 80% ` +
                'capacity');
        }
        return pushLocationMetric(location, newByteLength, log, cb);
    });
}

module.exports = locationStorageCheck;
