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

    const userErrors = responseJson.data?.metafieldsSet?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error("Shopify metafield error:", userErrors);
      return { success: false, error: userErrors[0].message };
    }

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

  // Show toast notification on success
  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(fetcher.data.message);
      setText(""); // clear input after save
    }
  }, [fetcher.data?.success]);

  const handleSave = () => {
    fetcher.submit({ text }, { method: "POST" });
  };

  return (
    <s-page heading="Announcement Manager">
      {/* ── Save Announcement Section ── */}
      <s-section heading="Create Announcement">
        <s-paragraph>
          Type your announcement below. It will be saved to the database and
          displayed as a banner on your storefront.
        </s-paragraph>

        <s-stack direction="block" gap="base">
          <s-text-field
            label="Announcement Text"
            value={text}
            onInput={(e) => setText(e.target.value)}
            placeholder="e.g. Sale 50% Off this weekend!"
          />

          {/* Error message */}
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

      {/* ── Recent Announcements Section ── */}
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
