document.addEventListener("DOMContentLoaded", () => {
  console.log("Mada Discovery - Script d'animation initialisé avec succès !");

  // ==========================================================================
  // 1. EFFET DE DÉFILEMENT DOUX (SMOOTH SCROLL) POUR LES ANCRES INTERNES
  // ==========================================================================
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // ==========================================================================
  // 2. OBSERVATEUR D'INTERSECTION POUR L'APPARITION DES CARTES ET SECTIONS (FADE-IN)
  // ==========================================================================
  const animatedElements = document.querySelectorAll(
    ".card, .destination-card, .activite-card, .form-section, .fiche-hero, .fiche-galerie",
  );

  // Ajout initial de la classe CSS pour préparer l'animation
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
  });

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15,
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target); // Arrête d'observer une fois l'élément affiché
      }
    });
  }, observerOptions);

  animatedElements.forEach((el) => {
    scrollObserver.observe(el);
  });

  // ==========================================================================
  // 3. EFFET DE ZOOM INTERACTIF SUR LES IMAGES DES GALERIES ET CARTES
  // ==========================================================================
  const zoomableImages = document.querySelectorAll(
    ".card img, .galerie-item img, .destination-image img, .img-wrapper img",
  );

  zoomableImages.forEach((img) => {
    img.style.transition = "transform 0.4s ease, filter 0.4s ease";

    img.addEventListener("mouseenter", () => {
      img.style.transform = "scale(1.05)";
      img.style.filter = "brightness(1.05)";
    });

    img.addEventListener("mouseleave", () => {
      img.style.transform = "scale(1)";
      img.style.filter = "brightness(1)";
    });
  });

  // ==========================================================================
  // 4. ANIMATION DE LA NAVBAR AU SCROLL (CHANGEMENT D'OMBRE / EFFET STICKY)
  // ==========================================================================
  const header = document.querySelector(".header");

  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
        header.style.backgroundColor = "rgba(252, 252, 252, 0.98)";
      } else {
        header.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
        header.style.backgroundColor = "var(--bg-light)";
      }
    });
  }

  // ==========================================================================
  // 5. GESTION ET VALIDATION INTERACTIVE DU FORMULAIRE DE DEVIS
  // ==========================================================================
  /*
const devisForm = document.querySelector("form");

if (devisForm) {
  devisForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Empêche le rechargement brutal de la page

    // Simulation d'une validation visuelle
    const submitBtn = devisForm.querySelector(
      'button[type="submit"], .btn-submit'
    );

    if (submitBtn) {
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Validation en cours...";
      submitBtn.style.backgroundColor = "#2e7d32"; // Vert de confirmation

      setTimeout(() => {
        submitBtn.textContent = "Demande envoyée avec succès!";

        // Création d'un message de succès visuel dans le formulaire
        let successMsg = document.createElement("div");
        successMsg.textContent =
          "Merci ! Notre équipe vous contactera très rapidement.";
        successMsg.style.cssText =
          "margin-top: 15px; padding: 12px; background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 8px; text-align: center; font-weight: bold;";

        devisForm.appendChild(successMsg);

        // Réinitialisation après quelques secondes
        setTimeout(() => {
          devisForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.style.backgroundColor = "";
          successMsg.remove();
        }, 4000);
      }, 1500);
    }
  });
}
*/
  // ==========================================================================
  // 6. SYSTÈME DE LIGHTBOX SIMPLE POUR LES IMAGES DES FICHES DÉTAILLÉES
  // ==========================================================================
  const galleryItems = document.querySelectorAll(
    ".galerie-item img, .fiche-hero-image img",
  );

  if (galleryItems.length > 0) {
    // Création dynamique de la structure de la Lightbox
    const lightbox = document.createElement("div");
    lightbox.id = "custom-lightbox";
    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      cursor: pointer;
    `;

    const lightboxImg = document.createElement("img");
    lightboxImg.style.cssText = `
      max-width: 90%;
      max-height: 85%;
      border-radius: 12px;
      box-shadow: 0 5px 25px rgba(0,0,0,0.5);
      transform: scale(0.95);
      transition: transform 0.3s ease;
    `;

    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);

    galleryItems.forEach((img) => {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => {
        lightboxImg.src = img.src;
        lightbox.style.opacity = "1";
        lightbox.style.visibility = "visible";
        setTimeout(() => {
          lightboxImg.style.transform = "scale(1)";
        }, 10);
      });
    });

    lightbox.addEventListener("click", () => {
      lightboxImg.style.transform = "scale(0.95)";
      lightbox.style.opacity = "0";
      setTimeout(() => {
        lightbox.style.visibility = "hidden";
      }, 300);
    });
  }

  // ==========================================================================
  // 7. EFFET DE SURVOL DYNAMIQUE SUR LES CARTES D'ACTIVITÉS (SECTION ACCUEIL)
  // ==========================================================================
  const activityCards = document.querySelectorAll(
    ".activites-grid .activite-card",
  );

  activityCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-5px) scale(1.02)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)";
    });
  });

  console.log(
    "Toutes les animations et interactions de script.js sont prêtes.",
  );
});
