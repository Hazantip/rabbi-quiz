var translateXY = function (el, positionX, positionY) {
    positionX || (positionX = 0);
    positionY || (positionY = 0);
    el.css({
        '-webkit-transform': 'translate3d(' + positionX + ', ' + positionY + ', 0) ',
        '-moz-transform': 'translate3d(' + positionX + ', ' + positionY + ', 0) ',
        '-ms-transform': 'translate3d(' + positionX + ', ' + positionY + ', 0)',
        '-o-transform': 'translate3d(' + positionX + ', ' + positionY + ', 0)',
        'transform': 'translate3d(' + positionX + ', ' + positionY + ', 0)'
    }).attr('data-position-x', positionX);
};

$.fn.translateXY = function (positionX, positionY) {
    return this.each(function () {
        translateXY($(this), positionX, positionY);
    });
};

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function equalHeight(group, groupSize) {
    if (!group.length) {
        return;
    }
    groupSize = +(groupSize || 0);
    if (groupSize < 1) {
        groupSize = group.length;
    }
    var start = -groupSize, part;
    while ((part = group.slice(start += groupSize, start + groupSize)) && part.length) {
        part.height(Math.max.apply(null, $.makeArray(part.map(function () {
            return $(this).height();
        }))));
    }
}

(function($) {
    // There is another technic,
    // which watch children heigth and set height to parent
    // This will make ability to refresh height on resize;
    $.fn.equalHeights = function() {
        var maxHeight = 0,
            $this = $(this);

        $this.each( function() {
            var height = $(this).children().innerHeight();

            if ( height > maxHeight ) { maxHeight = height; }
        });

        return $this.css('height', maxHeight);
    };

    // auto-initialize plugin, just add data attribute
    $('[data-equal]').each(function(){
        var $this = $(this),
            target = $this.data('equal');
        $this.find(target).equalHeights();
    });

})(jQuery);