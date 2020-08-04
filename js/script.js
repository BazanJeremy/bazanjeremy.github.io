

$(function() {
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();
        if (scroll >= 150) {
            $(".navbar").addClass('color');
        } else {
            $(".navbar").removeClass("color");
        }
    });
});
