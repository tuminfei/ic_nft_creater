import { useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  FormLayout,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  BlockStack,
  PageActions,
  LegacyCard,
  DropZone,
} from "@shopify/polaris";
import { NoteMinor } from "@shopify/polaris-icons";

import db from "../db.server";
import { getSettings } from "../models/AppSetting.server";

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  return json(await getSettings(session.shop, admin.graphql));
}

export default function AppSettingForm() {
  const settings = useLoaderData();
  const [formState, setFormState] = useState(settings);
  const [cleanFormState, setCleanFormState] = useState(settings);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";

  const submit = useSubmit();
  function handleSave() {
    const data = {
      merchant_principal: formState.merchant_principal,
      app_description: formState.app_description || "",
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title="Edit App Settings"></ui-title-bar>
      <Layout>
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
                  i
                />
                <TextField
                  id="app_description"
                  label="Description"
                  autoComplete="off"
                  value={formState.app_description}
                  multiline={5}
                  onChange={(app_description) =>
                    setFormState({ ...formState, app_description })
                  }
                />
              </FormLayout>
            </Card>
          </BlockStack>
        </Layout.Section>
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
    </Page>
  );
}
