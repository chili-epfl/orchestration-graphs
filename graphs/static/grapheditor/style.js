
Raphael.el.style = function (state, style, aniOptions) {
    style = style ? style : 'default';
    state = state ? state : 'base';
    aniOptions = this.aniOptions ? this.aniOptions : null;

    // The structure of Raphael.styles is " type --> style --> state "
    if (aniOptions) {
        this.animate(Raphael.styles[this.type][style][state], 
                     aniOptions.duration, aniOptions.easing, aniOptions.callback);
    } else {
        this.attr(Raphael.styles[this.type][style][state]);
    }

    return this; // chaining, e.g. shape.attr({ stroke: '#fff'}).style('dragging').toFront();
};

 
/**
 * Same API as Raphael.el.style for Raphael Sets
 *
 * @author      Terry Young <terryyounghk [at] gmail.com>
 * @license     WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 */
Raphael.st.style = function (state, style, animated) {
    for (var i = 0, j = this.items.length; i < j; i++) {
        var item = this.items[i];
        item.style(state, style, animated);
    }
    return this; // chaining, e.g. set.attr({ stroke: '#fff'}).style('dragging').toFront();
};


/**
 * This is a method to add more style sets at runtime
 *
 * @author      Terry Young <terryyounghk [at] gmail.com>
 * @license     WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 */
Raphael.setStyles = function (styles) {
    Raphael.styles = $.extend(true, {}, styles);
};


/**
 * @author      Terry Young <terryyounghk [at] gmail.com>
 * @license     WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 *
 */
Raphael.setStyles({
    rect: {
        'default': {
            base: {
                fill: "#FFFFFF",
                stroke: "#BBBBBB",
                "stroke-width": 2,
                cursor: "pointer"
            }
            // hover: {
            //    fill: ...,
            // }
        },
        'inspected': {
            base: {
                stroke: "#0080CF",
            }
        }
    },

    circle: {
        'deleteButton': {
            base: {
                fill: "#FF4E53",
                "stroke-width": 0,
                cursor: "pointer" 
            },
        },
        'inspectButton': {
            base: {
                fill: "#0080CF",
                "stroke-width": 0,
                cursor: "pointer" },
        }
    },

    text: {
        'activity': {
            base: {
                "font-size": "13px",
                fill: "#0080CF",
                cursor: "pointer" 
            },
        },
        'button': {
            base: {
                fill: "#FFFFFF",
                cursor: "pointer" 
            },
        }
    },

    path: {
        'default': {
            base: {
                stroke: "#BBBBBB",
                "stroke-width": 3,
                "arrow-end": "classic-wide-long",
                fill: "none"
            },
        },
        'possibleConnection': {
            base: { 
                "stroke": "#BBB",
                "stroke-width": 3,
                "arrow-end": "classic-wide-long",
                "fill": "none",
                "opacity": 0.5
            },
         },
        'inspected': {
            base: {
                stroke: "#0080CF",
            },
        }
    }
});