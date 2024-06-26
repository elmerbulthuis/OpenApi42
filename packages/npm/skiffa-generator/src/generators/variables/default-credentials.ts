import { itt } from "../../utils/index.js";
import { getCredentialsTypeName, getDefaultCredentialsConstantName } from "../names/index.js";

export function* generateCredentialsConstant() {
  const typeName = getCredentialsTypeName();
  const constantName = getDefaultCredentialsConstantName();

  yield itt`
    export const ${constantName}: ${typeName} = {};
  `;
}
