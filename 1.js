// ==UserScript==
// @name         javlibrary_preview
// @version      0.0.20
// @include      http*://*javlibrary.com/*/?v=*
// @description  perview video and links
// @grant        GM_xmlhttpRequest
// @namespace    https://greasyfork.org/users/164996a
// ==/UserScript==
// insert position, no need to wait
const $position = document.querySelector('#video_favorite_edit')
if (!$position) return
// Promise.race but for success
const race = promises => {
  const newPromises = promises.map(
    p => new Promise((resolve, reject) => p.then(v => v && resolve(v), reject))
  )
  newPromises.push(Promise.all(promises).then(() => false))
  return Promise.race(newPromises)
}
// GM_xmlhttpRequest promise wrapper
const gmFetch = (url, method = 'GET') =>
  new Promise((onload, onerror) => {
    GM_xmlhttpRequest({ url, method, onload, onerror })
  })
const parseHTML = str => {
  const tmp = document.implementation.createHTMLDocument()
  tmp.body.innerHTML = str
  return tmp
}
const avid = document.title.replace(/([^-]+)-([^ ]+) .*/, '$1-$2')
const preview = async () => {
  const r18 = async () => {
    try {
      const res = await gmFetch(
        `https://www.r18.com/common/search/order=match/searchword=${avid}`
      )
      const video_tag = parseHTML(res.responseText).querySelector('.js-view-sample')
      const src = ['high', 'med', 'low']
        .map(i => video_tag.getAttribute('data-video-' + i))
        .find(i => i)
      const srcs = ['dmb', 'dm', 'sm']
        .map(i => src.replace(/_(dmb|dm|sm)_/, `_${i}_`))
        .map(i => `<source src=${i}></source>`)
        .join('')
      return srcs
    } catch (_) {}
  }
  const prestige = async () => {
    try {
      const res = await gmFetch(
        `https://www.prestige-av.com/goods/goods_list.php?q=${avid}&m=search&p=1&s=date`
      )
      const dom = parseHTML(res.responseText)
      const url = dom.querySelectorAll('#body_goods > ul > li > a')
      const name = [...url].map(i =>
        new URL(i.getAttribute('href')).searchParams.get('sku').toUpperCase()
      )
      for (let n of name) {
        n = 'https://www.prestige-av.com/sample_movie/' + n + '.mp4'
        const res = await gmFetch(n, 'HEAD')
        if (res.status === 200) return `<source src=${n}></source>`
      }
    } catch (_) {}
  }
  let src = await race([r18(), prestige()])
  const html = src
    ? `<video id=jav_preview style='postiton:absolute;z-order:1' controls autoplay>${src}</video>`
    : '<div id=jav_preview class=header style="text-align:center;padding-top:1rem;">preview not found</div>'
  $position.insertAdjacentHTML('afterend', html)
}
preview()
// google
const num = 6
const baseUrl = `https://google.com/search?tbm=vid&num=${num}&safe=images&pws=0&lr=lang_en\
&as_eq=youtube.com+javlibrary.com+pron.tv+dailymotion.com+facebook.com+google.com&q=`
const fetchList = async () => {
  const res = await gmFetch(baseUrl + avid)
  const doc = parseHTML(res.responseText)
  const url = [...doc.querySelectorAll('.g .r a')].map(i => i.href)
  url.forEach(src => {
    requestAnimationFrame(() => {
      ;(document.getElementById('jav_preview') || $position).insertAdjacentHTML(
        'afterend',
        `<div style='display:flex'>
			<a href='${src}' target='_blank' style='display:block;width:41em;text-overflow:ellipsis;overflow: hidden;white-space: nowrap'>${src}</a>
		</div>`
      )
    })
  })
}
// extra search button
$position.insertAdjacentHTML(
  'afterend',
  `<button id=jav_perview_extra class=smallbutton style=\
'padding:0.5em;display:block;margin-top:0.5em'>extra search from google</button>`
)
const b = document.querySelector('#jav_perview_extra')
b.addEventListener('click', () => {
  b.style.display = 'none'
  fetchList()
})
