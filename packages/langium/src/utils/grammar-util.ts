/******************************************************************************
 * Copyright 2021-2022 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import { createDefaultModule, createDefaultSharedModule } from '../default-module';
import { inject, Module } from '../dependency-injection';
import { interpretAstReflection } from '../grammar/ast-reflection-interpreter';
import * as ast from '../grammar/generated/ast';
import { prepareGrammar, terminalRegex } from '../grammar/internal-grammar-util';
import { createLangiumGrammarServices, LangiumGrammarServices } from '../grammar/langium-grammar-module';
import { LanguageMetaData } from '../grammar/language-meta-data';
import { IParserConfig } from '../parser/parser-config';
import { LangiumGeneratedServices, LangiumGeneratedSharedServices, LangiumServices, LangiumSharedServices, PartialLangiumServices, PartialLangiumSharedServices } from '../services';
import { AstNode, CstNode, isCompositeCstNode } from '../syntax-tree';
import { getContainerOfType, streamAllContents } from '../utils/ast-util';
import { streamCst } from '../utils/cst-util';
import { EmptyFileSystem } from '../workspace/file-system-provider';

/**
 * Returns the entry rule of the given grammar, if any. If the grammar file does not contain an entry rule,
 * the result is `undefined`.
 */
export function getEntryRule(grammar: ast.Grammar): ast.ParserRule | undefined {
    return grammar.rules.find(e => ast.isParserRule(e) && e.entry) as ast.ParserRule;
}

/**
 * Determines the grammar expression used to parse a cross-reference (usually a reference to a terminal rule).
 * A cross-reference can declare this expression explicitly in the form `[Type : Terminal]`, but if `Terminal`
 * is omitted, this function attempts to infer it from the name of the referenced `Type` (using `findNameAssignment`).
 *
 * Returns the grammar expression used to parse the given cross-reference, or `undefined` if it is not declared
 * and cannot be inferred.
 */
export function getCrossReferenceTerminal(crossRef: ast.CrossReference): ast.AbstractElement | undefined {
    if (crossRef.terminal) {
        return crossRef.terminal;
    } else if (crossRef.type.ref) {
        const nameAssigment = findNameAssignment(crossRef.type.ref);
        return nameAssigment?.terminal;
    }
    return undefined;
}

/**
 * Determines whether the given terminal rule represents a comment. This is true if the rule is marked
 * as `hidden` and it does not match white space. This means every hidden token (i.e. excluded from the AST)
 * that contains visible characters is considered a comment.
 */
export function isCommentTerminal(terminalRule: ast.TerminalRule): boolean {
    return terminalRule.hidden && !' '.match(terminalRegex(terminalRule));
}

/**
 * Find all CST nodes within the given node that contribute to the specified property.
 *
 * @param node A CST node in which to look for property assignments. If this is undefined, the result is an empty array.
 * @param property A property name of the constructed AST node. If this is undefined, the result is an empty array.
 */
export function findNodesForProperty(node: CstNode | undefined, property: string | undefined): CstNode[] {
    if (!node || !property) {
        return [];
    }
    return findNodesForPropertyInternal(node, property, node.element, true);
}

/**
 * Find a single CST node within the given node that contributes to the specified property.
 *
 * @param node A CST node in which to look for property assignments. If this is undefined, the result is `undefined`.
 * @param property A property name of the constructed AST node. If this is undefined, the result is `undefined`.
 * @param index If no index is specified or the index is less than zero, the first found node is returned. If the
 *        specified index exceeds the number of assignments to the property, the last found node is returned. Otherwise,
 *        the node with the specified index is returned.
 */
export function findNodeForProperty(node: CstNode | undefined, property: string | undefined, index?: number): CstNode | undefined {
    if (!node ||!property) {
        return undefined;
    }
    const nodes = findNodesForPropertyInternal(node, property, node.element, true);
    if (nodes.length === 0) {
        return undefined;
    }
    if (index !== undefined) {
        index = Math.max(0, Math.min(index, nodes.length - 1));
    } else {
        index = 0;
    }
    return nodes[index];
}

function findNodesForPropertyInternal(node: CstNode, property: string, element: AstNode | undefined, first: boolean): CstNode[] {
    if (!first) {
        const nodeFeature = getContainerOfType(node.feature, ast.isAssignment);
        if (nodeFeature && nodeFeature.feature === property) {
            return [node];
        }
    }
    if (isCompositeCstNode(node) && node.element === element) {
        return node.children.flatMap(e => findNodesForPropertyInternal(e, property, element, false));
    }
    return [];
}

/**
 * Find all CST nodes within the given node that correspond to the specified keyword.
 *
 * @param node A CST node in which to look for keywords. If this is undefined, the result is an empty array.
 * @param keyword A keyword as specified in the grammar.
 */
export function findNodesForKeyword(node: CstNode | undefined, keyword: string): CstNode[] {
    if (!node) {
        return [];
    }
    return findNodesForKeywordInternal(node, keyword, node?.element);
}

/**
 * Find a single CST node within the given node that corresponds to the specified keyword.
 *
 * @param node A CST node in which to look for keywords. If this is undefined, the result is `undefined`.
 * @param keyword A keyword as specified in the grammar.
 * @param index If no index is specified or the index is less than zero, the first found node is returned. If the
 *        specified index exceeds the number of keyword occurrences, the last found node is returned. Otherwise,
 *        the node with the specified index is returned.
 */
export function findNodeForKeyword(node: CstNode | undefined, keyword: string, index?: number): CstNode | undefined {
    if (!node) {
        return undefined;
    }
    const nodes = findNodesForKeywordInternal(node, keyword, node?.element);
    if (nodes.length === 0) {
        return undefined;
    }
    if (index !== undefined) {
        index = Math.max(0, Math.min(index, nodes.length - 1));
    } else {
        index = 0;
    }
    return nodes[index];
}

