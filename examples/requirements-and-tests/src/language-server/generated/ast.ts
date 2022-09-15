/******************************************************************************
 * This file was generated by langium-cli 0.4.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { AstNode, AstReflection, Reference, ReferenceInfo, isAstNode, TypeMetaData } from 'langium';

export interface Contact extends AstNode {
    readonly $container: RequirementModel | TestModel;
    user_name: string
}

export const Contact = 'Contact';

export function isContact(item: unknown): item is Contact {
    return reflection.isInstance(item, Contact);
}

export interface Requirement extends AstNode {
    readonly $container: RequirementModel;
    name: string
    text: string
}

export const Requirement = 'Requirement';

export function isRequirement(item: unknown): item is Requirement {
    return reflection.isInstance(item, Requirement);
}

export interface RequirementModel extends AstNode {
    contact?: Contact
    requirements: Array<Requirement>
}

export const RequirementModel = 'RequirementModel';

export function isRequirementModel(item: unknown): item is RequirementModel {
    return reflection.isInstance(item, RequirementModel);
}

export interface Test extends AstNode {
    readonly $container: TestModel;
    name: string
    requirements: Array<Reference<Requirement>>
    testFile?: string
}

export const Test = 'Test';

export function isTest(item: unknown): item is Test {
    return reflection.isInstance(item, Test);
}

export interface TestModel extends AstNode {
    contact?: Contact
    tests: Array<Test>
}

export const TestModel = 'TestModel';

export function isTestModel(item: unknown): item is TestModel {
    return reflection.isInstance(item, TestModel);
}

export type RequirementsAndTestsAstType = 'Contact' | 'Requirement' | 'RequirementModel' | 'Test' | 'TestModel';

export class RequirementsAndTestsAstReflection implements AstReflection {

    getAllTypes(): string[] {
        return ['Contact', 'Requirement', 'RequirementModel', 'Test', 'TestModel'];
    }

    isInstance(node: unknown, type: string): boolean {
        return isAstNode(node) && this.isSubtype(node.$type, type);
    }

    isSubtype(subtype: string, supertype: string): boolean {
        if (subtype === supertype) {
            return true;
        }
        switch (subtype) {
            default: {
                return false;
            }
        }
    }

    getReferenceType(refInfo: ReferenceInfo): string {
        const referenceId = `${refInfo.container.$type}:${refInfo.property}`;
        switch (referenceId) {
            case 'Test:requirements': {
                return Requirement;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }

    getTypeMetaData(type: string): TypeMetaData {
        switch (type) {
            case 'RequirementModel': {
                return {
                    name: 'RequirementModel',
                    mandatory: [
                        { name: 'requirements', type: 'array' }
                    ]
                };
            }
            case 'Test': {
                return {
                    name: 'Test',
                    mandatory: [
                        { name: 'requirements', type: 'array' }
                    ]
                };
            }
            case 'TestModel': {
                return {
                    name: 'TestModel',
                    mandatory: [
                        { name: 'tests', type: 'array' }
                    ]
                };
            }
            default: {
                return {
                    name: type,
                    mandatory: []
                };
            }
        }
    }
}

export const reflection = new RequirementsAndTestsAstReflection();
