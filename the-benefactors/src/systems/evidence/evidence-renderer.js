function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const EVIDENCE_PRESENTATIONS = {
  document: { label: "Document", stamp: "DOC", motif: "document" },
  photograph: { label: "Photographic record", stamp: "PHOTO", motif: "photograph" },
  recording: { label: "Audio evidence", stamp: "REC", motif: "recording" },
  financial: { label: "Account trace", stamp: "ACCT", motif: "financial" },
  location: { label: "Site / route", stamp: "LOC", motif: "location" },
  organization: { label: "Organization file", stamp: "ORG", motif: "organization" },
  event: { label: "Event record", stamp: "EVENT", motif: "event" },
  access: { label: "Access credential", stamp: "PASS", motif: "access" },
  witness: { label: "Witness statement", stamp: "WIT", motif: "witness" },
  lead: { label: "Active lead", stamp: "LEAD", motif: "lead" },
};

export function getEvidencePresentation(evidence) {
  const category = evidence?.category || "document";
  const presentation = EVIDENCE_PRESENTATIONS[category] || EVIDENCE_PRESENTATIONS.document;
  return {
    ...presentation,
    fileNumber: String(evidence?.id || "unfiled").replaceAll("_", "-").toUpperCase(),
  };
}

function renderFileRail(evidence) {
  const presentation = getEvidencePresentation(evidence);
  return `
    <header class="evidence-file-rail">
      <span>${escapeHtml(presentation.label)}</span>
      <strong>${escapeHtml(presentation.fileNumber)}</strong>
      <i aria-hidden="true">${escapeHtml(presentation.stamp)}</i>
    </header>
  `;
}

function renderEmail(artifact) {
  return `
    <article class="artifact artifact-email">
      <header>
        <p class="artifact-app">GREYMAIL · ARCHIVED MESSAGE</p>
        <h2>${escapeHtml(artifact.subject)}</h2>
        <dl>
          <div><dt>From</dt><dd>${escapeHtml(artifact.from)}</dd></div>
          <div><dt>To</dt><dd>${escapeHtml(artifact.to)}</dd></div>
          <div><dt>Sent</dt><dd>${escapeHtml(artifact.sent)}</dd></div>
        </dl>
      </header>
      <section>
        ${artifact.paragraphs
          .map((paragraph) => {
            const highlighted = escapeHtml(paragraph).replace(
              escapeHtml(artifact.highlightedPhrase),
              `<mark>${escapeHtml(artifact.highlightedPhrase)}</mark>`,
            );
            return `<p>${highlighted}</p>`;
          })
          .join("")}
      </section>
    </article>
  `;
}

function renderInvoice(artifact) {
  return `
    <article class="artifact artifact-paper artifact-invoice">
      <header class="invoice-heading">
        <div>
          <p class="document-mark">N★</p>
          <h2>${escapeHtml(artifact.vendor)}</h2>
          <p>${escapeHtml(artifact.vendorAddress)}</p>
        </div>
        <div class="invoice-number">
          <span>INVOICE</span>
          <strong>${escapeHtml(artifact.invoiceNumber)}</strong>
        </div>
      </header>
      <div class="invoice-meta">
        <dl>
          <dt>Bill to</dt><dd>${escapeHtml(artifact.billedTo)}</dd>
          <dt>Project</dt><dd>${escapeHtml(artifact.project)}</dd>
          <dt>Account</dt><dd>${escapeHtml(artifact.account)}</dd>
        </dl>
        <dl>
          <dt>Issued</dt><dd>${escapeHtml(artifact.issueDate)}</dd>
          <dt>Status</dt><dd class="paid-stamp">${escapeHtml(artifact.dueDate)}</dd>
          <dt>Authorized</dt><dd>${escapeHtml(artifact.authorization)}</dd>
        </dl>
      </div>
      <table>
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          ${artifact.lineItems
            .map(
              ([description, amount]) =>
                `<tr><td>${escapeHtml(description)}</td><td>${escapeHtml(amount)}</td></tr>`,
            )
            .join("")}
        </tbody>
        <tfoot><tr><th>Total paid</th><th>${escapeHtml(artifact.total)}</th></tr></tfoot>
      </table>
      <footer>${escapeHtml(artifact.footer)}</footer>
    </article>
  `;
}

function renderPermit(artifact) {
  return `
    <article class="artifact artifact-paper artifact-permit">
      <header>
        <p class="document-seal">G</p>
        <div>
          <p>CITY OF GREYHAVEN · DEPARTMENT OF BUILDINGS</p>
          <h2>RESIDENTIAL BUILDING PERMIT</h2>
        </div>
        <strong>${escapeHtml(artifact.permitNumber)}</strong>
      </header>
      <p class="permit-status">${escapeHtml(artifact.status)}</p>
      <dl class="permit-fields">
        <div><dt>Property</dt><dd>${escapeHtml(artifact.address)}</dd></div>
        <div><dt>Applicant</dt><dd>${escapeHtml(artifact.applicant)}</dd></div>
        <div><dt>Contractor</dt><dd>${escapeHtml(artifact.contractor)}</dd></div>
        <div><dt>Declared scope</dt><dd>${escapeHtml(artifact.scope)}</dd></div>
        <div><dt>Filed</dt><dd>${escapeHtml(artifact.filed)}</dd></div>
        <div><dt>Inspection</dt><dd>${escapeHtml(artifact.inspection)}</dd></div>
        <div><dt>Last revision</dt><dd>${escapeHtml(artifact.revised)}</dd></div>
      </dl>
      <aside>${escapeHtml(artifact.warning)}</aside>
    </article>
  `;
}

