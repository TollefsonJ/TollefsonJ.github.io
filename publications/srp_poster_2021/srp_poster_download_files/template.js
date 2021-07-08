var activeUpload = false, activeDiv, w, l, activeAuthors = false, newDivEmpty, o, textboxAdd = 120, isPhoneOrPad = false;
var iskiosk = false;

var your_rating_is_registered_thank_you = "Your rating is registered. Thank you!";
var poppedUp = false;
var popupboxtextmultiplier = 2;

//dom loaded
$(function () {
    if (window.parent != window && window.history && window.history.pushState) {
        window.parent.history.pushState({}, document.title, '/?s=' + $("#PageShortName").val());
    }

    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML");

    iskiosk = $("body").hasClass("kiosk");

    $(".img-uploader").remove(); //make sure it is gone

    //add class to iposter
    $("body").addClass("iposter");

    //this is to handle back button when not in modal
    if (typeof $.cookie('gb') !== "undefined") {

        var back = $.cookie('gb');
        $('.back-button').addClass('visible').on("touchend click", function () {
            document.location.href = "/Default.aspx?s=" + back;
        });
        $.removeCookie('gb');
    }

    //if in iframe, notify click
    $(document).click(function () {
        if (window.parent != window)
            window.parent.iframeClicked();
    });

    //make custom font sizes fluid and add ref to fluid css
    var px2vw = 0.05208333333333;

    if (typeof printPDF == 'undefined')
        $(".block .text").each(function () {
            $(this).data("content", $(this).html())
        });

    if (typeof abstractid != 'undefined') {
        $("#poster-id").text(abstractid);
    }

    if (typeof printPDF == 'undefined') {
        $("head").append('<link media="all" rel="stylesheet" href="/templates/iPosters/styles/fluid.min.css">');
        $(".noscroll .close,.more").remove();
    } else {
        $("#slider-message, #slider-toolbar").hide();
        $(".close,.more").remove();
        $(".scrollable-area-wrapper,.scrollable-area").each(function () {
            $(this).attr("style", "");
        });

        $(".text span[style]").each(function () {
            var hexcolor = rgb2hex($(this).css("color"));
            var contrast = getContrast2(hexcolor);

            if (contrast == "bright") {
                while (contrast == "bright") {
                    hexcolor = tinycolor(hexcolor).darken().toString();
                    contrast = getContrast2(hexcolor);
                }
                $(this).css("color", hexcolor);
            }

        });
    }

    //hide edit fields for disclosure, cv, abstract, references
    $("#edit-disclosure-wrapper").hide();
    $("#edit-cv-wrapper").hide();
    $("#edit-abstract-wrapper").hide();
    $("#edit-references-wrapper").hide();

    //add close
    $(".more").before('<div class="close"><span>CLOSE</span></div>');

    //activate close
    $(".close").mousedown(resetEdit);

    //remove scrollbar, check if questview
    if (typeof guestView == 'undefined' && $("body").hasClass("kiosk"))
        $("body").css("overflow", "hidden");

    if (typeof guestView == 'undefined')
        $("body").css("-ms-content-zooming", "none").css("-ms-user-select", "none");

    //attendee ratings?
    if (typeof attendeeRating != 'undefined') {
        $('#attendee-rating div').raty({
            path: '/common/script/raty-2.7.0/lib/images/',
            click: function (score, evt) {
                $("#loading h3").html(your_rating_is_registered_thank_you);
                $(".loading").show();
                $('#attendee-rating').fadeOut('fast');

                $.ajax({
                    type: "POST",
                    url: '/Plugins/Dialog/DialogService.asmx/AddPublicRating',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: "{sourceID:'" + $("#PageShortName").val() + "',key:'Attendee',rating:'" + score + "'}",
                    success: function (data) {
                        var storedResult = data.d;
                        //console.log("actions: rating registered with sourceID [" + $("#PageShortName").val() + "]");

                        setTimeout(function () {
                            $(".loading").hide();
                            $("#loading h3").html("LOADING");

                            $('#attendee-rating').fadeIn();
                            $('#attendee-rating div').raty('reload');
                        }, 2500);
                    },
                    error: function (result, a, b) {
                        //console.log("Error: " + a + ";" + b);
                        $("#loading h3").html("ERROR. Please notify staff.");
                        setTimeout(function () {
                            $(".loading").hide();
                        }, 1500);
                    }
                });
            }
        });
        $('#attendee-rating').css("display", "table-cell");
    }

    //if box titles are missing, remove it
    $(".block h2").each(function () {
        if ($(this).text() == "") $(this).height("1vw").css("overflow", "hidden").css("padding", "0");
    });
    //if content box text is placeholder, remove it
    $(".block .scrollable-area-wrapper .scrollable-area .text").each(function () {
        if ($(this).text() == "Click to enter content") { $(this).text(""); }
    });

    $("#noticeClose")
        .click(function () {
            $("#fancybox-close").trigger("click");
        });

    $(".block a[href]").each(function () {
        $(this).attr("target", "_blank");
    });

    $(document).on("touchend click", "body:not(.kiosk) #popuptextbox a[href]", function () {
        $(this).attr("target", "_blank");
    });

    $(document).on("touchend click", "body.kiosk:not(.lnkmod) .block a[href], body.kiosk:not(.lnkmod) #popuptextbox a[href]", function () {
        var link = $(this).attr("href");
        link = encodeURIComponent(link);
        msgToWD(link + '|1|2|1780x960|0| | |');
        return false;
    });

    $(document).on("touchend click", "body.lnkmod .block a[href], body.lnkmod #popuptextbox a[href]", function () {

        $("#externallink-title").text($(this).attr("href"));
        $("#externallink-modal").append('<iframe src="' + $(this).attr("href") + '"></iframe>');

        var h = Math.round($(document).height() * 0.9);
        var w = Math.round($(document).width() * 0.9);

        $.fancybox({
            padding: 0,
            cyclic: false,
            overlayShow: true,
            overlayOpacity: 0.4,
            overlayColor: '#000000',
            titlePosition: 'inside',
            width: w,
            height: h,
            autoSize: false,
            autoDimensions: false,
            href: '#popup-externallink',
            onComplete: function () {
                $("body").addClass("externallink");
            },
            onClosed: function () {
                $("body").removeClass("externallink");
                $("#externallink-modal > iframe").remove();
            }
        });
        return false;
    });

    //activate popup
    if (typeof printPDF == 'undefined')
        $('#main .block').on("mousedown", function () {

            $(this).find("iframe").each(function () { $(this).attr("src", $(this).attr("src")); })

            var toppos = iskiosk ? "10.1vw" : "0";

            $("body").append('<div id="popuptextbox"><h2 class="texttitle"></h2>' +
                '<div style="overflow-x:hidden;overflow-y:auto;" class="content"></div></div>' +
                '<div id="popuptextboxback" style="position:fixed;top:' + toppos + ';bottom:0;right:0;left:0;background:rgba(0,0,0,0.7);' +
                'z-index:49999;text-align:right;padding:1vw 2vw;font-size:3vw;"><i class="fa fa-times" aria-hidden="true"></i></div>');
            var maindiv = $("#popuptextbox");
            maindiv.attr("style", "position:fixed;top:" + toppos + ";bottom:0;left:0;right:0;margin-left:auto;margin-right:auto;z-index:50000;");

            $("#popuptextboxback").on("click", function () {
                $("#popuptextbox,#popuptextboxback").remove();
            });

            var px2vw2 = parseFloat(100 / $(window).width()) * popupboxtextmultiplier;
            var w = $(this).width();

            //if (w > $(document).width()) w = $(document).width();

            var calcw = (parseFloat(w) * px2vw2);

            if (calcw > 90) calcw = 90;

            //set width of main div
            maindiv.attr("style", maindiv.attr("style") + "width:" + calcw.toFixed(2) + "vw;");

            //adjust padding - should probably not be done
            //$("#popuptextbox .content").css("padding", "0 calc(7% / " + popupboxtextmultiplier + ")");

            //get title data
            var titleelement = $(this).children("h2");

            //get title styles
            $("#popuptextbox .texttitle").css("background", titleelement.css("background-color"))
                .css("font-family", titleelement.css("font-family"))
                .css("color", titleelement.css("color"))
                .css("font-weight", titleelement.css("font-weight"));

            //get title
            $("#popuptextbox .texttitle").html(titleelement.html());

            //content
            var parentBlock = $(this);
            var ct = parentBlock.children(".scrollable-area-wrapper").children(".scrollable-area").children(".text");

            //innercointainer background
            if (parentBlock.css("background-color") + "" != "rgba(0, 0, 0, 0)" && parentBlock.css("background-color") + "" != "transparent")
                maindiv.css("background", parentBlock.css("background-color"))

            //get content style
            $("#popuptextbox, .content").css("font-family", ct.css("font-family"))
                .css("color", ct.css("color"));

            //get content
            var c = ct.data("content");
            var temp = $("<div>" + c + "</div>");

            $("p", temp).each(function () {
                $(this).css("margin-bottom", "2px");
            });

            $("iframe[src^='//player.vimeo.com'], iframe[src^='https://player.vimeo.com'], iframe[src^='http://player.vimeo.com'], iframe[src^='//www.youtube.com'], iframe[src^='http://www.youtube.com'], iframe[src^='https://www.youtube.com']", temp).each(function () {

                var closestWidth = $("#popuptextbox .content").width(); // - parseInt($("#popuptextbox .content").css("padding-left")) * 2;

                $(this)
                    .width(closestWidth)
                    .height((closestWidth * 0.5625).toFixed(0));
            });

            content = temp.html();
            poppedUp = true;

            $("#popuptextbox .content").html(content);

            //render some content
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            createCharts();

            //make content correct height (remove content box top and bottom padding, see #popuptextbox .content in fluid.css)
            var contentboxPadding = $(document).width() / 100 * 3.28;

            //if (iskiosk) contentboxPadding += $(document).width() / 100 * 10.1;
            $("#popuptextbox .content").css("height", $("#popuptextbox").outerHeight() - $("#popuptextbox .texttitle").outerHeight() - contentboxPadding);

        });

    checkModals();

    //if click background, reset wysiwygs, modal, etc
    $("#edit-background").click(resetEdit);

    $(".btn_Start_Session").unbind('click').bind("click", function () {
        var sessionurl = $("#hdnSessionURL").val();

        if (sessionurl != "") {
            if (sessionurl.lastIndexOf("http") == - 1)
                sessionurl = "https://" + sessionurl;
            window.open(sessionurl);
        }
        else
            alert('Incorrect meeting address. Please contact the author directly!');
    });
});

