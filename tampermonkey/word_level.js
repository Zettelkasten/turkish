// ==UserScript==
// @name         Turkish Word Form
// @namespace    http://tampermonkey.net/
// @version      2025-06-29
// @description  try to take over the world!
// @author       Frithjof
// @match        https://tr.wikipedia.org/wiki/Orhan_Pamuk
// @match        https://coltekin.net/cagri/trmorph/index.php
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        GM.xmlHttpRequest
// @connect      coltekin.net
// @require https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    $(document).ready(() => {
        function wrapTextNodes($node) {
            // Skip undesirable elements
            if ($node.is('script, style, textarea, input, iframe')) return;

            $node.contents().each(function() {
                if (this.nodeType === 3 && $.trim(this.nodeValue) !== '') {
                    const $parent = $(this).parent();
                    const words = this.nodeValue.split(" ");
                    var newEl = "";

                    $.each(words, function(_, word) {
                        newEl += `<span class="tooltip-word">${word}</span> `;
                    });

                    console.log(this.nodeValue, newEl);

                    $(this).replaceWith($(newEl));
                } else if (this.nodeType === 1) {
                    wrapTextNodes($(this));
                }
            });
        }

        wrapTextNodes($('body'));

        function parseResult(resultEl) {
            return resultEl.find("ul").html();
        }

        $("head").append(`<style>
        .turkish-form-anchor {
          position: relative;
        }
        .turkish-form-box {
          background-color: red;
          position: absolute;
          top: 100%;
          left: 0;
          background: black;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          font-size: 12px;
          z-index: 1000;
        }
        .turkish-form-box, .turkish-form-box a {
          color: white !important;
        }
        </style>`);
        let formBox = $("<div class='turkish-form-box'>HELLO, world!</div>");
        formBox.hide();
        let currentAnchor = null;
        $(document).on("mouseenter", ".tooltip-word", (event) => {
            let el = $(event.target);
            currentAnchor = el;
            el.addClass("turkish-form-anchor");
            $(formBox).appendTo(el);

            // wait one second, if the user is still howevering on this field; then run the API call.
            setTimeout(() => {
                if (currentAnchor == el) {
                    var prevData = $(el).data("form");
                    if (prevData) {
                        $(formBox).html(prevData);
                        $(formBox).show();
                    } else {
                        console.log(el);
                        var rawWord = el[0].innerText;
                        console.log(rawWord);
                        GM.xmlHttpRequest({
                            method: "POST",
                            url: "https://coltekin.net/cagri/trmorph/index.php",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            data: `word=${rawWord}&submit=Analyze`,
                            onload: function(response) {
                                // console.log("POST success:", response.responseText);
                                let result = parseResult($(response.responseText).find(".trmorph-demo-result"));
                                console.log(result);
                                $(el).data("form", result);
                                if (currentAnchor == el) {
                                    $(formBox).html(result);
                                    $(formBox).show();
                                }
                            },
                            onerror: function(error) {
                                console.error("POST failed:", error);
                            }
                        });
                    }
                }
            }, 1000);
        });
        $(document).on("mouseleave", ".tooltip-word", (event) => {
            $(formBox).hide();
            currentAnchor = null;
        });
    });
})();