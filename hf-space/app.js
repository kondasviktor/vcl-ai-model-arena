(function () {
  const UTM_GITHUB = "https://github.com/kondasviktor/vcl-ai-model-arena";

  function el(html) {
    const wrap = document.createElement("div");
    wrap.innerHTML = html.trim();
    return wrap.firstElementChild;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderPrompts(target, items, suiteNote) {
    const frag = document.createDocumentFragment();
    frag.appendChild(el(`<p class="note">${suiteNote}</p>`));
    items.forEach((item) => {
      const hint = item.expected_hint
        ? ` · expected hint: ${escapeHtml(item.expected_hint)}`
        : "";
      const extra =
        item.function_name
          ? ` · function: ${escapeHtml(item.function_name)}`
          : "";
      const node = el(`
        <article class="prompt">
          <h3>${escapeHtml(item.title)}</h3>
          <p class="meta">${escapeHtml(item.scoring)}${hint}${extra}</p>
          <pre><code>${escapeHtml(item.prompt)}</code></pre>
          <button type="button" class="copy">Copy prompt</button>
        </article>
      `);
      node.querySelector(".copy").addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(item.prompt);
          node.querySelector(".copy").textContent = "Copied";
          setTimeout(() => {
            node.querySelector(".copy").textContent = "Copy prompt";
          }, 1200);
        } catch {
          node.querySelector(".copy").textContent = "Copy failed";
        }
      });
      frag.appendChild(node);
    });
    target.replaceChildren(frag);
  }

  function renderResults(target, latest) {
    if (!latest || !latest.suites) {
      target.innerHTML = '<p class="note">Latest results are not bundled yet.</p>';
      return;
    }
    const parts = [`<p class="note">Maintainer snapshot generated ${escapeHtml(latest.generated || "")}. No blended best-model score.</p>`];
    Object.keys(latest.suites)
      .sort()
      .forEach((suite) => {
        const s = latest.suites[suite];
        parts.push(`<h2>${escapeHtml(suite)} — ${escapeHtml(s.date || "")}</h2>`);
        if (s.notes) parts.push(`<p class="note">${escapeHtml(s.notes)}</p>`);
        parts.push("<table><thead><tr><th>Model</th><th>Pass</th><th>Fail</th><th>Scored</th></tr></thead><tbody>");
        (s.scored || []).forEach((row) => {
          parts.push(
            `<tr><td>${escapeHtml(row.model)}</td><td>${row.pass}</td><td>${row.fail}</td><td>${row.scored_total}</td></tr>`
          );
        });
        parts.push("</tbody></table>");
      });
    parts.push(
      `<p class="note">Fair multi-model reruns: <a href="${UTM_GITHUB}">fork on GitHub</a> and run the CLI with your key.</p>`
    );
    target.innerHTML = parts.join("");
  }

  function showTab(id) {
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === id));
    document.querySelectorAll('nav.tabs [role="tab"]').forEach((btn) => {
      btn.setAttribute("aria-selected", btn.dataset.tab === id ? "true" : "false");
    });
    if (id === "fun" || id === "results") history.replaceState(null, "", "#" + id);
  }

  document.querySelectorAll('nav.tabs [role="tab"]').forEach((btn) => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
  });

  document.querySelectorAll('a[href="#fun"], a[href="#results"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showTab(a.getAttribute("href").slice(1));
    });
  });

  Promise.all([
    fetch("data/prompts.json").then((r) => r.json()),
    fetch("data/latest.json").then((r) => r.json()).catch(() => null),
  ])
    .then(([prompts, latest]) => {
      renderPrompts(
        document.getElementById("fun"),
        prompts.fun || [],
        "Copy into any chat UI. Scored items have a public expected hint. No hosted inference."
      );
      renderPrompts(
        document.getElementById("dev"),
        prompts.dev || [],
        "Public Dev prompts. Official fair matrix: clone GitHub and run npm run eval:dev with your key."
      );
      renderPrompts(
        document.getElementById("score"),
        prompts.score || [],
        "Task prompts only. Hidden unit tests stay in the GitHub harness. 9/12 is not 75% intelligence."
      );
      renderResults(document.getElementById("results"), latest);
      const hash = (location.hash || "").slice(1);
      if (hash && document.getElementById(hash)) showTab(hash);
    })
    .catch((err) => {
      document.getElementById("overview").insertAdjacentHTML(
        "beforeend",
        `<p class="note">Could not load bundled data (${escapeHtml(err.message)}).</p>`
      );
    });
})();