function callSaveLogout() {
    $("#VisitorMaintenance").dialog({
        modal: true,
        zIndex: 100001,
        buttons: {
            Ok: function () {
                $(this).dialog("close");
            }
        }
    });
    setTimeout(function () { location.reload(true); }, 60000 * 5)
}

//all loaded
$(window).load(function () {
    $(".audioplayerwrapper").hide();
    //Popup notice if it has content
    if ($('#notice .text').html() !== '') {
        $('#noticeButton').click();
    }

    $(document).on("click", ".block img, .columns img, #popuptextbox img", function (e) {
        if (!poppedUp)
            e.stopPropagation();
        var href = $(this).parents().closest('a').attr("href");
        if (href === undefined) {
            $.fancybox({
                href: $(this).attr('src'),
                alt: $(this).attr('alt'),
                'hideOnContentClick': true
            });
        }
    });

    $("img").attr("title", "");

    //if counterenabled
    if (typeof counterenabled !== 'undefined') {
        $("#countdown").addClass('show');

        myminutes = countdown / 60;
        myseconds = countdown - (myminutes - 1) * 60; myseconds = myseconds == "60" ? 0 : myseconds;

        $("#countdown > div > div").text((myseconds + '').length > 1 ? "0" + myminutes + ":" + myseconds : "0" + myminutes + ":0" + myseconds);

        $("#PresentationTimer").dialog({
            modal: true,
            closeOnEscape: false,
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close, .ui-dialog-content").hide();
                $(".ui-dialog-buttonset, .ui-dialog-title").css("float", "none");
                $(".ui-dialog-buttonpane, .ui-dialog-titlebar").css("text-align", "center");
                $(".ui-dialog-buttonpane").css("padding", "0");
            },
            buttons: [{
                text: "Start Presentation",
                click: function () {
                    $(this).dialog("close");
                    $(".ui-dialog-titlebar-close, .ui-dialog-content").show();
                    $(".ui-dialog-buttonset, .ui-dialog-title").css("float", "");
                    $(".ui-dialog-buttonpane, .ui-dialog-titlebar").css("text-align", "");
                    $(".ui-dialog-buttonpane").css("padding", "");
                    doCountdown();
                }
            }]
        });
    }

    //var as = audiojs.createAll();
    if ($(".iposteraudioplayer").length > 0)
        var as = audiojs.create(document.getElementsByClassName("iposteraudioplayer"));

    $(document).on("click", ".playaudio", function (index, element) {
        var audiourl = $("#" + this.id).data("url");
        var audio = as[0];
        if (s3Folder != "")
            audio.load(audiourl.replace("/GetFile.ashx?file=", s3Folder));
        else
            audio.load(audiourl.replace("GetFile.ashx", "GetAudio.ashx"));
        audio.play();
        $(".audioplayerwrapper").show();
    });
    $(document).on("click", ".closeaudio", function (index, element) {
        var audio = as[0];
        audio.pause();
        $(".audioplayerwrapper").hide();
    });

    //if not s3, correct audio playback correct handler
    if (typeof s3Folder == "undefined" || s3Folder == "") {
        $('audio').each(function () {
            var o = $(this);
            var src = o.attr("src");
            o.attr("src", src.replace("GetFile.ashx", "GetAudio.ashx"));
        });
    }

    //check broken images if AWS
    if (s3Folder != "")
        $('.block img').each(function () {
            if ((typeof this.naturalWidth != "undefined" &&
                this.naturalWidth == 0)
                || this.readyState == 'uninitialized') {
                var file = $(this).attr("src");
                if (file.indexOf("GetFile.ashx") > -1) {
                    file = file.substring(file.lastIndexOf("/") + 1);
                    $(this).addClass("awserror").attr("src", "/GetFile.ashx?file=" + file);
                    checkResource("/GetFile.ashx?file=" + file);
                }
            }
        });

    //if kiosk or not, do stuff here
    if ($("body").hasClass("kiosk")) { //is kiosk
        $("#printpanel").hide(); //hide print
    } else { //is not
        $("#attendee-rating").hide(); //hide attendee rating
    }

    //convert chat/session time to local time
    $(".utctolocaltime-function").each(function () {
        var o = $(this);
        var sdate = o.data("starttimeutc");
        var edate = o.data("endtimeutc");

        o.attr("datetime", sdate.trim());
        o.text(toTimeZone(sdate).format('LLL') + '-' + toTimeZone(edate).format('LT') + ' ' + tzAbbr());
    });
});

