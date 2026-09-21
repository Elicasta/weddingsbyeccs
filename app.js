const template = window.WEDDING_TEMPLATE;

if (!template) {
  throw new Error("Wedding template data failed to load.");
}

const byId = (id) => document.getElementById(id);

function getClientSlug() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const candidate = parts[0];

  if (!candidate || candidate === "index.html" || candidate.includes(".")) {
    return "cristina";
  }

  return candidate.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function loadClientProposal(slug) {
  return new Promise((resolve, reject) => {
    window.CLIENT_PROPOSAL = undefined;

    const script = document.createElement("script");
    script.src = `/clients/${encodeURIComponent(slug)}.js`;
    script.async = true;

    script.onload = () => {
      if (!window.CLIENT_PROPOSAL) {
        reject(new Error(`Client data for "${slug}" did not initialize.`));
        return;
      }
      resolve(window.CLIENT_PROPOSAL);
    };

    script.onerror = () => reject(new Error(`Client proposal "${slug}" was not found.`));
    document.head.appendChild(script);
  });
}

function showNotFound(slug) {
  document.title = "Wedding Proposal | Emma Cast Creative";
  document.body.innerHTML = `
    <main class="missing-proposal">
      <div>
        <p class="eyebrow">Private Wedding Proposal</p>
        <h1>We couldn't find this proposal.</h1>
        <p>The link <strong>/${slug}</strong> may be incomplete or no longer active.</p>
        <a class="button button-primary" href="mailto:hello@eccreativestudios.com">Contact Emma Cast Creative</a>
      </div>
    </main>
  `;
}

function setText(id, value) {
  const el = byId(id);
  if (el && value !== undefined && value !== null) el.textContent = value;
}

function setNodeText(selector, value) {
  const el = document.querySelector(selector);
  if (el && value !== undefined && value !== null) el.textContent = value;
}

