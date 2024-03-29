import { useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  FormLayout,
  Layout,
  Page,
  TextField,
  BlockStack,
  PageActions,
  Toast,
  Frame,
} from "@shopify/polaris";

import db from "../db.server";
import { getSettings, SETTING_KEYS } from "../models/AppSetting.server";
import {
  SYSTEM_FACTORY_CANISTER_ID,
  SYSTEM_LOCAL_FACTORY_CANISTER_ID,
} from "../utils/constants";

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  const env_code = process.env.NODE_ENV;
  const factory_id =
    env_code == "production"
      ? SYSTEM_FACTORY_CANISTER_ID
      : SYSTEM_LOCAL_FACTORY_CANISTER_ID;
  const system_account = process.env.SYSTEM_ACCOUNT_PID;

  let settings = await getSettings(session.shop, admin.graphql);
  settings["env_code"] = env_code;
  settings["factory_id"] = factory_id;
  settings["system_account"] = system_account;

  return json(settings);
}

export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  let data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  for (const key in data) {
    if (SETTING_KEYS.includes(key)) {
      const value = data[key];
      await db.appSetting.upsert({
        where: { shop_info_key: { shop, info_key: key } },
        update: { info_value: value },
        create: { info_key: key, info_value: value, shop: shop },
      });
    }
  }

  return redirect(`/app/main_settings?active=true`);
}

export default function AppSettingForm() {
  const settings = useLoaderData();
  const [active, setActive] = useState(false);
  const [formState, setFormState] = useState(settings);

  const [cleanFormState, setCleanFormState] = useState(settings);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const toastMarkup = active ? (
    <Toast
      content="App Settings Save Success"
      onClick={toggleActive}
      duration={3500}
    />
  ) : null;

  const submit = useSubmit();
  function handleSave() {
    const data = {
      merchant_principal: formState.merchant_principal,
      app_description: formState.app_description || "",
      royalties_recipient_principal:
        formState.royalties_recipient_principal || "",
      nft_product_description: formState.nft_product_description || "",
    };

    setCleanFormState({ ...formState });
    toggleActive();
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title="Edit App Settings"></ui-title-bar>
      <Layout>
        <Layout.AnnotatedSection
          id="appSettings"
          title="App Settings"
          description="The merchant sets some basic information on the 'ic nft creator' app."
        >
          <Layout.Section>
            <BlockStack gap="500">
              <Card>
                <FormLayout>
                  <TextField
                    id="merchant_principal"
                    label="Merchant Principal"
                    autoComplete="off"
                    value={formState.merchant_principal}
                    onChange={(merchant_principal) =>
                      setFormState({ ...formState, merchant_principal })
                    }
                  />
                  <TextField
                    id="royalties_recipient_principal"
                    label="Royalties Recipient Principal"
                    autoComplete="off"
                    value={formState.royalties_recipient_principal}
                    onChange={(royalties_recipient_principal) =>
                      setFormState({
                        ...formState,
                        royalties_recipient_principal,
                      })
                    }
                  />
                  <TextField
                    id="app_description"
                    label="Shop Description"
                    autoComplete="off"
                    value={formState.app_description}
                    multiline={5}
                    onChange={(app_description) =>
                      setFormState({ ...formState, app_description })
                    }
                  />
                  <TextField
                    id="nft_product_description"
                    label="Product Description"
                    autoComplete="off"
                    value={formState.nft_product_description}
                    multiline={5}
                    onChange={(nft_product_description) =>
                      setFormState({ ...formState, nft_product_description })
                    }
                  />
                </FormLayout>
              </Card>
              <Card>
                <FormLayout>
                  <TextField
                    id="env_value1"
                    label="Env Level"
                    autoComplete="off"
                    value={formState.env_code}
                    disabled="true"
                  />
                  <TextField
                    id="env_value2"
                    label="Factory Canister Id"
                    autoComplete="off"
                    value={formState.factory_id}
                    disabled="true"                                                                      
                  />
                  <TextField
                    id="env_value3"
                    label="app system account"
                    autoComplete="off"
                    value={formState.system_account}
                    disabled="true"
                  />
                </FormLayout>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout.AnnotatedSection>
        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Save",
              loading: isSaving,
              disabled: !isDirty || isSaving,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
      <Frame>{toastMarkup}</Frame>
    </Page>
  );
}
