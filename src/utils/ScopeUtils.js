/**
 * remove variables from the 'loopVariables' array if they are being redefined in the new function scope.
 * All variables are retrieved from the current AST node and iteratively compared with the content in loopVariables
 *
 * TODO: currently dead code - remove if this doesn't prove to be required after all
 * Created by Martin Koster on 2/25/15.
 */
var _ = require('lodash');

/**
 * remove variables from the 'loopVariables' array if they are being redefined in the new function scope.
 * All variables are retrieved from the current AST node and iteratively compared with the content in loopVariables
 * If the given node contains child nodes this function will be called (recursively) with the child nodes
 *
 * @param astNode the node to search for overriding variables in
 * @param loopVariables array of variables that belong to a loop invariant and therefore should be exempt from mutations
 * @returns [string] a new array containing loop variables - fewer than the original if some were being overridden in the new function scope
 */
function removeOverriddenLoopVariables(astNode, loopVariables) {
    var result = loopVariables;

    if (astNode && astNode.type === 'VariableDeclarator') {
    }
    if (!astNode || hasNewScope(astNode)) {
        return loopVariables; // new scope: any variables therein have no bearing on current scope
    }
    if (astNode.type === 'VariableDeclaration') {
        result = processScopeVariables(astNode, loopVariables);
    }
    _.forOwn(astNode, function (childNode) {
        result = removeOverriddenLoopVariables(childNode, result);
    });

    return result;
}

/**
 * determines a scope change.
 * @param astNode
 * @returns {boolean}
 */
function hasNewScope(astNode) {
    return astNode.type === 'FunctionDeclaration' || astNode.type === 'FunctionExpression';
}

/**
 * Filters Identifiers within given variableDeclaration out of the loopVariables array.
 *
 * Filtering occurs as follows:
 * XOR : (intermediate) result + variable identifiers found => a combined array minus identifiers that overlap
 * INTERSECTION: (intermediate) result + combined array to filter out variables that weren't in the original loopVariables array
 * @param {object} variableDeclaration declaration block of one or more variables
 * @param {Array} loopVariables list of variables that are part of a loop invariable and should therefore not undergo mutations - unless overridden by another variable in the current function scope
 */
function processScopeVariables(variableDeclaration, loopVariables) {
    var identifiers = [], exclusiveCombination;

    _.forEach(variableDeclaration.declarations, function(declaration) {
        identifiers.push(declaration.id.name);
    });

    exclusiveCombination = _.xor(loopVariables, identifiers);
    return _.intersection(loopVariables, exclusiveCombination);
}

module.exports.removeOverriddenLoopVariables = removeOverriddenLoopVariables;
module.exports.hasNewScope = hasNewScope;
