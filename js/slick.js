/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.1
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function (factory) {
  "use strict";
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else if (typeof exports !== "undefined") {
    module.exports = factory(require("jquery"));
  } else {
    factory(jQuery);
  }
})(function ($) {
  "use strict";
  var Slick = window.Slick || {};

  Slick = (function () {
    var instanceUid = 0;

    function Slick(element, settings) {
      var _ = this,
        dataSettings;

      _.defaults = {
        accessibility: true,
        adaptiveHeight: false,
        appendArrows: $(element),
        appendDots: $(element),
        arrows: true,
        asNavFor: null,
        prevArrow:
          '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
        nextArrow:
          '<button class="slick-next" aria-label="Next" type="button">Next</button>',
        autoplay: true,
        autoplaySpeed: 5000,
        centerMode: false,
        centerPadding: "50px",
        cssEase: "ease",
        customPaging: function (slider, i) {
          return $('<button type="button" />').text(i + 1);
        },
        dots: false,
        dotsClass: "slick-dots",
        draggable: true,
        easing: "linear",
        edgeFriction: 0.35,
        fade: false,
        focusOnSelect: false,
        focusOnChange: false,
        infinite: true,
        initialSlide: 0,
        lazyLoad: "ondemand",
        mobileFirst: false,
        pauseOnHover: true,
        pauseOnFocus: true,
        pauseOnDotsHover: false,
        respondTo: "window",
        responsive: null,
        rows: 1,
        rtl: false,
        slide: "",
        slidesPerRow: 1,
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 1000,
        swipe: true,
        swipeToSlide: false,
        touchMove: true,
        touchThreshold: 5,
        useCSS: true,
        useTransform: true,
        variableWidth: false,
        vertical: false,
        verticalSwiping: false,
        waitForAnimate: true,
        zIndex: 1000,
      };

      _.initials = {
        animating: false,
        dragging: false,
        autoPlayTimer: null,
        currentDirection: 0,
        currentLeft: null,
        currentSlide: 0,
        direction: 1,
        $dots: null,
        listWidth: null,
        listHeight: null,
        loadIndex: 0,
        $nextArrow: null,
        $prevArrow: null,
        scrolling: false,
        slideCount: null,
        slideWidth: null,
        $slideTrack: null,
        $slides: null,
        sliding: false,
        slideOffset: 0,
        swipeLeft: null,
        swiping: false,
        $list: null,
        touchObject: {},
        transformsEnabled: false,
        unslicked: false,
      };

      $.extend(_, _.initials);

      _.activeBreakpoint = null;
      _.animType = null;
      _.animProp = null;
      _.breakpoints = [];
      _.breakpointSettings = [];
      _.cssTransitions = false;
      _.focussed = false;
      _.interrupted = false;
      _.hidden = "hidden";
      _.paused = true;
      _.positionProp = null;
      _.respondTo = null;
      _.rowCount = 1;
      _.shouldClick = true;
      _.$slider = $(element);
      _.$slidesCache = null;
      _.transformType = null;
      _.transitionType = null;
      _.visibilityChange = "visibilitychange";
      _.windowWidth = 0;
      _.windowTimer = null;

      dataSettings = $(element).data("slick") || {};

      _.options = $.extend({}, _.defaults, settings, dataSettings);

      _.currentSlide = _.options.initialSlide;

      _.originalSettings = _.options;

      if (typeof document.mozHidden !== "undefined") {
        _.hidden = "mozHidden";
        _.visibilityChange = "mozvisibilitychange";
      } else if (typeof document.webkitHidden !== "undefined") {
        _.hidden = "webkitHidden";
        _.visibilityChange = "webkitvisibilitychange";
      }

      _.autoPlay = $.proxy(_.autoPlay, _);
      _.autoPlayClear = $.proxy(_.autoPlayClear, _);
      _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
      _.changeSlide = $.proxy(_.changeSlide, _);
      _.clickHandler = $.proxy(_.clickHandler, _);
      _.selectHandler = $.proxy(_.selectHandler, _);
      _.setPosition = $.proxy(_.setPosition, _);
      _.swipeHandler = $.proxy(_.swipeHandler, _);
      _.dragHandler = $.proxy(_.dragHandler, _);
      _.keyHandler = $.proxy(_.keyHandler, _);

      _.instanceUid = instanceUid++;

      // A simple way to check for HTML strings
      // Strict HTML recognition (must start with <)
      // Extracted from jQuery v1.11 source
      _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

      _.registerBreakpoints();
      _.init(true);
    }

    return Slick;
  })();

  Slick.prototype.activateADA = function () {
    var _ = this;

    _.$slideTrack
      .find(".slick-active")
      .attr({
        "aria-hidden": "false",
      })
      .find("a, input, button, select")
      .attr({
        tabindex: "0",
      });
  };

  Slick.prototype.addSlide = Slick.prototype.slickAdd = function (
    markup,
    index,
    addBefore
  ) {
    var _ = this;

    if (typeof index === "boolean") {
      addBefore = index;
      index = null;
    } else if (index < 0 || index >= _.slideCount) {
      return false;
    }

    _.unload();

    if (typeof index === "number") {
      if (index === 0 && _.$slides.length === 0) {
        $(markup).appendTo(_.$slideTrack);
      } else if (addBefore) {
        $(markup).insertBefore(_.$slides.eq(index));
      } else {
        $(markup).insertAfter(_.$slides.eq(index));
      }
    } else {
      if (addBefore === true) {
        $(markup).prependTo(_.$slideTrack);
      } else {
        $(markup).appendTo(_.$slideTrack);
      }
    }

    _.$slides = _.$slideTrack.children(this.options.slide);

    _.$slideTrack.children(this.options.slide).detach();

    _.$slideTrack.append(_.$slides);

    _.$slides.each(function (index, element) {
      $(element).attr("data-slick-index", index);
    });

    _.$slidesCache = _.$slides;

    _.reinit();
  };

  Slick.prototype.animateHeight = function () {
    var _ = this;
    if (
      _.options.slidesToShow === 1 &&
      _.options.adaptiveHeight === true &&
      _.options.vertical === false
    ) {
      var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
      _.$list.animate(
        {
          height: targetHeight,
        },
        _.options.speed
      );
    }
  };

  Slick.prototype.animateSlide = function (targetLeft, callback) {
    var animProps = {},
      _ = this;

    _.animateHeight();

    if (_.options.rtl === true && _.options.vertical === false) {
      targetLeft = -targetLeft;
    }
    if (_.transformsEnabled === false) {
      if (_.options.vertical === false) {
        _.$slideTrack.animate(
          {
            left: targetLeft,
          },
          _.options.speed,
          _.options.easing,
          callback
        );
      } else {
        _.$slideTrack.animate(
          {
            top: targetLeft,
          },
          _.options.speed,
          _.options.easing,
          callback
        );
      }
    } else {
      if (_.cssTransitions === false) {
        if (_.options.rtl === true) {
          _.currentLeft = -_.currentLeft;
        }
        $({
          animStart: _.currentLeft,
        }).animate(
          {
            animStart: targetLeft,
          },
          {
            duration: _.options.speed,
            easing: _.options.easing,
            step: function (now) {
              now = Math.ceil(now);
              if (_.options.vertical === false) {
                animProps[_.animType] = "translate(" + now + "px, 0px)";
                _.$slideTrack.css(animProps);
              } else {
                animProps[_.animType] = "translate(0px," + now + "px)";
                _.$slideTrack.css(animProps);
              }
            },
            complete: function () {
              if (callback) {
                callback.call();
              }
            },
          }
        );
      } else {
        _.applyTransition();
        targetLeft = Math.ceil(targetLeft);

        if (_.options.vertical === false) {
          animProps[_.animType] = "translate3d(" + targetLeft + "px, 0px, 0px)";
        } else {
          animProps[_.animType] = "translate3d(0px," + targetLeft + "px, 0px)";
        }
        _.$slideTrack.css(animProps);

        if (callback) {
          setTimeout(function () {
            _.disableTransition();

            callback.call();
          }, _.options.speed);
        }
      }
    }
  };

  Slick.prototype.getNavTarget = function () {
    var _ = this,
      asNavFor = _.options.asNavFor;

    if (asNavFor && asNavFor !== null) {
      asNavFor = $(asNavFor).not(_.$slider);
    }

    return asNavFor;
  };

  Slick.prototype.asNavFor = function (index) {
    var _ = this,
      asNavFor = _.getNavTarget();

    if (asNavFor !== null && typeof asNavFor === "object") {
      asNavFor.each(function () {
        var target = $(this).slick("getSlick");
        if (!target.unslicked) {
          target.slideHandler(index, true);
        }
      });
    }
  };

  Slick.prototype.applyTransition = function (slide) {
    var _ = this,
      transition = {};

    if (_.options.fade === false) {
      transition[_.transitionType] =
        _.transformType + " " + _.options.speed + "ms " + _.options.cssEase;
    } else {
      transition[_.transitionType] =
        "opacity " + _.options.speed + "ms " + _.options.cssEase;
    }

    if (_.options.fade === false) {
      _.$slideTrack.css(transition);
    } else {
      _.$slides.eq(slide).css(transition);
    }
  };

  Slick.prototype.autoPlay = function () {
    var _ = this;

    _.autoPlayClear();

    if (_.slideCount > _.options.slidesToShow) {
      _.autoPlayTimer = setInterval(
        _.autoPlayIterator,
        _.options.autoplaySpeed
      );
    }
  };

  Slick.prototype.autoPlayClear = function () {
    var _ = this;

    if (_.autoPlayTimer) {
      clearInterval(_.autoPlayTimer);
    }
  };

  Slick.prototype.autoPlayIterator = function () {
    var _ = this,
      slideTo = _.currentSlide + _.options.slidesToScroll;

    if (!_.paused && !_.interrupted && !_.focussed) {
      if (_.options.infinite === false) {
        if (_.direction === 1 && _.currentSlide + 1 === _.slideCount - 1) {
          _.direction = 0;
        } else if (_.direction === 0) {
          slideTo = _.currentSlide - _.options.slidesToScroll;

          if (_.currentSlide - 1 === 0) {
            _.direction = 1;
          }
        }
      }

      _.slideHandler(slideTo);
    }
  };

  Slick.prototype.buildArrows = function () {
    var _ = this;

    if (_.options.arrows === true) {
      _.$prevArrow = $(_.options.prevArrow).addClass("slick-arrow");
      _.$nextArrow = $(_.options.nextArrow).addClass("slick-arrow");

      if (_.slideCount > _.options.slidesToShow) {
        _.$prevArrow
          .removeClass("slick-hidden")
          .removeAttr("aria-hidden tabindex");
        _.$nextArrow
          .removeClass("slick-hidden")
          .removeAttr("aria-hidden tabindex");

        if (_.htmlExpr.test(_.options.prevArrow)) {
          _.$prevArrow.prependTo(_.options.appendArrows);
        }

        if (_.htmlExpr.test(_.options.nextArrow)) {
          _.$nextArrow.appendTo(_.options.appendArrows);
        }

        if (_.options.infinite !== true) {
          _.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true");
        }
      } else {
        _.$prevArrow
          .add(_.$nextArrow)

          .addClass("slick-hidden")
          .attr({
            "aria-disabled": "true",
            tabindex: "-1",
          });
      }
    }
  };

  Slick.prototype.buildDots = function () {
    var _ = this,
      i,
      dot;

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$slider.addClass("slick-dotted");

      dot = $("<ul />").addClass(_.options.dotsClass);

      for (i = 0; i <= _.getDotCount(); i += 1) {
        dot.append($("<li />").append(_.options.customPaging.call(this, _, i)));
      }

      _.$dots = dot.appendTo(_.options.appendDots);

      _.$dots.find("li").first().addClass("slick-active");
    }
  };

  Slick.prototype.buildOut = function () {
    var _ = this;

    _.$slides = _.$slider
      .children(_.options.slide + ":not(.slick-cloned)")
      .addClass("slick-slide");

    _.slideCount = _.$slides.length;

    _.$slides.each(function (index, element) {
      $(element)
        .attr("data-slick-index", index)
        .data("originalStyling", $(element).attr("style") || "");
    });

    _.$slider.addClass("slick-slider");

    _.$slideTrack =
      _.slideCount === 0
        ? $('<div class="slick-track"/>').appendTo(_.$slider)
        : _.$slides.wrapAll('<div class="slick-track"/>').parent();

    _.$list = _.$slideTrack.wrap('<div class="slick-list"/>').parent();
    _.$slideTrack.css("opacity", 0);

    if (_.options.centerMode === true || _.options.swipeToSlide === true) {
      _.options.slidesToScroll = 1;
    }

    $("img[data-lazy]", _.$slider).not("[src]").addClass("slick-loading");

    _.setupInfinite();

    _.buildArrows();

    _.buildDots();

    _.updateDots();

    _.setSlideClasses(typeof _.currentSlide === "number" ? _.currentSlide : 0);

    if (_.options.draggable === true) {
      _.$list.addClass("draggable");
    }
  };

  Slick.prototype.buildRows = function () {
    var _ = this,
      a,
      b,
      c,
      newSlides,
      numOfSlides,
      originalSlides,
      slidesPerSection;

    newSlides = document.createDocumentFragment();
    originalSlides = _.$slider.children();

    if (_.options.rows > 0) {
      slidesPerSection = _.options.slidesPerRow * _.options.rows;
      numOfSlides = Math.ceil(originalSlides.length / slidesPerSection);

      for (a = 0; a < numOfSlides; a++) {
        var slide = document.createElement("div");
        for (b = 0; b < _.options.rows; b++) {
          var row = document.createElement("div");
          for (c = 0; c < _.options.slidesPerRow; c++) {
            var target =
              a * slidesPerSection + (b * _.options.slidesPerRow + c);
            if (originalSlides.get(target)) {
              row.appendChild(originalSlides.get(target));
            }
          }
          slide.appendChild(row);
        }
        newSlides.appendChild(slide);
      }

      _.$slider.empty().append(newSlides);
      _.$slider
        .children()
        .children()
        .children()
        .css({
          width: 100 / _.options.slidesPerRow + "%",
          display: "inline-block",
        });
    }
  };

  Slick.prototype.checkResponsive = function (initial, forceUpdate) {
    var _ = this,
      breakpoint,
      targetBreakpoint,
      respondToWidth,
      triggerBreakpoint = false;
    var sliderWidth = _.$slider.width();
    var windowWidth = window.innerWidth || $(window).width();

    if (_.respondTo === "window") {
      respondToWidth = windowWidth;
    } else if (_.respondTo === "slider") {
      respondToWidth = sliderWidth;
    } else if (_.respondTo === "min") {
      respondToWidth = Math.min(windowWidth, sliderWidth);
    }

    if (
      _.options.responsive &&
      _.options.responsive.length &&
      _.options.responsive !== null
    ) {
      targetBreakpoint = null;

      for (breakpoint in _.breakpoints) {
        if (_.breakpoints.hasOwnProperty(breakpoint)) {
          if (_.originalSettings.mobileFirst === false) {
            if (respondToWidth < _.breakpoints[breakpoint]) {
              targetBreakpoint = _.breakpoints[breakpoint];
            }
          } else {
            if (respondToWidth > _.breakpoints[breakpoint]) {
              targetBreakpoint = _.breakpoints[breakpoint];
            }
          }
        }
      }

      if (targetBreakpoint !== null) {
        if (_.activeBreakpoint !== null) {
          if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
            _.activeBreakpoint = targetBreakpoint;
            if (_.breakpointSettings[targetBreakpoint] === "unslick") {
              _.unslick(targetBreakpoint);
            } else {
              _.options = $.extend(
                {},
                _.originalSettings,
                _.breakpointSettings[targetBreakpoint]
              );
              if (initial === true) {
                _.currentSlide = _.options.initialSlide;
              }
              _.refresh(initial);
            }
            triggerBreakpoint = targetBreakpoint;
          }
        } else {
          _.activeBreakpoint = targetBreakpoint;
          if (_.breakpointSettings[targetBreakpoint] === "unslick") {
            _.unslick(targetBreakpoint);
          } else {
            _.options = $.extend(
              {},
              _.originalSettings,
              _.breakpointSettings[targetBreakpoint]
            );
            if (initial === true) {
              _.currentSlide = _.options.initialSlide;
            }
            _.refresh(initial);
          }
          triggerBreakpoint = targetBreakpoint;
        }
      } else {
        if (_.activeBreakpoint !== null) {
          _.activeBreakpoint = null;
          _.options = _.originalSettings;
          if (initial === true) {
            _.currentSlide = _.options.initialSlide;
          }
          _.refresh(initial);
          triggerBreakpoint = targetBreakpoint;
        }
      }

      // only trigger breakpoints during an actual break. not on initialize.
      if (!initial && triggerBreakpoint !== false) {
        _.$slider.trigger("breakpoint", [_, triggerBreakpoint]);
      }
    }
  };

  Slick.prototype.changeSlide = function (event, dontAnimate) {
    var _ = this,
      $target = $(event.currentTarget),
      indexOffset,
      slideOffset,
      unevenOffset;

    // If target is a link, prevent default action.
    if ($target.is("a")) {
      event.preventDefault();
    }

    // If target is not the <li> element (ie: a child), find the <li>.
    if (!$target.is("li")) {
      $target = $target.closest("li");
    }

    unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
    indexOffset = unevenOffset
      ? 0
      : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

    switch (event.data.message) {
      case "previous":
        slideOffset =
          indexOffset === 0
            ? _.options.slidesToScroll
            : _.options.slidesToShow - indexOffset;
        if (_.slideCount > _.options.slidesToShow) {
          _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
        }
        break;

      case "next":
        slideOffset =
          indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
        if (_.slideCount > _.options.slidesToShow) {
          _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
        }
        break;

      case "index":
        var index =
          event.data.index === 0
            ? 0
            : event.data.index || $target.index() * _.options.slidesToScroll;

        _.slideHandler(_.checkNavigable(index), false, dontAnimate);
        $target.children().trigger("focus");
        break;

      default:
        return;
    }
  };

  Slick.prototype.checkNavigable = function (index) {
    var _ = this,
      navigables,
      prevNavigable;

    navigables = _.getNavigableIndexes();
    prevNavigable = 0;
    if (index > navigables[navigables.length - 1]) {
      index = navigables[navigables.length - 1];
    } else {
      for (var n in navigables) {
        if (index < navigables[n]) {
          index = prevNavigable;
          break;
        }
        prevNavigable = navigables[n];
      }
    }

    return index;
  };

  Slick.prototype.cleanUpEvents = function () {
    var _ = this;

    if (_.options.dots && _.$dots !== null) {
      $("li", _.$dots)
        .off("click.slick", _.changeSlide)
        .off("mouseenter.slick", $.proxy(_.interrupt, _, true))
        .off("mouseleave.slick", $.proxy(_.interrupt, _, false));

      if (_.options.accessibility === true) {
        _.$dots.off("keydown.slick", _.keyHandler);
      }
    }

    _.$slider.off("focus.slick blur.slick");

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow && _.$prevArrow.off("click.slick", _.changeSlide);
      _.$nextArrow && _.$nextArrow.off("click.slick", _.changeSlide);

      if (_.options.accessibility === true) {
        _.$prevArrow && _.$prevArrow.off("keydown.slick", _.keyHandler);
        _.$nextArrow && _.$nextArrow.off("keydown.slick", _.keyHandler);
      }
    }

    _.$list.off("touchstart.slick mousedown.slick", _.swipeHandler);
    _.$list.off("touchmove.slick mousemove.slick", _.swipeHandler);
    _.$list.off("touchend.slick mouseup.slick", _.swipeHandler);
    _.$list.off("touchcancel.slick mouseleave.slick", _.swipeHandler);

    _.$list.off("click.slick", _.clickHandler);

    $(document).off(_.visibilityChange, _.visibility);

    _.cleanUpSlideEvents();

    if (_.options.accessibility === true) {
      _.$list.off("keydown.slick", _.keyHandler);
    }

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().off("click.slick", _.selectHandler);
    }

    $(window).off(
      "orientationchange.slick.slick-" + _.instanceUid,
      _.orientationChange
    );

    $(window).off("resize.slick.slick-" + _.instanceUid, _.resize);

    $("[draggable!=true]", _.$slideTrack).off("dragstart", _.preventDefault);

    $(window).off("load.slick.slick-" + _.instanceUid, _.setPosition);
  };

  Slick.prototype.cleanUpSlideEvents = function () {
    var _ = this;

    _.$list.off("mouseenter.slick", $.proxy(_.interrupt, _, true));
    _.$list.off("mouseleave.slick", $.proxy(_.interrupt, _, false));
  };

  Slick.prototype.cleanUpRows = function () {
    var _ = this,
      originalSlides;

    if (_.options.rows > 0) {
      originalSlides = _.$slides.children().children();
      originalSlides.removeAttr("style");
      _.$slider.empty().append(originalSlides);
    }
  };

  Slick.prototype.clickHandler = function (event) {
    var _ = this;

    if (_.shouldClick === false) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    }
  };

  Slick.prototype.destroy = function (refresh) {
    var _ = this;

    _.autoPlayClear();

    _.touchObject = {};

    _.cleanUpEvents();

    $(".slick-cloned", _.$slider).detach();

    if (_.$dots) {
      _.$dots.remove();
    }

    if (_.$prevArrow && _.$prevArrow.length) {
      _.$prevArrow
        .removeClass("slick-disabled slick-arrow slick-hidden")
        .removeAttr("aria-hidden aria-disabled tabindex")
        .css("display", "");

      if (_.htmlExpr.test(_.options.prevArrow)) {
        _.$prevArrow.remove();
      }
    }

    if (_.$nextArrow && _.$nextArrow.length) {
      _.$nextArrow
        .removeClass("slick-disabled slick-arrow slick-hidden")
        .removeAttr("aria-hidden aria-disabled tabindex")
        .css("display", "");

      if (_.htmlExpr.test(_.options.nextArrow)) {
        _.$nextArrow.remove();
      }
    }

    if (_.$slides) {
      _.$slides
        .removeClass(
          "slick-slide slick-active slick-center slick-visible slick-current"
        )
        .removeAttr("aria-hidden")
        .removeAttr("data-slick-index")
        .each(function () {
          $(this).attr("style", $(this).data("originalStyling"));
        });

      _.$slideTrack.children(this.options.slide).detach();

      _.$slideTrack.detach();

      _.$list.detach();

      _.$slider.append(_.$slides);
    }

    _.cleanUpRows();

    _.$slider.removeClass("slick-slider");
    _.$slider.removeClass("slick-initialized");
    _.$slider.removeClass("slick-dotted");

    _.unslicked = true;

    if (!refresh) {
      _.$slider.trigger("destroy", [_]);
    }
  };

  Slick.prototype.disableTransition = function (slide) {
    var _ = this,
      transition = {};

    transition[_.transitionType] = "";

    if (_.options.fade === false) {
      _.$slideTrack.css(transition);
    } else {
      _.$slides.eq(slide).css(transition);
    }
  };

  Slick.prototype.fadeSlide = function (slideIndex, callback) {
    var _ = this;

    if (_.cssTransitions === false) {
      _.$slides.eq(slideIndex).css({
        zIndex: _.options.zIndex,
      });

      _.$slides.eq(slideIndex).animate(
        {
          opacity: 1,
        },
        _.options.speed,
        _.options.easing,
        callback
      );
    } else {
      _.applyTransition(slideIndex);

      _.$slides.eq(slideIndex).css({
        opacity: 1,
        zIndex: _.options.zIndex,
      });

      if (callback) {
        setTimeout(function () {
          _.disableTransition(slideIndex);

          callback.call();
        }, _.options.speed);
      }
    }
  };

  Slick.prototype.fadeSlideOut = function (slideIndex) {
    var _ = this;

    if (_.cssTransitions === false) {
      _.$slides.eq(slideIndex).animate(
        {
          opacity: 0,
          zIndex: _.options.zIndex - 2,
        },
        _.options.speed,
        _.options.easing
      );
    } else {
      _.applyTransition(slideIndex);

      _.$slides.eq(slideIndex).css({
        opacity: 0,
        zIndex: _.options.zIndex - 2,
      });
    }
  };

  Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (
    filter
  ) {
    var _ = this;

    if (filter !== null) {
      _.$slidesCache = _.$slides;

      _.unload();

      _.$slideTrack.children(this.options.slide).detach();

      _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

      _.reinit();
    }
  };

  Slick.prototype.focusHandler = function () {
    var _ = this;

    // If any child element receives focus within the slider we need to pause the autoplay
    _.$slider
      .off("focus.slick blur.slick")
      .on("focus.slick", "*", function (event) {
        var $sf = $(this);

        setTimeout(function () {
          if (_.options.pauseOnFocus) {
            if ($sf.is(":focus")) {
              _.focussed = true;
              _.autoPlay();
            }
          }
        }, 0);
      })
      .on("blur.slick", "*", function (event) {
        var $sf = $(this);

        // When a blur occurs on any elements within the slider we become unfocused
        if (_.options.pauseOnFocus) {
          _.focussed = false;
          _.autoPlay();
        }
      });
  };

  Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {
    var _ = this;
    return _.currentSlide;
  };

  Slick.prototype.getDotCount = function () {
    var _ = this;

    var breakPoint = 0;
    var counter = 0;
    var pagerQty = 0;

    if (_.options.infinite === true) {
      if (_.slideCount <= _.options.slidesToShow) {
        ++pagerQty;
      } else {
        while (breakPoint < _.slideCount) {
          ++pagerQty;
          breakPoint = counter + _.options.slidesToScroll;
          counter +=
            _.options.slidesToScroll <= _.options.slidesToShow
              ? _.options.slidesToScroll
              : _.options.slidesToShow;
        }
      }
    } else if (_.options.centerMode === true) {
      pagerQty = _.slideCount;
    } else if (!_.options.asNavFor) {
      pagerQty =
        1 +
        Math.ceil(
          (_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll
        );
    } else {
      while (breakPoint < _.slideCount) {
        ++pagerQty;
        breakPoint = counter + _.options.slidesToScroll;
        counter +=
          _.options.slidesToScroll <= _.options.slidesToShow
            ? _.options.slidesToScroll
            : _.options.slidesToShow;
      }
    }

    return pagerQty - 1;
  };

  Slick.prototype.getLeft = function (slideIndex) {
    var _ = this,
      targetLeft,
      verticalHeight,
      verticalOffset = 0,
      targetSlide,
      coef;

    _.slideOffset = 0;
    verticalHeight = _.$slides.first().outerHeight(true);

    if (_.options.infinite === true) {
      if (_.slideCount > _.options.slidesToShow) {
        _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
        coef = -1;

        if (_.options.vertical === true && _.options.centerMode === true) {
          if (_.options.slidesToShow === 2) {
            coef = -1.5;
          } else if (_.options.slidesToShow === 1) {
            coef = -2;
          }
        }
        verticalOffset = verticalHeight * _.options.slidesToShow * coef;
      }
      if (_.slideCount % _.options.slidesToScroll !== 0) {
        if (
          slideIndex + _.options.slidesToScroll > _.slideCount &&
          _.slideCount > _.options.slidesToShow
        ) {
          if (slideIndex > _.slideCount) {
            _.slideOffset =
              (_.options.slidesToShow - (slideIndex - _.slideCount)) *
              _.slideWidth *
              -1;
            verticalOffset =
              (_.options.slidesToShow - (slideIndex - _.slideCount)) *
              verticalHeight *
              -1;
          } else {
            _.slideOffset =
              (_.slideCount % _.options.slidesToScroll) * _.slideWidth * -1;
            verticalOffset =
              (_.slideCount % _.options.slidesToScroll) * verticalHeight * -1;
          }
        }
      }
    } else {
      if (slideIndex + _.options.slidesToShow > _.slideCount) {
        _.slideOffset =
          (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
        verticalOffset =
          (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
      }
    }

    if (_.slideCount <= _.options.slidesToShow) {
      _.slideOffset = 0;
      verticalOffset = 0;
    }

    if (
      _.options.centerMode === true &&
      _.slideCount <= _.options.slidesToShow
    ) {
      _.slideOffset =
        (_.slideWidth * Math.floor(_.options.slidesToShow)) / 2 -
        (_.slideWidth * _.slideCount) / 2;
    } else if (_.options.centerMode === true && _.options.infinite === true) {
      _.slideOffset +=
        _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
    } else if (_.options.centerMode === true) {
      _.slideOffset = 0;
      _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
    }

    if (_.options.vertical === false) {
      targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
    } else {
      targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
    }

    if (_.options.variableWidth === true) {
      if (
        _.slideCount <= _.options.slidesToShow ||
        _.options.infinite === false
      ) {
        targetSlide = _.$slideTrack.children(".slick-slide").eq(slideIndex);
      } else {
        targetSlide = _.$slideTrack
          .children(".slick-slide")
          .eq(slideIndex + _.options.slidesToShow);
      }

      if (_.options.rtl === true) {
        if (targetSlide[0]) {
          targetLeft =
            (_.$slideTrack.width() -
              targetSlide[0].offsetLeft -
              targetSlide.width()) *
            -1;
        } else {
          targetLeft = 0;
        }
      } else {
        targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
      }

      if (_.options.centerMode === true) {
        if (
          _.slideCount <= _.options.slidesToShow ||
          _.options.infinite === false
        ) {
          targetSlide = _.$slideTrack.children(".slick-slide").eq(slideIndex);
        } else {
          targetSlide = _.$slideTrack
            .children(".slick-slide")
            .eq(slideIndex + _.options.slidesToShow + 1);
        }

        if (_.options.rtl === true) {
          if (targetSlide[0]) {
            targetLeft =
              (_.$slideTrack.width() -
                targetSlide[0].offsetLeft -
                targetSlide.width()) *
              -1;
          } else {
            targetLeft = 0;
          }
        } else {
          targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
        }

        targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
      }
    }

    return targetLeft;
  };

  Slick.prototype.getOption = Slick.prototype.slickGetOption = function (
    option
  ) {
    var _ = this;

    return _.options[option];
  };

  Slick.prototype.getNavigableIndexes = function () {
    var _ = this,
      breakPoint = 0,
      counter = 0,
      indexes = [],
      max;

    if (_.options.infinite === false) {
      max = _.slideCount;
    } else {
      breakPoint = _.options.slidesToScroll * -1;
      counter = _.options.slidesToScroll * -1;
      max = _.slideCount * 2;
    }

    while (breakPoint < max) {
      indexes.push(breakPoint);
      breakPoint = counter + _.options.slidesToScroll;
      counter +=
        _.options.slidesToScroll <= _.options.slidesToShow
          ? _.options.slidesToScroll
          : _.options.slidesToShow;
    }

    return indexes;
  };

  Slick.prototype.getSlick = function () {
    return this;
  };

  Slick.prototype.getSlideCount = function () {
    var _ = this,
      slidesTraversed,
      swipedSlide,
      swipeTarget,
      centerOffset;

    centerOffset =
      _.options.centerMode === true ? Math.floor(_.$list.width() / 2) : 0;
    swipeTarget = _.swipeLeft * -1 + centerOffset;

    if (_.options.swipeToSlide === true) {
      _.$slideTrack.find(".slick-slide").each(function (index, slide) {
        var slideOuterWidth, slideOffset, slideRightBoundary;
        slideOuterWidth = $(slide).outerWidth();
        slideOffset = slide.offsetLeft;
        if (_.options.centerMode !== true) {
          slideOffset += slideOuterWidth / 2;
        }

        slideRightBoundary = slideOffset + slideOuterWidth;

        if (swipeTarget < slideRightBoundary) {
          swipedSlide = slide;
          return false;
        }
      });

      slidesTraversed =
        Math.abs($(swipedSlide).attr("data-slick-index") - _.currentSlide) || 1;

      return slidesTraversed;
    } else {
      return _.options.slidesToScroll;
    }
  };

  Slick.prototype.goTo = Slick.prototype.slickGoTo = function (
    slide,
    dontAnimate
  ) {
    var _ = this;

    _.changeSlide(
      {
        data: {
          message: "index",
          index: parseInt(slide),
        },
      },
      dontAnimate
    );
  };

  Slick.prototype.init = function (creation) {
    var _ = this;

    if (!$(_.$slider).hasClass("slick-initialized")) {
      $(_.$slider).addClass("slick-initialized");

      _.buildRows();
      _.buildOut();
      _.setProps();
      _.startLoad();
      _.loadSlider();
      _.initializeEvents();
      _.updateArrows();
      _.updateDots();
      _.checkResponsive(true);
      _.focusHandler();
    }

    if (creation) {
      _.$slider.trigger("init", [_]);
    }

    if (_.options.accessibility === true) {
      _.initADA();
    }

    if (_.options.autoplay) {
      _.paused = false;
      _.autoPlay();
    }
  };

  Slick.prototype.initADA = function () {
    var _ = this,
      numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
      tabControlIndexes = _.getNavigableIndexes().filter(function (val) {
        return val >= 0 && val < _.slideCount;
      });

    _.$slides
      .add(_.$slideTrack.find(".slick-cloned"))
      .attr({
        "aria-hidden": "true",
        tabindex: "-1",
      })
      .find("a, input, button, select")
      .attr({
        tabindex: "-1",
      });

    if (_.$dots !== null) {
      _.$slides.not(_.$slideTrack.find(".slick-cloned")).each(function (i) {
        var slideControlIndex = tabControlIndexes.indexOf(i);

        $(this).attr({
          role: "tabpanel",
          id: "slick-slide" + _.instanceUid + i,
          tabindex: -1,
        });

        if (slideControlIndex !== -1) {
          var ariaButtonControl =
            "slick-slide-control" + _.instanceUid + slideControlIndex;
          if ($("#" + ariaButtonControl).length) {
            $(this).attr({
              "aria-describedby": ariaButtonControl,
            });
          }
        }
      });

      _.$dots
        .attr("role", "tablist")
        .find("li")
        .each(function (i) {
          var mappedSlideIndex = tabControlIndexes[i];

          $(this).attr({
            role: "presentation",
          });

          $(this)
            .find("button")
            .first()
            .attr({
              role: "tab",
              id: "slick-slide-control" + _.instanceUid + i,
              "aria-controls": "slick-slide" + _.instanceUid + mappedSlideIndex,
              "aria-label": i + 1 + " of " + numDotGroups,
              "aria-selected": null,
              tabindex: "-1",
            });
        })
        .eq(_.currentSlide)
        .find("button")
        .attr({
          "aria-selected": "true",
          tabindex: "0",
        })
        .end();
    }

    for (
      var i = _.currentSlide, max = i + _.options.slidesToShow;
      i < max;
      i++
    ) {
      if (_.options.focusOnChange) {
        _.$slides.eq(i).attr({ tabindex: "0" });
      } else {
        _.$slides.eq(i).removeAttr("tabindex");
      }
    }

    _.activateADA();
  };

  Slick.prototype.initArrowEvents = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.off("click.slick").on(
        "click.slick",
        {
          message: "previous",
        },
        _.changeSlide
      );
      _.$nextArrow.off("click.slick").on(
        "click.slick",
        {
          message: "next",
        },
        _.changeSlide
      );

      if (_.options.accessibility === true) {
        _.$prevArrow.on("keydown.slick", _.keyHandler);
        _.$nextArrow.on("keydown.slick", _.keyHandler);
      }
    }
  };

  Slick.prototype.initDotEvents = function () {
    var _ = this;

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      $("li", _.$dots).on(
        "click.slick",
        {
          message: "index",
        },
        _.changeSlide
      );

      if (_.options.accessibility === true) {
        _.$dots.on("keydown.slick", _.keyHandler);
      }
    }

    if (
      _.options.dots === true &&
      _.options.pauseOnDotsHover === true &&
      _.slideCount > _.options.slidesToShow
    ) {
      $("li", _.$dots)
        .on("mouseenter.slick", $.proxy(_.interrupt, _, true))
        .on("mouseleave.slick", $.proxy(_.interrupt, _, false));
    }
  };

  Slick.prototype.initSlideEvents = function () {
    var _ = this;

    if (_.options.pauseOnHover) {
      _.$list.on("mouseenter.slick", $.proxy(_.interrupt, _, true));
      _.$list.on("mouseleave.slick", $.proxy(_.interrupt, _, false));
    }
  };

  Slick.prototype.initializeEvents = function () {
    var _ = this;

    _.initArrowEvents();

    _.initDotEvents();
    _.initSlideEvents();

    _.$list.on(
      "touchstart.slick mousedown.slick",
      {
        action: "start",
      },
      _.swipeHandler
    );
    _.$list.on(
      "touchmove.slick mousemove.slick",
      {
        action: "move",
      },
      _.swipeHandler
    );
    _.$list.on(
      "touchend.slick mouseup.slick",
      {
        action: "end",
      },
      _.swipeHandler
    );
    _.$list.on(
      "touchcancel.slick mouseleave.slick",
      {
        action: "end",
      },
      _.swipeHandler
    );

    _.$list.on("click.slick", _.clickHandler);

    $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

    if (_.options.accessibility === true) {
      _.$list.on("keydown.slick", _.keyHandler);
    }

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().on("click.slick", _.selectHandler);
    }

    $(window).on(
      "orientationchange.slick.slick-" + _.instanceUid,
      $.proxy(_.orientationChange, _)
    );

    $(window).on("resize.slick.slick-" + _.instanceUid, $.proxy(_.resize, _));

    $("[draggable!=true]", _.$slideTrack).on("dragstart", _.preventDefault);

    $(window).on("load.slick.slick-" + _.instanceUid, _.setPosition);
    $(_.setPosition);
  };

  Slick.prototype.initUI = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.show();
      _.$nextArrow.show();
    }

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$dots.show();
    }
  };

  Slick.prototype.keyHandler = function (event) {
    var _ = this;
    //Dont slide if the cursor is inside the form fields and arrow keys are pressed
    if (!event.target.tagName.match("TEXTAREA|INPUT|SELECT")) {
      if (event.keyCode === 37 && _.options.accessibility === true) {
        _.changeSlide({
          data: {
            message: _.options.rtl === true ? "next" : "previous",
          },
        });
      } else if (event.keyCode === 39 && _.options.accessibility === true) {
        _.changeSlide({
          data: {
            message: _.options.rtl === true ? "previous" : "next",
          },
        });
      }
    }
  };

  Slick.prototype.lazyLoad = function () {
    var _ = this,
      loadRange,
      cloneRange,
      rangeStart,
      rangeEnd;

    function loadImages(imagesScope) {
      $("img[data-lazy]", imagesScope).each(function () {
        var image = $(this),
          imageSource = $(this).attr("data-lazy"),
          imageSrcSet = $(this).attr("data-srcset"),
          imageSizes =
            $(this).attr("data-sizes") || _.$slider.attr("data-sizes"),
          imageToLoad = document.createElement("img");

        imageToLoad.onload = function () {
          image.animate({ opacity: 0 }, 100, function () {
            if (imageSrcSet) {
              image.attr("srcset", imageSrcSet);

              if (imageSizes) {
                image.attr("sizes", imageSizes);
              }
            }

            image
              .attr("src", imageSource)
              .animate({ opacity: 1 }, 200, function () {
                image
                  .removeAttr("data-lazy data-srcset data-sizes")
                  .removeClass("slick-loading");
              });
            _.$slider.trigger("lazyLoaded", [_, image, imageSource]);
          });
        };

        imageToLoad.onerror = function () {
          image
            .removeAttr("data-lazy")
            .removeClass("slick-loading")
            .addClass("slick-lazyload-error");

          _.$slider.trigger("lazyLoadError", [_, image, imageSource]);
        };

        imageToLoad.src = imageSource;
      });
    }

    if (_.options.centerMode === true) {
      if (_.options.infinite === true) {
        rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
        rangeEnd = rangeStart + _.options.slidesToShow + 2;
      } else {
        rangeStart = Math.max(
          0,
          _.currentSlide - (_.options.slidesToShow / 2 + 1)
        );
        rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
      }
    } else {
      rangeStart = _.options.infinite
        ? _.options.slidesToShow + _.currentSlide
        : _.currentSlide;
      rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
      if (_.options.fade === true) {
        if (rangeStart > 0) rangeStart--;
        if (rangeEnd <= _.slideCount) rangeEnd++;
      }
    }

    loadRange = _.$slider.find(".slick-slide").slice(rangeStart, rangeEnd);

    if (_.options.lazyLoad === "anticipated") {
      var prevSlide = rangeStart - 1,
        nextSlide = rangeEnd,
        $slides = _.$slider.find(".slick-slide");

      for (var i = 0; i < _.options.slidesToScroll; i++) {
        if (prevSlide < 0) prevSlide = _.slideCount - 1;
        loadRange = loadRange.add($slides.eq(prevSlide));
        loadRange = loadRange.add($slides.eq(nextSlide));
        prevSlide--;
        nextSlide++;
      }
    }

    loadImages(loadRange);

    if (_.slideCount <= _.options.slidesToShow) {
      cloneRange = _.$slider.find(".slick-slide");
      loadImages(cloneRange);
    } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
      cloneRange = _.$slider
        .find(".slick-cloned")
        .slice(0, _.options.slidesToShow);
      loadImages(cloneRange);
    } else if (_.currentSlide === 0) {
      cloneRange = _.$slider
        .find(".slick-cloned")
        .slice(_.options.slidesToShow * -1);
      loadImages(cloneRange);
    }
  };

  Slick.prototype.loadSlider = function () {
    var _ = this;

    _.setPosition();

    _.$slideTrack.css({
      opacity: 1,
    });

    _.$slider.removeClass("slick-loading");

    _.initUI();

    if (_.options.lazyLoad === "progressive") {
      _.progressiveLazyLoad();
    }
  };

  Slick.prototype.next = Slick.prototype.slickNext = function () {
    var _ = this;

    _.changeSlide({
      data: {
        message: "next",
      },
    });
  };

  Slick.prototype.orientationChange = function () {
    var _ = this;

    _.checkResponsive();
    _.setPosition();
  };

  Slick.prototype.pause = Slick.prototype.slickPause = function () {
    var _ = this;

    _.autoPlayClear();
    _.paused = true;
  };

  Slick.prototype.play = Slick.prototype.slickPlay = function () {
    var _ = this;

    _.autoPlay();
    _.options.autoplay = true;
    _.paused = false;
    _.focussed = false;
    _.interrupted = false;
  };

  Slick.prototype.postSlide = function (index) {
    var _ = this;

    if (!_.unslicked) {
      _.$slider.trigger("afterChange", [_, index]);

      _.animating = false;

      if (_.slideCount > _.options.slidesToShow) {
        _.setPosition();
      }

      _.swipeLeft = null;

      if (_.options.autoplay) {
        _.autoPlay();
      }

      if (_.options.accessibility === true) {
        _.initADA();

        if (_.options.focusOnChange) {
          var $currentSlide = $(_.$slides.get(_.currentSlide));
          $currentSlide.attr("tabindex", 0).focus();
        }
      }
    }
  };

  Slick.prototype.prev = Slick.prototype.slickPrev = function () {
    var _ = this;

    _.changeSlide({
      data: {
        message: "previous",
      },
    });
  };

  Slick.prototype.preventDefault = function (event) {
    event.preventDefault();
  };

  Slick.prototype.progressiveLazyLoad = function (tryCount) {
    tryCount = tryCount || 1;

    var _ = this,
      $imgsToLoad = $("img[data-lazy]", _.$slider),
      image,
      imageSource,
      imageSrcSet,
      imageSizes,
      imageToLoad;

    if ($imgsToLoad.length) {
      image = $imgsToLoad.first();
      imageSource = image.attr("data-lazy");
      imageSrcSet = image.attr("data-srcset");
      imageSizes = image.attr("data-sizes") || _.$slider.attr("data-sizes");
      imageToLoad = document.createElement("img");

      imageToLoad.onload = function () {
        if (imageSrcSet) {
          image.attr("srcset", imageSrcSet);

          if (imageSizes) {
            image.attr("sizes", imageSizes);
          }
        }

        image
          .attr("src", imageSource)
          .removeAttr("data-lazy data-srcset data-sizes")
          .removeClass("slick-loading");

        if (_.options.adaptiveHeight === true) {
          _.setPosition();
        }

        _.$slider.trigger("lazyLoaded", [_, image, imageSource]);
        _.progressiveLazyLoad();
      };

      imageToLoad.onerror = function () {
        if (tryCount < 3) {
          /**
           * try to load the image 3 times,
           * leave a slight delay so we don't get
           * servers blocking the request.
           */
          setTimeout(function () {
            _.progressiveLazyLoad(tryCount + 1);
          }, 500);
        } else {
          image
            .removeAttr("data-lazy")
            .removeClass("slick-loading")
            .addClass("slick-lazyload-error");

          _.$slider.trigger("lazyLoadError", [_, image, imageSource]);

          _.progressiveLazyLoad();
        }
      };

      imageToLoad.src = imageSource;
    } else {
      _.$slider.trigger("allImagesLoaded", [_]);
    }
  };

  Slick.prototype.refresh = function (initializing) {
    var _ = this,
      currentSlide,
      lastVisibleIndex;

    lastVisibleIndex = _.slideCount - _.options.slidesToShow;

    // in non-infinite sliders, we don't want to go past the
    // last visible index.
    if (!_.options.infinite && _.currentSlide > lastVisibleIndex) {
      _.currentSlide = lastVisibleIndex;
    }

    // if less slides than to show, go to start.
    if (_.slideCount <= _.options.slidesToShow) {
      _.currentSlide = 0;
    }

    currentSlide = _.currentSlide;

    _.destroy(true);

    $.extend(_, _.initials, { currentSlide: currentSlide });

    _.init();

    if (!initializing) {
      _.changeSlide(
        {
          data: {
            message: "index",
            index: currentSlide,
          },
        },
        false
      );
    }
  };

  Slick.prototype.registerBreakpoints = function () {
    var _ = this,
      breakpoint,
      currentBreakpoint,
      l,
      responsiveSettings = _.options.responsive || null;

    if ($.type(responsiveSettings) === "array" && responsiveSettings.length) {
      _.respondTo = _.options.respondTo || "window";

      for (breakpoint in responsiveSettings) {
        l = _.breakpoints.length - 1;

        if (responsiveSettings.hasOwnProperty(breakpoint)) {
          currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

          // loop through the breakpoints and cut out any existing
          // ones with the same breakpoint number, we don't want dupes.
          while (l >= 0) {
            if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
              _.breakpoints.splice(l, 1);
            }
            l--;
          }

          _.breakpoints.push(currentBreakpoint);
          _.breakpointSettings[currentBreakpoint] =
            responsiveSettings[breakpoint].settings;
        }
      }

      _.breakpoints.sort(function (a, b) {
        return _.options.mobileFirst ? a - b : b - a;
      });
    }
  };

  Slick.prototype.reinit = function () {
    var _ = this;

    _.$slides = _.$slideTrack.children(_.options.slide).addClass("slick-slide");

    _.slideCount = _.$slides.length;

    if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
      _.currentSlide = _.currentSlide - _.options.slidesToScroll;
    }

    if (_.slideCount <= _.options.slidesToShow) {
      _.currentSlide = 0;
    }

    _.registerBreakpoints();

    _.setProps();
    _.setupInfinite();
    _.buildArrows();
    _.updateArrows();
    _.initArrowEvents();
    _.buildDots();
    _.updateDots();
    _.initDotEvents();
    _.cleanUpSlideEvents();
    _.initSlideEvents();

    _.checkResponsive(false, true);

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().on("click.slick", _.selectHandler);
    }

    _.setSlideClasses(typeof _.currentSlide === "number" ? _.currentSlide : 0);

    _.setPosition();
    _.focusHandler();

    _.paused = !_.options.autoplay;
    _.autoPlay();

    _.$slider.trigger("reInit", [_]);
  };

  Slick.prototype.resize = function () {
    var _ = this;

    if ($(window).width() !== _.windowWidth) {
      clearTimeout(_.windowDelay);
      _.windowDelay = window.setTimeout(function () {
        _.windowWidth = $(window).width();
        _.checkResponsive();
        if (!_.unslicked) {
          _.setPosition();
        }
      }, 50);
    }
  };

  Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (
    index,
    removeBefore,
    removeAll
  ) {
    var _ = this;

    if (typeof index === "boolean") {
      removeBefore = index;
      index = removeBefore === true ? 0 : _.slideCount - 1;
    } else {
      index = removeBefore === true ? --index : index;
    }

    if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
      return false;
    }

    _.unload();

    if (removeAll === true) {
      _.$slideTrack.children().remove();
    } else {
      _.$slideTrack.children(this.options.slide).eq(index).remove();
    }

    _.$slides = _.$slideTrack.children(this.options.slide);

    _.$slideTrack.children(this.options.slide).detach();

    _.$slideTrack.append(_.$slides);

    _.$slidesCache = _.$slides;

    _.reinit();
  };

  Slick.prototype.setCSS = function (position) {
    var _ = this,
      positionProps = {},
      x,
      y;

    if (_.options.rtl === true) {
      position = -position;
    }
    x = _.positionProp == "left" ? Math.ceil(position) + "px" : "0px";
    y = _.positionProp == "top" ? Math.ceil(position) + "px" : "0px";

    positionProps[_.positionProp] = position;

    if (_.transformsEnabled === false) {
      _.$slideTrack.css(positionProps);
    } else {
      positionProps = {};
      if (_.cssTransitions === false) {
        positionProps[_.animType] = "translate(" + x + ", " + y + ")";
        _.$slideTrack.css(positionProps);
      } else {
        positionProps[_.animType] = "translate3d(" + x + ", " + y + ", 0px)";
        _.$slideTrack.css(positionProps);
      }
    }
  };

  Slick.prototype.setDimensions = function () {
    var _ = this;

    if (_.options.vertical === false) {
      if (_.options.centerMode === true) {
        _.$list.css({
          padding: "0px " + _.options.centerPadding,
        });
      }
    } else {
      _.$list.height(
        _.$slides.first().outerHeight(true) * _.options.slidesToShow
      );
      if (_.options.centerMode === true) {
        _.$list.css({
          padding: _.options.centerPadding + " 0px",
        });
      }
    }

    _.listWidth = _.$list.width();
    _.listHeight = _.$list.height();

    if (_.options.vertical === false && _.options.variableWidth === false) {
      _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
      _.$slideTrack.width(
        Math.ceil(_.slideWidth * _.$slideTrack.children(".slick-slide").length)
      );
    } else if (_.options.variableWidth === true) {
      _.$slideTrack.width(5000 * _.slideCount);
    } else {
      _.slideWidth = Math.ceil(_.listWidth);
      _.$slideTrack.height(
        Math.ceil(
          _.$slides.first().outerHeight(true) *
            _.$slideTrack.children(".slick-slide").length
        )
      );
    }

    var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
    if (_.options.variableWidth === false)
      _.$slideTrack.children(".slick-slide").width(_.slideWidth - offset);
  };

  Slick.prototype.setFade = function () {
    var _ = this,
      targetLeft;

    _.$slides.each(function (index, element) {
      targetLeft = _.slideWidth * index * -1;
      if (_.options.rtl === true) {
        $(element).css({
          position: "relative",
          right: targetLeft,
          top: 0,
          zIndex: _.options.zIndex - 2,
          opacity: 0,
        });
      } else {
        $(element).css({
          position: "relative",
          left: targetLeft,
          top: 0,
          zIndex: _.options.zIndex - 2,
          opacity: 0,
        });
      }
    });

    _.$slides.eq(_.currentSlide).css({
      zIndex: _.options.zIndex - 1,
      opacity: 1,
    });
  };

  Slick.prototype.setHeight = function () {
    var _ = this;

    if (
      _.options.slidesToShow === 1 &&
      _.options.adaptiveHeight === true &&
      _.options.vertical === false
    ) {
      var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
      _.$list.css("height", targetHeight);
    }
  };

  Slick.prototype.setOption = Slick.prototype.slickSetOption = function () {
    /**
     * accepts arguments in format of:
     *
     *  - for changing a single option's value:
     *     .slick("setOption", option, value, refresh )
     *
     *  - for changing a set of responsive options:
     *     .slick("setOption", 'responsive', [{}, ...], refresh )
     *
     *  - for updating multiple values at once (not responsive)
     *     .slick("setOption", { 'option': value, ... }, refresh )
     */

    var _ = this,
      l,
      item,
      option,
      value,
      refresh = false,
      type;

    if ($.type(arguments[0]) === "object") {
      option = arguments[0];
      refresh = arguments[1];
      type = "multiple";
    } else if ($.type(arguments[0]) === "string") {
      option = arguments[0];
      value = arguments[1];
      refresh = arguments[2];

      if (arguments[0] === "responsive" && $.type(arguments[1]) === "array") {
        type = "responsive";
      } else if (typeof arguments[1] !== "undefined") {
        type = "single";
      }
    }

    if (type === "single") {
      _.options[option] = value;
    } else if (type === "multiple") {
      $.each(option, function (opt, val) {
        _.options[opt] = val;
      });
    } else if (type === "responsive") {
      for (item in value) {
        if ($.type(_.options.responsive) !== "array") {
          _.options.responsive = [value[item]];
        } else {
          l = _.options.responsive.length - 1;

          // loop through the responsive object and splice out duplicates.
          while (l >= 0) {
            if (_.options.responsive[l].breakpoint === value[item].breakpoint) {
              _.options.responsive.splice(l, 1);
            }

            l--;
          }

          _.options.responsive.push(value[item]);
        }
      }
    }

    if (refresh) {
      _.unload();
      _.reinit();
    }
  };

  Slick.prototype.setPosition = function () {
    var _ = this;

    _.setDimensions();

    _.setHeight();

    if (_.options.fade === false) {
      _.setCSS(_.getLeft(_.currentSlide));
    } else {
      _.setFade();
    }

    _.$slider.trigger("setPosition", [_]);
  };

  Slick.prototype.setProps = function () {
    var _ = this,
      bodyStyle = document.body.style;

    _.positionProp = _.options.vertical === true ? "top" : "left";

    if (_.positionProp === "top") {
      _.$slider.addClass("slick-vertical");
    } else {
      _.$slider.removeClass("slick-vertical");
    }

    if (
      bodyStyle.WebkitTransition !== undefined ||
      bodyStyle.MozTransition !== undefined ||
      bodyStyle.msTransition !== undefined
    ) {
      if (_.options.useCSS === true) {
        _.cssTransitions = true;
      }
    }

    if (_.options.fade) {
      if (typeof _.options.zIndex === "number") {
        if (_.options.zIndex < 3) {
          _.options.zIndex = 3;
        }
      } else {
        _.options.zIndex = _.defaults.zIndex;
      }
    }

    if (bodyStyle.OTransform !== undefined) {
      _.animType = "OTransform";
      _.transformType = "-o-transform";
      _.transitionType = "OTransition";
      if (
        bodyStyle.perspectiveProperty === undefined &&
        bodyStyle.webkitPerspective === undefined
      )
        _.animType = false;
    }
    if (bodyStyle.MozTransform !== undefined) {
      _.animType = "MozTransform";
      _.transformType = "-moz-transform";
      _.transitionType = "MozTransition";
      if (
        bodyStyle.perspectiveProperty === undefined &&
        bodyStyle.MozPerspective === undefined
      )
        _.animType = false;
    }
    if (bodyStyle.webkitTransform !== undefined) {
      _.animType = "webkitTransform";
      _.transformType = "-webkit-transform";
      _.transitionType = "webkitTransition";
      if (
        bodyStyle.perspectiveProperty === undefined &&
        bodyStyle.webkitPerspective === undefined
      )
        _.animType = false;
    }
    if (bodyStyle.msTransform !== undefined) {
      _.animType = "msTransform";
      _.transformType = "-ms-transform";
      _.transitionType = "msTransition";
      if (bodyStyle.msTransform === undefined) _.animType = false;
    }
    if (bodyStyle.transform !== undefined && _.animType !== false) {
      _.animType = "transform";
      _.transformType = "transform";
      _.transitionType = "transition";
    }
    _.transformsEnabled =
      _.options.useTransform && _.animType !== null && _.animType !== false;
  };

  Slick.prototype.setSlideClasses = function (index) {
    var _ = this,
      centerOffset,
      allSlides,
      indexOffset,
      remainder;

    allSlides = _.$slider
      .find(".slick-slide")
      .removeClass("slick-active slick-center slick-current")
      .attr("aria-hidden", "true");

    _.$slides.eq(index).addClass("slick-current");

    if (_.options.centerMode === true) {
      var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

      centerOffset = Math.floor(_.options.slidesToShow / 2);

      if (_.options.infinite === true) {
        if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
          _.$slides
            .slice(index - centerOffset + evenCoef, index + centerOffset + 1)
            .addClass("slick-active")
            .attr("aria-hidden", "false");
        } else {
          indexOffset = _.options.slidesToShow + index;
          allSlides
            .slice(
              indexOffset - centerOffset + 1 + evenCoef,
              indexOffset + centerOffset + 2
            )
            .addClass("slick-active")
            .attr("aria-hidden", "false");
        }

        if (index === 0) {
          allSlides
            .eq(_.options.slidesToShow + _.slideCount + 1)
            .addClass("slick-center");
        } else if (index === _.slideCount - 1) {
          allSlides.eq(_.options.slidesToShow).addClass("slick-center");
        }
      }

      _.$slides.eq(index).addClass("slick-center");
    } else {
      if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {
        _.$slides
          .slice(index, index + _.options.slidesToShow)
          .addClass("slick-active")
          .attr("aria-hidden", "false");
      } else if (allSlides.length <= _.options.slidesToShow) {
        allSlides.addClass("slick-active").attr("aria-hidden", "false");
      } else {
        remainder = _.slideCount % _.options.slidesToShow;
        indexOffset =
          _.options.infinite === true ? _.options.slidesToShow + index : index;

        if (
          _.options.slidesToShow == _.options.slidesToScroll &&
          _.slideCount - index < _.options.slidesToShow
        ) {
          allSlides
            .slice(
              indexOffset - (_.options.slidesToShow - remainder),
              indexOffset + remainder
            )
            .addClass("slick-active")
            .attr("aria-hidden", "false");
        } else {
          allSlides
            .slice(indexOffset, indexOffset + _.options.slidesToShow)
            .addClass("slick-active")
            .attr("aria-hidden", "false");
        }
      }
    }

    if (
      _.options.lazyLoad === "ondemand" ||
      _.options.lazyLoad === "anticipated"
    ) {
      _.lazyLoad();
    }
  };

  Slick.prototype.setupInfinite = function () {
    var _ = this,
      i,
      slideIndex,
      infiniteCount;

    if (_.options.fade === true) {
      _.options.centerMode = false;
    }

    if (_.options.infinite === true && _.options.fade === false) {
      slideIndex = null;

      if (_.slideCount > _.options.slidesToShow) {
        if (_.options.centerMode === true) {
          infiniteCount = _.options.slidesToShow + 1;
        } else {
          infiniteCount = _.options.slidesToShow;
        }

        for (i = _.slideCount; i > _.slideCount - infiniteCount; i -= 1) {
          slideIndex = i - 1;
          $(_.$slides[slideIndex])
            .clone(true)
            .attr("id", "")
            .attr("data-slick-index", slideIndex - _.slideCount)
            .prependTo(_.$slideTrack)
            .addClass("slick-cloned");
        }
        for (i = 0; i < infiniteCount + _.slideCount; i += 1) {
          slideIndex = i;
          $(_.$slides[slideIndex])
            .clone(true)
            .attr("id", "")
            .attr("data-slick-index", slideIndex + _.slideCount)
            .appendTo(_.$slideTrack)
            .addClass("slick-cloned");
        }
        _.$slideTrack
          .find(".slick-cloned")
          .find("[id]")
          .each(function () {
            $(this).attr("id", "");
          });
      }
    }
  };

  Slick.prototype.interrupt = function (toggle) {
    var _ = this;

    if (!toggle) {
      _.autoPlay();
    }
    _.interrupted = toggle;
  };

  Slick.prototype.selectHandler = function (event) {
    var _ = this;

    var targetElement = $(event.target).is(".slick-slide")
      ? $(event.target)
      : $(event.target).parents(".slick-slide");

    var index = parseInt(targetElement.attr("data-slick-index"));

    if (!index) index = 0;

    if (_.slideCount <= _.options.slidesToShow) {
      _.slideHandler(index, false, true);
      return;
    }

    _.slideHandler(index);
  };

  Slick.prototype.slideHandler = function (index, sync, dontAnimate) {
    var targetSlide,
      animSlide,
      oldSlide,
      slideLeft,
      targetLeft = null,
      _ = this,
      navTarget;

    sync = sync || false;

    if (_.animating === true && _.options.waitForAnimate === true) {
      return;
    }

    if (_.options.fade === true && _.currentSlide === index) {
      return;
    }

    if (sync === false) {
      _.asNavFor(index);
    }

    targetSlide = index;
    targetLeft = _.getLeft(targetSlide);
    slideLeft = _.getLeft(_.currentSlide);

    _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

    if (
      _.options.infinite === false &&
      _.options.centerMode === false &&
      (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)
    ) {
      if (_.options.fade === false) {
        targetSlide = _.currentSlide;
        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
          _.animateSlide(slideLeft, function () {
            _.postSlide(targetSlide);
          });
        } else {
          _.postSlide(targetSlide);
        }
      }
      return;
    } else if (
      _.options.infinite === false &&
      _.options.centerMode === true &&
      (index < 0 || index > _.slideCount - _.options.slidesToScroll)
    ) {
      if (_.options.fade === false) {
        targetSlide = _.currentSlide;
        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
          _.animateSlide(slideLeft, function () {
            _.postSlide(targetSlide);
          });
        } else {
          _.postSlide(targetSlide);
        }
      }
      return;
    }

    if (_.options.autoplay) {
      clearInterval(_.autoPlayTimer);
    }

    if (targetSlide < 0) {
      if (_.slideCount % _.options.slidesToScroll !== 0) {
        animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
      } else {
        animSlide = _.slideCount + targetSlide;
      }
    } else if (targetSlide >= _.slideCount) {
      if (_.slideCount % _.options.slidesToScroll !== 0) {
        animSlide = 0;
      } else {
        animSlide = targetSlide - _.slideCount;
      }
    } else {
      animSlide = targetSlide;
    }

    _.animating = true;

    _.$slider.trigger("beforeChange", [_, _.currentSlide, animSlide]);

    oldSlide = _.currentSlide;
    _.currentSlide = animSlide;

    _.setSlideClasses(_.currentSlide);

    if (_.options.asNavFor) {
      navTarget = _.getNavTarget();
      navTarget = navTarget.slick("getSlick");

      if (navTarget.slideCount <= navTarget.options.slidesToShow) {
        navTarget.setSlideClasses(_.currentSlide);
      }
    }

    _.updateDots();
    _.updateArrows();

    if (_.options.fade === true) {
      if (dontAnimate !== true) {
        _.fadeSlideOut(oldSlide);

        _.fadeSlide(animSlide, function () {
          _.postSlide(animSlide);
        });
      } else {
        _.postSlide(animSlide);
      }
      _.animateHeight();
      return;
    }

    if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
      _.animateSlide(targetLeft, function () {
        _.postSlide(animSlide);
      });
    } else {
      _.postSlide(animSlide);
    }
  };

  Slick.prototype.startLoad = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.hide();
      _.$nextArrow.hide();
    }

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$dots.hide();
    }

    _.$slider.addClass("slick-loading");
  };

  Slick.prototype.swipeDirection = function () {
    var xDist,
      yDist,
      r,
      swipeAngle,
      _ = this;

    xDist = _.touchObject.startX - _.touchObject.curX;
    yDist = _.touchObject.startY - _.touchObject.curY;
    r = Math.atan2(yDist, xDist);

    swipeAngle = Math.round((r * 180) / Math.PI);
    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }

    if (swipeAngle <= 45 && swipeAngle >= 0) {
      return _.options.rtl === false ? "left" : "right";
    }
    if (swipeAngle <= 360 && swipeAngle >= 315) {
      return _.options.rtl === false ? "left" : "right";
    }
    if (swipeAngle >= 135 && swipeAngle <= 225) {
      return _.options.rtl === false ? "right" : "left";
    }
    if (_.options.verticalSwiping === true) {
      if (swipeAngle >= 35 && swipeAngle <= 135) {
        return "down";
      } else {
        return "up";
      }
    }

    return "vertical";
  };

  Slick.prototype.swipeEnd = function (event) {
    var _ = this,
      slideCount,
      direction;

    _.dragging = false;
    _.swiping = false;

    if (_.scrolling) {
      _.scrolling = false;
      return false;
    }

    _.interrupted = false;
    _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

    if (_.touchObject.curX === undefined) {
      return false;
    }

    if (_.touchObject.edgeHit === true) {
      _.$slider.trigger("edge", [_, _.swipeDirection()]);
    }

    if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
      direction = _.swipeDirection();

      switch (direction) {
        case "left":
        case "down":
          slideCount = _.options.swipeToSlide
            ? _.checkNavigable(_.currentSlide + _.getSlideCount())
            : _.currentSlide + _.getSlideCount();

          _.currentDirection = 0;

          break;

        case "right":
        case "up":
          slideCount = _.options.swipeToSlide
            ? _.checkNavigable(_.currentSlide - _.getSlideCount())
            : _.currentSlide - _.getSlideCount();

          _.currentDirection = 1;

          break;

        default:
      }

      if (direction != "vertical") {
        _.slideHandler(slideCount);
        _.touchObject = {};
        _.$slider.trigger("swipe", [_, direction]);
      }
    } else {
      if (_.touchObject.startX !== _.touchObject.curX) {
        _.slideHandler(_.currentSlide);
        _.touchObject = {};
      }
    }
  };

  Slick.prototype.swipeHandler = function (event) {
    var _ = this;

    if (
      _.options.swipe === false ||
      ("ontouchend" in document && _.options.swipe === false)
    ) {
      return;
    } else if (
      _.options.draggable === false &&
      event.type.indexOf("mouse") !== -1
    ) {
      return;
    }

    _.touchObject.fingerCount =
      event.originalEvent && event.originalEvent.touches !== undefined
        ? event.originalEvent.touches.length
        : 1;

    _.touchObject.minSwipe = _.listWidth / _.options.touchThreshold;

    if (_.options.verticalSwiping === true) {
      _.touchObject.minSwipe = _.listHeight / _.options.touchThreshold;
    }

    switch (event.data.action) {
      case "start":
        _.swipeStart(event);
        break;

      case "move":
        _.swipeMove(event);
        break;

      case "end":
        _.swipeEnd(event);
        break;
    }
  };

  Slick.prototype.swipeMove = function (event) {
    var _ = this,
      edgeWasHit = false,
      curLeft,
      swipeDirection,
      swipeLength,
      positionOffset,
      touches,
      verticalSwipeLength;

    touches =
      event.originalEvent !== undefined ? event.originalEvent.touches : null;

    if (!_.dragging || _.scrolling || (touches && touches.length !== 1)) {
      return false;
    }

    curLeft = _.getLeft(_.currentSlide);

    _.touchObject.curX =
      touches !== undefined ? touches[0].pageX : event.clientX;
    _.touchObject.curY =
      touches !== undefined ? touches[0].pageY : event.clientY;

    _.touchObject.swipeLength = Math.round(
      Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2))
    );

    verticalSwipeLength = Math.round(
      Math.sqrt(Math.pow(_.touchObject.curY - _.touchObject.startY, 2))
    );

    if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
      _.scrolling = true;
      return false;
    }

    if (_.options.verticalSwiping === true) {
      _.touchObject.swipeLength = verticalSwipeLength;
    }

    swipeDirection = _.swipeDirection();

    if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
      _.swiping = true;
      event.preventDefault();
    }

    positionOffset =
      (_.options.rtl === false ? 1 : -1) *
      (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
    if (_.options.verticalSwiping === true) {
      positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
    }

    swipeLength = _.touchObject.swipeLength;

    _.touchObject.edgeHit = false;

    if (_.options.infinite === false) {
      if (
        (_.currentSlide === 0 && swipeDirection === "right") ||
        (_.currentSlide >= _.getDotCount() && swipeDirection === "left")
      ) {
        swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
        _.touchObject.edgeHit = true;
      }
    }

    if (_.options.vertical === false) {
      _.swipeLeft = curLeft + swipeLength * positionOffset;
    } else {
      _.swipeLeft =
        curLeft +
        swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
    }
    if (_.options.verticalSwiping === true) {
      _.swipeLeft = curLeft + swipeLength * positionOffset;
    }

    if (_.options.fade === true || _.options.touchMove === false) {
      return false;
    }

    if (_.animating === true) {
      _.swipeLeft = null;
      return false;
    }

    _.setCSS(_.swipeLeft);
  };

  Slick.prototype.swipeStart = function (event) {
    var _ = this,
      touches;

    _.interrupted = true;

    if (
      _.touchObject.fingerCount !== 1 ||
      _.slideCount <= _.options.slidesToShow
    ) {
      _.touchObject = {};
      return false;
    }

    if (
      event.originalEvent !== undefined &&
      event.originalEvent.touches !== undefined
    ) {
      touches = event.originalEvent.touches[0];
    }

    _.touchObject.startX = _.touchObject.curX =
      touches !== undefined ? touches.pageX : event.clientX;
    _.touchObject.startY = _.touchObject.curY =
      touches !== undefined ? touches.pageY : event.clientY;

    _.dragging = true;
  };

  Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {
    var _ = this;

    if (_.$slidesCache !== null) {
      _.unload();

      _.$slideTrack.children(this.options.slide).detach();

      _.$slidesCache.appendTo(_.$slideTrack);

      _.reinit();
    }
  };

  Slick.prototype.unload = function () {
    var _ = this;

    $(".slick-cloned", _.$slider).remove();

    if (_.$dots) {
      _.$dots.remove();
    }

    if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
      _.$prevArrow.remove();
    }

    if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
      _.$nextArrow.remove();
    }

    _.$slides
      .removeClass("slick-slide slick-active slick-visible slick-current")
      .attr("aria-hidden", "true")
      .css("width", "");
  };

  Slick.prototype.unslick = function (fromBreakpoint) {
    var _ = this;
    _.$slider.trigger("unslick", [_, fromBreakpoint]);
    _.destroy();
  };

  Slick.prototype.updateArrows = function () {
    var _ = this,
      centerOffset;

    centerOffset = Math.floor(_.options.slidesToShow / 2);

    if (
      _.options.arrows === true &&
      _.slideCount > _.options.slidesToShow &&
      !_.options.infinite
    ) {
      _.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false");
      _.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false");

      if (_.currentSlide === 0) {
        _.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true");
        _.$nextArrow
          .removeClass("slick-disabled")
          .attr("aria-disabled", "false");
      } else if (
        _.currentSlide >= _.slideCount - _.options.slidesToShow &&
        _.options.centerMode === false
      ) {
        _.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true");
        _.$prevArrow
          .removeClass("slick-disabled")
          .attr("aria-disabled", "false");
      } else if (
        _.currentSlide >= _.slideCount - 1 &&
        _.options.centerMode === true
      ) {
        _.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true");
        _.$prevArrow
          .removeClass("slick-disabled")
          .attr("aria-disabled", "false");
      }
    }
  };

  Slick.prototype.updateDots = function () {
    var _ = this;

    if (_.$dots !== null) {
      _.$dots.find("li").removeClass("slick-active").end();

      _.$dots
        .find("li")
        .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
        .addClass("slick-active");
    }
  };

  Slick.prototype.visibility = function () {
    var _ = this;

    if (_.options.autoplay) {
      if (document[_.hidden]) {
        _.interrupted = true;
      } else {
        _.interrupted = false;
      }
    }
  };

  $.fn.slick = function () {
    var _ = this,
      opt = arguments[0],
      args = Array.prototype.slice.call(arguments, 1),
      l = _.length,
      i,
      ret;
    for (i = 0; i < l; i++) {
      if (typeof opt == "object" || typeof opt == "undefined")
        _[i].slick = new Slick(_[i], opt);
      else ret = _[i].slick[opt].apply(_[i].slick, args);
      if (typeof ret != "undefined") return ret;
    }
    return _;
  };
});

