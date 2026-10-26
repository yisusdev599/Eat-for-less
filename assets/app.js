/* ============================================================
   Eat For Less — interactions
   ============================================================ */
(function () {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  root.classList.add("js");

  /* ---------- Header, scroll progress & back to top ---------- */
  const header = doc.getElementById("site-header");
  const progress = doc.getElementById("scroll-progress");
  const toTop = doc.getElementById("to-top");

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      const y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", y > 6);
      if (progress) {
        const max = doc.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
      }
      if (toTop) toTop.classList.toggle("is-visible", y > 720);
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Mobile drawer ---------- */
  const menuBtn = doc.getElementById("menu-btn");
  const drawer = doc.getElementById("mobile-drawer");
  const backdrop = doc.getElementById("drawer-backdrop");
  const drawerClose = doc.getElementById("drawer-close");
  let lastFocus = null;

  function setDrawer(open) {
    if (!drawer || !backdrop) return;
    drawer.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    doc.body.classList.toggle("drawer-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      lastFocus = doc.activeElement;
      drawer.inert = false;
      window.setTimeout(function () {
        if (drawerClose) drawerClose.focus();
      }, 120);
    } else {
      drawer.inert = true;
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }
  }

  if (drawer) drawer.inert = true;

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setDrawer(!drawer.classList.contains("is-open"));
    });
  }
  if (drawerClose) {
    drawerClose.addEventListener("click", function () {
      setDrawer(false);
    });
  }
  if (backdrop) {
    backdrop.addEventListener("click", function () {
      setDrawer(false);
    });
  }
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setDrawer(false);
      });
    });
  }

  doc.addEventListener("keydown", function (event) {
    if (!drawer || !drawer.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      setDrawer(false);
      return;
    }
    if (event.key !== "Tab") return;
    const focusables = drawer.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && doc.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && doc.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 900 && drawer && drawer.classList.contains("is-open")) {
      setDrawer(false);
    }
  });

  /* ---------- Announcement bar ---------- */
  const launchBar = doc.getElementById("launch-bar");
  const launchClose = doc.getElementById("launch-close");
  if (launchBar) {
    try {
      if (window.localStorage.getItem("efl-launch-bar") === "closed") {
        launchBar.remove();
      }
    } catch (error) {
      /* storage blocked: keep visible */
    }
  }
  if (launchClose) {
    launchClose.addEventListener("click", function () {
      launchBar.style.display = "none";
      try {
        window.localStorage.setItem("efl-launch-bar", "closed");
      } catch (error) {
        /* ignore */
      }
    });
  }

  /* ---------- Accordions ---------- */
  doc.querySelectorAll("[data-accordion]").forEach(function (item) {
    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-panel");
    if (!trigger || !panel) return;
    trigger.addEventListener("click", function () {
      const open = !item.classList.contains("is-open");
      const group = item.closest("[data-accordion-group]");
      if (group) {
        group.querySelectorAll(".accordion-item.is-open").forEach(function (other) {
          if (other === item) return;
          other.classList.remove("is-open");
          const otherTrigger = other.querySelector(".accordion-trigger");
          const otherPanel = other.querySelector(".accordion-panel");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
          if (otherPanel) otherPanel.hidden = true;
        });
      }
      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
    });
  });

  /* ---------- Tabs ---------- */
  doc.querySelectorAll("[data-tabs]").forEach(function (group) {
    const tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
    const panels = Array.prototype.slice.call(group.querySelectorAll('[role="tabpanel"]'));
    if (!tabs.length) return;

    function activate(index, focus) {
      tabs.forEach(function (tab, i) {
        const selected = i === index;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focus) tab.focus();
      });
      panels.forEach(function (panel, i) {
        panel.hidden = i !== index;
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activate(index, false);
      });
      tab.addEventListener("keydown", function (event) {
        let next = null;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== null) {
          event.preventDefault();
          activate(next, true);
        }
      });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealItems = doc.querySelectorAll(".reveal");
  if (revealItems.length && !reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ---------- Toast ---------- */
  let toast = doc.getElementById("toast");
  if (!toast) {
    toast = doc.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    doc.body.appendChild(toast);
  }
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3400);
  }

  doc.querySelectorAll("[data-store]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const store = button.getAttribute("data-store") || "la tienda";
      showToast(store + " estará disponible muy pronto. Escríbenos y te avisamos al lanzar.");
    });
  });

  /* ---------- Native share ---------- */
  doc.querySelectorAll("[data-share]").forEach(function (button) {
    button.addEventListener("click", function () {
      const shareData = {
        title: document.title,
        text: "Eat For Less — Tu comida favorita, por mucho menos.",
        url: window.location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(window.location.href)
          .then(function () {
            showToast("Enlace copiado. Compártelo con quien quieras.");
          })
          .catch(function () {
            showToast("Copia el enlace de esta página para compartirla.");
          });
      } else {
        showToast("Copia el enlace de esta página para compartirla.");
      }
    });
  });

  /* ---------- Lightweight video autoplay management ---------- */
  const videos = doc.querySelectorAll("video[data-autoplay]");
  if (videos.length) {
    if (reduceMotion) {
      videos.forEach(function (video) {
        video.removeAttribute("autoplay");
        video.pause();
      });
    } else if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            const video = entry.target;
            if (entry.isIntersecting) {
              const playAttempt = video.play();
              if (playAttempt && typeof playAttempt.catch === "function") {
                playAttempt.catch(function () {});
              }
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.15 }
      );
      videos.forEach(function (video) {
        videoObserver.observe(video);
      });
    }
  }

  /* ---------- Soft page transitions ---------- */
  function isModifiedClick(event) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  }

  doc.addEventListener("click", function (event) {
    const link = event.target.closest("a[href]");
    if (!link || isModifiedClick(event)) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;

    const href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto|tel|sms):/i.test(href)) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }
    if (url.origin !== window.location.origin) return;

    // Same page + hash: smooth scroll, no transition.
    if (url.pathname === window.location.pathname && url.hash) return;

    // Same page without hash: smooth scroll to top.
    if (url.pathname === window.location.pathname) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }

    if (reduceMotion) return;
    event.preventDefault();
    doc.body.classList.add("is-leaving");
    window.setTimeout(function () {
      window.location.href = url.href;
    }, 170);
  });

  window.addEventListener("pageshow", function () {
    doc.body.classList.remove("is-leaving");
  });

  /* ---------- Subtle pointer tilt on hero media ---------- */
  if (isFinePointer && !reduceMotion) {
    doc.querySelectorAll("[data-tilt]").forEach(function (element) {
      const strength = 7;
      element.addEventListener("pointermove", function (event) {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        element.style.transform =
          "perspective(1200px) rotateY(" + x * strength + "deg) rotateX(" + -y * strength + "deg)";
      });
      element.addEventListener("pointerleave", function () {
        element.style.transform = "";
      });
    });
  }

  /* ---------- Current year ---------- */
  doc.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  /* ---------- Smooth hash scroll on load ---------- */
  if (window.location.hash && !reduceMotion) {
    const target = doc.querySelector(window.location.hash);
    if (target) {
      window.setTimeout(function () {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 260);
    }
  }
})();