const format = 'YYYY-MM-DD HH:mm ZZ';

function toTimeZone(time, zone) {
    zone = zone || new Date().getTimezoneOffset();
    return moment(time, format).lang(navigator.language).zone(zone);
}

var tzAbbr = function (dateInput) {
    var dateObject = dateInput || new Date(),
        dateString = dateObject + "",
        tzAbbr = (
            // Works for the majority of modern browsers
            dateString.match(/\(([^\)]+)\)$/) ||
            // IE outputs date strings in a different format:
            dateString.match(/([A-Z]+) [\d]{4}$/)
        );

    if (tzAbbr) {
        // Old Firefox uses the long timezone name (e.g., "Central
        // Daylight Time" instead of "CDT")
        tzAbbr = tzAbbr[1].match(/[A-Z]/g);

        if (tzAbbr != null)
            tzAbbr = tzAbbr.join("");
        else
            tzAbbr = "";
    }

    return tzAbbr;
};

function checkResource(url) {
    var req = new XMLHttpRequest();
    req.open('HEAD', url, true);
    req.send();
    if (req.status === 404) {

    }
    if (req.status === 403) {
        console.log("Broken picture:" + url);
    }
};

function resetEdit() {

    if (activeDiv) {
        //$(".more").each(function () { $(this).children(":first").text("OPEN"); });
        $("#edit-background").hide();
        activeDiv.removeClass("must-hide").prev(".close").removeClass("must-show").closest(".block").attr("style", "");
        if (activeDiv.parent().prev().hasClass("helper")) { //reset helper
            activeDiv.parent().prev().height(1).removeClass("active");
        }
        activeDiv = null;
        l = -1;

        setTimeout(function () {
            jQuery('.scrollable-area-wrapper').css({
                height: ''
            })
            initAll();
            jcf.customForms.refreshAll();
        }, 100);
    }
}