// const myTabContent = document.querySelector('#myTabContent')
// if (myTabContent != null) {
//     const span1 = myTabContent.querySelectorAll('.span__1')
//     const span2 = myTabContent.querySelectorAll('.span__2')

//     span1.forEach(function(a) {
//         if (a != null) {
//             a.classList.add("discription_info");
//             a.classList.add("_anim-items");
//             a.classList.add("_anim-no-hide");
//         }
//     })
//     span2.forEach(function(a) {
//         if (a != null) {
//             a.classList.add("discription_info");
//             a.classList.add("_anim-items");
//             a.classList.add("_anim-no-hide");
//         }
//     })
// }
// const span5 = document.querySelector('.span5')
// if (span5 != null) {
//     span5.classList.add("discription_info");
//     span5.classList.add("_anim-items");
//     span5.classList.add("_anim-no-hide");
// }

// const indexProductsAnimId = document.querySelector('#scrollspy-products')
// if (indexProductsAnimId != null) {
//     const indexProductsAnimClass = indexProductsAnimId.querySelectorAll('.col_1')

//     indexProductsAnimClass.forEach(function(a) {
//         if (a != null) {
//             a.classList.add("product-category-index");
//             a.classList.add("_anim-items");
//             a.classList.add("_anim-no-hide");
//         }
//     })
// }

