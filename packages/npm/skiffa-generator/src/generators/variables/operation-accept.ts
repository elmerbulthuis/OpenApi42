import * as skiffaCore from "@skiffa/core";
import { itt } from "../../utils/index.js";
import { getOperationAcceptConstName, getOperationAcceptTypeName } from "../names/index.js";

export function* generateOperationAcceptConstant(operationModel: skiffaCore.OperationContainer) {
  const operationAcceptTypeName = getOperationAcceptTypeName(operationModel);
  const operationAcceptConstName = getOperationAcceptConstName(operationModel);

  const operationAccepts = [
    ...new Set(
      operationModel.operationResults.flatMap((operationResultModel) =>
        operationResultModel.bodies.map((bodyModel) => bodyModel.contentType),
      ),
    ),
  ];

  yield itt`
    export const ${operationAcceptConstName}: ${operationAcceptTypeName}[] = ${JSON.stringify(operationAccepts)};
  `;
}
