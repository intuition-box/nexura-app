import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

interface Claim {
  avatar: string;
  titleLeft: string;
  titleMiddle: string;
  titleRight: string;
  attestations: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch("https://portal.intuition.systems/explore/triples");
    const html = await response.text();

    // Regex to capture all card divs (assuming a common class "triple-card")
    const cardMatches = html.match(/<div class="triple-card"[^>]*>[\s\S]*?<\/div>/g);

    if (!cardMatches || cardMatches.length === 0) {
      return res.status(404).json({ error: "No claims found" });
    }

    const claims: Claim[] = cardMatches.map((cardHtml) => {
      const avatarMatch = cardHtml.match(/<img[^>]+src="([^"]+)"/);
      const avatar = avatarMatch ? avatarMatch[1] : "/claim1.jpg";

      const titleLeftMatch = cardHtml.match(/<span class="title-left">([^<]+)<\/span>/);
      const titleMiddleMatch = cardHtml.match(/<span class="title-middle">([^<]+)<\/span>/);
      const titleRightMatch = cardHtml.match(/<span class="title-right">([^<]+)<\/span>/);
      const attestationsMatch = cardHtml.match(/([\d,]+)\s+attestations/);

      return {
        avatar,
        titleLeft: titleLeftMatch ? titleLeftMatch[1] : "The Ticker",
        titleMiddle: titleMiddleMatch ? titleMiddleMatch[1] : "is",
        titleRight: titleRightMatch ? titleRightMatch[1] : "Trust",
        attestations: attestationsMatch ? parseInt(attestationsMatch[1].replace(/,/g, "")) : 0,
      };
    });

    return res.status(200).json(claims);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch claims" });
  }
}
