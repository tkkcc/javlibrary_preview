// ==UserScript==
// @name         javlibrary_preview
// @version      0.0.7
// @include      http*://*javlibrary.com/*/?v=*
// @description  preview from r18.com
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @namespace    https://greasyfork.org/users/164996a
// ==/UserScript==
// r18.com
// insert position, no need to wait
const $position = document.querySelector('#video_favorite_edit')
const $social = $position.nextElementSibling
if (!$position) return
// GM_xmlhttpRequest promise wrapper
const gmFetch = url => new Promise((resolve, reject) => {
	GM_xmlhttpRequest({ url: url, method: 'GET', onload: resolve, onerror: reject })
})

const parseHTML = str => {
	const tmp = document.implementation.createHTMLDocument()
	tmp.body.innerHTML = str
	return tmp
}

const avid = document.title.split(' ')[0]

const addToDoc = video_url => {
	const text = video_url
		? `<video id='jav_r18' style='postiton:absolute;z-order:1' src=${video_url} controls autoplay></video>`
		: '<div class="header" style="text-align:center;padding-top:1rem;">preview not found</div>'
	$position.insertAdjacentHTML('afterend', text)
}

const r18 = async () => {
	const res = await gmFetch(`http://www.r18.com/common/search/searchword=${avid}`)
	let video_url = ''
	try {
		const video_tag = parseHTML(res.responseText).querySelector('.js-view-sample')
		video_url = ['high', 'med', 'low'].map(i => video_tag.getAttribute('data-video-' + i)).find(i => i)
	} catch (err) { } finally {
		addToDoc(video_url)
	}
}
r18()
// google
const num=6
const baseUrl = `https://www.google.com/search?tbm=vid&num=${num}&safe=images&pws=0&lr=lang_en\
&as_eq=youtube.com+javlibrary.com+pron.tv&q=`
const fetchList = async () => {
	const parser = new DOMParser()
	const res = await gmFetch(baseUrl + avid)
	const doc = parseHTML(res.responseText)
	// console.log(doc)
	const url = [...doc.querySelectorAll('.g .r a')].map(i => i.href)
	url.forEach(src => {
		requestAnimationFrame(() => {
			$social.insertAdjacentHTML('beforebegin', `
			<div style='display:flex'>
			<a href='${src}' target='_blank' style='display:block;width:40em;text-overflow:ellipsis;overflow: hidden;white-space: nowrap'>${src}</a>
			</div>`)
		})
	})
}
fetchList()