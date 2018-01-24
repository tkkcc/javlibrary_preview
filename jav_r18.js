// ==UserScript==
// @name         jav_r18
// @version      0.0.3
// @include      http*://*javlibrary.com/*/?v=*
// @description  详情页添加r18.com预览
// @supportURL   https://github.com/tkkcc/jav_r18/issues
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @namespace    https://greasyfork.org/users/164996
// ==/UserScript==
(function () {
    'use strict';
    const parseHTML = str => {
        const tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = str;
        return tmp;
    };
    const avid = document.title.split(' ')[0];
    const add_to_doc = video_url => {
        const text = video_url ? `<video id='jav_r18' style='postiton:absolute;z-order:1' src=${video_url} controls autoplay></video>`
            : '<div class="header" style="text-align:center;padding-top:1rem;">preview not found</div>';
        document.querySelector('#video_favorite_edit').insertAdjacentHTML('afterend', text);
    };
    const get_video_url = (avid, callback) => {
        GM_xmlhttpRequest({
            url: `http://www.r18.com/common/search/searchword=${avid}`,
            onload: res => {
                try {
                    const video_tag = parseHTML(res.responseText).querySelector('.js-view-sample');
                    let video_url = video_tag.getAttribute('data-video-high');
                    video_url = video_url ? video_url : video_tag.getAttribute('data-video-med');
                    video_url = video_url ? video_url : video_tag.getAttribute('data-video-low');
                    callback(video_url);
                } catch (err) { callback(''); }
            }
        });
    };
    if (document.querySelector('#video_jacket_img')) get_video_url(avid, add_to_doc);
})();