$(window).load(function () {
    //fix background colors
    if (OnClientColorChange()) {
        //remove loader once done
        $(".loading").fadeOut();

        //reset scrollbars
        if (typeof printPDF == 'undefined')
            setTimeout(function () {
                jQuery('.scrollable-area-wrapper').css({
                    height: ''
                })
                initAll();
                jcf.customForms.refreshAll();
            }, 100);
    }
});

///color picker stuff
function OnClientColorChange() {

    //BACKGROUND
    var fillColor = $find("FillColor").get_selectedColor();
    var gradientColor = $find("GradientColor").get_selectedColor();

    if (fillColor != null)
        var style = "background:" + fillColor + " !important;";

    if (fillColor != null && gradientColor != null) {
        style += "background:-moz-linear-gradient(top,  " + fillColor + " 0%, " + gradientColor + " 100%) !important;" +
            "background:-webkit-gradient(linear, left top, left bottom, color-stop(0%," + fillColor + "), color-stop(100%," + gradientColor + ")) !important;" +
            "background:-webkit-linear-gradient(top,  " + fillColor + " 0%," + gradientColor + " 100%) !important; " +
            "background:-o-linear-gradient(top,  " + fillColor + " 0%," + gradientColor + " 100%) !important; " +
            "background:-ms-linear-gradient(top,  " + fillColor + " 0%," + gradientColor + " 100%) !important; " +
            "background:linear-gradient(to bottom,  " + fillColor + " 0%," + gradientColor + " 100%) !important;"
    }

    //make sure styles are always removed
    clearStyle("backgroundColorCSS");

    //add style and value to hidden field
    if (fillColor != null) {
        //we also need to add style for our small display box
        addStyle("backgroundColorCSS", "#wrapper", style, "#background-image{ " + style + " }");
        $("#iFillColor").val(fillColor);
    }
    else
        $("#iFillColor").val('');

    if (gradientColor != null)
        $("#iGradientColor").val(gradientColor);
    else
        $("#iGradientColor").val('');

    //TITLE
    addStyleToTitle("titleTextColorCSS", "TitleTextColor", "#header .holder h2,.footer .textholder h2");

    //SUBTITLE
    addStyleToTitle("subtitleTextColorCSS", "SubtitleTextColor", "#header .holder h3,#header .holder h4,.footer .textholder h3,.footer .textholder h4");

    //the rest
    addColorStyleToElem("textBoxTitleColorCSS", "TextboxTitleColor", "color", ".column .block h2");
    addColorStyleToElem("textBoxTitleBackgroundColorCSS", "TextboxTitleBackgroundColor", "background-color", ".column .block h2");

    addColorStyleToElem("textboxTitleMiddleBackgroundColorCSS", "TextboxTitleMiddleBackgroundColor", "background-color", ".column .block.bg1 h2");

    addColorStyleToElem("textBoxTextboxColorCSS", "TextboxTextColor", "color", ".column .block:not(.bg1):not(.center) .text");
    addColorStyleToElem("sideTextboxColorCSS", "SideTextboxBackgroundColor", "background", ".column .block:not(.bg1):not(.bg2)");
    addColorStyleToElem("middleTextBoxTextboxColorCSS", "MiddleTextboxTextColor", "color", ".column .block.bg1 .text");
    addColorStyleToElem("middleTextboxColorCSS", "MiddleTextBackgroundColor", "background", ".column .block.bg1");
    addColorStyleToElem("centerTextBoxTextboxColorCSS", "CenterTextboxTextColor", "color", ".column .block.center .text");
    addColorStyleToElem("centerTextboxColorCSS", "CenterTextBackgroundColor", "background", ".column .block.center");

    //fonts
    addStyleToElem("titleTextFontCSS", "TitleTextFont", "font-family", "#header .holder h2,.footer .textholder h2");
    addStyleToElem("subtitleTextFontCSS", "SubtitleTextFont", "font-family", "#header .holder h3,#header .holder h4,.footer .textholder h3,.footer .textholder h4");
    addStyleToElem("textboxTitleFontCSS", "TextboxTitleFont", "font-family", ".column .block h2");
    addStyleToElem("textboxTextCSS", "TextboxTextFont", "font-family", ".column .block");


    // addStyle("arrowSize", ".column .block .more span", "background-size:70% !important;", "");

    //Christer commented out arrow size
    //addStyle("arrowSize", ".column .block .more span", "background-size:contain !important;", "");

    addImageStyleToElem("arrowColor", "ArrowColor", "background", ".column .block .more span", " no-repeat 50% 100% !important; background-size: contain ");
    if ($("#ArrowColor").val() == "bg-more.png")
        addStyle("arrowFontColor", ".more span", "color:#ddd !important;");
    else
        addStyle("arrowFontColor", ".more span", "color:#555 !important;");

    return true;
}