const footerWrapper = document.querySelector("#sidebar .side");

if (footerWrapper != null) {
  footerWrapper.innerHTML = `       
    <div class="footer_wrapper">
 <div class="footer_desc_3">
 <div class="footer_desc_1">
 <dd><a href="index.html">Главная</a></dd>
 <dd><a href="about.html">О нас</a></dd>
 <dd><a href="contact.html">Контакты</a></dd>
 <dd><a href="des.html">3D Дизайн</a></dd>
</div>
<div class="footer_desc_2">
 <dd><a href="products.html">Товары</a></dd>
 <dd><a href="services.html">Доставка и оплата</a></dd>
 <dd><a href="news.html">Новости</a></dd>
 <dd><a href="otzovik.php">Отзывы</a></dd>
</div>
 </div>
        <div class="footer_logo">
           <a href="index.html"> <dd style="margin:0"><img src="/images/logo17.png" /></dd></a>
        </div>
        <div class="footer_address">
            <div class="footer_address_one">
                <div class="foooter_address_city">
                    <a href="almaty.html">
                        <h3>
                            г. Алматы:</h3><br>ул. Мынбаева 43 
                    </a>
                </div>
                <div class="footer_address_contacts">
                    <a href="almaty.html"><b></b><br> 8 (727) 344-99-00 <br> +7 (701) 266-77-00</a>
                </div>
            </div>
            <div class="footer_address_two">
                <div class="foooter_address_city">
                    <a href="astana.html">
                        <h3>
                            г. Нур-Султан:</h3><br>ул. Бейсекбаева 24/1 
                    </a>
                </div>
                <div class="footer_address_contacts">
                    <a href="astana.html"><b></b><br> 8 (7172) 27-99-00 <br> +7 (701) 511-22-00</a>
                </div>
            </div>
            <div class="footer_address_two footer_address_three">
            <div class="foooter_address_city">
                <a href="shymkent.html">
                    <h3>
                    г. Шымкент:</h3><br>ул.
                    Мадели кожа 35/1,<br> (уг.ул. Байтурсынова) 
                </a>
            </div>
            <div class="footer_address_contacts">
                <a href="astana.html"><b></b><br>  8 (7252) 39-99-00 <br> +7 (701) 944-77-00</a>
            </div>
        </div>
        </div>
    </div>
    <div id="socialMedia" class="span3 pull-right">
    <a href="https://www.instagram.com/idiamarket/" style="margin-left:5px"><img width="40" height="40"
    src="/images/instagram.png" title="instagram" alt="instagram"></a>
    <a href="https://t.me/Raihan_106" style="margin-left:5px"><img width="40" height="40"
    src="/images/telegram.svg" title="telegram" alt="telegram"></a>
    <a  href="https://api.whatsapp.com/send/?phone=77011018388&text&app_absent=0" style="margin-left:5px"><img width="40" height="40"
    src="/images/whatsapp.svg" title="whatsapp" alt="whatsapp"></a>
    <a href="https://www.youtube.com/channel/UCNDMIviMuZOhhCP7xoxGYAA/videos" style="margin-left:5px;"><object width="40" height="40" type="image/svg+xml" data="/images/youtube.svg"></object></a>
    </div>
    <p class="footer_text">© 2010-2022 MetalGroup. Все права защищены.</p>
`;
}

