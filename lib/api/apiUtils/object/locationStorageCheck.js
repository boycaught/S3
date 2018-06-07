const { config } = require('../../Config');
const { listLocationMetric } = require('../../utapi/utilities');

function locationStorageCheck(request, objMD, location, cb) {
    const newByteLength = request.parsedContentLength;
    const oldByteLength = objMD && objMD['content-length']
    !== undefined ? objMD['content-length'] : null;

    return listLocationMetric(location, (err, metric) => {
        if (err) {
            return cb(err);
        }
        const newStorageSize = metric.storageSize + newByteLength;
        const storageSizeLimit = config.locationConstraints[location].storageSizeLimit;

        if (storageSizeLimit && storageSizeLimit < newStorageSize) {
            return cb(err);
        }
        if (storageSizeLimit && storageSizeLimit > newStorageSize) {
            return cb(null, 'yay, you have space');
        }
        return cb();
    });
}

module.exports = locationStorageCheck;