//general functions
function clearStyle(id) {
    if ($("#" + id).length > 0)
        $("#" + id).remove();
}
function addStyle(id, el, value, extra, afterElem) {
    //remove if css already exists
    if ($("#" + id).length > 0)
        $("#" + id).remove();

    if (extra + '' == 'undefined')
        extra = '';

    if (value != null && value != "undefined" && value != "") {
        var o = $("form").first();
        if (afterElem != '' && $(afterElem).length > 0)
            o = $(afterElem);
        o.after("<style id='" + id + "'>" + el + "{ " + value + " }" + extra + "</style>");
    }
}

function addStyleToElem(styleID, elemID, cssProperty, elementName) {
    clearStyle(styleID);

    if (elementName == "")
        $("#" + elemID).val("");
    else {
        var myValue = $("#" + elemID).val();

        var style = "";
        var el = elementName;

        if (myValue != null && myValue != "") {
            style += cssProperty + ": " + myValue + " !important;";
        }

        if (style.length > 0)
            addStyle(styleID, el, style);
    }
}

function addImageStyleToElem(styleID, elemID, cssProperty, elementName, extra) {
    clearStyle(styleID);

    if (elementName == "")
        $("#" + elemID).val("");
    else {
        var myValue = $("#" + elemID).val();

        if (extra + '' == 'undefined')
            extra = '';

        var style = "";
        var el = elementName;

        if (myValue != null && myValue != "") {
            style += cssProperty + ": url(/Common/Images/SIWI/" + myValue + ") " + extra + " !important;";
        }

        if (style.length > 0)
            addStyle(styleID, el, style);
    }
}

