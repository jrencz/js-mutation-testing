/**
 * Utility for creating a mutation object
 * Created by Martin Koster on 2/16/15.
 */
var _ = require('lodash');

var createMutation = function (astNode, endOffset, parentMutationId, replacement) {
    replacement = replacement || '';
    return {
        range: astNode.range,
        begin: astNode.range[0],
        end: endOffset,
        line: astNode.loc.start.line,
        col: astNode.loc.start.column,
        parentMutationId: parentMutationId,
        mutationId: _.uniqueId(),
        replacement: replacement
    };
};

var createAstArrayElementDeletionMutation = function (astArray, element, elementIndex, parentMutationId) {
    var endOffset = (elementIndex === astArray.length - 1) ? // is last element ?
        element.range[1] :                     // handle last element
        astArray[elementIndex + 1].range[0];   // care for commas by extending to start of next element
    return createMutation(element, endOffset, parentMutationId);
};

var createOperatorMutation = function (astNode, parentMutationId, replacement) {
    return {
        range: astNode.range,
        begin: astNode.left.range[1],
        end: astNode.right.range[0],
        line: astNode.left.loc.end.line,
        col: astNode.left.loc.end.column,
        mutationId: _.uniqueId(),
        parentMutationId: parentMutationId,
        replacement: replacement
    };
};
var createUnaryOperatorMutation = function (astNode, parentMutationId, replacement) {
    return {
        range: astNode.range,
        begin: astNode.range[0],
        end: astNode.range[0]+1,
        line: astNode.loc.end.line,
        col: astNode.loc.end.column,
        mutationId: _.uniqueId(),
        parentMutationId: parentMutationId,
        replacement: replacement
    };
};

module.exports.createMutation = createMutation;
module.exports.createAstArrayElementDeletionMutation = createAstArrayElementDeletionMutation;
module.exports.createOperatorMutation = createOperatorMutation;
module.exports.createUnaryOperatorMutation = createUnaryOperatorMutation;
