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

function initializeProposal(clientData) {
  const proposal = {
    ...template,
    ...clientData,
    photoCollections: template.photoCollections,
    videoAddons: template.videoAddons
  };

  if (!proposal.quoteUrl) {
    throw new Error(`Client proposal "${proposal.slug}" is missing quoteUrl.`);
  }

  document.title = `${proposal.client.firstName}'s Wedding Story | Emma Cast Creative`;

  setText("client-name", proposal.client.firstName);
  setText("wedding-date", proposal.client.date);
  setText("ribbon-date", proposal.client.date);
  setText("venue", proposal.client.venue);
  setText("location", proposal.client.location);
  setText("guest-count", proposal.client.guestCount);
  setText("hero-intro", proposal.heroIntro);
  setText("footer-client", `${proposal.client.fullName} · Private Wedding Proposal`);
  setText("recommendation-eyebrow", `For ${proposal.client.firstName}`);
  setText("recommendation-title", proposal.recommendation.title);
  setText("recommendation-copy", proposal.recommendation.copy);
  setText(
    "reserve-copy",
    `${proposal.client.firstName}, your final selections happen inside your official quote so your package, add-ons, and total always stay together in one place.`
  );

  const vision = byId("vision-copy");
  if (vision) {
    vision.innerHTML = `${proposal.vision} <em>Not just a record of the day, but the feeling of it.</em>`;
  }

  const photoList = byId("photo-list");
  photoList.innerHTML = proposal.photoCollections
    .map((item) => collectionCard(item, "photo", proposal.recommendation.photoCollection))
    .join("");

  const videoList = byId("video-list");
  videoList.innerHTML = proposal.videoAddons
    .filter((item) => item.id !== "none")
    .map((item) => collectionCard(item, "video", proposal.recommendation.videoAddon))
    .join("");

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

  document.querySelectorAll(".quote-link").forEach((link) => {
    link.href = proposal.quoteUrl;
    link.target = "_blank";
    link.rel = "noopener";
  });

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