function addColorStyleToElem(styleID, elemID, cssProperty, elementName) {
    clearStyle(styleID);

    var myPicker = $find(elemID);
    var myColor = null;

    if (elementName == "")
        myPicker.set_selectedColor(null);
    else {
        if (myPicker != null)
            myColor = myPicker.get_selectedColor();

        var style = "";
        var el = elementName;

        if (myColor != null && myColor != "") {
            style += cssProperty + ": " + myColor + " !important;";
        }

        if (style.length > 0)
            addStyle(styleID, el, style);
    }

    //expects input id to have same name as color picket expect i in the beginning
    if (myColor != null && myColor != "") {
        $("#i" + elemID).val('' + myColor);
    }
    else {
        $("#i" + elemID).val('');
    }
}

function addStyleToTitle(styleID, textColorID, elementName) {
    clearStyle(styleID);

    var titleTextColor = null;
    var titleTextShadowColor = null;

    if (elementName == "") {
        $find(textColorID).set_selectedColor(null);
    } else {
        titleTextColor = $find(textColorID).get_selectedColor();

        var style = "";
        var el = elementName;
        if (titleTextColor != null) {
            style += "color: " + titleTextColor + " !important;";
        }

        if (style.length > 0)
            addStyle(styleID, el, style);
    }

    //expects input id to have same name as color picket expect i in the beginning
    if (titleTextColor != null)
        $("#i" + textColorID).val(titleTextColor);
    else
        $("#i" + textColorID).val('');
}

// When the window is resized
$(function () {
    if (typeof printPDF == 'undefined') $(window).resize(videoFix);
    setTimeout(function () { videoFix(); audioFix(); }, 500);
})

function audioFix() {
    if (typeof printPDF != 'undefined' && printPDF != "") {
        $("audio").remove();
    }
}

function videoFix() {
    // Resize all videos according to their own aspect ratio
    var idcount = 1;
    $("body:not(page2) iframe[src^='//player.vimeo.com'], body:not(page2) iframe[src^='https://player.vimeo.com'], body:not(page2) iframe[src^='http://player.vimeo.com'], body:not(page2) iframe[src^='//www.youtube.com'], body:not(page2) iframe[src^='http://www.youtube.com'], body:not(page2) iframe[src^='https://www.youtube.com']").each(function () {

        if (typeof printPDF == 'undefined') {
            if ($(this).parents(".cf-page").length == 0) {
                $(this).attr("id", "video" + idcount);
                idcount++;

                var actDiv = $(this).closest(".text");
                var closestWidth = actDiv.width();

                var curW = $(this).width();
                var curH = $(this).height();

                $(this)
                    .width(closestWidth)
                    .height(closestWidth * curH / curW);
            }
        } else { //PDF print
            $(this).hide().after("<p class=\"compressed\">[VIDEO] " + $(this).attr("src") + "</p>");
        }
    });
}

