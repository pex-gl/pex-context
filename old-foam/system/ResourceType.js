/**
 * Type of resource
 * @type {{IMAGE: string, ARRAY_BUFFER: string, BLOB: string, DOCUMENT: string, JSON: string, TEXT: string, OBJ: string}}
 */

var ResourceType = {
    IMAGE        : 'image',
    ARRAY_BUFFER : 'arraybuffer',
    BLOB         : 'blob',
    DOCUMENT     : 'document',
    JSON         : 'json',
    TEXT         : 'text',
    OBJ          : 'obj'
};

module.exports = ResourceType;