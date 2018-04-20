// ==UserScript==
// @name         javlibrary_preview
// @version      0.0.6
// @include      http*://*javlibrary.com/*/?v=*
// @description  preview from r18.com and pron.tv
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

// porn.tv
const Decrypt = () => {
	const base64_decode = atob
	const ord = r => (r + '').codePointAt(0)
	const hta = r => r.toString().match(/.{1,2}/g).reduce((a, c) => a + String.fromCharCode(parseInt(c, 16)), '')
	const strrev = r => [...r].reverse().join('')
	const strswpcs = r => [...r].map(i => i.match(/^[A-Za-z]$/) ? i === i.toLowerCase() ? i.toUpperCase() : i.toLowerCase() : i).join('')
	const decrypt = (r, t) => {
		let e = '', o = r.substring(0, 3)
		r = r.substring(3)
		'3' + aaa + 'f' == o ? (r = strrev(base64_decode(r))) : 'f' + bbb + '0' == o ? (r = hta(strrev(r))) : '6' + ccc + '3' == o ? (r = base64_decode(strrev(r))) : '5' + ddd + 'a' == o && (r = base64_decode(strswpcs(r)))
		for (let s = 0; s < r.length; s++) {
			let n = r.substr(s, 1), a = t.substr(s % t.length - 1, 1)
			n = Math.floor(ord(n) - ord(a))
			e += n = String.fromCharCode(n)
		}
		return e
	}
	let aaa, bbb, ccc, ddd, decryptStr
	return t => {
		;[aaa, bbb, ccc, ddd] = ['aaa', 'bbb', 'ccc', 'ddd'].map(i => t.match(new RegExp(`${i}.*=.*(\\d+)`))[1])
		decryptStr = t.match(/document\.write\(decrypt\('(.*?)'.*?'(.*)'\)/)
		return decrypt(decryptStr[1].replace(/\\/g, ''), decryptStr[2])
	}
}

const baseUrl = 'http://pron.tv'
const fetchList = async () => {
	const d = Decrypt(), parser = new DOMParser()
	const res = await gmFetch(baseUrl + '/stream/' + avid)
	const doc = parseHTML(res.responseText)
	const url = [...doc.querySelectorAll('div.title > a')].map(i => baseUrl + i.pathname).slice(0,10)
	const inf = [...doc.querySelectorAll('.hoster')].map(i => i.childNodes[2].nodeValue.trim())
	const urlSet=new Set()
	url.forEach(async (i, index) => {
		try {
			const res = await gmFetch(i)
			// get video code and decrypt
			const html = d(res.responseText)
			// get iframe src
			const src = parser.parseFromString(html, "text/html").querySelector('iframe').getAttribute('src')
			if (urlSet.has(src)) return
			urlSet.add(src)
			// add to list
			requestAnimationFrame(() => {
				$social.insertAdjacentHTML('beforebegin', `
			<div style='display:flex'>
			<a href='${src}' target='_blank' style='display:block;width:30em;text-overflow:ellipsis;overflow: hidden;white-space: nowrap'>${src}</a>
			<span style='white-space: nowrap;'>${inf[index]}</span></div>`)
			})
		} catch (e) { }
	})
}
fetchList()