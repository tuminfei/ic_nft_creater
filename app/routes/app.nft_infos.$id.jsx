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
  LegacyStack,
  Select,
  DropZone,
  Grid,
} from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";

import db from "../db.server";
import {
  getNFTInfo,
  validateInfo,
  canisterMintNFT,
  canisterUploadImg,
  converData,
} from "../models/NFTInfo.server";
import { createProduct, createProductImage } from "../models/NFTProduct.server";
import CollectionInfo from "./collection_info";
import { readAndSaveImage } from "../common/local_file";

export async function loader({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  const nft_collections = await db.nFTCollection.findMany({
    where: { shop: session.shop },
    select: {
      id: true,
      name: true,
      description: true,
      symbol: true,
      image: true,
      owner: true,
      canister_id: true,
    },
  });

  if (params.id === "new") {
    return json({
      nft_info: {
        name: "",
        canister_id: null,
      },
      nft_collections: nft_collections,
    });
  }

  const nft_info = await getNFTInfo(Number(params.id), admin.graphql);

  return json({
    ...nft_info,
    nft_collections: nft_collections,
  });
}

export async function read_file(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      // Remove the prefix such as "data:application/octet-stream;base64,"
      resolve(event.target.result.split(",")[1]);
    };

    reader.onerror = function (error) {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

export async function action({ request, params }) {
  const { admin, session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  let data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };
  const action_name = data.action || "";

  // upload image to canister
  if (data.file_size && parseInt(data.file_size) > 0) {
    // save to public
    const result = await readAndSaveImage(data.file_data, data.file_name);
    const app_url = process.env.SHOPIFY_APP_URL;
    const local_image = app_url + result.file_path;

    // save to canister
    let image_url = await canisterUploadImg(
      parseInt(data.nft_collection_id),
      parseInt(data.file_size),
      data.file_type,
      data.file_name,
      data.file_data
    );
    data.image = image_url;
    data.image_data = data.file_data;
    data.local_image = local_image;
  }

  const errors = validateInfo(data);
  data = converData(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  let nft_info = null;

  if (action_name === "create_product") {
    const response = await createProduct(
      shop,
      admin.graphql,
      data.name,
      100,
      data.local_image,
      data.canister_id,
      data.token_id.toString()
    );
    const responseJson = await response.json();
    const product = responseJson.data?.productCreate?.product;
    const parts_id = product.id.split("/");
    const product_num = parseInt(parts_id[parts_id.length - 1]);
    const image_name = `nft_${data.token_id}.jpg`;
    const image_rest = await createProductImage(admin, session, product_num, image_name, data.image_data);
    await image_rest.save({
      update: false,
    });
    await db.nFTInfo.update({
      where: { id: Number(params.id) },
      data: { product_id: product.id },
    });
  } else {
    if (params.id === "new") {
      nft_info = await db.nFTInfo.create({ data });
      try {
        await canisterMintNFT(nft_info);
        await db.nFTInfo.update({
          where: { id: nft_info.id },
          data: { onchain: true },
        });
      } catch (error) {
        console.log(error);
        console.log("mint nft error, token_id:", nft_info.token_id);
      }
    } else {
      nft_info = await db.nFTInfo.update({
        where: { id: Number(params.id) },
        data,
      });
    }
  }

  return redirect(`/app/main_nfts/`);
}

export default function NFTInfoForm() {
  const errors = useActionData()?.errors || {};

  const nft_info = useLoaderData().nft_info;
  const nft_collections = useLoaderData().nft_collections;
  const [formState, setFormState] = useState(nft_info);
  const [collectionState, setCollectionState] = useState(nft_collections[0]);
  const [cleanFormState, setCleanFormState] = useState(nft_info);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving =
    nav.state === "submitting" && nav.formData?.get("action") !== "delete";

  const navigate = useNavigate();

  const submit = useSubmit();
  async function handleSave() {
    const data = {
      name: formState.name,
      description: formState.description || "",
      owner: formState.owner,
      token_id: formState.token_id,
      subaccount: formState.subaccount,
      image: formState.image,
      nft_collection_id: formState.nft_collection_id || nft_collections[0].id,
      local_image: formState.local_image,
    };

    if (file && file.size > 0) {
      var base64data = await read_file(file);

      data["file_size"] = file.size;
      data["file_type"] = file.type;
      data["file_name"] = file.name;
      data["file_data"] = base64data;
    }

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  async function createProductSave() {
    console.log(collectionState);
    const data = {
      action: "create_product",
      name: formState.name,
      description: formState.description || "",
      owner: formState.owner,
      token_id: formState.token_id,
      subaccount: formState.subaccount,
      image: formState.image,
      nft_collection_id: formState.nft_collection_id || nft_collections[0].id,
      canister_id: collectionState.canister_id,
      local_image: formState.local_image,
      image_data: formState.image_data,
    };
    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  const [selected, setSelected] = useState(nft_collections[0].id.toString());
  const handleSelectChange = useCallback((nft_collection_id) => {
    setSelected(nft_collection_id);
    setFormState({ ...formState, nft_collection_id });
    nft_collections.map((collection) => {
      if (collection.id.toString() === nft_collection_id) {
        setCollectionState(collection);
      }
    });
  }, []);
  const options = nft_collections.map((item) => ({
    label: item.name,
    value: item.id.toString(),
  }));

  const [file, setFile] = useState();
  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => setFile(acceptedFiles[0]),
    []
  );

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
  const fileUpload = !file && <DropZone.FileUpload />;
  const uploadedFile = file && (
    <LegacyStack>
      <Thumbnail
        size="large"
        alt={file.name}
        source={
          validImageTypes.includes(file.type)
            ? window.URL.createObjectURL(file)
            : NoteIcon
        }
      />
      <div>
        {file.name}{" "}
        <Text variant="bodySm" as="p">
          {file.size} bytes
        </Text>
      </div>
    </LegacyStack>
  );

  const createProduction = nft_info.id ? (
    <PageActions
      primaryAction={{
        content: "Save",
        loading: isSaving,
        disabled: !isDirty || isSaving,
        onAction: handleSave,
      }}
      secondaryActions={[
        {
          loading: isSaving,
          disabled: isDirty || isSaving,
          content: "Create NFT Product",
          onAction: createProductSave,
        },
      ]}
    />
  ) : (
    <PageActions
      primaryAction={{
        content: "Save",
        loading: isSaving,
        disabled: !isDirty || isSaving,
        onAction: handleSave,
      }}
    />
  );

  return (
    <Page fullWidth>
      <ui-title-bar title={nft_info.id ? "Edit NFT" : "Mint new NFT"}>
        <button
          variant="breadcrumb"
          onClick={() => navigate("/app/main_nfts/")}
        >
          NFT Infos
        </button>
      </ui-title-bar>
      <Grid columns={{ sm: 3 }}>
        <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 8, xl: 8 }}>
          <Layout>
            <Layout.Section>
              <BlockStack gap="500">
                <Card>
                  <FormLayout>
                    <Select
                      label="NFT Collection"
                      options={options}
                      onChange={handleSelectChange}
                      value={selected}
                    />
                    <TextField
                      id="name"
                      label="Name"
                      autoComplete="off"
                      value={formState.name}
                      onChange={(name) => setFormState({ ...formState, name })}
                      error={errors.name}
                      i
                    />
                    <TextField
                      id="description"
                      label="Description"
                      autoComplete="off"
                      value={formState.description}
                      multiline={5}
                      onChange={(description) =>
                        setFormState({ ...formState, description })
                      }
                      error={errors.description}
                    />
                    <TextField
                      id="token_id"
                      label="Token Id"
                      autoComplete="off"
                      value={formState.token_id}
                      onChange={(token_id) =>
                        setFormState({ ...formState, token_id })
                      }
                      error={errors.token_id}
                    />
                    <TextField
                      id="image"
                      label="Image"
                      autoComplete="off"
                      value={formState.image}
                      onChange={(image) =>
                        setFormState({ ...formState, image })
                      }
                      error={errors.image}
                    />
                    <TextField
                      id="owner"
                      label="NFT Owner"
                      autoComplete="off"
                      value={formState.owner}
                      onChange={(owner) =>
                        setFormState({ ...formState, owner })
                      }
                      error={errors.owner}
                    />
                    <TextField
                      id="subaccount"
                      label="NFT Owner Subaccount"
                      autoComplete="off"
                      value={formState.subaccount}
                      onChange={(subaccount) =>
                        setFormState({ ...formState, subaccount })
                      }
                      error={errors.subaccount}
                    />
                  </FormLayout>
                </Card>
                <LegacyCard title="Media" sectioned>
                  <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                    {uploadedFile}
                    {fileUpload}
                  </DropZone>
                </LegacyCard>
              </BlockStack>
            </Layout.Section>
            <Layout.Section>{createProduction}</Layout.Section>
          </Layout>
        </Grid.Cell>
        <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
          <CollectionInfo collection_info={collectionState} />
        </Grid.Cell>
      </Grid>
    </Page>
  );
}
