(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const revealEls = Array.from(document.querySelectorAll(".reveal-on-scroll"));

  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
      );

      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    const closeNav = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", (event) => {
      if (event.target.tagName === "A") closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  const serviceItems = Array.from(document.querySelectorAll(".service-item"));

  if (serviceItems.length) {
    const panelFor = (item) => item.querySelector(".service-item__panel");
    const triggerFor = (item) => item.querySelector(".menu__item");

    const setOpen = (item, isOpen) => {
      item.classList.toggle("is-open", isOpen);
      const trigger = triggerFor(item);
      const panel = panelFor(item);
      if (trigger) trigger.setAttribute("aria-expanded", String(isOpen));
      if (panel) panel.setAttribute("aria-hidden", String(!isOpen));
    };

    const openItem = (item) => {
      if (item.classList.contains("is-open")) return;
      serviceItems.forEach((el) => {
        if (el !== item) setOpen(el, false);
      });
      setOpen(item, true);
    };

    serviceItems.forEach((item) => {
      const trigger = triggerFor(item);
      if (!trigger) return;
      setOpen(item, item.classList.contains("is-open"));
      trigger.addEventListener("click", () => openItem(item));
      trigger.addEventListener("mouseenter", () => openItem(item));
      trigger.addEventListener("focus", () => openItem(item));
    });
  }

  const form = document.getElementById("consult-form");
  const status = document.getElementById("form-status");

  if (form && status) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.classList.remove("form-status--ok", "form-status--error");

      const submitBtn = form.querySelector("button[type='submit']");
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Sending…";
      submitBtn.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          status.textContent =
            "Thank you — your message has been sent. Meghan will be in touch personally.";
          status.classList.add("form-status--ok", "is-visible");
          form.reset();
        } else {
          let detail = `HTTP ${response.status}`;
          try {
            const data = await response.json();
            if (data && Array.isArray(data.errors) && data.errors.length) {
              detail = data.errors
                .map((e) => e.message || e.code)
                .filter(Boolean)
                .join("; ") || detail;
            } else if (data && data.error) {
              detail = data.error;
            }
          } catch (_) {
            // Response wasn't JSON — keep the HTTP-status-based detail.
          }
          status.textContent = `Something went wrong sending this form (${detail}). Please call 336.310.9242 and Meghan will assist you directly.`;
          status.classList.add("form-status--error", "is-visible");
        }
      } catch (error) {
        status.textContent = `Something went wrong sending this form (${error.message || "network error"}). Please call 336.310.9242 and Meghan will assist you directly.`;
        status.classList.add("form-status--error", "is-visible");
      } finally {
        submitBtn.textContent = originalLabel;
        submitBtn.disabled = false;
      }
    });
  }
})();
