const template = window.WEDDING_TEMPLATE;

if (!template) {
  throw new Error("Wedding template data failed to load.");
}

const byId = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

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

function collectionCard(item, type) {
  const isVideo = type === "video";
  const includes = item.includes?.length
    ? `
      <div class="collection-includes">
        <h4>${isVideo ? "Film Add-On Includes" : "Your Experience Includes"}</h4>
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
    <article class="collection ${isVideo ? "video-card" : ""} ${item.featured ? "featured" : ""}" data-${type}="${item.id}">
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

      <button class="select-collection" type="button" aria-pressed="false" data-select="${type}">
        ${isVideo ? (item.id === "none" ? "Photography Only" : `Add ${item.name}`) : `Select ${item.name}`}
      </button>
    </article>
  `;
}

function mailtoFor(proposal, photo, video) {
  const hasVideo = video && video.id !== "none";
  const subject = encodeURIComponent(
    `${proposal.client.fullName} · Wedding Collection Selection`
  );

  const lines = [
    "Hi Emma,",
    "",
    "I'd like to move forward with the following wedding collection:",
    "",
    `Photography: ${photo.name} · ${photo.hours} · ${photo.priceDisplay}`,
    hasVideo
      ? `Film Add-On: ${video.name} · ${video.hours} · ${video.priceDisplay}`
      : "Film Add-On: Photography only",
    `Total: ${money.format(photo.price + (video?.price || 0))}`,
    "",
    `Wedding Date: ${proposal.client.date}`,
    "",
    "Thank you,",
    proposal.client.firstName
  ];

  return `mailto:hello@eccreativestudios.com?subject=${subject}&body=${encodeURIComponent(lines.join("\n"))}`;
}

function initializeProposal(clientData) {
  const proposal = {
    ...template,
    ...clientData,
    photoCollections: template.photoCollections,
    videoAddons: template.videoAddons
  };

  let selectedPhotoId =
    proposal.photoCollections.find((item) => item.name === proposal.recommendation.photoCollection)?.id ||
    proposal.photoCollections[0].id;

  let selectedVideoId =
    proposal.videoAddons.find((item) => item.name === proposal.recommendation.videoAddon)?.id ||
    "none";

  function updateSelection() {
    const photo = proposal.photoCollections.find((item) => item.id === selectedPhotoId);
    const video = proposal.videoAddons.find((item) => item.id === selectedVideoId);

    if (!photo || !video) return;

    document.querySelectorAll("[data-photo]").forEach((card) => {
      const active = card.dataset.photo === selectedPhotoId;
      card.classList.toggle("is-selected", active);
      card.querySelector(".select-collection")?.setAttribute("aria-pressed", String(active));
    });

    document.querySelectorAll("[data-video]").forEach((card) => {
      const active = card.dataset.video === selectedVideoId;
      card.classList.toggle("is-selected", active);
      card.querySelector(".select-collection")?.setAttribute("aria-pressed", String(active));
    });

    const hasVideo = video.id !== "none";
    const title = hasVideo ? `${photo.name} + ${video.name}` : photo.name;

    setText("selection-title", title);
    setText("selected-photo", `${photo.name} · ${photo.hours}`);
    setText("selected-photo-price", photo.priceDisplay);
    setText("selected-video", hasVideo ? `${video.name} · ${video.hours}` : "Photography Only");
    setText("selected-video-price", hasVideo ? video.priceDisplay : "$0.00");
    setText("selected-total", money.format(photo.price + video.price));

    const reserveLink = byId("reserve-link");
    reserveLink.href = mailtoFor(proposal, photo, video);
  }

  function selectPhoto(id, scroll = false) {
    selectedPhotoId = id;
    updateSelection();
    if (scroll) {
      byId("film")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function selectVideo(id, scroll = false) {
    selectedVideoId = id;
    updateSelection();
    if (scroll) {
      byId("reserve")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
    `${proposal.client.firstName}, this is your current selection. We can fine-tune the timing together before anything is finalized.`
  );

  const vision = byId("vision-copy");
  if (vision) {
    vision.innerHTML = `${proposal.vision} <em>Not just a record of the day, but the feeling of it.</em>`;
  }

  const photoList = byId("photo-list");
  photoList.innerHTML = proposal.photoCollections.map((item) => collectionCard(item, "photo")).join("");

  const videoList = byId("video-list");
  videoList.innerHTML = proposal.videoAddons.map((item) => collectionCard(item, "video")).join("");

  document.querySelectorAll('[data-select="photo"]').forEach((button) => {
    button.addEventListener("click", () => {
      selectPhoto(button.closest("[data-photo]").dataset.photo, true);
    });
  });

  document.querySelectorAll('[data-select="video"]').forEach((button) => {
    button.addEventListener("click", () => {
      selectVideo(button.closest("[data-video]").dataset.video, true);
    });
  });

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

  updateSelection();

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