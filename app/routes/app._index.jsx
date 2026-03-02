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
