import { Platforms } from "@internal/database";
import type { IPlatform } from "@internal/types";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { formDataToObject } from "app/helpers/utils";
import { ExtendedSession } from "app/modules/sessionStorage";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  const platforms = await Platforms.find<IPlatform>({
    sessionId: session?._id,
  });

  const isNewDisabled =
    session.limitationId && platforms.length >= session.limitationId?.platforms;

  return {
    isNewDisabled,
    platforms,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  const formData = await request.formData();
  const {
    action,
    primaryApiKey,
    platform: platformName,
    status,
  } = formDataToObject(formData);

  switch (action) {
    case "init-platform":
      const platformModule = await Platforms.findOne<IPlatform>({
        sessionId: session?._id,
        name: platformName,
      }).lean();

      if (!platformModule) {
        await Platforms.create({
          name: platformName,
          sessionId: session?._id,
          primaryApiKey: primaryApiKey,
          integrationStatus: status,
        });
      } else {
        await Platforms.updateOne(
          {
            id: platformModule._id,
          },
          {
            primaryApiKey: primaryApiKey,
            integrationStatus: status,
          },
        );
      }
      break;

    case "toggle-connect":
      await Platforms.updateOne(
        {
          name: platformName,
          sessionId: session._id,
        },
        {
          integrationStatus: status,
        },
      );

      break;

    default:
      break;
  }

  return {};
};