function renderMemo(artifact, evidence) {
  const presentation = getEvidencePresentation(evidence);
  return `
    <article class="artifact artifact-paper artifact-memo artifact-memo--${presentation.motif}">
      <header class="memo-heading">
        <div>
          <span>${escapeHtml(presentation.label)}</span>
          <h2>${escapeHtml(artifact.heading)}</h2>
        </div>
        <strong>${escapeHtml(presentation.stamp)}</strong>
      </header>
      <div class="memo-body">
        ${artifact.body.map((line, index) => `<p><b>${String(index + 1).padStart(2, "0")}</b>${escapeHtml(line)}</p>`).join("")}
      </div>
      <p class="handwritten">${escapeHtml(artifact.handwritten)}</p>
    </article>
  `;
}

function renderTranscript(artifact) {
  return `
    <article class="artifact artifact-transcript">
      <header><h2>${escapeHtml(artifact.heading)}</h2><p>${escapeHtml(artifact.timestamp)}</p></header>
      <div class="transcript-tape" aria-hidden="true"><i></i><i></i></div>
      ${
        artifact.audio
          ? `<audio class="recording-audio recording-audio-restored" data-recording-audio="evidence" controls preload="metadata" src="${escapeHtml(artifact.audio)}" aria-label="Play covert recording">Your browser cannot play this recording.</audio>`
          : ""
      }
      <ol>
        ${artifact.lines
          .map(
            ([speaker, line]) =>
              `<li><strong>${escapeHtml(speaker)}</strong><p>${escapeHtml(line)}</p></li>`,
          )
          .join("")}
      </ol>
    </article>
  `;
}

function renderPhoto(artifact) {
  const image = artifact.image
    ? `<img src="${escapeHtml(artifact.image)}" alt="${escapeHtml(artifact.alt || artifact.caption)}" />`
    : `<span class="photo-unavailable">VISUAL RECORD UNAVAILABLE</span>`;

  return `
    <article class="artifact artifact-photo">
      <div class="photo-image ${artifact.image ? "has-evidence-image" : ""}" ${
        artifact.image
          ? ""
          : `role="img" aria-label="${escapeHtml(artifact.alt || "Visual record unavailable")}"`
      }>
        ${image}
      </div>
      <p class="photo-caption">${escapeHtml(artifact.caption)}</p>
      <ol>
        ${artifact.annotations.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
      </ol>
    </article>
  `;
}

function renderFloorplan(artifact) {
  return `
    <article class="artifact artifact-paper artifact-floorplan">
      <header><h2>${escapeHtml(artifact.heading)}</h2><p>${escapeHtml(artifact.revision)}</p></header>
      <div class="floorplan-drawing">
        ${artifact.rooms.map((room) => `<span>${escapeHtml(room)}</span>`).join("")}
      </div>
      <p class="handwritten">${escapeHtml(artifact.note)}</p>
    </article>
  `;
}

function renderRecording(artifact) {
  return `
    <article class="artifact artifact-recording">
      <header><div class="rec-light"></div><div><h2>${escapeHtml(artifact.heading)}</h2><p>${escapeHtml(artifact.duration)}</p></div></header>
      <div class="waveform" aria-hidden="true">
        ${Array.from({ length: 48 }, (_, index) => `<i style="height:${18 + ((index * 17) % 55)}%"></i>`).join("")}
      </div>
      ${
        artifact.audio
          ? `<audio class="recording-audio recording-audio-restored" data-recording-audio="evidence" controls preload="metadata" src="${escapeHtml(artifact.audio)}" aria-label="Play recovered recording">Your browser cannot play this recording.</audio>`
          : ""
      }
      <ol class="recording-fragments">
        ${artifact.fragments.map((fragment) => `<li>${escapeHtml(fragment)}</li>`).join("")}
      </ol>
      <p class="background-audio">Background markers: ${artifact.background.map(escapeHtml).join(" · ")}</p>
    </article>
  `;
}

export function renderEvidenceArtifact(evidence) {
  const artifact = evidence?.artifact;
  if (!artifact) {
    return `<article class="artifact"><p>No visual record is available for this evidence.</p></article>`;
  }

  const renderers = {
    email: renderEmail,
    invoice: renderInvoice,
    permit: renderPermit,
    memo: renderMemo,
    transcript: renderTranscript,
    photo: renderPhoto,
    floorplan: renderFloorplan,
    recording: renderRecording,
  };

  const presentation = getEvidencePresentation(evidence);
  const artifactHtml = (renderers[artifact.type] || renderers.memo)(artifact, evidence);
  return `
    <div class="evidence-artifact evidence-presentation-${presentation.motif}">
      ${renderFileRail(evidence)}
      ${artifactHtml}
    </div>
  `;
}
