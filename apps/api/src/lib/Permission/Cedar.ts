import type { Option, Record, Schema } from "effect"
import { SchemaAST } from "effect"

export type ActionType = Schema.Struct<{
  principalTypes: Schema.Schema.All;
  resourceTypes:  Schema.Schema.All;
  context:  Schema.Schema.All;
}>

export type NamespaceType = Schema.Struct<{
  commonTypes: Schema.Union<any>,
  entityTypes: Schema.Union<any>,
  actions: Schema.Struct<Record<string,  Schema.Struct<any>>>
}>

export type SchemaType = Schema.Struct<Record<string, NamespaceType>>

const getAnnotation = (schema: Schema.Schema.All, annotation: symbol) => SchemaAST.getAnnotation(annotation)(schema.ast) as Option.Option<string>
const getIdentifier = (schema: Schema.Schema.All) => getAnnotation(schema, SchemaAST.IdentifierAnnotationId)
const getIdentifierOrDie = (schema: Schema.Schema.All) => (getIdentifier(schema) as any).value as string

const structToStruct: (struct: Schema.Struct<Record<string, Schema.Struct<any>>>) => Record<string, Schema.Struct<any>> = (struct: Schema.Struct<Record<string, Schema.Struct<any>>>) => 
  Object.fromEntries(Object.entries( struct.fields).map(([key, value]) => [key, value]))

const structToRecordType = (struct: Schema.Struct<any>) => {
  const fields = struct.fields
  const attributes = Object.keys(fields).map((name: string) => {
    const field = fields[name]
    const type = field.ast._tag as string
    return {
      name,
      field,
      type,
      required: !(field.ast.toJSON().isOptional || false)
    }
  })
  return {
    name: getIdentifier(struct),
    attributes
  }
}

function isUnion(value: any): value is Schema.Union<any> {
  return value.members !== undefined;
}


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


const generateCommonType = (commonTypes: Schema.Union<any>) => {

  const un = isUnion(commonTypes) ? commonTypes.members.map((m: any) => structToRecordType(m)) : [structToRecordType(commonTypes)]

  const toCommonType = (ct: any) => {

    const attributes = Object.fromEntries(ct.attributes.map((attr: any) => (
      [attr.name, {
        type: findCedarType(attr.field),
        required: attr.required
      }]
    )))

    return [[ct.name.value], {
      type: "Record",
      attributes
    }]

  }

  return Object.fromEntries(un.map(toCommonType))
}

const generateEntityType = (entityType: Schema.Union<any>) => {

  const un = isUnion(entityType) ? entityType.members.map((m: any) => structToRecordType(m)) : [structToRecordType(entityType)]

  const toCommonType = (ct: any) => {

    const attributes = Object.fromEntries(ct.attributes.map((attr: any) => (
      [attr.name, {
        type: findCedarType(attr.field),
        required: attr.required
      }]
    )))

    return [[ct.name.value], {
      shape: {
        type: "Record",
        attributes
      },
      memberOfTypes: []
    }]

  }

  return Object.fromEntries(un.map(toCommonType))

}

const generateActions = (actions: Schema.Struct<any>) => {
  const actionTypes = structToStruct(actions)
  return Object.fromEntries(
    Object.entries(actionTypes).map(([key, value]) => {
      const { context, principalTypes, resourceTypes } = structToStruct(value as Schema.Struct<any>)

      const resourceArr = isUnion(resourceTypes) ? resourceTypes.members.map((m: any) => getIdentifierOrDie(m)) : [getIdentifierOrDie(resourceTypes)]
      const principalArr = isUnion(principalTypes) ? principalTypes.members.map((m: any) => getIdentifierOrDie(m)) : [getIdentifierOrDie(principalTypes)]

      const action = {
        appliesTo: {
          context: {
            type: getIdentifierOrDie(context)
          },
          resourceTypes: resourceArr,
          principalTypes: principalArr
        }
      }

      return [key, action]
    })
  );
}

export const generateUnitarySchema = (ns: NamespaceType) => {

  const {
    actions,
    commonTypes,
    entityTypes
  } = ns.fields

  return ({
      commonTypes: generateCommonType(commonTypes),
      entityTypes: generateEntityType(entityTypes),
      actions: generateActions(actions)
    })
}

export const generateSchema = (schema: SchemaType) => Object.fromEntries(
    Object.entries(schema.fields).map(([key, value]) => [key, generateUnitarySchema(value)]))