var timer_active = false;
var timer;

function doCountdown() {
    if (timer_active) timer = window.clearInterval(timer);
    $("#countdown").addClass("show");


    myminutes = countdown / 60;
    myseconds = countdown - (myminutes - 1) * 60; myseconds = myseconds == "60" ? 0 : myseconds;

    $("#countdown > div > div").text((myseconds + '').length > 1 ? "0" + myminutes + ":" + myseconds : "0" + myminutes + ":0" + myseconds);

    timer = window.setInterval(function () {

        timer_active = true;
        countdown--;

        myminutes = parseInt(countdown / 60);
        myseconds = parseInt(countdown - myminutes * 60); myseconds = myseconds == "60" ? 0 : myseconds;

        $("#countdown > div > div").text((myseconds + '').length > 1 ? "0" + myminutes + ":" + myseconds : "0" + myminutes + ":0" + myseconds);

        switch (countdown) {
            case 120:
                $("#countdown").addClass("time-warning-1");
                break;
            case 30:
                $("#countdown").removeClass("time-warning-1").addClass("time-warning");
                break;
            case 4:
            case 2:
                $("#countdown").addClass("time-warning");
                break;
            case 5:
            case 3:
            case 1:
                $("#countdown").removeClass("time-warning");
                break;
            case 0:
                $("#countdown").addClass("time-warning");
                $("#TimeIsUp").dialog({
                    modal: true,
                    closeOnEscape: true,
                    open: function (event, ui) {
                        $(".ui-dialog-buttonset, .ui-dialog-title").css("float", "none");
                        $(".ui-dialog-buttonpane, .ui-dialog-titlebar").css("text-align", "center");
                        $(".ui-dialog-buttonpane").css("padding", "0");
                    },
                    buttons: [{
                        text: "Close",
                        click: function () {
                            $(this).dialog("close");
                            $(".ui-dialog-buttonset, .ui-dialog-title").css("float", "");
                            $(".ui-dialog-buttonpane, .ui-dialog-titlebar").css("text-align", "");
                            $(".ui-dialog-buttonpane").css("padding", "");
                        }
                    }]
                });
                break;
        }
        if (countdown <= 0) {
            timer_active = false;
            timer = window.clearInterval(timer);
            $("#countdown > div > div").text("Time's up!");
        }
    }, 1000);
}

function checkModals() {
    if (referencesEmpty == 'undefined') {
    } else {
        if (referencesEmpty)
            $('#references').addClass('hide-print');
    }
    if (abstractEmpty == 'undefined') {
    } else {
        if (abstractEmpty)
            $('#abstract').addClass('hide-print');
    }
    if (cvEmpty == 'undefined') {
    } else {
        if (cvEmpty)
            $('#cv').addClass('hide-print');
    }
    if (disclosureEmpty == 'undefined') {
    } else {
        if (disclosureEmpty)
            $('#disclosure').addClass('hide-print');
    }

    if (noticeEmpty == 'undefined') {
    } else {
        if (noticeEmpty)
            $('#notice').addClass('hide-print');
    }

    $("#disclosure-show, #references-show, #cv-show, #abstract-show").css("height", "auto !important");
}

function getContrast(hexcolor) {
    hexcolor = hexcolor.replace("#", "0x");
    return (parseInt(hexcolor, 16) > 0xbbbbbb) ? 'bright' : 'ok';
}

function rgb2hex(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

var getContrast2 = function (hexcolor) {
    // If a leading # is provided, remove it
    if (hexcolor.slice(0, 1) === '#') {
        hexcolor = hexcolor.slice(1);
    }

    // If a three-character hexcode, make six-character
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split('').map(function (hex) {
            return hex + hex;
        }).join('');
    }

    // Convert to RGB value
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);

    // Get YIQ ratio
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // Check contrast
    return (yiq >= 170) ? 'bright' : 'good';

};

function msgToWD(command) {
    try {
        window.external.iPosterMsgIE(command);
    }
    catch (err) {
    }
    try {
        jsmessaging.iPosterMsgChr(command);
    }
    catch (err) {
    }
}