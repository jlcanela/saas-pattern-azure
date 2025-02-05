import { Schema, SchemaAST } from "effect"
import { it } from "vitest"

export const findCedarTypeJson = (id: string, json: any) => {
    const annotations = json.annotations
    const identifier = annotations[SchemaAST.IdentifierAnnotationId.toString()]
    const jsonTag = json._tag

    if (identifier == "Int") {
        return "Long"
    } else if (jsonTag == "StringKeyword") {
        return "String"
    } else if (jsonTag == "BooleanKeyword") {
        return "Boolean"
    } else {
        return null
    }
}

export const findCedarType = (p: any) => {
    const ast = p.ast
    let result: any
    switch (ast._tag) {
        case "Refinement":
           result = findCedarTypeJson("Refinement", ast.toJSON())
           break;
        case "PropertySignatureDeclaration":                        
            result = findCedarTypeJson("PropertySignatureDeclaration", ast.toJSON().type.types[0])
            break;
        case "StringKeyword":
            result = "String"
            break;      
        case "BooleanKeyword":
            result = "Boolean"
            break;
    }
    return result
}


it("Int type should be 'Long'", () => {
    const int = Schema.Int
    expect(findCedarType( int)).toEqual("Long")
    const optInt = Schema.Int.pipe(Schema.optional)
    expect(findCedarType(optInt)).toEqual("Long")
})

it("String type should be 'String'", () => {
    const str = Schema.String
    expect(findCedarType(str)).toEqual("String")
    const optStr = Schema.String.pipe(Schema.optional)
    expect(findCedarType(optStr)).toEqual("String")
})

it("Boolean type should be 'Boolean'", () => {
    const bl = Schema.Boolean
    expect(findCedarType(bl)).toEqual("Boolean")
    const optBl = Schema.Boolean.pipe(Schema.optional)
    expect(findCedarType(optBl)).toEqual("Boolean")
})