function renderList(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function collectionCard(item, type, recommendedName) {
  const isVideo = type === "video";
  const isRecommended = item.name === recommendedName;

  const includes = item.includes?.length
    ? `
      <div class="collection-includes">
        <h4>${isVideo ? "Film Includes" : "Your Experience Includes"}</h4>
        <ul>${renderList(item.includes)}</ul>
      </div>
    `
    : "";

  const ideal = item.idealFor?.length
    ? `
      <div class="collection-ideal">
        <h4>Perfect For</h4>
        <ul>${renderList(item.idealFor)}</ul>
      </div>
    `
    : "";

  return `
    <article class="collection ${isVideo ? "video-card" : ""} ${isRecommended ? "featured" : ""}">
      <div class="collection-top">
        <div>
          <p class="collection-index">${item.numeral}</p>
          <h3>${item.name}</h3>
          ${item.subtitle ? `<p class="collection-subtitle">${item.subtitle}</p>` : ""}
          <p class="collection-tone">${item.tone}</p>
        </div>

        <div class="collection-price">
          <span>${item.hours}</span>
          <strong>${item.priceDisplay}</strong>
        </div>
      </div>

      <p class="collection-description">${item.description}</p>

      <div class="collection-details ${ideal ? "" : "single-column"}">
        ${ideal}
        ${includes}
      </div>
    </article>
  `;
}

function requestQuoteHref(proposal) {
  const subject = encodeURIComponent(
    `${proposal.client.fullName} · ${proposal.client.date} · Wedding Quote`
  );

  const body = encodeURIComponent(
    [
      "Hi Emma,",
      "",
      "I reviewed my proposal and I’m ready to talk through the options and have my official quote prepared.",
      "",
      `Name: ${proposal.client.fullName}`,
      `Wedding Date: ${proposal.client.date}`,
      "",
      "Thank you!"
    ].join("\n")
  );

  return `mailto:hello@eccreativestudios.com?subject=${subject}&body=${body}`;
}

function initializeProposal(clientData) {
  const proposal = {
    ...template,
    ...clientData,
    photoCollections: clientData.photoCollections || template.photoCollections,
    videoAddons: clientData.videoAddons || template.videoAddons
  };

  const copy = proposal.pageCopy || {};
  const hasQuote = Boolean(proposal.quoteUrl);

  document.title = `${proposal.client.firstName}'s Wedding Story | Emma Cast Creative`;

  setText("client-name", proposal.client.firstName);
  setText("wedding-date", proposal.client.date);
  setText("ribbon-date", proposal.client.date);
  setText("venue", proposal.client.venue);
  setText("location", proposal.client.location);
  setText("guest-count", proposal.client.guestCount);
  setText("hero-intro", copy.heroIntro || proposal.heroIntro);
  setText("footer-client", `${proposal.client.fullName} · Private Wedding Proposal`);
  setText("recommendation-eyebrow", `For ${proposal.client.firstName}`);
  setText("recommendation-title", proposal.recommendation.title);
  setText("recommendation-copy", proposal.recommendation.copy);

  setNodeText(".hero .eyebrow", copy.heroEyebrow);
  setNodeText(".hero h1 em", copy.heroTitleTail);
  setNodeText(".hero-photo figcaption", copy.heroCaption);

  setNodeText("#photography .chapter-heading .eyebrow", copy.photoEyebrow);
  setNodeText("#photography .chapter-heading h2", copy.photoTitle);
  setNodeText("#photography .chapter-heading > p:last-child", copy.photoIntro);

  setNodeText("#film .chapter-heading .eyebrow", copy.filmEyebrow);
  setNodeText("#film .chapter-heading h2", copy.filmTitle);
  setNodeText("#film .chapter-heading > p:last-child", copy.filmIntro);

  setNodeText(".reserve-copy > .eyebrow", copy.reserveEyebrow);
  setNodeText(".reserve-copy > h2", copy.reserveTitle);

  const vision = byId("vision-copy");
  const visionLead = copy.vision || proposal.vision;
  const visionTail = copy.visionTail || "Not just a record of the day, but the feeling of it.";
  if (vision && visionLead) {
    vision.innerHTML = `${visionLead} <em>${visionTail}</em>`;
  }

  const photoList = byId("photo-list");
  photoList.innerHTML = proposal.photoCollections
    .map((item) => collectionCard(item, "photo", proposal.recommendation.photoCollection))
    .join("");

  const videoList = byId("video-list");
  const visibleVideoAddons = proposal.videoAddons.filter((item) => item.id !== "none");
  videoList.innerHTML = visibleVideoAddons
    .map((item) => collectionCard(item, "video", proposal.recommendation.videoAddon))
    .join("");

  const filmSection = byId("film");
  if (!visibleVideoAddons.length && filmSection) {
    filmSection.hidden = true;
  }

  const priorityList = byId("priority-list");
  priorityList.innerHTML = "";
  proposal.priorities.forEach((priority, index) => {
    const article = document.createElement("article");
    article.className = "priority-card";
    article.innerHTML = `
      <span>${String(index + 1).padStart(2, "0")}</span>
      <h3>${priority.title}</h3>
      <p>${priority.copy}</p>
    `;
    priorityList.appendChild(article);
  });

  const quoteHref = hasQuote ? proposal.quoteUrl : requestQuoteHref(proposal);
  const fallbackLabel = copy.quoteButtonLabel || (hasQuote ? "Open Your Quote" : "Request Your Official Quote");

  document.querySelectorAll(".quote-link").forEach((link) => {
    link.href = quoteHref;

    if (hasQuote) {
      link.target = "_blank";
      link.rel = "noopener";
    } else {
      link.removeAttribute("target");
      link.removeAttribute("rel");
      link.textContent = fallbackLabel;
    }
  });

  const reserveLink = byId("reserve-link");
  if (reserveLink && copy.quoteButtonLabel) {
    reserveLink.textContent = copy.quoteButtonLabel;
  }

  setText(
    "reserve-copy",
    copy.reserveCopy ||
      (hasQuote
        ? `${proposal.client.firstName}, your final selections happen inside your official quote so your package, add-ons, and total always stay together in one place.`
        : `${proposal.client.firstName}, review the collections and let us know what feels closest to your day. We’ll prepare your official quote from there.`)
  );

  const handoffSteps = document.querySelectorAll(".quote-handoff > div strong");
  if (!hasQuote && handoffSteps.length >= 3) {
    handoffSteps[0].textContent = "Review the elopement options";
    handoffSteps[1].textContent = "Tell us what feels right";
    handoffSteps[2].textContent = "We’ll prepare your official quote";
  }

  const sourceNote = document.querySelector(".quote-source-note");
  if (sourceNote) {
    sourceNote.textContent = hasQuote
      ? "Your quote opens in a new tab. Final package selections and totals are confirmed there."
      : "Your final selections and total will be confirmed in the official quote we prepare for you.";
  }

  const steps = document.querySelectorAll(".steps .step");
  if (!hasQuote && steps.length >= 3) {
    steps[0].querySelector("h3").textContent = "Explore";
    steps[0].querySelector("p").textContent =
      "Use this page to compare the coverage options and see the direction we think best fits your day.";

    steps[1].querySelector("h3").textContent = "Tell Us";
    steps[1].querySelector("p").textContent =
      "Let us know which photography option feels right and whether you want to add film.";

    steps[2].querySelector("h3").textContent = "Quote";
    steps[2].querySelector("p").textContent =
      "We’ll prepare the official quote with your final collection, add-ons, and investment in one place.";
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -3% 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }
}

const slug = getClientSlug();

loadClientProposal(slug)
  .then(initializeProposal)
  .catch(() => showNotFound(slug));