const BASE_URL = 'https://movie-list.alphacamp.io'
// 串接電影 list
const INDEX_URL = BASE_URL + '/api/v1/movies/'
// 串接電影 img
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
let filteredMovies = [] // 存放搜尋完的結果

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const changeMode = document.querySelector('#change-mode')
// 每個分頁顯示多少的電影清單
const MOVIES_PER_PAGE = 12
// 觀摩 Model Answer
// 宣告currentPage去紀錄目前分頁，確保切換模式時分頁不會跑掉且搜尋時不會顯示錯誤
let currentPage = 1

// 處理電影 list
function renderMovieList(data) {
  let rawHTML = ''
  if (dataPanel.dataset.mode === 'card-mode') {
    
    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>`
    })
    
  } else if (dataPanel.dataset.mode === 'list-mode') {
    // let rawHTML = ''
    rawHTML = `<ul class="list-group">`
    data.forEach((item) => {
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <p class="fs-4">${item.title}</p>
        <div>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
      `
    })
    rawHTML += `</ul>`
    // dataPanel.innerHTML = rawHTML
  }
  dataPanel.innerHTML = rawHTML
}


// 處理彈窗內的資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // 解決資料殘影問題 - 自己新增的
  modalTitle.innerText = ''
  modalDate.innerText = ''
  modalDescription.innerText = ''
  modalImage.innerHTML = ''

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

// 處理新增 Favorite list
// 這支函式的目的是：「將使用者點擊到的那一部電影送進 local storage 儲存起來」，被儲存的資料需要手動刪除。
// 如要確認是否成功，打開 devtools → Application 看 Storage 中的 Local Storage。
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  // 以下是避免重複新增相同的電影到收藏清單中的判斷式。
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 點擊 more 的監聽器
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 處理搜尋功能，判斷使用者輸入的內容
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() // 阻止自動跳頁(重新整理)
  const keyword = searchInput.value.trim().toLowerCase()
  // 以下是判斷 keyword 的長度，如為0就跳出提示。
  // if (!keyword.length) {
  //   return alert('Please enter a valid string')
  // }
  searchInput.value = ""
  // 用 filter() 進行搜尋電影名稱
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  // 希望沒有搜到電影時跳出提示，搜尋列沒東西時，重新顯示所有電影清單
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  // 運用 loop 來做檢查輸入的電影名稱有在名單中
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  
  //重製分頁器
  renderPaginator(filteredMovies.length)
  // 預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))
})

// 計算分頁需要有幾頁
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

// 處理分頁
function getMoviesByPage(page) {
  // 運用三元運算子(類似 if...else)
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 點分頁的監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
  currentPage = page // 要記住點了第幾頁，這樣切換介面才會跟著連動
})

// 處理轉換介面
// function changDataMode (dataMode) {
//   dataPanel.dataset.mode = dataMode
// }

// 點圖示改變介面顯示的監聽器
changeMode.addEventListener('click', function onChangeModeButton(event) {
  const target = event.target
  if (target.matches('#card-button')) {
    dataPanel.dataset.mode = 'card-mode'
  } else if (target.matches('#list-button')) {
    dataPanel.dataset.mode = 'list-mode'
  }
  renderMovieList(getMoviesByPage(currentPage))
})


axios
  .get(INDEX_URL)
  .then((response) => {
    // 使用展開運算子，三個點的功用是「展開陣列元素」。
    movies.push(...response.data.results)
    renderPaginator(movies.length)  // 分頁的長度
    renderMovieList(getMoviesByPage(1)) // 顯示第幾頁
  })
  .catch((err) => console.log(err))