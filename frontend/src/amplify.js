
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "ap-southeast-2_xrMDb8ESo",
      userPoolClientId: "2vbhpbtr384odlkti41irpfnk6",
    },
  },
});
