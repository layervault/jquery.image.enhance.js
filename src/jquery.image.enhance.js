// TODO set a max-width and max-height and then only animate the dimension we will but up against
(function($) {
  var
    options = {
      transitionLength: 250,
      easing          : 'ease-out',
      padding         : 100,
      top             : 100
    },
    setup,
    prefixes,
    clearData,
    computeTargets;

  prefixes = [
    '',
    '-webkit-',
    '-moz-',
    '-o-'
  ];

  // Generate a random throwaway class
  randomClass = function () {
    return "LV-" + Math.floor(Math.random() * 100000000);
  };

  setup = function(opts) {
    var
      $head           = $('head'),
      $style          = $('<style></style>'),
      zoomUpClass     = randomClass(),
      zoomDownClass   = randomClass(),
      transitionClass = randomClass(),
      transition;

    options = $.extend(options, opts);

    transition = $.map(prefixes, function (p) {
      return p + "transition: top " + options.transitionLength + "ms " + options.easing + ", " +
        "left "   + options.transitionLength + "ms " + options.easing + ", " +
        "width "  + options.transitionLength + "ms " + options.easing + "; ";
    }).join(' ');

    $style.html(
      "." + zoomUpClass + "{ top: " + options.targetTop + "px !important; left: " + options.targetLeft + "px !important;" +
        " width: " + options.targetWidth + "px !important; } " +
      "." + zoomDownClass + "{ top: " + options.sourceTop + "px; left: " + options.sourceLeft + "px;" +
        " width: " + options.sourceWidth + "px; }" +
      "." + transitionClass + "{ -webkit-transform: translateZ(0); z-index: 9999; position: absolute; " + transition + " }"
    );

    $head.append($style);

    return {
      $style    : $style,
      zoomUp    : zoomUpClass,
      zoomDown  : zoomDownClass,
      transition: transitionClass,
      options   : options
    };
  };

  clearData = function ($e) {
    if (typeof $e === "undefined" || $e.length === 0) {
      return;
    }

    $e.data('cloneId',      null)
      .data('enhanced',     null)
      .data('zoomUpClass',  null)
      .data('zoomLength',   null)
      .data('style',        null)
      .data('options',      null);
  };

  computeTargets = function (opts) {
    var
      width,
      top,
      left,
      $window = $(window),
      windowWidth = $(window).width();

    options = $.extend(options, opts);

    width = options.width || (windowWidth - (options.padding * 2));
    left = options.padding;
    top = options.top || options.width;

    return {
      width: width,
      left: left,
      top: top
    }
  };

  //-- Methods to attach to jQuery sets

  $.fn.enhance = function(opts) {
    var
      $e = $(this),
      $clone = $e.clone(),
      classes,
      cloneId = randomClass(),
      highResSrc = $e.attr('data-high-res-src'),
      highResImage,
      targets;

    if ($e.length === 0) {
      return;
    }

    if (typeof opts === "undefined") {
      opts = {};
    }

    if (!!highResSrc) {
      highResImage = new Image();
      highResImage.onload = function () {
        $clone.attr('src', highResSrc);
      };

      highResImage.src = highResSrc;
    }

    opts.sourceWidth  = $e.width();
    opts.sourceHeight = $e.height();
    opts.sourceLeft   = $e.offset().left;
    opts.sourceTop    = $e.offset().top;

    targets = computeTargets(opts);

    opts.targetWidth  = targets.width;
    opts.targetLeft   = targets.left;
    opts.targetTop    = targets.top;

    classes = setup(opts);

    // Set up our clone.
    $clone.attr('id', cloneId)
    $clone.addClass(classes.transition);
    $clone.addClass(classes.zoomDown);
    $('body').append($clone);

    // We need to do a poor man's _.defer() to get this to transition
    // correctly.
    setTimeout(function () {
      $clone.addClass(classes.zoomUp);
    }, 0);

    if (typeof classes.options.enhanceStart === "function") {
      classes.options.enhanceStart();
    }

    if (typeof classes.options.enhanceEnd === "function") {
      setTimeout(function () {
        classes.options.enhanceEnd();
      }, classes.options.transitionLength);
    }

    // Store our data for when we want to dehance()
    $e.data('cloneId',      cloneId)
      .data('enhanced',     true)
      .data('zoomUpClass',  classes.zoomUp)
      .data('zoomLength',   classes.options.transitionLength)
      .data('style',        classes.$style)
      .data('options',      classes.options);
  };

  $.fn.dehance = function() {
    var
      $e          = $(this),
      zoomUpClass = $e.data('zoomUpClass'),
      zoomLength  = parseInt($e.data('zoomLength'), 10),
      cloneId     = $e.data('cloneId'),
      $clone      = $('#' + cloneId),
      options     = $e.data('options');

    $e.removeClass(zoomUpClass);

    if (typeof options.dehanceStart === "function") {
      options.dehanceStart();
    }

    setTimeout(function () {
      if (typeof options.dehanceEnd === "function") {
        options.dehanceEnd();
      }

      $clone.remove();
      $e.data('style').remove();
      clearData($e);
    }, zoomLength);
  };

  $.fn.toggleEnhance = function (opts) {
    var $e = $(this);

    if (!!$e.data('enhanced')) {
      $e.dehance();
    }
    else {
      $e.enhance(opts);
    }
  };
})(jQuery);