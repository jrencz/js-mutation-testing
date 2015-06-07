/**
 * modifies an AST Node with the given mutations and returns a mutation report for each mutation done
 * @author Martin Koster, created on 07/06/15.
 * Licensed under the MIT license.
 */
(function (module) {
    'use strict';

    var _ = require('lodash'),
        MutationOperatorHandler = require('MutationOperatorHandler'),
        esprima = require('esprima'),
        escodegen = require('escodegen');

    var Mutator = function(src) {
        this._brackets = _.filter(esprima.tokenize(src, {range: true}), {"type": "Punctuator", "value": "("});
        this._handler = new MutationOperatorHandler();
    };

    /**
     * Mutates the code by epplying each mutation operator in the given set
     * @param mutationOperatorSet set of mutation operators which can be executed to effect a mutation on the code
     * @returns {*} a mutation report detailing which part of the code was mutated and how
     */
    Mutator.prototype.mutate = function(mutationOperatorSet) {
        var self = this,
            mutationReports;

        this._handler.undo(); //undo previous mutation operation, will do nothing if this is the first
        mutationReports = this._handler.applyMutation(mutationOperatorSet);
        return _.reduce(mutationReports, function(result, mutationReport) {
            result.push(_.merge(mutationReport, calibrateBeginAndEnd(mutationReport.begin, mutationReport.end, self._brackets)));
        }, []);
    };

    function calibrateBeginAndEnd(begin, end, brackets) {
        //return {begin: begin, end: end};
        var beginBracket = _.find(brackets, function (bracket) {
                return bracket.range[0] === begin;
            }),
            endBracket = _.find(brackets, function (bracket) {
                return bracket.range[1] === end;
            });

        return {
            begin: beginBracket && beginBracket.value === ')' ? begin + 1 : begin,
            end: endBracket && endBracket.value === '(' ? end - 1 : end
        };
    }

    module.exports = Mutator;

})(module);