export function findNodesForKeywordInternal(node: CstNode, keyword: string, element: AstNode | undefined): CstNode[] {
    if (node.element !== element) {
        return [];
    }
    if (ast.isKeyword(node.feature) && node.feature.value === keyword) {
        return [node];
    }
    const treeIterator = streamCst(node).iterator();
    let result: IteratorResult<CstNode>;
    const keywordNodes: CstNode[] = [];
    do {
        result = treeIterator.next();
        if (!result.done) {
            const childNode = result.value;
            if (childNode.element === element) {
                if (ast.isKeyword(childNode.feature) && childNode.feature.value === keyword) {
                    keywordNodes.push(childNode);
                }
            } else {
                treeIterator.prune();
            }
        }
    } while (!result.done);
    return keywordNodes;
}

/**
 * If the given CST node was parsed in the context of a property assignment, the respective `Assignment` grammar
 * node is returned. If no assignment is found, the result is `undefined`.
 *
 * @param cstNode A CST node for which to find a property assignment.
 */
export function findAssignment(cstNode: CstNode): ast.Assignment | undefined {
    let n: CstNode | undefined = cstNode;
    do {
        const assignment = getContainerOfType(n.feature, ast.isAssignment);
        if (assignment) {
            return assignment;
        }
        n = n.parent;
    } while (n);
    return undefined;
}

/**
 * Find an assignment to the `name` property for the given grammar type. This requires the `type` to be inferred
 * from a parser rule, and that rule must contain an assignment to the `name` property. In all other cases,
 * this function returns `undefined`.
 */
export function findNameAssignment(type: ast.AbstractType | ast.InferredType): ast.Assignment | undefined {
    if (ast.isInferredType(type)) {
        // inferred type is unexpected, extract AbstractType first
        type = type.$container;
    }
    return findNameAssignmentInternal(type, new Map());
}

function findNameAssignmentInternal(type: ast.AbstractType, cashed: Map<ast.AbstractType, ast.Assignment | undefined>): ast.Assignment | undefined {
    function go(node: AstNode, refType: ast.AbstractType): ast.Assignment | undefined {
        let childAssignment: ast.Assignment | undefined = undefined;
        const parentAssignment = getContainerOfType(node, ast.isAssignment);
        // No parent assignment implies unassigned rule call
        if (!parentAssignment) {
            childAssignment = findNameAssignmentInternal(refType, cashed);
        }
        cashed.set(type, childAssignment);
        return childAssignment;
    }

    if (cashed.has(type)) return cashed.get(type);
    cashed.set(type, undefined);
    for (const node of streamAllContents(type)) {
        if (ast.isAssignment(node) && node.feature.toLowerCase() === 'name') {
            cashed.set(type, node);
            return node;
        } else if (ast.isRuleCall(node) && ast.isParserRule(node.rule.ref)) {
            return go(node, node.rule.ref);
        } else if (ast.isAtomType(node) && node?.refType?.ref) {
            return go(node, node.refType.ref);
        }
    }
    return undefined;
}

/**
 * Load a Langium grammar for your language from a JSON string. This is used by several services,
 * most notably the parser builder which interprets the grammar to create a parser.
 */
export function loadGrammarFromJson(json: string): ast.Grammar {
    const services = createLangiumGrammarServices(EmptyFileSystem).grammar;
    const astNode = services.serializer.JsonSerializer.deserialize(json);
    if (!ast.isGrammar(astNode)) {
        throw new Error('Could not load grammar from specified json input.');
    }
    return prepareGrammar(services, astNode);
}

/**
 * Create an instance of the language services for the given grammar. This function is very
 * useful when the grammar is defined on-the-fly, for example in tests of the Langium framework.
 */
export function createServicesForGrammar(config: {
    grammar: string | ast.Grammar,
    grammarServices?: LangiumGrammarServices,
    parserConfig?: IParserConfig,
    languageMetaData?: LanguageMetaData,
    module?: Module<LangiumServices, PartialLangiumServices>
    sharedModule?: Module<LangiumSharedServices, PartialLangiumSharedServices>
}): LangiumServices {
    const grammarServices = config.grammarServices ?? createLangiumGrammarServices(EmptyFileSystem).grammar;
    const grammarNode = typeof config.grammar === 'string' ? grammarServices.parser.LangiumParser.parse<ast.Grammar>(config.grammar).value : config.grammar;
    prepareGrammar(grammarServices, grammarNode);

    const parserConfig = config.parserConfig ?? {
        skipValidations: false
    };
    const languageMetaData = config.languageMetaData ?? {
        caseInsensitive: false,
        fileExtensions: [`.${grammarNode.name?.toLowerCase() ?? 'unknown'}`],
        languageId: grammarNode.name ?? 'UNKNOWN'
    };
    const generatedSharedModule: Module<LangiumSharedServices, LangiumGeneratedSharedServices> = {
        AstReflection: () => interpretAstReflection(grammarNode),
    };
    const generatedModule: Module<LangiumServices, LangiumGeneratedServices> = {
        Grammar: () => grammarNode,
        LanguageMetaData: () => languageMetaData,
        parser: {
            ParserConfig: () => parserConfig
        }
    };
    const shared = inject(createDefaultSharedModule(EmptyFileSystem), generatedSharedModule, config.sharedModule);
    const services = inject(createDefaultModule({ shared }), generatedModule, config.module);
    shared.ServiceRegistry.register(services);
    return services;
}
