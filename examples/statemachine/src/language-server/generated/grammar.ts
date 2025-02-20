/******************************************************************************
 * This file was generated by langium-cli 0.4.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { loadGrammarFromJson, Grammar } from 'langium';

let loadedStatemachineGrammar: Grammar | undefined;
export const StatemachineGrammar = (): Grammar => loadedStatemachineGrammar ?? (loadedStatemachineGrammar = loadGrammarFromJson(`{
  "$type": "Grammar",
  "isDeclared": true,
  "name": "Statemachine",
  "rules": [
    {
      "$type": "ParserRule",
      "name": "Statemachine",
      "entry": true,
      "definition": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Keyword",
            "value": "statemachine"
          },
          {
            "$type": "Assignment",
            "feature": "name",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "rule": {
                "$refText": "ID"
              },
              "arguments": []
            }
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Keyword",
                "value": "events"
              },
              {
                "$type": "Assignment",
                "feature": "events",
                "operator": "+=",
                "terminal": {
                  "$type": "RuleCall",
                  "rule": {
                    "$refText": "Event"
                  },
                  "arguments": []
                },
                "cardinality": "+"
              }
            ],
            "cardinality": "?"
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Keyword",
                "value": "commands"
              },
              {
                "$type": "Assignment",
                "feature": "commands",
                "operator": "+=",
                "terminal": {
                  "$type": "RuleCall",
                  "rule": {
                    "$refText": "Command"
                  },
                  "arguments": []
                },
                "cardinality": "+"
              }
            ],
            "cardinality": "?"
          },
          {
            "$type": "Keyword",
            "value": "initialState"
          },
          {
            "$type": "Assignment",
            "feature": "init",
            "operator": "=",
            "terminal": {
              "$type": "CrossReference",
              "type": {
                "$refText": "State"
              },
              "deprecatedSyntax": false
            }
          },
          {
            "$type": "Assignment",
            "feature": "states",
            "operator": "+=",
            "terminal": {
              "$type": "RuleCall",
              "rule": {
                "$refText": "State"
              },
              "arguments": []
            },
            "cardinality": "*"
          }
        ]
      },
      "definesHiddenTokens": false,
      "fragment": false,
      "hiddenTokens": [],
      "parameters": [],
      "wildcard": false
    },
    {
      "$type": "ParserRule",
      "name": "Event",
      "definition": {
        "$type": "Assignment",
        "feature": "name",
        "operator": "=",
        "terminal": {
          "$type": "RuleCall",
          "rule": {
            "$refText": "ID"
          },
          "arguments": []
        }
      },
      "definesHiddenTokens": false,
      "entry": false,
      "fragment": false,
      "hiddenTokens": [],
      "parameters": [],
      "wildcard": false
    },
    {
      "$type": "ParserRule",
      "name": "Command",
      "definition": {
        "$type": "Assignment",
        "feature": "name",
        "operator": "=",
        "terminal": {
          "$type": "RuleCall",
          "rule": {
            "$refText": "ID"
          },
          "arguments": []
        }
      },
      "definesHiddenTokens": false,
      "entry": false,
      "fragment": false,
      "hiddenTokens": [],
      "parameters": [],
      "wildcard": false
    },
    {
      "$type": "ParserRule",
      "name": "State",
      "definition": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Keyword",
            "value": "state"
          },
          {
            "$type": "Assignment",
            "feature": "name",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "rule": {
                "$refText": "ID"
              },
              "arguments": []
            }
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Keyword",
                "value": "actions"
              },
              {
                "$type": "Keyword",
                "value": "{"
              },
              {
                "$type": "Assignment",
                "feature": "actions",
                "operator": "+=",
                "terminal": {
                  "$type": "CrossReference",
                  "type": {
                    "$refText": "Command"
                  },
                  "deprecatedSyntax": false
                },
                "cardinality": "+"
              },
              {
                "$type": "Keyword",
                "value": "}"
              }
            ],
            "cardinality": "?"
          },
          {
            "$type": "Assignment",
            "feature": "transitions",
            "operator": "+=",
            "terminal": {
              "$type": "RuleCall",
              "rule": {
                "$refText": "Transition"
              },
              "arguments": []
            },
            "cardinality": "*"
          },
          {
            "$type": "Keyword",
            "value": "end"
          }
        ]
      },
      "definesHiddenTokens": false,
      "entry": false,
      "fragment": false,
      "hiddenTokens": [],
      "parameters": [],
      "wildcard": false
    },
    {
      "$type": "ParserRule",
      "name": "Transition",
      "definition": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Assignment",
            "feature": "event",
            "operator": "=",
            "terminal": {
              "$type": "CrossReference",
              "type": {
                "$refText": "Event"
              },
              "deprecatedSyntax": false
            }
          },
          {
            "$type": "Keyword",
            "value": "=>"
          },
          {
            "$type": "Assignment",
            "feature": "state",
            "operator": "=",
            "terminal": {
              "$type": "CrossReference",
              "type": {
                "$refText": "State"
              },
              "deprecatedSyntax": false
            }
          }
        ]
      },
      "definesHiddenTokens": false,
      "entry": false,
      "fragment": false,
      "hiddenTokens": [],
      "parameters": [],
      "wildcard": false
    },
    {
      "$type": "TerminalRule",
      "hidden": true,
      "name": "WS",
      "definition": {
        "$type": "RegexToken",
        "regex": "\\\\s+"
      },
      "fragment": false
    },
    {
      "$type": "TerminalRule",
      "name": "ID",
      "definition": {
        "$type": "RegexToken",
        "regex": "[_a-zA-Z][\\\\w_]*"
      },
      "fragment": false,
      "hidden": false
    },
    {
      "$type": "TerminalRule",
      "name": "INT",
      "type": {
        "$type": "ReturnType",
        "name": "number"
      },
      "definition": {
        "$type": "RegexToken",
        "regex": "[0-9]+"
      },
      "fragment": false,
      "hidden": false
    },
    {
      "$type": "TerminalRule",
      "name": "STRING",
      "definition": {
        "$type": "RegexToken",
        "regex": "\\"[^\\"]*\\"|'[^']*'"
      },
      "fragment": false,
      "hidden": false
    },
    {
      "$type": "TerminalRule",
      "hidden": true,
      "name": "ML_COMMENT",
      "definition": {
        "$type": "RegexToken",
        "regex": "\\\\/\\\\*[\\\\s\\\\S]*?\\\\*\\\\/"
      },
      "fragment": false
    },
    {
      "$type": "TerminalRule",
      "hidden": true,
      "name": "SL_COMMENT",
      "definition": {
        "$type": "RegexToken",
        "regex": "\\\\/\\\\/[^\\\\n\\\\r]*"
      },
      "fragment": false
    }
  ],
  "definesHiddenTokens": false,
  "hiddenTokens": [],
  "imports": [],
  "interfaces": [],
  "types": [],
  "usedGrammars": []
}`));
