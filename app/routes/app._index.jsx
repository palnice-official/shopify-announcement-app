import { useState, useEffect } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import connectDB from "../db.mongo.js";
import { Announcement } from "../models.js";

// ─── LOADER: runs on page load, fetches recent announcements ───
export const loader = async ({ request }) => {
  await authenticate.admin(request);

  try {
    await connectDB();
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5);
    return { announcements: JSON.parse(JSON.stringify(announcements)) };
  } catch (error) {
    console.error("MongoDB load error:", error);
    return { announcements: [] };
  }
};

// ─── ACTION: runs when Save button is clicked ───
export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const formData = await request.formData();
  const text = formData.get("text");

  if (!text || text.trim() === "") {
    return { success: false, error: "Announcement text cannot be empty" };
  }

  try {
    // 1. Save to MongoDB
    await connectDB();
    await Announcement.create({
      text: text.trim(),
      shop: session.shop,
    });

    // 2. First get real Shop GID
    const shopResponse = await admin.graphql(`
      {
        shop {
          id
        }
      }
    `);
    const shopData = await shopResponse.json();
    const shopId = shopData.data.shop.id;
    console.log("Shop ID:", shopId);

    // 3. Save to Shopify Metafield
    const response = await admin.graphql(
      `#graphql
      mutation setShopMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              namespace: "my_app",
              key: "announcement",
              value: text.trim(),
              type: "single_line_text_field",
              ownerId: shopId,
            },
          ],
        },
      }
    );

    const responseJson = await response.json();
    console.log("Metafield response:", JSON.stringify(responseJson, null, 2));
    console.log("Metafield URL was:", response.url);
    console.log("Metafield status:", response.status);

    if (!responseJson.data) {
      console.error("NO DATA IN RESPONSE:", responseJson);
      return { success: false, error: `GraphQL Error: ${JSON.stringify(responseJson.errors)}` };
    }

    const userErrors = responseJson.data?.metafieldsSet?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error("Shopify metafield error:", userErrors);
      return { success: false, error: userErrors[0].message };
    }

    const savedMetafields = responseJson.data?.metafieldsSet?.metafields;
    if (!savedMetafields || savedMetafields.length === 0) {
      console.error("No metafields returned from mutation");
      return { success: false, error: "Metafield was not saved" };
    }

    console.log("Metafield successfully saved:", savedMetafields[0]);

    return { success: true, message: "Announcement saved successfully!" };
  } catch (error) {
    console.error("Save error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
};

// ─── UI COMPONENT ───
export default function Index() {
  const { announcements } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [text, setText] = useState("");

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(fetcher.data.message);
      setText("");
    }
  }, [fetcher.data?.success]);

  const handleSave = () => {
    console.log("handleSave called with text:", text);
    if (!text.trim()) {
      return;
    }
    const formData = new FormData();
    formData.append("text", text);
    fetcher.submit(formData, { method: "POST" });
  };

  return (
    <s-page heading="Announcement Manager">
      <s-section heading="Create Announcement">
        <s-paragraph>
          Type your announcement below. It will be saved to the database and
          displayed as a banner on your storefront.
        </s-paragraph>

        <s-stack direction="block" gap="base">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Sale 50% Off this weekend!"
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />

          {fetcher.data?.error && (
            <s-banner tone="critical">{fetcher.data.error}</s-banner>
          )}

          <s-button
            onClick={handleSave}
            variant="primary"
            {...(isLoading ? { loading: true } : {})}
          >
            {isLoading ? "Saving..." : "Save Announcement"}
          </s-button>
        </s-stack>
      </s-section>

      <s-section heading="Recent Announcements">
        {announcements.length === 0 ? (
          <s-paragraph>
            No announcements yet. Create your first one above!
          </s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {announcements.map((a) => (
              <s-box
                key={a._id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-stack direction="inline" gap="base">
                  <s-text>📢 {a.text}</s-text>
                  <s-text tone="subdued">
                    {new Date(a.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </s-text>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
