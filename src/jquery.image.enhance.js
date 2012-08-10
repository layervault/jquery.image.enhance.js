(function($) {
  var
    options = {
      transitionLength: 250,
      easing: 'ease-out'
    },
    setup,
    prefixes;

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
      "." + transitionClass + "{ z-index: 9999; position: absolute; " + transition + " }"
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

  //-- Methods to attach to jQuery sets

  $.fn.enhance = function(opts) {
    var
      $e = $(this),
      $clone = $e.clone(),
      classes,
      cloneId = randomClass();

    if ($e.length === 0) {
      return;
    }

    if (typeof opts === "undefined") {
      opts = {};
    }

    opts.sourceWidth  = $e.width();
    opts.sourceHeight = $e.height();
    opts.sourceLeft   = $e.offset().left;
    opts.sourceTop    = $e.offset().top;

    opts.targetWidth  = 900;
    opts.targetHeight = 900;
    opts.targetLeft   = 100;
    opts.targetTop    = 100;

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

    // Store our data for when we want to dehance()
    $e.data('cloneId',      cloneId)
      .data('enhanced',     true)
      .data('zoomUpClass',  classes.zoomUp)
      .data('zoomLength',   classes.options.transitionLength);
  };

  $.fn.dehance = function() {
    var
      $e          = $(this),
      zoomUpClass = $e.data('zoomUpClass'),
      zoomLength  = parseInt($e.data('zoomLength'), 10),
      cloneId     = $e.data('cloneId'),
      $clone    = $('#' + cloneId);

    $e.removeClass(zoomUpClass);
    setTimeout(function () {
      $clone.remove();
    }, zoomLength);
  };

  $.fn.toggleEnhance = function (opts) {
    var $e = $(this);

    if ($e.data('enhanced')) {
      $e.dehance();
    }
    else {
      $e.enhance();
    }
  };
})(jQuery);