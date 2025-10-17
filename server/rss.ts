import { PressRelease, Entity } from "../drizzle/schema";

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  guid: string;
  content?: string;
  author?: string;
  category?: string[];
}

export function generateRSSFeed(pressReleases: (PressRelease & { entity?: Entity | null })[], baseUrl: string): string {
  const items = pressReleases
    .filter(pr => pr.status === "published")
    .map(pr => generateRSSItem(pr, baseUrl));

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Press Releases</title>
    <link>${baseUrl}</link>
    <description>Latest press releases</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items.map(item => generateRSSItemXML(item)).join("\n    ")}
  </channel>
</rss>`;

  return rss;
}

function generateRSSItem(pr: PressRelease & { entity?: Entity | null }, baseUrl: string): RSSItem {
  const link = `${baseUrl}/press-releases/${pr.id}/view`;
  
  // Combine dateline with lead paragraph for description
  let description = "";
  if (pr.datelineCity || pr.datelineState || pr.datelineDate) {
    const dateline = [
      pr.datelineCity,
      pr.datelineState,
      pr.datelineDate ? new Date(pr.datelineDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null
    ].filter(Boolean).join(", ");
    description = dateline + " - ";
  }
  description += pr.leadParagraph || pr.subheadline || "";

  // Full content includes body, boilerplate, and call to action
  let content = "";
  if (pr.bodyContent) content += pr.bodyContent;
  if (pr.boilerplate) content += `\n\n<p><strong>About ${pr.entity?.companyName || "the Company"}:</strong> ${pr.boilerplate}</p>`;
  if (pr.callToAction) content += `\n\n<p>${pr.callToAction}</p>`;
  
  // Add media contact if available
  if (pr.mediaContactName || pr.mediaContactEmail) {
    content += "\n\n<p><strong>Media Contact:</strong><br/>";
    if (pr.mediaContactName) content += `${pr.mediaContactName}`;
    if (pr.mediaContactTitle) content += `, ${pr.mediaContactTitle}`;
    content += "<br/>";
    if (pr.mediaContactEmail) content += `Email: ${pr.mediaContactEmail}<br/>`;
    if (pr.mediaContactPhone) content += `Phone: ${pr.mediaContactPhone}<br/>`;
    if (pr.mediaContactWebsite) content += `Website: ${pr.mediaContactWebsite}`;
    content += "</p>";
  }

  const categories: string[] = [];
  if (pr.entity?.industry) categories.push(pr.entity.industry);
  if (pr.keywords) {
    const keywords = pr.keywords.split(",").map(k => k.trim());
    categories.push(...keywords);
  }

  return {
    title: pr.headline,
    description,
    link,
    pubDate: pr.publishedAt || pr.createdAt || new Date(),
    guid: pr.id,
    content,
    author: pr.authorEmail ? `${pr.authorEmail} (${pr.authorName || "Author"})` : undefined,
    category: categories.length > 0 ? categories : undefined,
  };
}

function generateRSSItemXML(item: RSSItem): string {
  const escapeCDATA = (str: string) => {
    return str.replace(/]]>/g, "]]]]><![CDATA[>");
  };

  const escapeXML = (str: string) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  let xml = `<item>
      <title>${escapeXML(item.title)}</title>
      <description><![CDATA[${escapeCDATA(item.description)}]]></description>
      <link>${escapeXML(item.link)}</link>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <guid isPermaLink="false">${escapeXML(item.guid)}</guid>`;

  if (item.content) {
    xml += `\n      <content:encoded><![CDATA[${escapeCDATA(item.content)}]]></content:encoded>`;
  }

  if (item.author) {
    xml += `\n      <dc:creator>${escapeXML(item.author)}</dc:creator>`;
  }

  if (item.category && item.category.length > 0) {
    item.category.forEach(cat => {
      xml += `\n      <category>${escapeXML(cat)}</category>`;
    });
  }

  xml += `\n    </item>`;

  return xml;
}

export async function submitToXPRMedia(rssContent: string, endpoint?: string): Promise<{ success: boolean; message: string }> {
  // Test endpoint - in production, this would be the actual XPR Media endpoint
  const xprEndpoint = endpoint || "https://test-rss-endpoint.example.com/submit";
  
  try {
    // For now, this is a mock submission
    // In production, you would make an actual HTTP request to XPR Media
    console.log("RSS Feed to submit:", rssContent);
    console.log("Endpoint:", xprEndpoint);
    
    // Simulate API call
    // const response = await fetch(xprEndpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/rss+xml',
    //   },
    //   body: rssContent,
    // });
    
    return {
      success: true,
      message: "RSS feed submitted successfully (test mode)",
    };
  } catch (error) {
    console.error("RSS submission error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit RSS feed",
    };
  }
}

