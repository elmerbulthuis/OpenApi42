import { statusCodes } from "oa42-lib";
import * as models from "../../models/index.js";
import { joinIterable, mapIterable } from "../../utils/index.js";
import { itt } from "../../utils/iterable-text-template.js";
import { getIncomingResponseTypeName, getResponseParametersTypeName } from "../names/index.js";

export function* generateOperationIncomingResponseType(
  apiModel: models.Api,
  operationModel: models.Operation,
) {
  const typeName = getIncomingResponseTypeName(operationModel);

  yield itt`
    export type ${typeName} = ${joinIterable(
      mapIterable(generateElements(apiModel, operationModel), (element) => itt`(${element})`),
      " |\n",
    )};
  `;
}

function* generateElements(apiModel: models.Api, operationModel: models.Operation) {
  if (operationModel.operationResults.length === 0) {
    yield itt`never`;
  }

  const statusCodesAvailable = new Set(statusCodes);

  for (const operationResultModel of operationModel.operationResults) {
    for (const statusCode of operationResultModel.statusCodes) {
      statusCodesAvailable.delete(statusCode);
    }
    yield itt`
      ${generateParametersContainerType(operationModel, operationResultModel)} &
      (
        ${joinIterable(generateBodyContainerTypes(apiModel, operationModel, operationResultModel), " |\n")}
      )
    `;
  }

  if (statusCodesAvailable.size > 0) {
    yield itt`
      lib.StatusContainer<${joinIterable(mapIterable(statusCodesAvailable, String), " |\n")}>
    `;
  }
}

function* generateParametersContainerType(
  operationModel: models.Operation,
  operationResultModel: models.OperationResult,
) {
  const parametersTypeName = getResponseParametersTypeName(operationModel, operationResultModel);

  yield `lib.ParametersContainer<parameters.${parametersTypeName}>`;
}

function* generateBodyContainerTypes(
  apiModel: models.Api,
  operationModel: models.Operation,
  operationResultModel: models.OperationResult,
) {
  if (operationResultModel.bodies.length === 0) {
    yield* generateBodyContainerType(apiModel, operationModel, operationResultModel);
  }

  for (const bodyModel of operationResultModel.bodies) {
    yield* generateBodyContainerType(apiModel, operationModel, operationResultModel, bodyModel);
  }
}

function* generateBodyContainerType(
  apiModel: models.Api,
  operationModel: models.Operation,
  operationResultModel: models.OperationResult,
  bodyModel?: models.Body,
) {
  if (bodyModel == null) {
    yield itt`
      lib.IncomingEmptyResponse<
        ${joinIterable(
          operationResultModel.statusCodes.map((statusCode) => JSON.stringify(statusCode)),
          " |\n",
        )}
      >
    `;
    return;
  }

  switch (bodyModel.contentType) {
    case "text/plain": {
      yield itt`
        lib.IncomingTextResponse<
          ${joinIterable(
            operationResultModel.statusCodes.map((statusCode) => JSON.stringify(statusCode)),
            " |\n",
          )},
          ${JSON.stringify(bodyModel.contentType)}
        >
      `;
      break;
    }
    case "application/json": {
      const bodySchemaId = bodyModel.schemaId;
      const bodyTypeName = bodySchemaId == null ? bodySchemaId : apiModel.names[bodySchemaId];

      yield itt`
        lib.IncomingJsonResponse<
          ${joinIterable(
            operationResultModel.statusCodes.map((statusCode) => JSON.stringify(statusCode)),
            " |\n",
          )},
          ${JSON.stringify(bodyModel.contentType)},
          ${bodyTypeName == null ? "unknown" : itt`types.${bodyTypeName}`}
        >
      `;
      break;
    }
    default: {
      yield itt`
        lib.IncomingStreamResponse<
          ${joinIterable(
            operationResultModel.statusCodes.map((statusCode) => JSON.stringify(statusCode)),
            " |\n",
          )},
          ${JSON.stringify(bodyModel.contentType)}
        >
      `;
      break;
    }
  }
}
