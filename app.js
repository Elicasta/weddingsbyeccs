const proposal = window.PROPOSAL;

if (!proposal) {
  throw new Error("Proposal data failed to load.");
}

const byId = (id) => document.getElementById(id);

function setText(id, value) {
  const el = byId(id);
  if (el && value) el.textContent = value;
}

function mailtoFor(collectionName) {
  const subject = encodeURIComponent(
    `${proposal.client.fullName} · ${collectionName} Wedding Collection`
  );
  const body = encodeURIComponent(
    `Hi Emma,\n\nI'd like to move forward with the ${collectionName} collection for our wedding on ${proposal.client.date}.\n\nThank you,\n${proposal.client.firstName}`
  );
  return `mailto:hello@eccreativestudios.com?subject=${subject}&body=${body}`;
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
setText("recommendation-title", proposal.recommendation.title);
setText("recommendation-copy", proposal.recommendation.copy);

const vision = byId("vision-copy");
if (vision) {
  vision.innerHTML = `${proposal.vision} <em>Not just how it looked. How it felt.</em>`;
}

const reserveCopy = byId("reserve-copy");
if (reserveCopy) {
  reserveCopy.textContent =
    `${proposal.client.firstName}, when you're ready, choose the collection that feels closest to the day you're planning. We can fine-tune the timeline together before anything is finalized.`;
}

const priorityList = byId("priority-list");
proposal.priorities.forEach((priority, index) => {
  const article = document.createElement("article");
  article.className = "priority-card reveal";
  article.innerHTML = `
    <span>${String(index + 1).padStart(2, "0")}</span>
    <h3>${priority.title}</h3>
    <p>${priority.copy}</p>
  `;
  priorityList.appendChild(article);
});

const collectionList = byId("collection-list");
const reserveLink = byId("reserve-link");

function selectCollection(id, shouldScroll = false) {
  const selected = proposal.collections.find((collection) => collection.id === id);
  if (!selected) return;

  document.querySelectorAll(".collection").forEach((card) => {
    const active = card.dataset.collection === id;
    card.classList.toggle("is-selected", active);
    card.querySelector(".select-collection")?.setAttribute("aria-pressed", String(active));
  });

  reserveLink.href = mailtoFor(selected.name);
  reserveLink.textContent = `Choose ${selected.name}`;

  if (shouldScroll) {
    byId("reserve")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

proposal.collections.forEach((collection) => {
  const article = document.createElement("article");
  article.className = `collection reveal${collection.featured ? " featured" : ""}`;
  article.dataset.collection = collection.id;

  const idealFor = collection.idealFor.map((item) => `<li>${item}</li>`).join("");
  const includes = collection.includes.map((item) => `<li>${item}</li>`).join("");

  article.innerHTML = `
    <div class="collection-top">
      <div>
        <p class="collection-index">${collection.numeral}</p>
        <h3>${collection.name}</h3>
        <p class="collection-tone">${collection.tone}</p>
      </div>
      <div class="collection-price">
        <span>${collection.hours}</span>
        <strong>${collection.price}</strong>
      </div>
    </div>

    <p class="collection-description">${collection.description}</p>

    <div class="collection-details">
      <div>
        <h4>Perfect For</h4>
        <ul>${idealFor}</ul>
      </div>
      <div>
        <h4>Your Experience Includes</h4>
        <ul>${includes}</ul>
      </div>
    </div>

    <button class="select-collection" type="button" aria-pressed="false">
      Select ${collection.name}
    </button>
  `;

  article.querySelector(".select-collection").addEventListener("click", () => {
    selectCollection(collection.id, true);
  });

  collectionList.appendChild(article);
});

const recommended =
  proposal.collections.find((collection) => collection.name === proposal.recommendation.collection) ||
  proposal.collections[0];

selectCollection(recommended.id);

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