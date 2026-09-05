

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    injectStyles();

    initRevealOnScroll(reduceMotion);
    initHeaderShrink();
    initPinPulse(reduceMotion);
    initCarouselPauseOnHover();
    initStampOnDestinationCheck(reduceMotion);
    initRippleButtons(reduceMotion);

    if (!reduceMotion) {
      initHeroParallax();
      initCardTilt();
    }
  }

  /* ------------------------------------------------------------------------
     0. INJECTION DES STYLES NÉCESSAIRES AUX ANIMATIONS
     Un seul fichier JS suffit : il apporte lui-même le CSS dont il a besoin.
     ------------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById("mada-animations-style")) return;

    const style = document.createElement("style");
    style.id = "mada-animations-style";
    style.textContent = `
      /* Apparition au scroll */
      .reveal-init {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.7s ease, transform 0.7s ease;
      }
      .reveal-init.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
      .reveal-card.reveal-init {
        transform: translateY(35px) scale(0.96);
      }
      .reveal-card.reveal-init.is-visible {
        transform: translateY(0) scale(1);
      }

      /* En-tête rétracté au scroll */
      .header {
        transition: padding 0.3s ease, box-shadow 0.3s ease;
      }
      .header.header-scrolled {
        padding-top: 8px;
        padding-bottom: 8px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
      }
      .header.header-scrolled .logo img {
        max-height: 46px;
        transition: max-height 0.3s ease;
      }
      .logo img {
        transition: max-height 0.3s ease;
      }

      /* Tilt "carte postale" */
      .tilt-ready {
        transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        will-change: transform;
      }

      /* Pins 📍 qui pulsent comme un repère sur une carte */
      .pin-pulse {
        display: inline-block;
        animation: madaPinBounce 2.4s ease-in-out infinite;
        transform-origin: bottom center;
      }
      @keyframes madaPinBounce {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-5px) scale(1.08); }
      }

      /* Ripple façon vague sur les boutons */
      .btn-main, .btn-voir, .btn-submit {
        position: relative;
        overflow: hidden;
      }
      .mada-ripple {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        background: rgba(255, 255, 255, 0.55);
        pointer-events: none;
        animation: madaRippleAnim 0.65s ease-out forwards;
      }
      @keyframes madaRippleAnim {
        to {
          transform: scale(2.8);
          opacity: 0;
        }
      }

      /* Tampon de passeport sur les destinations cochées */
      .dest-card {
        transition: box-shadow 0.2s ease;
      }
      .dest-card.is-checked {
        box-shadow: 0 0 0 3px var(--primary-orange, #ff7a00) inset,
          0 4px 10px rgba(0, 0, 0, 0.15);
      }
      .stamp-pop {
        animation: madaStampPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes madaStampPop {
        0% { transform: scale(1) rotate(0deg); }
        35% { transform: scale(1.1) rotate(-4deg); }
        65% { transform: scale(0.97) rotate(2deg); }
        100% { transform: scale(1) rotate(0deg); }
      }

      /* Accessibilité : réduction des animations si demandé par l'utilisateur */
      .mada-reduced-motion * {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     1. APPARITION EN FONDU AU DÉFILEMENT (reveal on scroll)
     S'applique aux sections, cartes, blocs de préférences, étapes du devis,
     blocs de texte "à propos", cartes de contact, etc.
     ------------------------------------------------------------------------ */
  function initRevealOnScroll(reduceMotion) {
    if (reduceMotion) {
      document.documentElement.classList.add("mada-reduced-motion");
      return;
    }

    const selectors = [
      "section",
      ".form-section",
      ".card",
      ".dest-card",
      ".pref-box",
      ".story-block",
      ".step-item",
      ".contact-item",
      ".devis-steps",
      ".gallery-img",
      ".hero-content",
      ".devis-hero-content"
    ].join(", ");

    const elements = Array.from(document.querySelectorAll(selectors));
    if (!elements.length) return;

    elements.forEach((el, index) => {
      const isCardLike =
        el.classList.contains("card") ||
        el.classList.contains("dest-card") ||
        el.classList.contains("pref-box") ||
        el.classList.contains("gallery-img");

      el.classList.add("reveal-init");
      if (isCardLike) el.classList.add("reveal-card");

      // Petit décalage progressif pour un effet "cascade" plutôt qu'un bloc figé
      const delay = (index % 6) * 90;
      el.style.transitionDelay = delay + "ms";
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------------
     2. EN-TÊTE QUI SE RÉTRACTE LÉGÈREMENT AU SCROLL
     ------------------------------------------------------------------------ */
  function initHeaderShrink() {
    const header = document.querySelector(".header");
    if (!header) return;

    let ticking = false;

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        header.classList.toggle("header-scrolled", window.scrollY > 40);
        ticking = false;
      });
    });
  }

  /* ------------------------------------------------------------------------
     3. EFFET PARALLAX SUR LES BANNIÈRES (hero-bg, images de fiches/villes)
     Donne une impression de profondeur, classique sur les sites de voyage.
     ------------------------------------------------------------------------ */
  function initHeroParallax() {
    const parallaxSelectors = [
      ".hero-bg",
      ".fiche-hero-image img",
      ".ville-hero-image img"
    ].join(", ");

    const parallaxImages = Array.from(
      document.querySelectorAll(parallaxSelectors)
    );
    if (!parallaxImages.length) return;

    let ticking = false;

    function updateParallax() {
      parallaxImages.forEach((img) => {
        const rect = img.getBoundingClientRect();
        // On n'anime que si l'image est proche de la zone visible (perf)
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
        const offset = rect.top * 0.12;
        img.style.transform = `translateY(${offset}px) scale(1.08)`;
      });
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });

    updateParallax();
  }

  /* ------------------------------------------------------------------------
     4. EFFET "CARTE POSTALE" (tilt 3D léger au survol)
     Sur les cartes de destinations/hébergements/circuits et les photos.
     ------------------------------------------------------------------------ */
  function initCardTilt() {
    const tiltSelectors = ".card, .dest-card, .gallery-img";
    const tiltElements = Array.from(document.querySelectorAll(tiltSelectors));
    if (!tiltElements.length) return;

    tiltElements.forEach((el) => {
      el.classList.add("tilt-ready");

      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        el.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. EFFET "VAGUE" (ripple) AU CLIC SUR LES BOUTONS
     Clin d'œil aux vagues de l'océan Indien / plages de Madagascar.
     ------------------------------------------------------------------------ */
  function initRippleButtons(reduceMotion) {
    if (reduceMotion) return;

    const buttons = document.querySelectorAll(
      ".btn-main, .btn-voir, .btn-submit"
    );

    buttons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height);

        ripple.className = "mada-ripple";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - rect.left - size / 2 + "px";
        ripple.style.top = e.clientY - rect.top - size / 2 + "px";

        btn.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. EFFET "TAMPON DE PASSEPORT" QUAND ON SÉLECTIONNE UNE DESTINATION
     S'applique aux cases à cocher des destinations (page devis.html).
     ------------------------------------------------------------------------ */
  function initStampOnDestinationCheck(reduceMotion) {
    const checkboxes = document.querySelectorAll(
      '.dest-card input[type="checkbox"]'
    );
    if (!checkboxes.length) return;

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const card = checkbox.closest(".dest-card");
        if (!card) return;

        card.classList.toggle("is-checked", checkbox.checked);

        if (checkbox.checked && !reduceMotion) {
          card.classList.remove("stamp-pop");
          // force le redémarrage de l'animation même si déjà cochée/décochée vite
          void card.offsetWidth;
          card.classList.add("stamp-pop");
          card.addEventListener(
            "animationend",
            () => card.classList.remove("stamp-pop"),
            { once: true }
          );
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. PINS DE LOCALISATION (📍) QUI PULSENT DOUCEMENT
     Ajoute une classe d'animation aux repères "pin" utilisés dans les titres
     de la page À propos, façon repère sur une carte de voyage.
     ------------------------------------------------------------------------ */
  function initPinPulse(reduceMotion) {
    if (reduceMotion) return;
    document.querySelectorAll(".pin").forEach((pin) => {
      pin.classList.add("pin-pulse");
    });
  }

  /* ------------------------------------------------------------------------
     8. PAUSE DU CAROUSEL PHOTO AU SURVOL (page À propos)
     Le défilement automatique (CSS) se met en pause si l'utilisateur
     survole le carousel, pour lui laisser le temps de regarder une image.
     ------------------------------------------------------------------------ */
  function initCarouselPauseOnHover() {
    const carousel = document.querySelector(".story-carousel");
    if (!carousel) return;

    const images = carousel.querySelectorAll(".carousel-img");

    carousel.addEventListener("mouseenter", () => {
      images.forEach((img) => (img.style.animationPlayState = "paused"));
    });

    carousel.addEventListener("mouseleave", () => {
      images.forEach((img) => (img.style.animationPlayState = "running"));
    });
  }
})();