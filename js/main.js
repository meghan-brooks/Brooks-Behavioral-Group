(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
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

  const serviceItems = Array.from(document.querySelectorAll(".menu__item[data-img]"));
  const stageImg = document.querySelector(".service-stage__img");
  const stageFrame = document.querySelector(".service-stage__frame");
  const stageFoot = document.querySelector(".service-stage__foot");
  const stageName = document.querySelector(".service-stage__name");
  const stageDesc = document.querySelector(".service-stage__desc");
  const stageCount = document.querySelector(".service-stage__count");
  const prevBtn = document.querySelector(".service-stage__arrow--prev");
  const nextBtn = document.querySelector(".service-stage__arrow--next");
  const explorer = document.querySelector(".service-explorer");

  if (serviceItems.length && stageImg && stageFoot && stageName && stageDesc) {
    const total = serviceItems.length;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeIndex = Math.max(serviceItems.findIndex((el) => el.classList.contains("is-active")), 0);
    let pendingTimeout = null;

    const renderCount = (index) => {
      if (!stageCount) return;
      const n = String(index + 1).padStart(2, "0");
      const t = String(total).padStart(2, "0");
      stageCount.textContent = `${n} / ${t}`;
    };

    const showService = (item, direction) => {
      serviceItems.forEach((el) => el.classList.remove("is-active"));
      item.classList.add("is-active");

      const index = serviceItems.indexOf(item);
      const { img, alt, desc } = item.dataset;
      const name = item.textContent.trim();
      activeIndex = index;

      if (stageImg.getAttribute("src") === img) {
        renderCount(index);
        return;
      }

      if (pendingTimeout) window.clearTimeout(pendingTimeout);

      if (prefersReducedMotion) {
        stageImg.src = img;
        stageImg.alt = alt || "";
        stageName.textContent = name;
        stageDesc.textContent = desc || "";
        renderCount(index);
        return;
      }

      stageImg.dataset.state = direction === "prev" ? "leaving-prev" : "leaving-next";
      stageFoot.classList.add("is-updating");

      pendingTimeout = window.setTimeout(() => {
        stageImg.src = img;
        stageImg.alt = alt || "";
        stageName.textContent = name;
        stageDesc.textContent = desc || "";
        renderCount(index);

        stageImg.dataset.state = direction === "prev" ? "entering-prev" : "entering-next";
        void stageImg.offsetWidth;
        requestAnimationFrame(() => {
          stageImg.dataset.state = "";
          stageFoot.classList.remove("is-updating");
        });
      }, 380);
    };

    const goTo = (rawIndex) => {
      const nextIndex = ((rawIndex % total) + total) % total;
      if (nextIndex === activeIndex) return;
      const direction = nextIndex === (activeIndex + 1) % total ? "next" : "prev";
      showService(serviceItems[nextIndex], direction);
    };

    serviceItems.forEach((item, index) => {
      const enter = () => {
        const direction = index >= activeIndex ? "next" : "prev";
        showService(item, direction);
      };
      item.addEventListener("mouseenter", enter);
      item.addEventListener("focus", enter);
      item.addEventListener("click", enter);
    });

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(activeIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(activeIndex + 1));

    if (explorer && stageFrame) {
      explorer.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        if (!stageFrame.contains(event.target)) return;
        event.preventDefault();
        goTo(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
      });

      let touchStartX = null;
      stageFrame.addEventListener(
        "touchstart",
        (event) => {
          touchStartX = event.touches[0].clientX;
        },
        { passive: true }
      );
      stageFrame.addEventListener("touchend", (event) => {
        if (touchStartX === null) return;
        const delta = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 40) {
          goTo(activeIndex + (delta < 0 ? 1 : -1));
        }
        touchStartX = null;
      });
    }

    renderCount(activeIndex);
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
          throw new Error("Form submission failed");
        }
      } catch (error) {
        status.textContent =
          "Something went wrong sending this form. Please call 336.310.9242 and Meghan will assist you directly.";
        status.classList.add("form-status--error", "is-visible");
      } finally {
        submitBtn.textContent = originalLabel;
        submitBtn.disabled = false;
      }
    });
  }
})();
