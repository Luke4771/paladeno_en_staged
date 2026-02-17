(function () {
  "use strict";

  var heroSection = document.getElementById("hero");
  var heroWireframe = document.querySelector(".hero-wireframe");
  var heroSubtitle = document.querySelector(".hero__subtitle");
  var heroPrimaryMajor = document.querySelector(".hero-wireframe__line--primary");
  var heroPrimaryNodeA = document.querySelector(".hero-wireframe__node--primary-a");
  var heroPrimaryNodeB = document.querySelector(".hero-wireframe__node--primary-b");
  var heroAlignRaf = 0;

  function setHeroWireframeState(isActive) {
    if (!heroWireframe) {
      return;
    }

    heroWireframe.classList.toggle("hero-wireframe--active", Boolean(isActive));
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getLastLineRect(element) {
    var range;
    var rects;

    if (!element) {
      return null;
    }

    range = document.createRange();
    range.selectNodeContents(element);
    rects = range.getClientRects();

    if (!rects || !rects.length) {
      return null;
    }

    return rects[rects.length - 1];
  }

  function updateHeroWireframeAlignment() {
    var wireRect;
    var lastLineRect;
    var targetViewportY;
    var targetSvgY;
    var roundedSvgY;

    if (!heroWireframe || !heroSubtitle || !heroPrimaryMajor) {
      return;
    }

    wireRect = heroWireframe.getBoundingClientRect();
    if (wireRect.height <= 0) {
      return;
    }

    lastLineRect = getLastLineRect(heroSubtitle);
    if (!lastLineRect) {
      return;
    }

    targetViewportY = lastLineRect.bottom - 2;
    targetSvgY = ((targetViewportY - wireRect.top) / wireRect.height) * 900;
    roundedSvgY = Math.round(clamp(targetSvgY, 120, 760) * 10) / 10;

    heroPrimaryMajor.setAttribute("y1", String(roundedSvgY));
    heroPrimaryMajor.setAttribute("y2", String(roundedSvgY));

    if (heroPrimaryNodeA) {
      heroPrimaryNodeA.setAttribute("cy", String(roundedSvgY));
    }

    if (heroPrimaryNodeB) {
      heroPrimaryNodeB.setAttribute("cy", String(roundedSvgY));
    }
  }

  function queueHeroWireframeAlignment() {
    if (heroAlignRaf) {
      return;
    }

    heroAlignRaf = window.requestAnimationFrame(function () {
      heroAlignRaf = 0;
      updateHeroWireframeAlignment();
    });
  }

  if (heroSection && heroWireframe) {
    var heroRect = heroSection.getBoundingClientRect();

    setHeroWireframeState(
      heroRect.bottom > 0 && heroRect.top < window.innerHeight
    );

    if ("IntersectionObserver" in window) {
      var heroObserver = new IntersectionObserver(function (entries) {
        var isHeroVisible = false;

        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            isHeroVisible = true;
            break;
          }
        }

        setHeroWireframeState(isHeroVisible);
      });

      heroObserver.observe(heroSection);
    } else {
      setHeroWireframeState(true);
    }

    queueHeroWireframeAlignment();
    window.addEventListener("resize", queueHeroWireframeAlignment);

    window.addEventListener("load", queueHeroWireframeAlignment);
  }

  // --- Benefits detail toggle ---
  var benefitStats = document.querySelectorAll(".benefits__stat");
  var isDesktop = window.matchMedia("(min-width: 48em)");
  var firstDetailRevealClass = "benefits__detail--intro-reveal";

  function consumeFirstDetailReveal(detail) {
    if (!detail || !detail.classList.contains(firstDetailRevealClass)) {
      return;
    }

    detail.classList.remove(firstDetailRevealClass);
  }

  function setBenefitDetailState(stat, detail, shouldOpen) {
    if (!stat || !detail) {
      return;
    }

    if (!shouldOpen && detail.classList.contains("is-open")) {
      consumeFirstDetailReveal(detail);
    }

    detail.classList.toggle("is-open", shouldOpen);
    detail.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
    stat.classList.toggle("is-open", shouldOpen);
  }

  function closeAllDetails(excludedStat) {
    for (var i = 0; i < benefitStats.length; i++) {
      var stat = benefitStats[i];
      var detail = stat.querySelector(".benefits__detail");

      if (!detail || stat === excludedStat) {
        continue;
      }

      setBenefitDetailState(stat, detail, false);
    }
  }

  for (var i = 0; i < benefitStats.length; i++) {
    (function (stat) {
      var detail = stat.querySelector(".benefits__detail");
      if (!detail) return;

      stat.addEventListener("mouseenter", function () {
        if (!isDesktop.matches) return;
        closeAllDetails(stat);
        setBenefitDetailState(stat, detail, true);
      });

      stat.addEventListener("mouseleave", function () {
        if (!isDesktop.matches) return;
        setBenefitDetailState(stat, detail, false);
      });

      stat.addEventListener("click", function () {
        if (detail.classList.contains("is-open")) {
          setBenefitDetailState(stat, detail, false);
        } else {
          closeAllDetails(stat);
          setBenefitDetailState(stat, detail, true);
        }
      });
    })(benefitStats[i]);
  }
})();
