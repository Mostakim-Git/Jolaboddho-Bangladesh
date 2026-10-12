import { test, expect } from "@playwright/test";
const assessment = {
  problem_type: "blocked_drain",
  severity: 4,
  visible_evidence: "Waste obstructs a drain opening.",
  confidence: 0.9,
  affects: ["pedestrians"],
};
const weatherData = () => ({
  hourly: {
    time: Array.from(
      { length: 48 },
      (_, i) => Math.floor(Date.now() / 3600000) * 3600 + i * 3600,
    ),
    precipitation: Array(48).fill(1.5),
    precipitation_probability: Array(48).fill(85),
  },
});
async function navigate(page, name) {
  await page
    .getByRole("navigation", { name: "Report screens", exact: true })
    .getByRole("button", { name, exact: true })
    .click();
}
async function uploadPhoto(page, width = 64, height = 64) {
  const dataURL = await page.evaluate(
    ({ width, height }) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#567d74";
      ctx.fillRect(0, 0, width, height);
      return canvas.toDataURL("image/png");
    },
    { width, height },
  );
  await page
    .getByLabel("Upload a drainage problem photo", { exact: true })
    .setInputFiles({
      name: "drain.png",
      mimeType: "image/png",
      buffer: Buffer.from(dataURL.split(",")[1], "base64"),
    });
}
async function enterDemoComplaint(page) {
  await page.getByRole("button", { name: "Try demo", exact: true }).click();
  await page
    .getByRole("button", { name: "Prepare complaint", exact: true })
    .click();
  await page
    .getByLabel("Addressed to")
    .selectOption("ঢাকা উত্তর সিটি কর্পোরেশন");
  await page
    .getByRole("button", { name: "Create demo complaint", exact: true })
    .click();
}
test("five screens navigate forward/back without losing state or overflowing", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A small report. A safer city." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Report a problem", exact: true })
    .click();
  await uploadPhoto(page);
  await expect(
    page.getByAltText("Your selected drainage problem"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Choose location", exact: true })
    .click();
  await page.getByRole("button", { name: "View result", exact: true }).click();
  await expect(
    page.getByText("Awaiting location", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Weather source: Open-Meteo", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Prepare complaint", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Draft my complaint" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page).toHaveURL(/#result$/);
  await page.goBack();
  await expect(page).toHaveURL(/#complaint$/);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const screen of ["Photo", "Location", "Result", "Complaint"]) {
      await navigate(page, screen);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
  }
  await navigate(page, "Photo");
  await expect(
    page.getByAltText("Your selected drainage problem"),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("demo includes exact 8/10 score, date, peak hour, editable draft, and invalidation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try demo", exact: true }).click();
  await expect(
    page.getByText("HIGH RISK · 8/10", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Demo data · illustrative, not a live forecast", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByLabel("Sustainable Development Goals")).toContainText(
    "SDG 13",
  );
  await page
    .getByRole("button", { name: "Prepare complaint", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Create demo complaint", exact: true })
    .click();
  const letter = page.getByLabel("Edit your Bangla complaint");
  await expect(letter).toContainText("তারিখ:");
  await expect(letter).toContainText("নাম:");
  await expect(letter).toContainText("সর্বোচ্চ ঘণ্টাভিত্তিক বৃষ্টি");
  await letter.fill("");
  await expect(letter).toBeVisible();
  await letter.fill("পরীক্ষিত খসড়া");
  await page
    .getByLabel("Addressed to")
    .selectOption("ঢাকা উত্তর সিটি কর্পোরেশন");
  await expect(letter).toHaveCount(0);
  await page
    .getByRole("button", { name: "Create demo complaint", exact: true })
    .click();
  await expect(letter).toContainText("ঢাকা উত্তর সিটি কর্পোরেশন");
  await page
    .getByRole("button", { name: "Start a real report", exact: true })
    .click();
  await navigate(page, "Result");
  await expect(page.getByText(/HIGH RISK/)).toHaveCount(0);
  await navigate(page, "Complaint");
  await expect(
    page.getByRole("button", { name: "Draft my complaint" }),
  ).toBeDisabled();
});
test("full photo/location/live precipitation/risk/AI complaint flow with mocked services", async ({
  page,
}) => {
  await page.route("**/api/analyze", (r) => r.fulfill({ json: assessment }));
  await page.route("https://api.open-meteo.com/**", (r) => {
    const url = new URL(r.request().url());
    expect(url.searchParams.get("hourly")).toBe(
      "precipitation,precipitation_probability",
    );
    expect(url.searchParams.get("daily")).toBe("precipitation_sum");
    expect(url.searchParams.get("forecast_days")).toBe("2");
    return r.fulfill({ json: weatherData() });
  });
  await page.route("**/api/complaint", async (r) => {
    const facts = r.request().postDataJSON();
    expect(facts.weather.source).toBe("live");
    expect(facts.weather.peakTime).toBeGreaterThan(0);
    expect(facts.analysis.visible_evidence).toBe(assessment.visible_evidence);
    expect(facts.location.label).toBe("My verified street");
    await r.fulfill({
      json: {
        text: "বরাবর\nসিটি কর্পোরেশন\nনাম: __________\nফোন: __________",
        source: "Gemini",
      },
    });
  });
  await page.goto("/#photo");
  await uploadPhoto(page);
  await page.getByRole("button", { name: "Analyze photo with Gemini" }).click();
  await expect(page.getByText("Photo assessed", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Choose location", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Use demo location", exact: true })
    .click();
  await page
    .getByLabel("Area name (optional; enter what you know)")
    .fill("My verified street");
  await page.getByRole("button", { name: "View result", exact: true }).click();
  await expect(
    page.getByText(/Live data: Open-Meteo, fetched at/),
  ).toBeVisible();
  await expect(
    page.getByText("HIGH RISK · 7/10", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".result-location")
      .getByText("My verified street", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Prepare complaint", exact: true })
    .click();
  await page.getByRole("button", { name: "Draft my complaint" }).click();
  await expect(page.getByLabel("Edit your Bangla complaint")).toContainText(
    "নাম:",
  );
  await expect(
    page.getByText("AI-assisted draft · Gemini", { exact: true }),
  ).toBeVisible();
});
test("weather failure has retry and does not substitute demo data", async ({
  page,
}) => {
  await page.route("https://api.open-meteo.com/**", (r) => r.abort());
  await page.goto("/#location");
  await page
    .getByRole("button", { name: "Use demo location", exact: true })
    .click();
  await navigate(page, "Result");
  await expect(page.getByRole("alert")).toContainText(
    "Could not reach Open-Meteo",
  );
  await expect(
    page.getByRole("button", { name: "Retry live forecast" }),
  ).toBeVisible();
  await expect(page.getByText("Sample forecast", { exact: true })).toHaveCount(
    0,
  );
});
test("manual pin/coordinates work without map tiles and appear on Result", async ({
  page,
}) => {
  await page.route("**/*.tile.openstreetmap.org/**", (r) => r.abort());
  await page.route("https://api.open-meteo.com/**", (r) =>
    r.fulfill({ json: weatherData() }),
  );
  await page.goto("/#location");
  await page.getByRole("button", { name: "Place a pin", exact: true }).click();
  await page.getByLabel("Area or street name").fill("Agrabad, Chattogram");
  await page.getByLabel("Latitude", { exact: true }).fill("22.327");
  await page.getByLabel("Longitude", { exact: true }).fill("91.811");
  await page.getByRole("button", { name: "Confirm location" }).click();
  await expect(
    page.getByText("22.32700° N, 91.81100° E · Manual pin", { exact: true }),
  ).toBeVisible();
  await navigate(page, "Result");
  await expect(
    page
      .locator(".result-location")
      .getByText("Agrabad, Chattogram", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Live data: Open-Meteo, fetched at/),
  ).toBeVisible();
});
test("GPS denial keeps the manual fallback available", async ({ page }) => {
  await page.goto("/#location");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (_success, failure) => failure({ code: 1 }),
      },
    }),
  );
  await page
    .getByRole("button", { name: "Use my location", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Location permission was not granted",
  );
  await expect(
    page.getByRole("button", { name: "Place a pin", exact: true }),
  ).toBeEnabled();
});
test("unsupported photo and missing Gemini key show friendly messages", async ({
  page,
}) => {
  await page.goto("/#photo");
  await page
    .getByLabel("Upload a drainage problem photo", { exact: true })
    .setInputFiles({
      name: "photo.heic",
      mimeType: "image/heic",
      buffer: Buffer.from("test"),
    });
  await expect(page.getByRole("alert")).toContainText("JPG, PNG, or WebP");
  await page.route("**/api/analyze", (r) =>
    r.fulfill({
      status: 503,
      json: {
        error:
          "Gemini is not configured yet. Add GEMINI_API_KEY on the server, or explore the demo.",
      },
    }),
  );
  await uploadPhoto(page);
  await page.getByRole("button", { name: "Analyze photo with Gemini" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Gemini is not configured",
  );
});
test("negative and low-confidence assessments show actionable guidance", async ({
  page,
}) => {
  await page.route("**/api/analyze", (r) =>
    r.fulfill({
      json: {
        ...assessment,
        problem_type: "none",
        severity: 1,
        confidence: 0.3,
        visible_evidence:
          "The image is too dark; please provide a clearer photo.",
        affects: [],
      },
    }),
  );
  await page.goto("/#photo");
  await uploadPhoto(page);
  await page.getByRole("button", { name: "Analyze photo with Gemini" }).click();
  await expect(page.getByText(/No reliable assessment yet/)).toBeVisible();
  await expect(page.getByText(/Low confidence — please verify/)).toBeVisible();
  await navigate(page, "Result");
  await expect(page.getByText(/Low confidence — please verify/)).toBeVisible();
});
test("copy, share, email preserve the edited Bangla text and do not invent a recipient", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (text) => (window.copiedComplaint = text) },
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
  });
  await enterDemoComplaint(page);
  await page
    .getByLabel("Edit your Bangla complaint")
    .fill("আমার যাচাইকৃত অভিযোগ");
  await page.getByRole("button", { name: "Copy text", exact: true }).click();
  expect(await page.evaluate(() => window.copiedComplaint)).toBe(
    "আমার যাচাইকৃত অভিযোগ",
  );
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Sharing is not supported here",
  );
  await expect(page.getByLabel("Recipient email", { exact: true })).toHaveValue(
    "info@dncc.gov.bd",
  );
  await page
    .getByLabel("I checked the office and jurisdiction.", { exact: false })
    .check();
  const href = await page
    .getByRole("link", { name: "Email", exact: true })
    .getAttribute("href");
  expect(href.startsWith("mailto:info%40dncc.gov.bd?")).toBeTruthy();
  expect(new URLSearchParams(href.split("?")[1]).get("body")).toBe(
    "আমার যাচাইকৃত অভিযোগ",
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data) => (window.sharedComplaint = data.text),
    }),
  );
  await page.getByRole("button", { name: "Share", exact: true }).click();
  expect(await page.evaluate(() => window.sharedComplaint)).toBe(
    "আমার যাচাইকৃত অভিযোগ",
  );
});
test("Other authority requires a name and appears in the demo salutation", async ({
  page,
}) => {
  await page.goto("/");
  await enterDemoComplaint(page);
  await page.getByLabel("Addressed to").selectOption("other");
  await expect(
    page.getByRole("button", { name: "Create demo complaint" }),
  ).toBeDisabled();
  await page.getByLabel("Authority / office name").fill("সাভার পৌরসভা");
  await page.getByRole("button", { name: "Create demo complaint" }).click();
  await expect(page.getByLabel("Edit your Bangla complaint")).toContainText(
    "সাভার পৌরসভা",
  );
});
test("an older weather response cannot overwrite a new demo report", async ({
  page,
}) => {
  let received, pending;
  const arrived = new Promise((resolve) => (received = resolve));
  await page.route("https://api.open-meteo.com/**", (r) => {
    pending = r;
    received();
  });
  await page.goto("/#location");
  await page
    .getByRole("button", { name: "Use demo location", exact: true })
    .click();
  await arrived;
  await page.getByRole("button", { name: "Try demo", exact: true }).click();
  await pending.fulfill({ json: weatherData() });
  await expect(
    page.getByText("Demo data · illustrative, not a live forecast", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(/Live data: Open-Meteo, fetched at/)).toHaveCount(
    0,
  );
});
test("large image is resized to max 1024 px; EXIF rotation is respected", async ({
  page,
}) => {
  await page.goto("/#photo");
  await uploadPhoto(page, 3200, 1600);
  await expect(
    page.getByAltText("Your selected drainage problem"),
  ).toBeVisible();
  expect(
    await page
      .getByAltText("Your selected drainage problem")
      .evaluate((img) => [img.naturalWidth, img.naturalHeight]),
  ).toEqual([1024, 512]);
  const dims = await page.evaluate(async () => {
    const { prepareImage } = await import("/src/image.js");
    const c = document.createElement("canvas");
    c.width = 80;
    c.height = 40;
    c.getContext("2d").fillRect(0, 0, 80, 40);
    const bytes = new Uint8Array(
      await (await fetch(c.toDataURL("image/jpeg"))).arrayBuffer(),
    );
    // JPEG APP1, Exif little-endian IFD, orientation 6 (rotate 90 degrees CW).
    const exif = new Uint8Array([
      255, 225, 0, 34, 69, 120, 105, 102, 0, 0, 73, 73, 42, 0, 8, 0, 0, 0, 1, 0,
      18, 1, 3, 0, 1, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0,
    ]);
    const f = new File(
      [bytes.slice(0, 2), exif, bytes.slice(2)],
      "rotated.jpg",
      { type: "image/jpeg" },
    );
    const result = await prepareImage(f);
    const img = new Image();
    img.src = result;
    await img.decode();
    return [img.naturalWidth, img.naturalHeight];
  });
  expect(dims).toEqual([40, 80]);
});
test("about modal discloses sources and closes with Escape", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "About & data sources" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "No accounts or report database",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("confident dry-street result is friendly and uses zero photo points", async ({
  page,
}) => {
  await page.route("**/api/analyze", (r) =>
    r.fulfill({
      json: {
        ...assessment,
        problem_type: "none",
        severity: 1,
        confidence: 0.96,
        visible_evidence:
          "A dry street is visible with no drainage obstruction.",
        affects: [],
      },
    }),
  );
  await page.route("https://api.open-meteo.com/**", (r) =>
    r.fulfill({ json: weatherData() }),
  );
  await page.goto("/#photo");
  await uploadPhoto(page);
  await page.getByRole("button", { name: "Analyze photo with Gemini" }).click();
  await expect(
    page.getByText(/No drainage or flooding problem is visible/),
  ).toBeVisible();
  await navigate(page, "Location");
  await page
    .getByRole("button", { name: "Use demo location", exact: true })
    .click();
  await navigate(page, "Result");
  await expect(
    page.getByText("MEDIUM RISK · 4/10", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/photo contributes 0 points/)).toBeVisible();
});

test("recipient directory follows authority, requires confirmation, and source is visible", async ({
  page,
}) => {
  await page.goto("/");
  await enterDemoComplaint(page);
  await expect(
    page.getByRole("link", { name: "View official contact source" }),
  ).toHaveAttribute("href", /dncc\.gov\.bd/);
  await expect(page.locator(".email-button")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await page
    .getByLabel("I checked the office and jurisdiction.", { exact: false })
    .check();
  await expect(page.locator(".email-button")).toHaveAttribute(
    "href",
    /^mailto:info%40dncc.gov.bd/,
  );
  await page
    .getByLabel("Recipient email", { exact: true })
    .fill("bad@example.com\nBcc:other@example.com");
  await expect(page.getByLabel("Edit your Bangla complaint")).toHaveCount(0);
  await page.getByLabel("Addressed to").selectOption("সিলেট সিটি কর্পোরেশন");
  await expect(page.getByLabel("Recipient email", { exact: true })).toHaveValue(
    "ce@scc.gov.bd",
  );
  await expect(
    page.getByLabel("I checked the office and jurisdiction.", { exact: false }),
  ).not.toBeChecked();
});

test("service settings reject unsafe origins without sending photos or keys", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByText("Service settings", { exact: true }).click();
  await page
    .getByLabel("Public HTTPS backend origin")
    .fill("http://localhost:3001");
  await page.getByRole("button", { name: "Save & check connection" }).click();
  await expect(page.locator(".service-settings [role=status]")).toContainText(
    "HTTPS origin",
  );
});