// ____________________________________________________

const project_3d = document.querySelectorAll(".project_3d");
if (project_3d != null) {
  project_3d.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const aboutTitleAnim = document.querySelectorAll(".aboutTitleAnim");
if (aboutTitleAnim != null) {
  aboutTitleAnim.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}
const about_b1_wrapper = document.querySelectorAll(".about_b1_wrapper");
if (about_b1_wrapper != null) {
  about_b1_wrapper.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const about_b1_title = document.querySelectorAll(".about_b1_title");
if (about_b1_title != null) {
  about_b1_title.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const about_b2_title = document.querySelectorAll(".about_b2_title");
if (about_b2_title != null) {
  about_b2_title.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const preimuwBlockChildIndiv = document.querySelectorAll(
  ".preimuw-block-child"
);
if (preimuwBlockChildIndiv != null) {
  preimuwBlockChildIndiv.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

// ____________________________________________________

const quickresto_b_1 = document.querySelector(".quickresto_b_1");
if (quickresto_b_1 != null) {
  quickresto_b_1.classList.add("_anim-items");
  quickresto_b_1.classList.add("_anim-no-hide");
}

const customization = document.querySelector(".customization");
if (customization != null) {
  customization.classList.add("_anim-items");
  customization.classList.add("_anim-no-hide");
}

const quickresto_schema = document.querySelector(".quickresto_schema");
if (quickresto_schema != null) {
  quickresto_schema.classList.add("_anim-items");
  quickresto_schema.classList.add("_anim-no-hide");
}

const quickresto_brands = document.querySelector(".quickresto_brands");
if (quickresto_brands != null) {
  quickresto_brands.classList.add("_anim-items");
  quickresto_brands.classList.add("_anim-no-hide");
}

const shop_content = document.querySelector(".shop_content");
if (shop_content != null) {
  shop_content.classList.add("_anim-items");
  shop_content.classList.add("_anim-no-hide");
}

const quickresto_reshenie = document.querySelector(".quickresto_reshenie");
if (quickresto_reshenie != null) {
  quickresto_reshenie.classList.add("_anim-items");
  quickresto_reshenie.classList.add("_anim-no-hide");
}

const rkeeper_b1_wrapper = document.querySelector(".rkeeper_b1_wrapper");
if (rkeeper_b1_wrapper != null) {
  rkeeper_b1_wrapper.classList.add("_anim-items");
  rkeeper_b1_wrapper.classList.add("_anim-no-hide");
}

const umagDop = document.querySelector(".umagDop");
if (umagDop != null) {
  umagDop.classList.add("_anim-items");
  umagDop.classList.add("_anim-no-hide");
}

const rkeeper_b2 = document.querySelector(".rkeeper_b2");
if (rkeeper_b2 != null) {
  rkeeper_b2.classList.add("_anim-items");
  rkeeper_b2.classList.add("_anim-no-hide");
}
// const rkeeper_b3_inner = document.querySelectorAll('.rkeeper_b3_inner');
// if (rkeeper_b3_inner != null) {
//     rkeeper_b3_inner.forEach(function(a) {
//         a.classList.add('_anim-items');
//         a.classList.add('_anim-no-hide');
//     })
// }

const rkeeper_reverse = document.querySelectorAll(".rkeeper_reverse");
if (rkeeper_reverse != null) {
  rkeeper_reverse.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const rkeeper_direction = document.querySelectorAll(".rkeeper_direction");
if (rkeeper_direction != null) {
  rkeeper_direction.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const umagB1 = document.querySelectorAll(".umagB1");
if (umagB1 != null) {
  umagB1.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const umag_b2 = document.querySelectorAll(".umag_b2");
if (umag_b2 != null) {
  umag_b2.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}
const umag_b5 = document.querySelectorAll(".umag_b5");
if (umag_b5 != null) {
  umag_b5.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const rkeeper_subB1 = document.querySelectorAll(".rkeeper_subB1");
if (rkeeper_subB1 != null) {
  rkeeper_subB1.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const rkeeper_subB2 = document.querySelectorAll(".rkeeper_subB2");
if (rkeeper_subB2 != null) {
  rkeeper_subB2.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const rkeeper_subB3 = document.querySelectorAll(".rkeeper_subB3");
if (rkeeper_subB3 != null) {
  rkeeper_subB3.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const rkeeper_subB4 = document.querySelectorAll(".rkeeper_subB4");
if (rkeeper_subB4 != null) {
  rkeeper_subB4.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const rkeeper_subB5 = document.querySelectorAll(".rkeeper_subB5");
if (rkeeper_subB5 != null) {
  rkeeper_subB5.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const c1_b1 = document.querySelectorAll(".c1_b1");
if (c1_b1 != null) {
  c1_b1.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const c1_b2 = document.querySelectorAll(".c1_b2");
if (c1_b2 != null) {
  c1_b2.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const c1_b3 = document.querySelectorAll(".c1_b3");
if (c1_b3 != null) {
  c1_b3.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const c1_b4 = document.querySelectorAll(".c1_b4");
if (c1_b4 != null) {
  c1_b4.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const c1_b5 = document.querySelectorAll(".c1_b5");
if (c1_b5 != null) {
  c1_b5.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const c1_b6 = document.querySelectorAll(".c1_b6");
if (c1_b6 != null) {
  c1_b6.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const variable = document.querySelectorAll(".variable");
if (variable != null) {
  variable.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}
// const footer_logo = document.querySelectorAll(".footer_logo");
// if (footer_logo != null) {
//   footer_logo.forEach(function (a) {
//     a.classList.add("_anim-items");
//     a.classList.add("_anim-no-hide");
//   });
// }

const about_b5_list = document.querySelectorAll(".about_b5_list");
if (about_b5_list != null) {
  about_b5_list.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const aboutSlide = document.querySelectorAll(".aboutSlide");
if (aboutSlide != null) {
  aboutSlide.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const about_b5_inner_one = document.querySelectorAll(".about_b5_inner_one ");
if (about_b5_inner_one != null) {
  about_b5_inner_one.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}
const about_b5_title = document.querySelectorAll(".about_b5_title ");
if (about_b5_title != null) {
  about_b5_title.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const about_b5_content = document.querySelectorAll(".about_b5_content ");
if (about_b5_content != null) {
  about_b5_content.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const aboutB5 = document.querySelectorAll(".aboutB5");
if (aboutB5 != null) {
  aboutB5.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}
const about_b3_wrapperP = document.querySelectorAll(".about_b3_wrapper p");
if (about_b3_wrapperP != null) {
  about_b3_wrapperP.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const about_b4_title = document.querySelectorAll(".about_b4_title");
if (about_b4_title != null) {
  about_b4_title.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const about_b5_lineDown = document.querySelectorAll(".about_b5_lineDown");
if (about_b5_lineDown != null) {
  about_b5_lineDown.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const about_title = document.querySelectorAll(".about_title");
if (about_title != null) {
  about_title.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const col_md_333 = document.querySelectorAll(".product-men");
if (col_md_333 != null) {
  col_md_333.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const port_b2_content = document.querySelectorAll(".port_b2_content");
if (port_b2_content != null) {
  port_b2_content.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const zagolovok = document.querySelectorAll(".zagolovok");
if (zagolovok != null) {
  zagolovok.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const feauturedH1 = document.querySelector("#body .featured h1");
if (feauturedH1 != null) {
  feauturedH1.classList.add("_anim-items");
  feauturedH1.classList.add("_anim-no-hide");
}

const about_garant_inner = document.querySelectorAll(".about_garant_inner");
if (about_garant_inner != null) {
  about_garant_inner.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const about_garant_title = document.querySelectorAll(".about_garant_title");
if (about_garant_title != null) {
  about_garant_title.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const about_garant_content = document.querySelectorAll(".about_garant_content");
if (about_garant_content != null) {
  about_garant_content.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

// const about_delivery_innerP = document.querySelectorAll('.about_delivery_inner p');
// if (about_delivery_innerP != null) {
//     about_delivery_innerP.forEach(function(a) {
//         a.classList.add('_anim-items');
//         a.classList.add('_anim-no-hide');
//     })
// }

const about_delivery_innerH2 = document.querySelectorAll(
  ".about_delivery_inner h2"
);
if (about_delivery_innerH2 != null) {
  about_delivery_innerH2.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

const about_auto_innerH2 = document.querySelectorAll(".about_auto_inner h2");
if (about_auto_innerH2 != null) {
  about_auto_innerH2.forEach(function (a) {
    a.classList.add("_anim-items");
    a.classList.add("_anim-no-hide");
  });
}

// const about_auto_innerP = document.querySelectorAll('.about_auto_inner p');
// if (about_auto_innerP != null) {
//     about_auto_innerP.forEach(function(a) {
//         a.classList.add('_anim-items');
//         a.classList.add('_anim-no-hide');
//     })
// }

// const gggPr = document.querySelectorAll('#ggg')
// if (gggPr != null) {
//     gggPr.forEach(function(a) {
//         a.classList.add('_anim-items');
//         a.classList.add('_anim-no-hide');
//     })
// }

// const about_auto_inner = document.querySelectorAll('.about_auto_inner p');
// if (about_auto_inner != null) {
//     about_auto_inner.forEach(function(a) {
//         a.classList.add('_anim-items');
//         a.classList.add('_anim-no-hide');
//     })
// }

// const mainG = document.querySelectorAll('.main');
// if (mainG != null) {
//     mainG.forEach(function(a) {
//         a.classList.add('_anim-items');
//         a.classList.add('_anim-no-hide');
//     })
// }
// const footer_wrapper = document.querySelector('.footer_wrapper');
// if (footer_wrapper != null) {
//     footer_wrapper.classList.add('_anim-items');
//     footer_wrapper.classList.add('_anim-no-hide');
// }

const quickresto_automatization = document.querySelector(
  ".quickresto_automatization"
);
if (quickresto_automatization != null) {
  quickresto_automatization.classList.add("_anim-items");
  quickresto_automatization.classList.add("_anim-no-hide");
}

const footer_desc_1 = document.querySelector(".footer_desc_1");
const footer_desc_2 = document.querySelector(".footer_desc_2");
const footer_address = document.querySelector(".footer_address");

if (footer_desc_1 != null || footer_desc_2 || footer_address) {
  footer_desc_1.classList.add("_anim-items");
  footer_desc_1.classList.add("_anim-no-hide");
  footer_desc_2.classList.add("_anim-items");
  footer_desc_2.classList.add("_anim-no-hide");
  footer_address.classList.add("_anim-items");
  footer_address.classList.add("_anim-no-hide");
}

const content_seo = document.querySelector(".content_seo");
if (content_seo != null) {
  content_seo.classList.add("_anim-items");
  content_seo.classList.add("_anim-no-hide");
}
const deliveryPage = document.querySelectorAll(".deliveryPage");

if (deliveryPage != null) {
  deliveryPage.forEach((item) => {
    item.classList.add("_anim-items");
    item.classList.add("_anim-no-hide");
  });
}

const description_seo = document.querySelector(".description_seo");
const description_seo_ul = document.querySelectorAll(".seo_des");
if (description_seo_ul != null) {
  description_seo_ul.forEach((item) => {
    item.classList.add("_anim-items");
    item.classList.add("_anim-no-hide");
  });
}

animationScroll();

function animationScroll() {
  const animItems = document.querySelectorAll("._anim-items");

  if (animItems.length > 0) {
    window.addEventListener("scroll", animOnScroll);

    function animOnScroll(params) {
      for (let index = 0; index < animItems.length; index++) {
        const animItem = animItems[index];
        const animItemHeight = animItem.offsetHeight;
        const animItemOffset = offset(animItem).top;
        const animStart = 4;

        let animItemPoint = window.innerHeight - animItemHeight / animStart;
        if (animItemHeight > window.innerHeight) {
          animItemPoint = window.innerHeight + window.innerHeight / 2;
        }

        if (
          pageYOffset > animItemOffset - animItemPoint &&
          pageYOffset < animItemOffset + animItemHeight
        ) {
          animItem.classList.add("_active");
          // animItem.classList.add('activeGiper');
        } else {
          if (!animItem.classList.contains("_anim-no-hide")) {
            animItem.classList.remove("_active");
          }
        }
      }
    }

    function offset(el) {
      const rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
      };
    }

    setTimeout(() => {
      animOnScroll();
    }, 300);
  }
}

// $(function() {
//     $(window).scroll(function() {
//         if ($(this).scrollTop() != 0) {
//             $('#toTop').fadeIn();
//         } else {
//             $('#toTop').fadeOut();
//         }
//     });
//     $('#toTop').click(function() {
//         $('body,html').animate({ scrollTop: 0 }, 800);
//     });
// });

// $(window).on('scroll', function() {
//     var scroll = $(window).scrollTop();

//     if (scroll >= 100) {
//         $(".lineBg").addClass("scrolled_down");
//     } else {
//         $(".lineBg").removeClass("scrolled_down");
//     }
// });

// let col1Tr = document.querySelectorAll('.col-1 tr');

// let tdB = document.querySelectorAll('td b');

// if (tdB != null) {
//     if (col1Tr != null) {
//         let colStyles = window.getComputedStyle(col1Tr, ).getPropertyPriority("padding");
//         console.log(colStyles);
//         col1Tr.forEach(function(item) {
//             item.style.cssText = 'flex-direction:row;';
//         })
//     }
// }

const bodySearch = document.querySelector("#body");

const searchScript = document.createElement("script");
searchScript.src = "/js/smart-search.js";
document.querySelector("body").appendChild(searchScript);

const fontLink = document.createElement("link");
fontLink.href =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
fontLink.rel = "stylesheet";
document.querySelector("head").appendChild(fontLink);

const topNavRight = document.querySelector(".shop_content");

let check = false;

let currentLocation = window.location.pathname;

// console.log(currentLocation.length);
// console.log(currentLocation.slice(0, 7));
// console.log(window.location);
// let currentLocationAlmaty = currentLocation.slice(0, 7);
// let currentLocationNursultan = currentLocation.slice(0, 10);

// if (currentLocationNursultan) {
//   cityMain = ` <div class="cityMain">
//   <div id="trigger" class="trigger-button">
//       <i class="fa-solid fa-location-dot"></i>
//       <p> Нур-Султан</p>
//   </div>
//   <div id="content" class="contentCity">
//       <div>
//           <h2>Выберите город</h2>
//       </div>
//       <div class="contentCitySub">
//           <div class="contentCity_link ">
//               <a href="/almaty/index.html" class="location-almaty">
//               <div>
//               Алматы
//               </div>
//               </a>
//           </div>
//           <div  class="contentCity_link ">
//               <a href="/nursultan/index.html"  class="location-nursultan">
//               <div>
//               Нур-Султан
//               </div>
//               </a>
//           </div>
//           <div  class="contentCity_link ">
//               <a href="/shymkent/index.html" class="location-shymkent">
//               <div>
//               Шымкент
//               </div>
//               </a>
//           </div>
//       </div>
//   </div>
//   </div>`;
// } else if(currentLocationAlmaty) {
//   cityMain = `<div class="cityMain">
//   <div id="trigger" class="trigger-button">
//       <i class="fa-solid fa-location-dot"></i>
//       <p> Алматы</p>
//   </div>
//   <div id="content" class="contentCity">
//       <div>
//           <h2>Выберите город</h2>
//       </div>
//       <div class="contentCitySub">
//           <div class="contentCity_link ">
//               <a href="/almaty/index.html" class="location-almaty">
//               <div>
//               Алматы
//               </div>
//               </a>
//           </div>
//           <div  class="contentCity_link ">
//               <a href="/nursultan/index.html"  class="location-nursultan">
//               <div>
//               Нур-Султан
//               </div>
//               </a>
//           </div>
//           <div  class="contentCity_link ">
//               <a href="/shymkent/index.html" class="location-shymkent">
//               <div>
//               Шымкент
//               </div>
//               </a>
//           </div>
//       </div>
//   </div>
//   </div>`;
// }
// console.log(cityMain);
// console.log(currentLocationNursultan);

let cityMainGorod1 = "Город";

// let currentLocationAlmaty = currentLocation.slice(0, 18);
// let currentLocationNursultan = currentLocation.slice(0, 21);
// let currentLocationShymkent = currentLocation.slice(0, 20);
// let currentLocationDefault = currentLocation.slice(0, 11);

// let cityHref11 = window.location.href.split("/")[0].split("#")[0].split("?")[0];
// (cityHref33 = window.location.href.split("/").pop()),
//   (cityHrefNursultan1 = "nursultan");

// let cityMainGorod2 = [`${cityHref11}/${cityHrefNursultan1}/${cityHref33}`];
// console.log(cityMainGorod2.length);
// console.log([window.location.href.length]);
// if (cityMainGorod2.length == [window.location.href.length]) {
//   console.log("true");
// } else {
//   console.log("false");
// }

// if (currentLocation == currentLocationDefault) {
//   cityMainGorod1 = "Город";
// } else if (currentLocation == currentLocationAlmaty) {
//   cityMainGorod1 = "Алматы";
// } else if (currentLocation == currentLocationShymkent) {
//   cityMainGorod1 = "Шымкент";
// } else if (currentLocation == currentLocationNursultan) {
//   cityMainGorod1 = "Нур-Султан";
// } else {
//   cityMainGorod1 = "Город";
// }
let currentNurs = currentLocation.slice(0, 10);
let currentAlmaty = currentLocation.slice(0, 7);
let currentShymkent = currentLocation.slice(0, 9);


if (currentNurs == "/nursultan") {
  cityMainGorod1 = "Нур-Султан";
} else if (currentAlmaty == "/almaty") {
  cityMainGorod1 = "Алматы";
} else if (currentShymkent == "/shymkent") {
  cityMainGorod1 = "Шымкент";
}
let cityMain = `<div class="cityMain">
   <div id="trigger" class="trigger-button">
       <i class="fa-solid fa-location-dot"></i>
       <p> ${cityMainGorod1}</p>
   </div>
   <div id="content" class="contentCity">
       <div>
           <h2>Выберите город</h2>
       </div>
       <div class="contentCitySub">
           <div class="contentCity_link ">
               <a  class="location-almaty">
               <div>
               Алматы
               </div>
               </a>
           </div>
           <div  class="contentCity_link ">
               <a   class="location-nursultan">
               <div>
               Нур-Султан
               </div>
               </a>
           </div>
           <div  class="contentCity_link ">
               <a  class="location-shymkent">
               <div>
               Шымкент
               </div>
               </a>
           </div>
       </div>
   </div>
   </div>`;

const headePage = document.getElementById("header");

headePage.innerHTML = ``;
headePage.innerHTML = `
<div id="header">
<div class="container">
    <div class="header_topMenu">
        <div id="logo" class="logoPhoned">
            <div>
                <a href="index.html"><img src="/images/logo17.png" /></a>
            </div>
          ${cityMain}
        </div>
        <div class="header_topMenu_right">
            <div class="chernyi">
                <p><span style="color:#ffc843; font-weight:600">Звоните нам: </span><a
                        href="tel:87273449900">Алматы:
                        8(727) <b>344 99 00</b></a></p>
                <p> <a href="tel:87172279900">Нур-Султан: 8(7172) <b>27 99 00</b></a></p>
                <p> <a href="tel:87252399900">Шымкент: 8(7252) <b>39 99 00</b></a></p>
            </div>
        </div>
        <div class="header_MenuItems">
            <div class="headerContactArrow">
                <div class="contactAdressPage" id="accordion-1">
                    <i class="fa-solid fa-phone"></i>
                    <div class="headCatalog headCatalog_Adaptive ">
                        <div class="burger-menu">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="header_MenuSearch">
            <div class="" id="accordion-1">
                <i class="fa fa-search"></i>
                <div class="burger-menuNodeSearch">
                    <div class="burger-menuSearch">
                    </div>
                </div>
            </div>
        </div>
        <div class="burgerBlock">
            <div class="burger" data-behaviour="toggle-menu-burger"></div>
        </div>
    </div>
</div>
<div class="lineBg">
    <div id="header__menu__id" class="linehead_back">
        <div class="linehead" id="header__menu__id">
            <div class="fond cat_menu_container">
                <div id="myfond_gris" opendiv="box_2" data-behaviour="toggle-menu-bg"
                    data-element="toggle-nav-bg">
                </div>
                <div class="headBar headBarAdaptive">
                    <div class="headCatalog headCatalog_Web" data-behaviour="toggle-menu-icon">
                        <div class="burger-menu">
                            <div class="burger"></div>
                        </div>
                        <div class="headCatalogText">
                            <p>Категории товаров</p>
                        </div>
                    </div>

                    <div class="headCatalog headCatalog_Adaptive ">
                        <div class="burger-menu">
                            <div class="burger"></div>
                        </div>
                    </div>
                </div>
                <div id="box_2" class="mymagicoverbox_fenetre mymagicoverbox_fenetreWeb"
                    data-element="toggle-nav">
                    <div class="mymagicoverbox_fenetreinterieur">
                        <ul>
                            <div class="hovering-title-wrapper">
                                <div>
                                    <li class="hovering-title"><a href="#"> Каталог</a> </li>
                                </div>

                                <div data-behaviour="toggle-menu-close">
                                    <span class="hovering-title_close">×</span>
                                </div>
                            </div>
                            <section class="categories-menu-container">
                                <nav class="categories-menu">
                                    <ul class="categories-menu-list">
                                        <a class=" nav__link" href="stellazhtor.html">

                                            <li id="98" class="categories-menu-item">
                                                <!-- <span class="hoveringArrow">➜</span> -->
                                                <div class="menuMainItem">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu1.svg"></object>
                                                    </div> Торговые стеллажи <span
                                                        class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                </div>
                                                <ul class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link"
                                                        href="pristennyj-bazovyj.html">
                                                        <li id="11" class="sub-categories-menu-item ">
                                                            Торговые
                                                            стеллажи Premium </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="hleb.html">
                                                        <li id="12" class="sub-categories-menu-item ">
                                                            Хлебные
                                                            стеллажи</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="perfor.html">
                                                        <li id="13" class="sub-categories-menu-item ">
                                                            Перфорированные стеллажи</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="konfetnica.html">
                                                        <li id="14" class="sub-categories-menu-item ">
                                                            Cтеллажи
                                                            для сыпучего
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="pristennyjbazovyjultra.html">
                                                        <li id="15" class="sub-categories-menu-item ">
                                                            Торговые
                                                            стеллажи Ultra</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="pristennyjbazovyjmega.html">
                                                        <li id="16" class="sub-categories-menu-item">
                                                            Торговые
                                                            стеллажи Mega</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="pristennyjbazovyjmassiv.html">
                                                        <li id="17" class="sub-categories-menu-item ">
                                                            Торговые
                                                            стеллажи Massiv</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="stellazh_ldsp.html">
                                                        <li id="18" class="sub-categories-menu-item  ">
                                                            Стеллажи из
                                                            ЛДСП, ДСП</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="accessories.html">
                                                        <li id="19" class="sub-categories-menu-item ">
                                                            Аксессуары для стеллажей</li>
                                                    </a>
                                                </ul>
                                            </li>
                                        </a>

                                        <a class="nav__link" href="sklad.html">

                                            <li id="99" class="categories-menu-item">
                                                <div class="menuMainItem">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu2.svg"></object>
                                                    </div> Складские стеллажи <span
                                                        class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link"
                                                        href="stellazh500.html">
                                                        <li id="20" class="sub-categories-menu-item ">
                                                            Архивные стеллажи с нагрузкой до 500кг</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="stellazh900.html">
                                                        <li id="21" class="sub-categories-menu-item ">
                                                            Cкладские стеллажи с нагрузкой до 900кг</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="stellazh2200.html">
                                                        <li id="22" class="sub-categories-menu-item ">
                                                            Cкладские стеллажи до 1500кг на зацепах</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="stellazh4000.html">
                                                        <li id="23" class="sub-categories-menu-item ">
                                                            Cкладские стеллажи до 3500кг на зацепах
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="stellazh_nerjaveika.html">
                                                        <li id="24" class="sub-categories-menu-item ">
                                                            Cтеллажи из нержавейки </li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="sklad_stellazh_ldsp.html">
                                                        <li id="25" class="sub-categories-menu-item ">
                                                            Складские стеллажи из ЛДСП</li>
                                                    </a>
                                                </ul>
                                            </li>
                                        </a>
                                        <a class=" nav__link" href="pallet.html">
                                            <li id="100" class="categories-menu-item">
                                                <div class="menuMainItem menuMainItem1">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu4.svg"></object>
                                                    </div> Паллетные стеллажи <span
                                                        class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link" href="front.html">
                                                        <li id="26" class="sub-categories-menu-item ">
                                                            Фронтальные стеллажи</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="glubin.html">
                                                        <li id="27" class="sub-categories-menu-item ">
                                                            Набивные (глубинные) стеллажи </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="mezon.html">
                                                        <li id="28" class="sub-categories-menu-item ">
                                                            Мезонинные стеллажи</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="acc_pallet.html">
                                                        <li id="29" class="sub-categories-menu-item ">
                                                            Аксессуары для паллетных стеллажей
                                                        </li>
                                                    </a>
                                                </ul>
                                            </li>
                                        </a>

                                        <a class=" nav__link" href="vitrina.html">
                                            <li id="101" class="categories-menu-item">
                                                <div class="menuMainItem">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu3.svg"></object>
                                                    </div> Витрины <span class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link" href="classic.html">
                                                        <li id="30" class="sub-categories-menu-item ">
                                                            Профильные торговые витрины и прилавки</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="steklo.html">
                                                        <li id="31" class="sub-categories-menu-item ">
                                                            Стеклянные витрины островного типа</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="steklo2.html">
                                                        <li id="32" class="sub-categories-menu-item ">
                                                            Стеклянные витрины</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="pavil.html">
                                                        <li id="33" class="sub-categories-menu-item ">
                                                            Торговые павильоны
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="nostandard.html">
                                                        <li id="34" class="sub-categories-menu-item ">
                                                            Нестандартные витрины и прилавки</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="dopvitrina.html">
                                                        <li id="35" class="sub-categories-menu-item ">
                                                            Дополнительная комплектация витрин</li>
                                                    </a>
                                                </ul>
                                            </li>
                                        </a>


                                        <a class=" nav__link" href="mebel_butik.html">
                                            <li id="102" class="categories-menu-item">
                                                <div class="menuMainItem">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu5.svg"></object>
                                                    </div> Мебель для бутика и аптеки <span
                                                        class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link" href="butik.html">
                                                        <li id="36" class="sub-categories-menu-item  ">
                                                            Мебель для бутика</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="apteka.html">
                                                        <li id="37" class="sub-categories-menu-item ">
                                                            Оборудование для аптек</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="garderob.html">
                                                        <li id="38" class="sub-categories-menu-item  ">
                                                            Гардеробные системы</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="office.html">
                                                        <li id="39" class="sub-categories-menu-item ">
                                                            Офисная мебель
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="front_desk.html">
                                                        <li id="40" class="sub-categories-menu-item ">
                                                            Ресепшн, Барные стойки</li>
                                                    </a>
                                                </ul>
                                            </li>
                                        </a>

                                        <a class=" nav__link" href="obor.html">
                                            <li id="103" class="categories-menu-item">
                                                <div class="menuMainItem">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu6.svg"></object>
                                                    </div> Торговое оборудование <span
                                                        class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>

                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link" href="stellazhtor.html">
                                                        <li id="41" class="sub-categories-menu-item ">
                                                            Торговые стеллажи</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="telezhka.html">
                                                        <li id="42" class="sub-categories-menu-item ">
                                                            Покупательские тележки, корзины и турникеты</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="setchatoe.html">
                                                        <li id="43" class="sub-categories-menu-item ">
                                                            Сетчатое торговое оборудование</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="mebel_butik.html">
                                                        <li id="44" class="sub-categories-menu-item  ">
                                                            Мебель для бутика и аптеки</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="econompanel.html">
                                                        <li id="45" class="sub-categories-menu-item  ">
                                                            Экономпанели
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="garderob.html">
                                                        <li id="46" class="sub-categories-menu-item  ">
                                                            Гардеробные системы</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="joker.html">
                                                        <li id="47" class="sub-categories-menu-item  ">
                                                            Хромированные трубы и аксессуары</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="atlant.html">
                                                        <li id="48" class="sub-categories-menu-item  ">
                                                            Навесное торговое оборудование "Атлант"</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="accector.html">
                                                        <li id="49" class="sub-categories-menu-item  ">
                                                            Аксессуары для торговли</li>
                                                    </a>

                                                    <a class="categories-menu-link"
                                                        href="kassovyie_boksyi.html">
                                                        <li id="50" class="sub-categories-menu-item  ">
                                                            Кассовые боксы</li>
                                                    </a>

                                                    <a class="categories-menu-link" href="eas.html">
                                                        <li id="51" class="sub-categories-menu-item  ">
                                                            Противокражные системы</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="pos_obor.html">
                                                        <li id="52" class="sub-categories-menu-item  ">
                                                            POS оборудование</li>
                                                    </a>
                                                </ul>
                                            </li>
                                        </a>

                                        <a class=" nav__link" href="holod.html">
                                            <li id="104" class="categories-menu-item">
                                                <div class="menuMainItem">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu7.svg"></object>
                                                    </div> Холодильное оборудование <span
                                                        class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link"
                                                        href="holodilnye_shkafy.html">
                                                        <li id="53" class="sub-categories-menu-item  ">
                                                            Холодильные шкафы</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="holodilnye_vitriny.html">
                                                        <li id="54" class="sub-categories-menu-item  ">
                                                            Холодильные витрины</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="pristennye_holodilnye_vitriny.html">
                                                        <li id="55" class="sub-categories-menu-item  ">
                                                            Пристенные холодильные витрины</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="ostrovnye_holodilnye_vitriny.html">
                                                        <li id="56" class="sub-categories-menu-item  ">
                                                            Бонеты
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="morozilnye_lari.html">
                                                        <li id="57" class="sub-categories-menu-item  ">
                                                            Морозильные лари</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="konditerskie.html">
                                                        <li id="58" class="sub-categories-menu-item  ">
                                                            Кондитерские витрины</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="nastolnye_vitriny.html">
                                                        <li id="59" class="sub-categories-menu-item  ">
                                                            Настольные витрины</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="holodilnye_stoly.html">
                                                        <li id="60" class="sub-categories-menu-item  ">
                                                            Холодильные столы</li>
                                                    </a>

                                                    <a class="categories-menu-link"
                                                        href="holod_camera.html">
                                                        <li id="61" class="sub-categories-menu-item  ">
                                                            Холодильная камера</li>
                                                    </a>

                                                    <a class="categories-menu-link"
                                                        href="holod_ustanovka.html">
                                                        <li id="62" class="sub-categories-menu-item  ">
                                                            Холодильные установки</li>
                                                    </a>
                                                </ul>
                                            </li>
                                        </a>


                                        <a class=" nav__link" href="neutral.html">
                                            <li id="119" class="categories-menu-item">
                                                <div class="menuMainItem">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu8.svg"></object>
                                                    </div> Нейтральное оборудование <span
                                                        class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link"
                                                        href="stoly_nerjaveika.html">
                                                        <li id="110" class="sub-categories-menu-item  ">
                                                            Столы из нержавейки</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="poverhnost.html">
                                                        <li id="111" class="sub-categories-menu-item  ">
                                                            Поверхности рабочие</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="moika.html">
                                                        <li id="112" class="sub-categories-menu-item  ">
                                                            Мойки из нержавейки</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="stellazh_nerjaveika.html">
                                                        <li id="113" class="sub-categories-menu-item  ">
                                                            Стеллажи из нержавейки
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="polki.html">
                                                        <li id="114" class="sub-categories-menu-item  ">
                                                            Полки и подставки</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="telezhki_protivnei.html">
                                                        <li id="115" class="sub-categories-menu-item  ">
                                                            Тележки для противней</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="ventilyaciya.html">
                                                        <li id="116" class="sub-categories-menu-item  ">
                                                            Вентиляционные зонты</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="podvec.html">
                                                        <li id="117" class="sub-categories-menu-item  ">
                                                            Подвесы для туш</li>
                                                    </a>

                                                    <a class="categories-menu-link"
                                                        href="holod_prilavok.html">
                                                        <li id="118" class="sub-categories-menu-item  ">
                                                            Неохлаждаемые прилавки</li>
                                                    </a>

                                                </ul>
                                            </li>
                                        </a>



                                        <a class=" nav__link" href="pos_obor.html">
                                            <li id="106" class="categories-menu-item">
                                                <div class="menuMainItem">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu9.svg"></object>
                                                    </div> POS оборудование <span
                                                        class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link" href="pos.html">
                                                        <li id="63" class="sub-categories-menu-item  ">
                                                            POS системы</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="scanner.html">
                                                        <li id="64" class="sub-categories-menu-item  ">
                                                            Сканеры штрих кодов</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="printer.html">
                                                        <li id="65" class="sub-categories-menu-item  ">
                                                            Принтеры чеков, этикеток</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="scale.html">
                                                        <li id="66" class="sub-categories-menu-item  ">
                                                            Весы электронные
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="till.html">
                                                        <li id="67" class="sub-categories-menu-item  ">
                                                            Денежные ящики </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="terminal.html">
                                                        <li id="68" class="sub-categories-menu-item  ">
                                                            Терминалы сбора данных</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="schetchiki.html">
                                                        <li id="69" class="sub-categories-menu-item  ">
                                                            Счетчики банкнот</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="detector.html">
                                                        <li id="70" class="sub-categories-menu-item  ">
                                                            Детекторы банкнот</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="rkeeper.html">
                                                        <li id="71" class="sub-categories-menu-item  ">
                                                            Программное обеспечение R-keeper </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="1c.html">
                                                        <li id="72" class="sub-categories-menu-item  ">
                                                            Программное обеспечение 1С </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="umag.html">
                                                        <li id="73" class="sub-categories-menu-item  ">
                                                            Программное обеспечение Umag</li>
                                                    </a>

                                                </ul>
                                            </li>
                                        </a>

                                        <a class=" nav__link" href="kassovyie_boksyi.html">
                                            <li id="107" class="categories-menu-item">
                                                <div class="menuMainItem">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu10.svg"></object>
                                                    </div> Кассовые боксы <span
                                                        class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link"
                                                        href="kassovyie_boksyi9.html">
                                                        <li id="75" class="sub-categories-menu-item  ">
                                                            Кассовый бокс универсальный</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="kassovyie_boksyi10.html">
                                                        <li id="76" class="sub-categories-menu-item  ">
                                                            Кассовый бокс с глубоким накопителем</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="kassovyie_boksyi11.html">
                                                        <li id="77" class="sub-categories-menu-item  ">
                                                            Кассовый бокс с широким накопителем</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="kassovyie_boksyi12.html">
                                                        <li id="78" class="sub-categories-menu-item  ">
                                                            Кассовый бокс с транспортером
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="kassovyie_boksyi13.html">
                                                        <li id="79" class="sub-categories-menu-item  ">
                                                            Кассовый бокс с удлиненным транспортером</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="kassovyie_boksyi14.html">
                                                        <li id="80" class="sub-categories-menu-item  ">
                                                            Кассовый бокс с денежным ящиком</li>
                                                    </a>
                                                </ul>
                                            </li>
                                        </a>

                                        <a class=" nav__link" href="met_shkaf.html">

                                            <li id="1077" class="categories-menu-item">
                                                <div class="menuMainItem">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu11.svg"></object>
                                                    </div> Металлические шкафы <span
                                                        class="navArrow navArrow1"><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link"
                                                        href="shkaf_odejda.html">
                                                        <li id="81" class="sub-categories-menu-item  ">
                                                            Металлические шкафы для одежды</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="shkaf_doc.html">
                                                        <li id="82" class="sub-categories-menu-item  ">
                                                            Металлические шкафы для документов</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="shkaf_buh.html">
                                                        <li id="83" class="sub-categories-menu-item  ">
                                                            Бухгалтерские шкафы</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="shkaf_kart.html">
                                                        <li id="84" class="sub-categories-menu-item  ">
                                                            Картотечные шкафы
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="shkaf_med.html">
                                                        <li id="85" class="sub-categories-menu-item  ">
                                                            Металлические медицинские шкафы </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="shkaf_sum.html">
                                                        <li id="86" class="sub-categories-menu-item  ">
                                                            Шкафы для сумок (сумочницы)</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="pochta_yachik.html">
                                                        <li id="87" class="sub-categories-menu-item  ">
                                                            Почтовые ящики, ключницы </li>
                                                    </a>
                                                    <a class="categories-menu-link" href="verstak.html">
                                                        <li id="88" class="sub-categories-menu-item  ">
                                                            Верстаки и аксессуары</li>
                                                    </a>
                                                </ul>
                                            </li>
                                        </a>
                                        <a class=" nav__link" href="horest.html">
                                            <li id="108" class="categories-menu-item">

                                                <div class="menuMainItem" style="height:35px;">
                                                    <p class="hovering hoveringCat">
                                                    <div class="iconMenuItem">
                                                        <object type="image/svg+xml"
                                                            data="/images/icon/iconMenu12.svg"
                                                            style="width:26px; margin-left: 3px;"></object>
                                                    </div>Профессиональное кухонное <span
                                                        class="navArrow navArrow1" style=""><img
                                                            src="/images/icon/right-arrow.png"
                                                            alt="Стрелка на право"></span>
                                                    </p>
                                                    <span class="navArrow navArrow2"><img
                                                            src="/images/icon/right-arrow2.png"
                                                            alt="Стрелка на право"></span>
                                                </div>
                                                <ul id="10" class="categories-menu-list-displaynone">
                                                    <a class="categories-menu-link" href="teplovoe.html">
                                                        <li id="89" class="sub-categories-menu-item  ">
                                                            Тепловое оборудование</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="salat_bary.html">
                                                        <li id="90" class="sub-categories-menu-item  ">
                                                            Салат бары</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="linii_razdachi.html">
                                                        <li id="91" class="sub-categories-menu-item  ">
                                                            Линии раздачи</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="gastroemkosti.html">
                                                        <li id="92" class="sub-categories-menu-item  ">
                                                            Гастроемкости
                                                        </li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="combi_steamer.html">
                                                        <li id="93" class="sub-categories-menu-item  ">
                                                            Пароконвектоматы</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="mixer.html">
                                                        <li id="94" class="sub-categories-menu-item  ">
                                                            Миксеры, блендеры</li>
                                                    </a>
                                                    <a class="categories-menu-link"
                                                        href="kipyatilniki.html">
                                                        <li id="95" class="sub-categories-menu-item  ">
                                                            Кипятильники</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="gril.html">
                                                        <li id="96" class="sub-categories-menu-item  ">
                                                            Установки для "Шаурма", Грили для кур</li>
                                                    </a>
                                                    <a class="categories-menu-link" href="neutral.html">
                                                        <li id="97" class="sub-categories-menu-item  ">
                                                            Нейтральное оборудование</li>
                                                    </a>
                                                </ul>
                                            </li>
                                        </a>
                                    </ul>
                                </nav>
                                <div class="categories-menu-details">
                                    <div class="categories-menu-details-right">
                                        <div class="categories-menu-detail-img-active">
                                            <div class="categoriesPhoto">
                                                <div class="sub-img-active">
                                                    <img id="" src="" alt="">
                                                </div>
                                            </div>
                                            <div class="category-images-display-none">
                                                <img id="11" src="/images/torg.png" alt="">
                                                <img id="12" src="/images/13.png" alt="">
                                                <img id="13" src="/images/14.png" alt="">
                                                <img id="14" src="/images/15.png" alt="">
                                                <img id="15" src="/images/opt.png" alt="">
                                                <img id="16" src="/images/mgvs.png" alt="">
                                                <img id="17" src="/images/mnvs.png" alt="">
                                                <img id="18" src="/images/ldcp.png" alt="">
                                                <img id="19" src="/images/33.png" alt="">
                                                <img id="20" src="/images/sklad_500_1.png" alt="">
                                                <img id="21" src="/images/sklad_900_1.png" alt="">
                                                <img id="22" src="/images/sklad_2200.png" alt="">
                                                <img id="23" src="/images/sklad_4000.png" alt="">
                                                <img id="24" src="/images/sklad_nerjaveika.png" alt="">
                                                <img id="25" src="/images/ldsp.png" alt="">
                                                <img id="26" src="/images/pallet1.png" alt="">
                                                <img id="27" src="/images/pallet2.png" alt="">
                                                <img id="28" src="/images/pallet3.png" alt="">
                                                <img id="29" src="/images/pallet4.png" alt="">
                                                <img id="30" src="/images/100.png" alt="">
                                                <img id="31" src="/images/105.png" alt="">
                                                <img id="32" src="/images/104.png" alt="">
                                                <img id="33" src="/images/101.png" alt="">
                                                <img id="34" src="/images/102.png" alt="">
                                                <img id="35" src="/images/103.png" alt="">
                                                <img id="36" src="/images/odejda.png" alt="">
                                                <img id="37" src="/images/apteka.png" alt="">
                                                <img id="38" src="/images/garderob.png" alt="">
                                                <img id="39" src="/images/office.png" alt="">
                                                <img id="40" src="/images/front_desk.png" alt="">
                                                <img id="41" src="/images/tor11.png" alt="">
                                                <img id="42" src="/images/telezhka.png" alt="">
                                                <img id="43" src="/images/setchatoe.png" alt="">
                                                <img id="44" src="/images/pharmacy1.png" alt="">
                                                <img id="45" src="/images/4.png" alt="">
                                                <img id="46" src="/images/garderob.png" alt="">
                                                <img id="47" src="/images/joker.png" alt="">
                                                <img id="48" src="/images/atlant.png" alt="">
                                                <img id="49" src="/images/accec.png" alt="">
                                                <img id="50" src="/images/kass.png" alt="">
                                                <img id="51" src="/images/eas.png" alt="">
                                                <img id="52" src="/images/poss.png" alt="">
                                                <img id="53" src="/images/thumbs/holod/1.png" alt="">
                                                <img id="54" src="/images/thumbs/holod/2.png" alt="">
                                                <img id="55" src="/images/thumbs/holod/3.png" alt="">
                                                <img id="56" src="/images/thumbs/holod/4.png" alt="">
                                                <img id="57" src="/images/thumbs/holod/5.png" alt="">
                                                <img id="58" src="/images/thumbs/holod/6.png" alt="">
                                                <img id="59" src="/images/thumbs/holod/7.png" alt="">
                                                <img id="60" src="/images/thumbs/holod/8.png" alt="">
                                                <img id="61" src="/images/thumbs/holod/10.png" alt="">
                                                <img id="62" src="/images/thumbs/holod/11.png" alt="">
                                                <img id="63" src="/images/pos.png" alt="">
                                                <img id="64" src="/images/scanner.png" alt="">
                                                <img id="65" src="/images/printer.png" alt="">
                                                <img id="66" src="/images/scale.png" alt="">
                                                <img id="67" src="/images/till.png" alt="">
                                                <img id="68" src="/images/terminal.png" alt="">
                                                <img id="69" src="/images/schetchiki.png" alt="">
                                                <img id="70" src="/images/detector.png" alt="">
                                                <img id="71" src="/images/rkeep.png" alt="">
                                                <img id="72" src="/images/1c.png" alt="">
                                                <img id="73" src="/images/umag.png" alt="">
                                                <img id="74" src="/images/quickresto.svg" alt="">
                                                <img id="75" src="/images/fulls/kas/shtrih55.png" alt="">
                                                <img id="76" src="/images/fulls/kas/shtrih22.png" alt="">
                                                <img id="77" src="/images/fulls/kas/shtrih33.png" alt="">
                                                <img id="78" src="/images/fulls/kas/shtrih44.png" alt="">
                                                <img id="79" src="/images/fulls/kas/shtrih55.png" alt="">
                                                <img id="80" src="/images/fulls/kas/shtrih66.png" alt="">
                                                <img id="81" src="/images/5.png" alt="">
                                                <img id="82" src="/images/2.png" alt="">
                                                <img id="83" src="/images/6.png" alt="">
                                                <img id="84" src="/images/10.png" alt="">
                                                <img id="85" src="/images/medical.png" alt="">
                                                <img id="86" src="/images/8.png" alt="">
                                                <img id="87" src="/images/pochta.png" alt="">
                                                <img id="88" src="/images/9.png" alt="">
                                                <img id="89" src="/images/thumbs/horest/1.png" alt="">
                                                <img id="90" src="/images/thumbs/horest/2.png" alt="">
                                                <img id="91" src="/images/thumbs/horest/3.png" alt="">
                                                <img id="92" src="/images/thumbs/horest/4.png" alt="">
                                                <img id="93" src="/images/thumbs/horest/parokonvektomat.png"
                                                    alt="">
                                                <img id="94" src="/images/thumbs/horest/5.png" alt="">
                                                <img id="95" src="/images/thumbs/horest/6.png" alt="">
                                                <img id="96" src="/images/thumbs/horest/7.png" alt="">
                                                <img id="97" src="/images/thumbs/horest/8.png" alt="">
                                                <img id="98" src="/images/tor1.png" alt="">
                                                <img id="99" src="/images/stellazh 1.png" alt="">
                                                <img id="100" src="/images/pallet.png" alt="">
                                                <img id="101" src="/images/vit.png" alt="">
                                                <img id="102" src="/images/pharmacy.png" alt="">
                                                <img id="103" src="/images/1.png" alt="">
                                                <img id="104" src="/images/12.png" alt="">
                                                <img id="105" src="/images/neutral.png" alt="">
                                                <img id="106" src="/images/poss.png" alt="">
                                                <img id="107" src="/images/kas.png" alt="">
                                                <img id="1077" src="/images/7.png" alt="">
                                                <!-- <img id="108" src="/images/7.png" alt=""> -->
                                                <img id="108" src="/images/16.png" alt="">

                                                <img id="110" src="/images/thumbs/neutral/1.png" alt="">
                                                <img id="111" src="/images/thumbs/horest/poverh.png" alt="">
                                                <img id="112" src="/images/thumbs/neutral/2.png" alt="">
                                                <img id="113" src="/images/thumbs/neutral/3.png" alt="">
                                                <img id="114" src="/images/thumbs/neutral/4.png" alt="">
                                                <img id="115" src="/images/thumbs/neutral/5.png" alt="">
                                                <img id="116" src="/images/thumbs/neutral/6.png" alt="">
                                                <img id="117" src="/images/thumbs/neutral/7.png" alt="">
                                                <img id="118" src="/images/thumbs/holod/9.png" alt="">
                                                <img id="119" src="/images/neutral.png" alt="">



                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </ul>
                    </div>
                </div>
                <div class="menuBurgerPage">

                    <div id="box_2" class="mymagicoverbox_fenetre mymagicoverbox_fenetreAdaptive"
                        data-element="toggle-nav-burger">
                        <div class="mymagicoverbox_fenetreinterieur">
                            <ul>
                                <div class="hovering-title-wrapper">
                                    <div>
                                        <li class="hovering-title"><a href="#">Меню</a> </li>
                                    </div>

                                    <div data-behaviour="toggle-menu-close">
                                        <span class="hovering-title_close">×</span>
                                    </div>
                                </div>
                                <section class="categories-menu-container">
                                    <nav class="categories-menu">
                                        <ul class="categories-menu-list">
                                            <a class=" nav__link" href="index.html">
                                                <li id="98" class="categories-menu-item">
                                                    <!-- <span class="hoveringArrow">➜</span> -->
                                                    <div class="menuMainItem">
                                                        <p class="hovering hoveringCat">
                                                        <div class="iconMenuItem iconMenuItem1">
                                                            <object type="image/svg+xml"
                                                                data="/images/icon/iconMenuAd1.svg"></object>
                                                        </div> Главная <span class="navArrow navArrow1"><img
                                                                src="/images/icon/right-arrow.png"
                                                                alt="Стрелка на право"></span>
                                                        <span class="navArrow navArrow2"><img
                                                                src="/images/icon/right-arrow2.png"
                                                                alt="Стрелка на право"></span>
                                                        </p>
                                                    </div>
                                                    <ul id="10" class="categories-menu-list-displaynone">
                                                        <a class="categories-menu-link" href="pos.html">
                                                            <li id="63" class="sub-categories-menu-item  ">
                                                                POS системы</li>
                                                        </a>
                                                    </ul>
                                                </li>
                                            </a>

                                            <a class="nav__link" href="products.html">

                                                <li id="99" class="categories-menu-item">
                                                    <div class="menuMainItem">
                                                        <p class="hovering hoveringCat">
                                                        <div class="iconMenuItem iconMenuItem2">
                                                            <object type="image/svg+xml"
                                                                data="/images/icon/iconMenuAd2.svg"></object>
                                                        </div> Товары <span class="navArrow navArrow1"><img
                                                                src="/images/icon/right-arrow.png"
                                                                alt="Стрелка на право"></span>
                                                        </p>
                                                        <span class="navArrow navArrow2"><img
                                                                src="/images/icon/right-arrow2.png"
                                                                alt="Стрелка на право"></span>
                                                    </div>
                                                    <ul id="10" class="categories-menu-list-displaynone">
                                                        <a class="categories-menu-link" href="pos.html">
                                                            <li id="63" class="sub-categories-menu-item  ">
                                                                POS системы</li>
                                                        </a>
                                                    </ul>
                                                </li>
                                            </a>

                                            <a class="nav__link" href="news.html">
                                                <li id="100" class="categories-menu-item">
                                                    <div class="menuMainItem menuMainItem1">
                                                        <p class="hovering hoveringCat">
                                                        <div class="iconMenuItem iconMenuItem3 ">
                                                            <object type="image/svg+xml"
                                                                data="/images/icon/iconMenuAd3.svg"></object>
                                                        </div> Проекты <span class="navArrow navArrow1"><img
                                                                src="/images/icon/right-arrow.png"
                                                                alt="Стрелка на право"></span>
                                                        </p>
                                                        <span class="navArrow navArrow2"><img
                                                                src="/images/icon/right-arrow2.png"
                                                                alt="Стрелка на право"></span>
                                                    </div>
                                                    <ul id="10" class="categories-menu-list-displaynone">
                                                        <a class="categories-menu-link" href="pos.html">
                                                            <li id="63" class="sub-categories-menu-item  ">
                                                                POS системы</li>
                                                        </a>
                                                    </ul>
                                                </li>
                                            </a>
                                            <a class="nav__link" href="des.html">
                                                <li id="101" class="categories-menu-item">
                                                    <div class="menuMainItem">
                                                        <p class="hovering hoveringCat">
                                                        <div class="iconMenuItem iconMenuItem4">
                                                            <object type="image/svg+xml"
                                                                data="/images/icon/iconMenuAd4.svg"></object>
                                                        </div> 3D Дизайн <span
                                                            class="navArrow navArrow1"><img
                                                                src="/images/icon/right-arrow.png"
                                                                alt="Стрелка на право"></span>
                                                        </p>
                                                        <span class="navArrow navArrow2"><img
                                                                src="/images/icon/right-arrow2.png"
                                                                alt="Стрелка на право"></span>
                                                    </div>
                                                    <ul id="10" class="categories-menu-list-displaynone">
                                                        <a class="categories-menu-link" href="pos.html">
                                                            <li id="63" class="sub-categories-menu-item  ">
                                                                POS системы</li>
                                                        </a>
                                                    </ul>
                                                </li>
                                            </a>
                                            <a class="nav__link" href="services.html">
                                                <li id="102" class="categories-menu-item">
                                                    <div class="menuMainItem">
                                                        <p class="hovering hoveringCat">
                                                        <div class="iconMenuItem iconMenuItem5">
                                                            <object type="image/svg+xml"
                                                                data="/images/icon/iconMenuAd5.svg"></object>
                                                        </div> Доставка <span
                                                            class="navArrow navArrow1"><img
                                                                src="/images/icon/right-arrow.png"
                                                                alt="Стрелка на право"></span>
                                                        </p>
                                                        <span class="navArrow navArrow2"><img
                                                                src="/images/icon/right-arrow2.png"
                                                                alt="Стрелка на право"></span>
                                                    </div>
                                                    <ul id="10" class="categories-menu-list-displaynone">
                                                        <a class="categories-menu-link" href="pos.html">
                                                            <li id="63" class="sub-categories-menu-item  ">
                                                                POS системы</li>
                                                        </a>
                                                    </ul>
                                                </li>
                                            </a>
                                            <a class="nav__link" href="otzovik.php">
                                                <li id="103" class="categories-menu-item">
                                                    <div class="menuMainItem">
                                                        <p class="hovering hoveringCat">
                                                        <div class="iconMenuItem iconMenuItem6">
                                                            <object type="image/svg+xml"
                                                                data="/images/icon/iconMenuAd6.svg"></object>
                                                        </div> Отзывы <span class="navArrow navArrow1"><img
                                                                src="/images/icon/right-arrow.png"
                                                                alt="Стрелка на право"></span>
                                                        <span class="navArrow navArrow2"><img
                                                                src="/images/icon/right-arrow2.png"
                                                                alt="Стрелка на право"></span>
                                                        </p>
                                                    </div>
                                                    <ul id="10" class="categories-menu-list-displaynone">
                                                        <a class="categories-menu-link" href="pos.html">
                                                            <li id="63" class="sub-categories-menu-item  ">
                                                                POS системы</li>
                                                        </a>
                                                    </ul>
                                                </li>
                                            </a>
                                            <a class="nav__link" href="about.html">
                                                <li id="104" class="categories-menu-item">
                                                    <div class="menuMainItem">
                                                        <p class="hovering hoveringCat">
                                                        <div class="iconMenuItem iconMenuItem7">
                                                            <object type="image/svg+xml"
                                                                data="/images/icon/iconMenuAd7.svg"></object>
                                                        </div> О нас <span class="navArrow navArrow1"><img
                                                                src="/images/icon/right-arrow.png"
                                                                alt="Стрелка на право"></span>
                                                        </p>
                                                        <span class="navArrow navArrow2"><img
                                                                src="/images/icon/right-arrow2.png"
                                                                alt="Стрелка на право"></span>
                                                    </div>
                                                    <ul id="10" class="categories-menu-list-displaynone">
                                                        <a class="categories-menu-link" href="pos.html">
                                                            <li id="63" class="sub-categories-menu-item  ">
                                                                POS системы</li>
                                                        </a>
                                                    </ul>
                                                </li>
                                            </a>
                                            <a class="nav__link" href="dealer.html">
                                                <li id="119" class="categories-menu-item">
                                                    <div class="menuMainItem">
                                                        <p class="hovering hoveringCat">
                                                        <div class="iconMenuItem iconMenuItem8">
                                                            <object type="image/svg+xml"
                                                                data="/images/icon/iconMenuAd8.svg"></object>
                                                        </div> Дилерам <span class="navArrow navArrow1"><img
                                                                src="/images/icon/right-arrow.png"
                                                                alt="Стрелка на право"></span>
                                                        </p>
                                                        <span class="navArrow navArrow2"><img
                                                                src="/images/icon/right-arrow2.png"
                                                                alt="Стрелка на право"></span>
                                                    </div>
                                                    <ul id="10" class="categories-menu-list-displaynone">
                                                        <a class="categories-menu-link" href="pos.html">
                                                            <li id="63" class="sub-categories-menu-item  ">
                                                                POS системы</li>
                                                        </a>
                                                    </ul>
                                                </li>
                                            </a>
                                            <a class="nav__link" href="contact.html">
                                                <li id="106" class="categories-menu-item">
                                                    <div class="menuMainItem">
                                                        <p class="hovering hoveringCat">
                                                        <div class="iconMenuItem">
                                                            <i class="fa-solid fa-phone"></i>
                                                        </div> Контакты <span
                                                            class="navArrow navArrow1"><img
                                                                src="/images/icon/right-arrow.png"
                                                                alt="Стрелка на право"></span>
                                                        </p>
                                                        <span class="navArrow navArrow2"><img
                                                                src="/images/icon/right-arrow2.png"
                                                                alt="Стрелка на право"></span>
                                                    </div>
                                                    <ul id="10" class="categories-menu-list-displaynone">
                                                        <a class="categories-menu-link" href="pos.html">
                                                            <li id="63" class="sub-categories-menu-item  ">
                                                                POS системы</li>
                                                        </a>
                                                    </ul>
                                                </li>
                                            </a>
                                        </ul>
                                    </nav>
                                    <div class="categories-menu-details">
                                        <div class="categories-menu-details-right">
                                            <div class="categories-menu-detail-img-active">
                                                <div class="categoriesPhoto">
                                                    <div class="sub-img-active">
                                                        <img id="" src="" alt="">
                                                    </div>
                                                </div>
                                                <div class="category-images-display-none">
                                                    <img id="11" src="/images/torg.png" alt="">
                                                    <img id="12" src="/images/13.png" alt="">
                                                    <img id="13" src="/images/14.png" alt="">
                                                    <img id="14" src="/images/15.png" alt="">
                                                    <img id="15" src="/images/opt.png" alt="">
                                                    <img id="16" src="/images/mgvs.png" alt="">
                                                    <img id="17" src="/images/mnvs.png" alt="">
                                                    <img id="18" src="/images/ldcp.png" alt="">
                                                    <img id="19" src="/images/33.png" alt="">
                                                    <img id="20" src="/images/sklad_500_1.png" alt="">
                                                    <img id="21" src="/images/sklad_900_1.png" alt="">
                                                    <img id="22" src="/images/sklad_2200.png" alt="">
                                                    <img id="23" src="/images/sklad_4000.png" alt="">
                                                    <img id="24" src="/images/sklad_nerjaveika.png" alt="">
                                                    <img id="25" src="/images/ldsp.png" alt="">
                                                    <img id="26" src="/images/pallet1.png" alt="">
                                                    <img id="27" src="/images/pallet2.png" alt="">
                                                    <img id="28" src="/images/pallet3.png" alt="">
                                                    <img id="29" src="/images/pallet4.png" alt="">
                                                    <img id="30" src="/images/100.png" alt="">
                                                    <img id="31" src="/images/105.png" alt="">
                                                    <img id="32" src="/images/104.png" alt="">
                                                    <img id="33" src="/images/101.png" alt="">
                                                    <img id="34" src="/images/102.png" alt="">
                                                    <img id="35" src="/images/103.png" alt="">
                                                    <img id="36" src="/images/odejda.png" alt="">
                                                    <img id="37" src="/images/apteka.png" alt="">
                                                    <img id="38" src="/images/garderob.png" alt="">
                                                    <img id="39" src="/images/office.png" alt="">
                                                    <img id="40" src="/images/front_desk.png" alt="">
                                                    <img id="41" src="/images/tor11.png" alt="">
                                                    <img id="42" src="/images/telezhka.png" alt="">
                                                    <img id="43" src="/images/setchatoe.png" alt="">
                                                    <img id="44" src="/images/pharmacy1.png" alt="">
                                                    <img id="45" src="/images/4.png" alt="">
                                                    <img id="46" src="/images/garderob.png" alt="">
                                                    <img id="47" src="/images/joker.png" alt="">
                                                    <img id="48" src="/images/atlant.png" alt="">
                                                    <img id="49" src="/images/accec.png" alt="">
                                                    <img id="50" src="/images/kass.png" alt="">
                                                    <img id="51" src="/images/eas.png" alt="">
                                                    <img id="52" src="/images/poss.png" alt="">
                                                    <img id="53" src="/images/thumbs/holod/1.png" alt="">
                                                    <img id="54" src="/images/thumbs/holod/2.png" alt="">
                                                    <img id="55" src="/images/thumbs/holod/3.png" alt="">
                                                    <img id="56" src="/images/thumbs/holod/4.png" alt="">
                                                    <img id="57" src="/images/thumbs/holod/5.png" alt="">
                                                    <img id="58" src="/images/thumbs/holod/6.png" alt="">
                                                    <img id="59" src="/images/thumbs/holod/7.png" alt="">
                                                    <img id="60" src="/images/thumbs/holod/8.png" alt="">
                                                    <img id="61" src="/images/thumbs/holod/10.png" alt="">
                                                    <img id="62" src="/images/thumbs/holod/11.png" alt="">
                                                    <img id="63" src="/images/pos.png" alt="">
                                                    <img id="64" src="/images/scanner.png" alt="">
                                                    <img id="65" src="/images/printer.png" alt="">
                                                    <img id="66" src="/images/scale.png" alt="">
                                                    <img id="67" src="/images/till.png" alt="">
                                                    <img id="68" src="/images/terminal.png" alt="">
                                                    <img id="69" src="/images/schetchiki.png" alt="">
                                                    <img id="70" src="/images/detector.png" alt="">
                                                    <img id="71" src="/images/rkeep.png" alt="">
                                                    <img id="72" src="/images/1c.png" alt="">
                                                    <img id="73" src="/images/umag.png" alt="">
                                                    <img id="74" src="/images/quickresto.svg" alt="">
                                                    <img id="75" src="/images/fulls/kas/shtrih55.png" alt="">
                                                    <img id="76" src="/images/fulls/kas/shtrih22.png" alt="">
                                                    <img id="77" src="/images/fulls/kas/shtrih33.png" alt="">
                                                    <img id="78" src="/images/fulls/kas/shtrih44.png" alt="">
                                                    <img id="79" src="/images/fulls/kas/shtrih55.png" alt="">
                                                    <img id="80" src="/images/fulls/kas/shtrih66.png" alt="">
                                                    <img id="81" src="/images/5.png" alt="">
                                                    <img id="82" src="/images/2.png" alt="">
                                                    <img id="83" src="/images/6.png" alt="">
                                                    <img id="84" src="/images/10.png" alt="">
                                                    <img id="85" src="/images/medical.png" alt="">
                                                    <img id="86" src="/images/8.png" alt="">
                                                    <img id="87" src="/images/pochta.png" alt="">
                                                    <img id="88" src="/images/9.png" alt="">
                                                    <img id="89" src="/images/thumbs/horest/1.png" alt="">
                                                    <img id="90" src="/images/thumbs/horest/2.png" alt="">
                                                    <img id="91" src="/images/thumbs/horest/3.png" alt="">
                                                    <img id="92" src="/images/thumbs/horest/4.png" alt="">
                                                    <img id="93"
                                                        src="/images/thumbs/horest/parokonvektomat.png"
                                                        alt="">
                                                    <img id="94" src="/images/thumbs/horest/5.png" alt="">
                                                    <img id="95" src="/images/thumbs/horest/6.png" alt="">
                                                    <img id="96" src="/images/thumbs/horest/7.png" alt="">
                                                    <img id="97" src="/images/thumbs/horest/8.png" alt="">
                                                    <img id="98" src="/images/tor1.png" alt="">
                                                    <img id="99" src="/images/stellazh 1.png" alt="">
                                                    <img id="100" src="/images/pallet.png" alt="">
                                                    <img id="101" src="/images/vit.png" alt="">
                                                    <img id="102" src="/images/pharmacy.png" alt="">
                                                    <img id="103" src="/images/1.png" alt="">
                                                    <img id="104" src="/images/12.png" alt="">
                                                    <img id="105" src="/images/neutral.png" alt="">
                                                    <img id="106" src="/images/poss.png" alt="">
                                                    <img id="107" src="/images/kas.png" alt="">
                                                    <img id="1077" src="/images/7.png" alt="">
                                                    <!-- <img id="108" src="/images/7.png" alt=""> -->
                                                    <img id="108" src="/images/16.png" alt="">

                                                    <img id="110" src="/images/thumbs/neutral/1.png" alt="">
                                                    <img id="111" src="/images/thumbs/horest/poverh.png"
                                                        alt="">
                                                    <img id="112" src="/images/thumbs/neutral/2.png" alt="">
                                                    <img id="113" src="/images/thumbs/neutral/3.png" alt="">
                                                    <img id="114" src="/images/thumbs/neutral/4.png" alt="">
                                                    <img id="115" src="/images/thumbs/neutral/5.png" alt="">
                                                    <img id="116" src="/images/thumbs/neutral/6.png" alt="">
                                                    <img id="117" src="/images/thumbs/neutral/7.png" alt="">
                                                    <img id="118" src="/images/thumbs/holod/9.png" alt="">
                                                    <img id="119" src="/images/neutral.png" alt="">



                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                            </ul>
                        </div>
                    </div>
                </div>

            </div>

            <div class="menu_lists  navigation">

                <ul class="menu">
                    <li class=" glavnaya_menu btn-15">
                        <a href="index.html" class="menuAdaptiveLink">
                            <div class="menuAdaptiveImg menuAdaptiveImgNoActive1">
                                <object type="image/svg+xml" data="/images/home1-1.svg"></object>
                            </div>
                            <div class="menuAdaptiveImg menuAdaptiveImgActive1">
                                <object type="image/svg+xml" data="/images/home1-2.svg"></object>
                            </div>
                            <div class="menuAdaptiveImg menuAdaptiveImgActive1-3">
                                <object type="image/svg+xml" data="/images/home1-3.svg"></object>
                            </div>
                            <span>Главная</span>
                        </a>
                    </li>
                    <li class="tovary_menu btn-15" data-behaviour="toggle-menu-icon">

                        <div class="menuAdaptiveImg menuAdaptiveImgNoActive2">
                            <object type="image/svg+xml" data="/images/otzov1-1.svg"></object>
                        </div>
                        <div class="menuAdaptiveImg menuAdaptiveImgActive2">
                            <object type="image/svg+xml" data="/images/otzov1-2.svg"></object>
                        </div>
                        </svg>
                        <div class="menuAdaptiveImg menuAdaptiveImgActive2-3">
                            <object type="image/svg+xml" data="/images/product3.svg"></object>
                        </div>
                        <div class="menuAdaptiveClass menuAdaptiveLink">
                            <p>Товары</p><span class="menuAdaptiveClassSpan">Товары</span>
                        </div>

                    </li>
                    <li class="news_menu">
                        <a href="news.html"><span>Проекты</span></a>
                    </li>
                    <li class="design_menu"><a href="des.html"><span>3D Дизайн</span></a></li>
                    <li class="dostavka_menu">
                        <a href="services.html"><span>Доставка</span></a>
                    </li>
                    <li class="otzyvy_menu">
                        <a href="otzovik.php" class="menuAdaptiveLink ">
                            <div class="menuAdaptiveImg menuAdaptiveImgNoActive3">
                                <object type="image/svg+xml" data="/images/product2-1.svg"></object>
                            </div>
                            <div class="menuAdaptiveImg menuAdaptiveImgActive3">
                                <object type="image/svg+xml" data="/images/product2-2.svg"></object>
                            </div>
                            <div class="menuAdaptiveImg menuAdaptiveImgActive3-3">
                                <object type="image/svg+xml" data="/images/otzov4.svg"></object>
                            </div>
                            <span>Отзывы</span>
                        </a>

                    </li>
                    <li class="about_menu">
                        <a href="about.html" class="menuAdaptiveLink ">
                            <div class="menuAdaptiveImg menuAdaptiveImgNoActive4">
                                <object type="image/svg+xml" data="/images/about4-1.svg"></object>
                            </div>

                            <div class="menuAdaptiveImg menuAdaptiveImgActive4">
                                <object type="image/svg+xml" data="/images/about4-2.svg"></object>
                            </div>
                            <div class="menuAdaptiveImg menuAdaptiveImgActive4-3">
                                <object type="image/svg+xml" data="/images/about5.svg"></object>
                            </div>
                            <span>О нас</span>
                        </a>
                    </li>
                    <li class="dealer_menu"><a href="dealer.html"><span>Дилерам</span></a></li>
                    <li class="contact_menu">
                        <a href="contact.html" class="menuAdaptiveLink">
                            <div class="menuAdaptiveImg menuAdaptiveImgNoActive5">
                                <i class="fa-solid fa-phone"></i>
                            </div>
                            <div class="menuAdaptiveImg menuAdaptiveImgActive5">
                                <i class="fa-solid fa-phone"></i>
                            </div>
                            <div class="menuAdaptiveImg menuAdaptiveImgActive5-3">
                                <i class="fa-solid fa-phone"></i>
                            </div>
                            <span>Контакты</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>

<div class="burgerHeadMenu">
    <div class="burgerBackgroundClose"></div>
    <div class="barMenu">
        <div class="barMenuContactHeader">
            <div class="barMenuContactHeader_title">
                <p>Контакты</p>
            </div>
            <div class="barMenuContactHeader_close">
                <div class="burger-menu menu-on">
                </div>×
            </div>
        </div>
        <div class="barMenuBlockItem">
            <div>
                <span class="barMenuItem">
                    <p class="burgerMenuDesc"><a href="almaty.html">г. Алматы:</a></p>
                    <a href="tel:87273449900">8 (727) 344 99 00 </a>
                    <a href="tel:87018837700">+7 701 883 77 00</a>
                </span>
            </div>
            <div class="barMenuItemIcon"><i class="fa-solid fa-phone"></i></div>
        </div>
        <div class="barMenuBlockItem">
            <div>
                <span class="barMenuItem ">
                    <p class="burgerMenuDesc"><a href="astana.html">г. Нур-Султан:</a></p>
                    <a href="tel:87172279900"> 8 (7172) 27-99-00 </a>
                    <a href="tel:87015112200">+7 (701) 511-22-00</a>
                </span>
            </div>
            <div class="barMenuItemIcon barMenuItemIcon2"><i class="fa-solid fa-phone"></i></div>
        </div>
        <div class="barMenuBlockItem">
            <div>
                <span class="barMenuItem ">
                    <p class="burgerMenuDesc"><a href="shymkent.html">г. Шымкент:</a></p>
                    <a href="tel:87252399900"> 8 (7252) 39-99-00 </a>
                    <a href="tel:77019447700">+7 (701) 944-77-00</a>
                </span>
            </div>
            <div class="barMenuItemIcon barMenuItemIcon3"><i class="fa-solid fa-phone"></i></div>
        </div>
    </div>
    <!-- <div class="burger-menu burger-menuBg"></div> -->
</div>
<div class="burgerHeadMenu">
    <div class="burgerBackgroundCloseSearch"></div>
    <div class="barMenuSearch">
        <div class="barMenuSearchInput">

        </div>
    </div>
    <!-- <div class="burger-menu burger-menuBg"></div> -->
</div>

</div>
`;

let location_almaty = document.querySelector(".location-almaty"),
  location_nursultan = document.querySelector(".location-nursultan"),
  location_shymkent = document.querySelector(".location-shymkent"),
  cityHref1 = window.location.href.split("/")[0].split("#")[0].split("?")[0],
  cityHref2 = "/metalgroup.kz",
  cityHref3 = window.location.href.split("/").pop(),
  cityHrefNursultan = "nursultan",
  cityHrefAlmaty = "almaty",
  cityHrefShymkent = "shymkent";

let nursultanHref = [`${cityHref1}/${cityHrefNursultan}/${cityHref3}`],
  almatyHref = [`${cityHref1}/${cityHrefAlmaty}/${cityHref3}`],
  shymkentHref = [`${cityHref1}/${cityHrefShymkent}/${cityHref3}`];

location_almaty.setAttribute("href", almatyHref);
location_nursultan.setAttribute("href", nursultanHref);
location_shymkent.setAttribute("href", shymkentHref);

let nursultanHrefCity = [
  `${cityHref1}/${cityHref2}/${cityHrefNursultan}/${cityHref3}`,
];

if (nursultanHrefCity.length == [window.location.href].length) {
  cityMainGorod1 = "Нур-Султан";
  console.log("true");
  console.log(cityMainGorod1);
} else {
  console.log("false");
}
console.log(nursultanHrefCity);
console.log(nursultanHref);
console.log([window.location.href]);
// console.log(cityHrefNursultan);

let menuProduct1 = document.querySelector(".menu");
let menuLi1 = document.querySelector(".glavnaya_menu");
let menuLi2 = menuProduct1.querySelector(".tovary_menu");
let menuLi3 = menuProduct1.querySelector(".news_menu");
let menuLi4 = menuProduct1.querySelector(".design_menu");
let menuLi5 = menuProduct1.querySelector(".dostavka_menu");
let menuLi6 = menuProduct1.querySelector(".otzyvy_menu");
let menuLi7 = menuProduct1.querySelector(".about_menu");
let menuLi8 = menuProduct1.querySelector(".dealer_menu");
let menuLi9 = menuProduct1.querySelector(".contact_menu");

if (currentLocation == "/metalgroup.kz/index.html") {
  menuLi1.classList.add("selected");
}

if (currentLocation == "/metalgroup.kz/products.html") {
  menuLi2.classList.add("selected");
}

if (currentLocation == "/metalgroup.kz/news.html") {
  menuLi3.classList.add("selected");
}

if (currentLocation == "/metalgroup.kz/des.html") {
  menuLi4.classList.add("selected");
}

if (currentLocation == "/metalgroup.kz/services.html") {
  menuLi5.classList.add("selected");
}

if (currentLocation == "/metalgroup.kz/otzovik.php") {
  menuLi6.classList.add("selected");
}

if (currentLocation == "/metalgroup.kz/about.html") {
  menuLi7.classList.add("selected");
}

if (currentLocation == "/metalgroup.kz/dealer.html") {
  menuLi8.classList.add("selected");
}

if (currentLocation == "/metalgroup.kz/contact.html") {
  menuLi9.classList.add("selected");
}
if (currentLocation == "/metalgroup.kz/almaty.html") {
  menuLi9.classList.add("selected");
}
if (currentLocation == "/metalgroup.kz/astana.html") {
  menuLi9.classList.add("selected");
}

let menuAdaptiveImgNoActive1 = document.querySelector(
  ".menuAdaptiveImgNoActive1"
);
let menuAdaptiveImgActive1 = document.querySelector(".menuAdaptiveImgActive1");
let menuAdaptiveImgActive1_3 = document.querySelector(
  ".menuAdaptiveImgActive1-3"
);

let menuAdaptiveImgNoActive2 = document.querySelector(
  ".menuAdaptiveImgNoActive2"
);
let menuAdaptiveImgActive2 = document.querySelector(".menuAdaptiveImgActive2");

let menuAdaptiveImgNoActive3 = document.querySelector(
  ".menuAdaptiveImgNoActive3"
);
let menuAdaptiveImgActive3 = document.querySelector(".menuAdaptiveImgActive3");
let menuAdaptiveImgActive3_3 = document.querySelector(
  ".menuAdaptiveImgActive3-3"
);

let menuAdaptiveImgNoActive4 = document.querySelector(
  ".menuAdaptiveImgNoActive4"
);
let menuAdaptiveImgActive4 = document.querySelector(".menuAdaptiveImgActive4");
let menuAdaptiveImgActive4_3 = document.querySelector(
  ".menuAdaptiveImgActive4-3"
);

let menuAdaptiveImgNoActive5 = document.querySelector(
  ".menuAdaptiveImgNoActive5"
);
let menuAdaptiveImgActive5 = document.querySelector(".menuAdaptiveImgActive5");
let menuAdaptiveImgActive5_3 = document.querySelector(
  ".menuAdaptiveImgActive5-3"
);

if (currentLocation == "/index.html") {
  if (matchMedia("(max-width:860px)").matches) {
    menuAdaptiveImgNoActive1.style.display = "none";
    menuAdaptiveImgActive1.style.display = "block";
    menuAdaptiveImgActive1_3.style.cssText = "display:none!important;";
  }
} else if (currentLocation == "/otzovik.php") {
  if (matchMedia("(max-width:860px)").matches) {
    menuAdaptiveImgNoActive3.style.display = "none";
    menuAdaptiveImgActive3.style.display = "block";
    menuAdaptiveImgActive3_3.style.cssText = "display:none!important;";
  }
} else if (currentLocation == "/about.html") {
  if (matchMedia("(max-width:860px)").matches) {
    menuAdaptiveImgNoActive4.style.display = "none";
    menuAdaptiveImgActive4.style.display = "block";
    menuAdaptiveImgActive4_3.style.cssText = "display:none!important;";
  }
} else if (currentLocation == "/contact.html") {
  if (matchMedia("(max-width:860px)").matches) {
    menuAdaptiveImgNoActive5.style.display = "none";
    menuAdaptiveImgActive5.style.display = "block";
    menuAdaptiveImgActive5_3.style.cssText = "display:none!important;";
  }
}

// Create an immediately invoked functional expression to wrap our code
(function () {
  // Define our constructor
  this.Modal = function () {
    // Create global element references
    this.closeButton = null;
    this.modal = null;
    this.overlay = null;

    // Determine proper prefix
    this.transitionEnd = transitionSelect();

    // Define option defaults
    var defaults = {
      autoOpen: false,
      className: "fade-and-drop",
      closeButton: true,
      content: "",
      maxWidth: 600,
      minWidth: 280,
      overlay: true,
    };

    // Create options by extending defaults with the passed in arugments
    if (arguments[0] && typeof arguments[0] === "object") {
      this.options = extendDefaults(defaults, arguments[0]);
    }

    if (this.options.autoOpen === true) this.open();
  };

  // Public Methods

  Modal.prototype.close = function () {
    var _ = this;
    this.modal.className = this.modal.className.replace(" scotch-open", "");
    this.overlay.className = this.overlay.className.replace(" scotch-open", "");
    this.modal.addEventListener(this.transitionEnd, function () {
      _.modal.parentNode.removeChild(_.modal);
    });
    this.overlay.addEventListener(this.transitionEnd, function () {
      if (_.overlay.parentNode) _.overlay.parentNode.removeChild(_.overlay);
    });
  };

  Modal.prototype.open = function () {
    buildOut.call(this);
    initializeEvents.call(this);
    window.getComputedStyle(this.modal).height;
    this.modal.className =
      this.modal.className +
      (this.modal.offsetHeight > window.innerHeight
        ? " scotch-open scotch-anchored"
        : " scotch-open");
    this.overlay.className = this.overlay.className + " scotch-open";
  };

  // Private Methods

  function buildOut() {
    var content, contentHolder, docFrag;

    /*
     * If content is an HTML string, append the HTML string.
     * If content is a domNode, append its content.
     */

    if (typeof this.options.content === "string") {
      content = this.options.content;
    } else {
      content = this.options.content.innerHTML;
    }

    // Create a DocumentFragment to build with
    docFrag = document.createDocumentFragment();

    // Create modal element
    this.modal = document.createElement("div");
    this.modal.className = "scotch-modal " + this.options.className;
    this.modal.style.minWidth = this.options.minWidth + "px";
    this.modal.style.maxWidth = this.options.maxWidth + "px";

    // If closeButton option is true, add a close button
    if (this.options.closeButton === true) {
      this.closeButton = document.createElement("div");
      this.closeButton.className = "scotch-close close-button";
      this.closeButton.innerHTML = "×";
      this.modal.appendChild(this.closeButton);
    }

    // If overlay is true, add one
    if (this.options.overlay === true) {
      this.overlay = document.createElement("div");
      this.overlay.className = "scotch-overlay " + this.options.className;
      docFrag.appendChild(this.overlay);
    }

    // Create content area and append to modal
    contentHolder = document.createElement("div");
    contentHolder.className = "scotch-content";
    contentHolder.innerHTML = content;
    this.modal.appendChild(contentHolder);

    // Append modal to DocumentFragment
    docFrag.appendChild(this.modal);

    // Append DocumentFragment to body

    headePage.appendChild(docFrag);
  }

  function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  }

  function initializeEvents() {
    if (this.closeButton) {
      this.closeButton.addEventListener("click", this.close.bind(this));
    }

    if (this.overlay) {
      this.overlay.addEventListener("click", this.close.bind(this));
    }
  }

  function transitionSelect() {
    var el = document.createElement("div");
    if (el.style.WebkitTransition) return "webkitTransitionEnd";
    if (el.style.OTransition) return "oTransitionEnd";
    return "transitionend";
  }
})();

var myContent = document.getElementById("content");

var myModal = new Modal({
  content: myContent,
});

var triggerButton = document.getElementById("trigger");

triggerButton.addEventListener("click", function () {
  myModal.open();
});

let featured = document.querySelector(".featured");
let shopContent = document.querySelector(".shop_content");
// let DDD = document.querySelector('.search_wrapper');

if (matchMedia("(max-width:860px)").matches) {
  let barMenuSearchInput = document.querySelector(".barMenuSearchInput");

  barMenuSearchInput.innerHTML = `
    <div class="searchLogParent searchLogParentMenu">
    <div class="search_log">
        <div class="sample eight search-box">
            <div class="searchLogIconFa">
                <i class="fa fa-search"></i>
            </div>
            <input type="text" name="" autocomplete="off" id="txtSearch"
                placeholder="Введите запрос..." class="sampleSearch search-txt">
            <input type="text" name="" autocomplete="off" id="txtSearch2"
                placeholder="Введите запрос..." class="sampleSearch sampleSearch2 search-txt">
            <div class="search-btn"></div>
            <div class="barMenuSearchInput_close">
                <div class="burger-menuSearch ">
                </div>
                ×
            </div>
            <button type="reset" class="btn btn-reset fa fa-times"></button>
        </div>
    </div>
</div>`;
}
let searchLog = `
<div class="searchLogParent searchLogParentFeatured">
<div class="search_log">
    <div class="sample eight search-box">
        <input type="text" name="" autocomplete="off" id="txtSearch"
            placeholder="Введите запрос..." class="sampleSearch search-txt">
        <input type="text" name="" autocomplete="off" id="txtSearch2"
            placeholder="Введите запрос..." class="sampleSearch sampleSearch2 search-txt">
        <button type="submit" class="btn btn-search search-btn search-btn2">
            <i class="fa fa-search"></i>
        </button>
        <button type="reset" class="btn btn-reset fa fa-times"></button>
    </div>
</div>
</div>
`;
let searchLog2 = `
<div class="searchLogParent searchLogParentPage">
<div class="search_log">
    <div class="sample eight search-box">
        <input type="text" name="" autocomplete="off" id="txtSearch"
            placeholder="Введите запрос..." class="sampleSearch search-txt">
        <input type="text" name="" autocomplete="off" id="txtSearch2"
            placeholder="Введите запрос..." class="sampleSearch sampleSearch2 search-txt">
        <button type="submit" class="btn btn-search search-btn search-btn2">
            <i class="fa fa-search"></i>
        </button>
        <button type="reset" class="btn btn-reset fa fa-times"></button>
    </div>
</div>
</div>
`;

if (shop_content != null) {
  shop_content.innerHTML = `
 
    <!-- Product Item -->
    <div class="product_item1"
    style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 65%);">


            <div class="product_slideImg">
                <a href="stellazhtor.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/tor1.png" alt=""></div>
                </a>
            </div>

  


    <div class="product_content"><a href="stellazhtor.html">

        </a>
        <div class="product_name1"><a href="stellazhtor.html"></a>
            <div><a href="stellazhtor.html">Торговые стеллажи</a></div>
        </div>

    </div>

</div>

<!-- Product Item -->
<div class="product_item1" style="background: rgb(255,255,255);
background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(220,252,220,1) 75%);">

            <div class="product_slideImg">
                <a href="sklad.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/stellazh 1.png" alt=""></div>
                </a>
     
      
    </div>

    <div class="product_content"><a href="sklad.html">

        </a>
        <div class="product_name1"><a href="sklad.html"></a>
            <div><a href="sklad.html">Складские стеллажи</a></div>
        </div>

    </div>

</div>

<!-- Product Item -->
<div class="product_item1"
    style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(253,239,255,1) 75%);">


            <div class="product_slideImg">
                <a href="pallet.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/pallet.png" alt=""></div>
                </a>
       </div>
      



    <div class="product_content"><a href="pallet.html">

        </a>
        <div class="product_name1"><a href="pallet.html"></a>
            <div><a href="pallet.html">Паллетные стеллажи</a></div>
        </div>

    </div>

</div>

<!-- Product Item -->
<div class="product_item1"
    style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(253,253,234,1) 70%);">


            <div class="product_slideImg">
                <a href="vitrina.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/vit.png" alt=""></div>
                </a>
            </div>
      
        

    <div class="product_content"><a href="vitrina.html">

        </a>
        <div class="product_name1"><a href="vitrina.html"></a>
            <div><a href="vitrina.html">Витрины</a></div>
        </div>

    </div>

</div>

<!-- Product Item -->
<div class="product_item1"
    style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(252,238,209,1) 36%);">


            <div class="product_slideImg">
                <a href="mebel_butik.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/pharmacy.png" alt=""></div>
                </a>
            </div>


    <div class="product_content"><a href="mebel_butik.html">

        </a>
        <div class="product_name1"><a href="mebel_butik.html"></a>
            <div><a href="mebel_butik.html">Мебель для бутика и аптеки</a></div>
        </div>
    
    </div>

</div>
<div class="product_item1"
    style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(238,247,254,1) 36%);">

  
            <div class="product_slideImg">
                <a href="obor.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/1.png" alt=""></div>
                </a>
            </div>

    
    <div class="product_content"><a href="obor.html">

        </a>
        <div class="product_name1"><a href="obor.html"></a>
            <div><a href="obor.html">Торговое оборудование</a></div>
        </div>
     
    </div>

</div>
<!-- Product Item -->
<div class="product_item1 holodBg"
    style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(223,231,255,1) 78%);">


            <div class="product_slideImg">
                <a href="holod.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/12.png" alt=""></div>
                </a>
       </div>

    <div class="product_content"><a href="holod.html">

        </a>
        <div class="product_name1"><a href="holod.html"></a>
            <div><a href="holod.html">Холодильное оборудование</a></div>
        </div>
   
    </div>

</div>

<div class="product_item1"
    style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(233,255,235,1) 48%);">

 
            <div class="product_slideImg">
                <a href="neutral.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/neutral.png" alt=""></div>
                </a>
            </div>
    

    <div class="product_content"><a href="neutral.html">

        </a>
        <div class="product_name1"><a href="neutral.html"></a>
            <div><a href="neutral.html">Нейтральное оборудование</a></div>
        </div>
   
    </div>

</div>

<div class="product_item1 "
    style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(239,239,239,1) 48%);">


            <div class="product_slideImg">
                <a href="pos_obor.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/poss.png" alt=""></div>
                </a>
            </div>
       

    <div class="product_content"><a href="pos_obor.html">

        </a>
        <div class="product_name1"><a href="pos_obor.html"></a>
            <div><a href="pos_obor.html">POS оборудование</a></div>
        </div>
    
   
    </div>

</div>

<div class="product_item1"
    style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(244,253,224,1) 48%);">


            <div class="product_slideImg">
                <a href="kassovyie_boksyi.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/kas.png" alt=""></div>
                </a>
            </div>
  

    <div class="product_content"><a href="kassovyie_boksyi.html">

        </a>
        <div class="product_name1"><a href="kassovyie_boksyi.html"></a>
            <div><a href="kassovyie_boksyi.html">Кассовые боксы</a></div>
        </div>

    </div>

</div>

<div class="product_item1"
    style="background: linear-gradient(156deg, rgba(255,255,255,1) 0%, rgba(246,236,253,1) 48%);">


            <div class="product_slideImg">
                <a href="met_shkaf.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/7.png" alt=""></div>
                </a>
            </div>
     

    <div class="product_content"><a href="met_shkaf.html">

        </a>
        <div class="product_name1"><a href="met_shkaf.html"></a>
            <div><a href="met_shkaf.html">Металлические шкафы</a></div>
        </div>

    </div>

</div>

<div class="product_item1"
    style="background: linear-gradient(150deg, rgba(255,255,255,1) 0%, rgba(251,241,241,1) 100%);">


            <div class="product_slideImg">
                <a href="horest.html">
                    <div class="product_image d-flex flex-column align-items-center justify-content-center"><img
                            src="/images/16.png" alt=""></div>
                </a>
            </div>

    <div class="product_content"><a href="horest.html">
        </a>
        <div class="product_name1"><a href="horest.html"></a>
            <div><a href="horest.html">Профессиональное кухонное оборудование</a></div>
        </div>
    </div>
</div>
`;
}

$(".pcb_button").on("click", function () {
  $(".pcb_input").toggleClass("inclicked");
  $(".pcb_button").toggleClass("close");
});
// let menuIconMenu = document.querySelector('[data-behaviour="toggle-menu-bg"]');
// let toggleMenuClose = document.querySelector('[data-behaviour="toggle-menu-close"]');
// console.log(menuIconMenu);
// menuAdaptiveImgNoActive2.addEventListener('click',() =>{
//     menuAdaptiveImgNoActive2.style.display = 'none';
//     menuAdaptiveImgActive2.style.display = 'block';
//     menuIconMenu.addEventListener('click',() =>{
//         menuAdaptiveImgNoActive2.style.display = 'block';
//         menuAdaptiveImgActive2.style.display = 'none';
//     })
//     toggleMenuClose.addEventListener('click',() =>{
//         menuAdaptiveImgNoActive2.style.display = 'block';
//         menuAdaptiveImgActive2.style.display = 'none';
//     })
// })

// Dropdown Menu Fade
jQuery(document).ready(function () {
  $(".dropdown").hover(
    function () {
      $(".dropdown-menu", this).fadeIn("fast");
    },
    function () {
      $(".dropdown-menu", this).fadeOut("fast");
    }
  );

  $(".dropdown2").hover(
    function () {
      $(".dropdown-menu2", this).fadeIn("fast");
    },
    function () {
      $(".dropdown-menu2", this).fadeOut("fast");
    }
  );
});

// ______________________________________________________________________________________________________________

let cat_menu_container = document.querySelector(".mymagicoverbox");
let cat_menu_container_li = document.querySelectorAll(".categories-menu-item");
let cat_menu_container_li_sub = document.querySelectorAll(
  ".sub-categories-menu-item"
);
let categories_menu_container = document.querySelector(
  ".categories-menu-container"
);
let categories_menu_detail_active = document.querySelector(
  ".categories-menu-detail-active"
);
let mainImageCat = document.querySelector(".sub-img-active img");
let ImageCat = document.querySelectorAll(".category-images-display-none img");

// cat_menu_container.addEventListener("mouseover", function() {
//     categories_menu_container.classList.add('displaying')
// })

cat_menu_container_li.forEach(function (a) {
  a.addEventListener("mouseenter", function () {
    a.classList.add("active");

    ImageCat.forEach(function (image) {
      if (a.id == image.id) {
        mainImageCat.setAttribute("src", image.getAttribute("src"));
      }
    });
  });
  a.addEventListener("mouseleave", function () {
    a.classList.remove("active");
  });
});

// _____________________________________________

cat_menu_container_li_sub.forEach(function (b) {
  b.addEventListener("mouseover", function () {
    b.classList.add("active");

    ImageCat.forEach(function (image_sub) {
      if (b.id == image_sub.id) {
        mainImageCat.setAttribute("src", image_sub.getAttribute("src"));
      }
    });
  });
  b.addEventListener("mouseleave", function () {
    b.classList.remove("active");
  });
});

const team_w3agile = document.querySelectorAll(".team-w3agile");
if (team_w3agile != null) {
  team_w3agile.forEach((item) => {
    item.classList.remove("thumbnails");
  });
}

// $(document).ready(function() {
// 	$("#contenttt div").hide(); // Скрываем содержание
// 	$("#tabs li:first").attr("id","current"); // Активируем первую закладку
// 	$("#contenttt div:first").fadeIn(); // Выводим содержание

//     $('#tabs a').click(function(e) {
//         e.preventDefault();
//         $("#contenttt div").hide(); //Скрыть все сожержание
//         $("#tabs li").attr("id",""); //Сброс ID
//         $(this).parent().attr("id","current"); // Активируем закладку
//         $('#' + $(this).attr('title')).fadeIn(); // Выводим содержание текущей закладки
//     });
// })();

// const topNavRight = document.querySelector('.top_nav_right')

// let check = false;

// window.onclick = function(event) {
//     if (event.target === topNavRight || event.target === topNavRight.children[0] || event.target === topNavRight.children[0].children[0]) {
//         scroll(0, 300);
//     }
// }

// window.addEventListener("touchstart", function(event) {
//     if (event.target === topNavRight || event.target === topNavRight.children[0] || event.target === topNavRight.children[0].children[0]) {
//         scroll(0, 300);
//     }
// })

// window.mobileCheck = function() {
//     (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
//     return check;
// };

// if (mobileCheck()) {
//     document.querySelector(".top_nav_right").style.height = `${document.querySelector(".navbar-header").offsetHeight}px`
// } else {
//     document.querySelector(".top_nav_right").style.height = `${document.querySelector(".container-fluid").offsetHeight}px`
// }

// _______________________________Два вида расположение товаров (Кнопка-active)_______________________________________

const myTab = document.getElementById("myTab");

if (myTab != null) {
  const btnList = myTab.children[0].querySelector(".btn");
  const btnBlock = myTab.children[1].querySelector(".btn");

  btnListFunction();

  function btnListFunction() {
    btnBlock.classList.remove("active");
    btnList.classList.add("active");

    // ____________________________Удаляем класс актив_______________________________________
    const ul_thumbnails = document.querySelector(".thumbnails");
    if (ul_thumbnails != null) {
      const li_thumbnails = ul_thumbnails.querySelectorAll("li");
      li_thumbnails.forEach(function (a) {
        if (a.classList.contains("span3")) {
          a.classList.remove("_active");
        }
      });
    }

    animationScroll();
  }

  function btnBlockFunction() {
    btnList.classList.remove("active");
    btnBlock.classList.add("active");

    // ____________________________Удаляем класс актив_______________________________________
    const listView = document.querySelectorAll("#ggg");
    listView.forEach(function (a) {
      if (a != null) {
        a.classList.remove("_active");
      }
    });

    animationScroll();
  }
  btnList.addEventListener("click", btnListFunction);
  btnBlock.addEventListener("click", btnBlockFunction);
}

$(document).on("ready", function () {
  $(".variable").slick({
    dots: true,
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 5,
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
        },
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  });
});

let body = document.querySelector("body");
let barMenu = document.querySelector(".barMenu");
let burger_Menu = document.querySelector(".burger-menu");
let burgerCloseMenu = document.querySelector(".burgerBackgroundClose");
let burgerBackgroundCloseSearch = document.querySelector(
  ".burgerBackgroundCloseSearch"
);
let barMenuSearch = document.querySelector(".barMenuSearch");
let burger_MenuSearch = document.querySelector(".burger-menuSearch");
var closestAttr = function (item, attr) {
  var node = item;
  while (node) {
    var attrVaue = node.getAttribute(attr);
    if (attrVaue) {
      var attrValue = node.getAttribute(attr);
      if (attrValue) {
        return attrValue;
      }

      node = node.parentElement;
      console.log(node);
    }
    return null;
  }
};

if (matchMedia("(max-width:860px)").matches) {
  $(".burger-menu").on("tap click", function () {
    // бургер меню
    $(this).toggleClass("menu-on");
    $(".barMenu").toggleClass("barMenuOn");
    $(".burgerBackgroundClose").toggleClass("burgerBackgroundCloseBlock");
    document
      .querySelector(".burgerBackgroundCloseBlock")
      .addEventListener("click", function () {
        barMenu.classList.remove("barMenuOn");
        burgerCloseMenu.classList.remove("burgerBackgroundCloseBlock");
      });
    document
      .querySelectorAll('[data-behaviour="toggle-menu-icon"]')
      .forEach((item) => {
        item.addEventListener("click", function () {
          barMenu.classList.remove("barMenuOn");
          burgerCloseMenu.classList.remove("burgerBackgroundCloseBlock");
        });
      });
    document
      .querySelectorAll('[data-behaviour="toggle-menu-burger"]')
      .forEach((item) => {
        item.addEventListener("click", function () {
          barMenu.classList.remove("barMenuOn");
          burgerCloseMenu.classList.remove("burgerBackgroundCloseBlock");
        });
      });
    document.querySelectorAll(".burger-menuSearch").forEach((item) => {
      item.addEventListener("click", function () {
        barMenu.classList.remove("barMenuOn");
        burgerCloseMenu.classList.remove("burgerBackgroundCloseBlock");
      });
    });
  });
  $(".burger-menuSearch").on("tap click", function () {
    $(this).toggleClass("menu-on");
    barMenuSearch.classList.toggle("barMenuOnSearch");
    $(".burgerBackgroundCloseSearch").toggleClass("burgerBackgroundCloseBlock");
    document
      .querySelector(".burgerBackgroundCloseBlock")
      .addEventListener("click", function () {
        barMenuSearch.classList.remove("barMenuOnSearch");
        burgerBackgroundCloseSearch.classList.remove(
          "burgerBackgroundCloseBlock"
        );
      });
    document
      .querySelectorAll('[data-behaviour="toggle-menu-icon"]')
      .forEach((item) => {
        item.addEventListener("click", function () {
          barMenuSearch.classList.remove("barMenuOnSearch");
          burgerBackgroundCloseSearch.classList.remove(
            "burgerBackgroundCloseBlock"
          );
        });
      });
    document
      .querySelectorAll('[data-behaviour="toggle-menu-burger"]')
      .forEach((item) => {
        item.addEventListener("click", function () {
          barMenuSearch.classList.remove("barMenuOnSearch");
          burgerBackgroundCloseSearch.classList.remove(
            "burgerBackgroundCloseBlock"
          );
        });
      });
    document.querySelectorAll(".burger-menu").forEach((item) => {
      item.addEventListener("click", function () {
        barMenuSearch.classList.remove("barMenuOnSearch");
        burgerBackgroundCloseSearch.classList.remove(
          "burgerBackgroundCloseBlock"
        );
      });
    });
  });

  // let menuListsLi = document.querySelectorAll('.menu_lists li');

  // menuListsLi.forEach(item => {
  //     item.addEventListener('mouseover', function(e) {
  //         let target = e.target;

  //         if(target == 'glavnaya_menu'){
  //             document.querySelector('.menuAdaptiveImgActive1-3').style.display = 'block';
  //             console.log('111');
  //         }
  //     });
  // });

  // burger_MenuSearch.addEventListener('click', function() {
  //     $(this).toggleClass("menu-on");
  //     barMenuSearch.classList.toggle('barMenuOnSearch');
  //     // $('.burgerBackgroundClose').toggleClass("burgerBackgroundCloseBlock");
  // });
}
// function init() {
//     $('[data-behaviour="toggle-menu-burger"]').on('click', toggleMenuBurger);
//     $('[data-behaviour="toggle-menu-icon"]').on('click', toggleMenuIcon);
//     $('[data-behaviour="toggle-menu-close"]').on('click', toggleMenuClose);
//     $('[data-behaviour="toggle-menu-bg"]').on('click', toggleMenuBg);
// };
// function toggleMenuBurger() {
//     $('[data-element="toggle-nav-burger"]').toggleClass('nav--activeAdap');
//     $('[data-element="toggle-nav-bg"]').addClass('menu-icon--open');
//     $('body').toggleClass('no-scroll');
// };
// function toggleMenuIcon() {
//     $('[data-element="toggle-nav"]').toggleClass('nav--active');
//     $('[data-element="toggle-nav-bg"]').addClass('menu-icon--open');
//     $('body').toggleClass('no-scroll');
// };

// function toggleMenuClose() {
//     $(this).removeClass('menu-icon--open');
//     $('[data-element="toggle-nav-burger"]').removeClass('nav--activeAdap');
//     $('[data-element="toggle-nav"]').removeClass('nav--active');
//     $('[data-element="toggle-nav-bg"]').removeClass('menu-icon--open');
//     $('body').toggleClass('no-scroll');
// };

// function toggleMenuBg() {
//     $(this).removeClass('menu-icon--open');
//     $('[data-element="toggle-nav"]').removeClass('nav--active');
//     $('[data-element="toggle-nav-burger"]').removeClass('nav--activeAdap');
//     $('body').toggleClass('no-scroll');
// };

// init();

// $(add).on('click', function () {
//     $(tab).prop('checked', true);
// })

// $(".mymagicoverbox").click(function () {
//     $('#myfond_gris').fadeIn(300);
//     var iddiv = $(this).attr("iddiv");
//     $('#' + iddiv).fadeIn(300);
//     $('#myfond_gris').attr('opendiv', iddiv);
//     return false;
// });

// $('#myfond_gris, .mymagicoverbox_fermer').click(function () {

//     var iddiv = $("#myfond_gris").attr('opendiv');
//     $('#myfond_gris').fadeOut(300);
//     $('#' + iddiv).fadeOut(300);

// });

// $(".mymagicoverbox").click(function () {
//     $("body").attr("style", "overflow:hidden;");
// });
// $("#myfond_gris").click(function () {
//     $("body").attr("style", "overflow:visible;");
// });

// $("#performanceRadioBtns").find("#IndividualPD").prop("checked", true);

if (featured != null) {
  featured.insertAdjacentHTML("afterbegin", searchLog);
}

class ItcAccordion {
  constructor(target, config) {
    this._el =
      typeof target === "string" ? document.querySelector(target) : target;
    const defaultConfig = {
      alwaysOpen: true,
    };
    this._config = Object.assign(defaultConfig, config);
    this.addEventListener();
  }
  addEventListener() {
    this._el.addEventListener("click", (e) => {
      const elHeader = e.target.closest(".contactAdress");
      if (!elHeader) {
        return;
      }
      if (!this._config.alwaysOpen) {
        const elOpenItem = this._el.querySelector(".contactAdress_show");
        if (elOpenItem) {
          elOpenItem !== elHeader.parentElement
            ? elOpenItem.classList.toggle("contactAdress_show")
            : null;
        }
      }
      elHeader.parentElement.classList.toggle("contactAdress_show");
    });
  }
}

new ItcAccordion("#accordion-1");
//   new ItcAccordion('#accordion-2');
let featuredCol3 = document.querySelector(".featured .col-3");
let hrLine1 = document.querySelector(".featured hr");
// let featuredCol3Parent = featuredCol3.parentNode;
// console.log(featuredCol3Parent);
if (matchMedia("(max-width:860px)").matches) {
  // featuredCol3.insertBeforeAdjasenment(feauturedH1, featuredCol3)
  // let domc =    featuredCol3.appendChild(feauturedH1);
  // console.log(domc);
  if (featuredCol3 != null) {
    featuredCol3.after(feauturedH1);
    feauturedH1.after(hrLine1);
  }
}

let selectBoxMain = document.querySelector(".selectBox");

if (selectBoxMain != null) {
  selectBoxMain.innerHTML = `<div id="priceSort" class="select">
    <label for="select-box1" class="label select-box1"><span class="label-desc">
        <p class="sortedPo">Сортировать по:</p>
        <p class="sortedFirst">по возрастанию цены</p>
        <p class="sortedSecond">по убыванию цены</p>
    </span>
    <div class="priceContainer">
        <div name="firstT" class="priceOptionFirst priceOptionFirstBg">
            по возрастанию цены
        </div>
        <div name="secondT" class="priceOptionSecond">
            по убыванию цены
        </div>
    </div>
</div>`;
}
