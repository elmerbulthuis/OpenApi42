import * as skiffaCore from "@skiffa/core";
import { joinIterable, mapIterable } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { getIncomingRequestTypeName, getRequestParametersTypeName } from "../names/index.js";

export function* generateOperationIncomingRequestType(
  names: Record<string, string>,
  operationModel: skiffaCore.OperationContainer,
) {
  const typeName = getIncomingRequestTypeName(operationModel);

  yield itt`
    export type ${typeName} = ${joinIterable(
      mapIterable(generateElements(names, operationModel), (element) => itt`(${element})`),
      " |\n",
    )};
  `;
}

function* generateElements(
  names: Record<string, string>,
  operationModel: skiffaCore.OperationContainer,
) {
  yield itt`
    ${generateParametersContainerType(operationModel)} &
    (
      ${joinIterable(generateBodyContainerTypes(names, operationModel), " |\n")}
    )
  `;
}

function* generateParametersContainerType(operationModel: skiffaCore.OperationContainer) {
  const parametersTypeName = getRequestParametersTypeName(operationModel);

  yield `lib.ParametersContainer<parameters.${parametersTypeName}>`;
}

function* generateBodyContainerTypes(
  names: Record<string, string>,
  operationModel: skiffaCore.OperationContainer,
) {
  if (operationModel.bodies.length === 0) {
    yield* generateBodyContainerType(names, operationModel);
  }

  for (const bodyModel of operationModel.bodies) {
    yield* generateBodyContainerType(names, operationModel, bodyModel);
  }
}

function* generateBodyContainerType(
  names: Record<string, string>,
  operationModel: skiffaCore.OperationContainer,
  bodyModel?: skiffaCore.BodyContainer,
) {
  if (bodyModel == null) {
    yield itt`
      lib.IncomingEmptyRequest
    `;
    return;
  }

  switch (bodyModel.contentType) {
    case "text/plain": {
      yield itt`
        lib.IncomingTextRequest<
          ${JSON.stringify(bodyModel.contentType)}
        >
      `;
      break;
    }
    case "application/json": {
      const bodySchemaId = bodyModel.schemaId;
      const bodyTypeName = bodySchemaId == null ? bodySchemaId : names[bodySchemaId];

      yield itt`
        lib.IncomingJsonRequest<
          ${JSON.stringify(bodyModel.contentType)},
          ${bodyTypeName == null ? "unknown" : itt`types.${bodyTypeName}`}
        >
      `;
      break;
    }
    default: {
      yield itt`
        lib.IncomingStreamRequest<
          ${JSON.stringify(bodyModel.contentType)}
        >
      `;
      break;
    }
  }
}
