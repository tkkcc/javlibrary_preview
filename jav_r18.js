// ==UserScript==
// @name         jav_r18
// @version      0.0.1
// @include      http*://*javlibrary.com/*/?v=*
// @description  详情页添加r18.com预览
// @homepageURL  https://github.com/tkkcc/userscript
// @supportURL   https://github.com/tkkcc/userscript/issues
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// ==/UserScript==
(()=> {
    'use strict';
    const parseHTML =  (str) => {
        var tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = str;
        return tmp;
    };
    const avid = document.title.split(' ')[0];
    const get_video_url = (avid, callback) => {
        GM_xmlhttpRequest({
            url: `http://www.r18.com/common/search/searchword=${avid}`,
            onload: (res) => callback(parseHTML(res.responseText).querySelector('.js-view-sample').getAttribute('data-video-high'))
        });
    };
    const add_to_doc = (video_url) => {
        document.querySelector('#video_favorite_edit').insertAdjacentHTML('beforeend',
            `<video id='jav_r18' style='postiton:absolute;z-order:1' src=${video_url} controls autoplay></video>`);
    };
    if (document.querySelector('#video_jacket_img'))
        get_video_url(avid, add_to_doc);
})();
