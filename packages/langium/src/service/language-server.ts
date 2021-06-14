/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import {
    InitializeParams, TextDocumentPositionParams, TextDocumentSyncKind, InitializeResult, Connection, CompletionList,
    ReferenceParams, Location, DocumentSymbolParams, DocumentSymbol
} from 'vscode-languageserver/node';

import { LangiumDocument } from '../documents/document';
import { LangiumServices } from '../services';
import { AstNode } from '../syntax-tree';

export function startLanguageServer(services: LangiumServices): void {
    const connection = services.languageServer.Connection;
    if (!connection) {
        throw new Error('Starting a language server requires the languageServer.Connection service to be set.');
    }

    connection.onInitialize((params: InitializeParams) => {
        const capabilities = params.capabilities;
        const hasWorkspaceFolderCapability = !!capabilities.workspace?.workspaceFolders;

        const result: InitializeResult = {
            capabilities: {
                textDocumentSync: TextDocumentSyncKind.Incremental,
                // Tell the client that this server supports code completion.
                completionProvider: {},
                referencesProvider: {}, // TODO enable workDoneProgress?
                documentSymbolProvider: {}
                // goto-declaration
                declarationProvider: {},
                // hoverProvider needs to be created for mouse-over events, etc.
                hoverProvider: false
            }
        };
        if (hasWorkspaceFolderCapability) {
            result.capabilities.workspace = {
                workspaceFolders: {
                    supported: true
                }
            };
        }
        return result;
    });

    const documents = services.documents.TextDocuments;
    const documentBuilder = services.documents.DocumentBuilder;
    documents.onDidChangeContent(change => {
        documentBuilder.build(change.document);
    });

    addCompletionHandler(connection, services);
    addFindReferencesHandler(connection, services);
    addDocumentSymbolHandler(connection, services);
    addDeclarationProvider(connection, services);

    // Make the text document manager listen on the connection for open, change and close text document events.
    documents.listen(connection);

    // Listen on the connection.
    connection.listen();
}

export function addCompletionHandler(connection: Connection, services: LangiumServices): void {
    // TODO create an extensible service API for completion
    connection.onCompletion(
        (_textDocumentPosition: TextDocumentPositionParams): CompletionList => {
            const uri = _textDocumentPosition.textDocument.uri;
            const document = services.documents.TextDocuments.get(uri);
            if (document) {
                const rootNode = assembleRoot(services, document);
                const completionProvider = services.completion.CompletionProvider;

                const offset = document.offsetAt(_textDocumentPosition.position);
                const assist = completionProvider.getCompletion(rootNode, offset);
                return assist;
            } else {
                return CompletionList.create();
            }
        }
    );
}

export function addFindReferencesHandler(connection: Connection, services: LangiumServices): void {
    const referenceFinder = services.references.ReferenceFinder;
    connection.onReferences((params: ReferenceParams): Location[] => {
        const uri = params.textDocument.uri;
        const document = services.documents.TextDocuments.get(uri);
        if (document) {
            return referenceFinder.findReferenceLocations(document, params.position, params.context.includeDeclaration);
        } else {
            return [];
        }
    });
}

export function addDocumentSymbolHandler(connection: Connection, services: LangiumServices): void {
    const symbolProvider = services.symbols.DocumentSymbolProvider;
    connection.onDocumentSymbol((params: DocumentSymbolParams): DocumentSymbol[] => {
        const uri = params.textDocument.uri;
        const document = services.documents.TextDocuments.get(uri);
        if (document) {
            return symbolProvider.getSymbols(document);
        } else {
            return [];
        }
    });
}

export function addDeclarationProvider(connection: Connection, services: LangiumServices): void {
    connection.onDeclaration(
        (_textDocumentPosition: TextDocumentPositionParams): Location[] => {
            const uri = _textDocumentPosition.textDocument.uri;
            const document = services.documents.TextDocuments.get(uri);
            if (document) {

                const rootNode = assembleRoot(services, document);
                const gotoDeclaration = services.references.goto.GoToDeclaration;

                const offset = document.offsetAt(_textDocumentPosition.position);
                return gotoDeclaration.findDeclaration(uri, rootNode, offset);
            }
            else {
                return [];
            }
        }
    );
}

function assembleRoot( services: LangiumServices, document: LangiumDocument): AstNode {
    const text = document.getText();
    const parser = services.Parser;
    const parseResult = parser.parse(text);
    const rootNode = parseResult.value;
    (rootNode as { $document: LangiumDocument }).$document = document;
    document.parseResult = parseResult;
    document.precomputedScopes = services.references.ScopeComputation.computeScope(rootNode);
    return rootNode;
}