let form = document.querySelector('form')
let search = document.querySelector('#search')

let overlay = document.querySelector('.overlay')
let searchName = document.querySelector('#searchName')

let results = document.querySelector('.results')

let item = document.querySelector('.item')
let info = document.querySelector('.info')

let similarBody = document.querySelector('.similar-body')

let compareOverlay = document.querySelector('.compareOverlay')

search.addEventListener('input', () => {
    if (search.value === '') {
        results.innerHTML = ''
    }
})

form.addEventListener('submit', info => {
    fetchResults(search.value)
    info.preventDefault()
})

function fetchResults(query) {
    fetch('https://api.themoviedb.org/3/search/movie?api_key=62e9bec2f6e90579beb97180ff68dab2&query=' + query)
        .then(response => response.json())
        .then(result => {
            results.innerHTML = ''

            let resultItem = document.createElement('ul')
            results.appendChild(resultItem)

            for (let n = 0; n < result['results'].length; n++) {
                results.style.display = 'block'
                let item = document.createElement('li')
                item.setAttribute('id', 'M' + result['results'][n]['id'])

                let img = document.createElement('img')
                img.setAttribute('alt', 'Poster')
                img.setAttribute('width', '50')

                if (result['results'][n]['poster_path'] !== null) {
                    img.setAttribute('src', 'https://image.tmdb.org/t/p/w200' + result['results'][n]['poster_path'])
                } else {
                    img.setAttribute('src', 'assets/placeholder.png')
                }

                let info = document.createElement('div')
                info.setAttribute('class', 'info')

                let title = document.createElement('a')
                title.textContent = result['results'][n]['original_title']

                let year = document.createElement('p')
                year.textContent = result['results'][n]['release_date']

                let rating = document.createElement('p')
                rating.setAttribute('class', 'rating')
                rating.textContent = 'Rating: ' + result['results'][n]['vote_average']

                resultItem.appendChild(item)
                item.appendChild(img)
                item.appendChild(info)
                info.appendChild(title)
                info.appendChild(year)
                info.appendChild(rating)

                item.addEventListener('click', (event) => {
                    let id = event.target.id
                    let movieID = id
                    let movieName = document.querySelector('#' + id + ' .info a').textContent
                    let movieImg = document.querySelector('#' + id + ' img').src
                    let movieYear = document.querySelector('#' + id + ' .info p:first-of-type').textContent
                    let movieRating = document.querySelector('#' + id + ' .info .rating').textContent
                    fetchSimilar(id, movieName, movieRating, 1)

                    if (sessionStorage.getItem('history') !== null) {
                        let previousHistory = sessionStorage.getItem('history')
                        var start = previousHistory.startsWith("[")
                        if (start) {
                            previousHistory = sessionStorage.getItem('history').slice(1, -1)
                        }
                        sessionStorage.setItem('history', '[' + JSON.stringify({ id: movieID, img: movieImg, name: movieName, year: movieYear, rating: movieRating }) + ',' + previousHistory + ']')
                    } else {
                        sessionStorage.setItem('history', '[' + JSON.stringify({ id: movieID, img: movieImg, name: movieName, year: movieYear }) + ']')
                    }
                })
            }

            let total = document.createElement('p')
            total.setAttribute('class', 'total')
            total.textContent = 'Total Results: ' + result['results'].length
            results.appendChild(total)
        })
}

function fetchSimilar(query, name, rating, page) {
    let intQuery = query.substring(1)
    let movieRating = rating.substr(8, 11)
    fetch('https://api.themoviedb.org/3/movie/' + intQuery + '/similar?api_key=62e9bec2f6e90579beb97180ff68dab2&page=' + page)
        .then(response => response.json())
        .then(result => {
            let similarAmount = document.querySelector('#similarAmount')
            similarAmount.textContent = result['total_results']

            for (let m = 0; m < result['results'].length; m++) {
                searchName.textContent = name
                overlay.style.display = 'block'

                let item = document.createElement('div')
                item.setAttribute('class', 'item')
                item.setAttribute('id', 'M' + result['results'][m]['id'])

                let img = document.createElement('img')
                img.setAttribute('alt', 'Poster')

                if (result['results'][m]['poster_path'] !== null) {
                    img.setAttribute('src', 'https://image.tmdb.org/t/p/w500' + result['results'][m]['poster_path'])
                } else {
                    img.setAttribute('src', 'assets/placeholder.png')
                }

                let title = document.createElement('div')
                title.setAttribute('class', 'title')

                similarBody.appendChild(item)
                item.appendChild(img)

                let info = document.createElement('div')
                info.setAttribute('class', 'info')

                let inner = document.createElement('div')
                inner.setAttribute('class', 'inner')

                let infoTitle = document.createElement('h1')
                infoTitle.textContent = result['results'][m]['original_title']

                let year = document.createElement('span')
                year.textContent = result['results'][m]['release_date']

                let rating = document.createElement('input')
                rating.setAttribute('type', 'hidden')
                rating.value = result['results'][m]['vote_average']

                let overview = document.createElement('p')
                overview.textContent = result['results'][m]['overview'].substr(0, 150) + '...'

                let genre = document.createElement('p')
                fetch('genres.json')
                    .then(response => response.json())
                    .then(genreList => {
                        for (let gID = 0; gID < result['results'][m]['genre_ids'].length; gID++) {
                            for (let gList = 0; gList < genreList['genres'].length; gList++) {
                                if (result['results'][m]['genre_ids'][gID] === genreList['genres'][gList]['id']) {
                                    genre.textContent = 'Genre: ' + genreList['genres'][gList]['name'].replace(' ', ', ')
                                }
                            }
                        }
                    })

                let netflixSearch = document.createElement('a')
                netflixSearch.setAttribute('href', 'https://www.netflix.com/search?q=' + result['results'][m]['original_title'])
                netflixSearch.setAttribute('target', '_blank')
                netflixSearch.innerText = 'Search on Netflix'

                let compare = document.createElement('span')
                compare.setAttribute('class', 'compareText')
                compare.setAttribute('id', 'M' + result['results'][m]['id'])
                compare.innerText = 'Compare to ' + name

                let bookmark = document.createElement('i')
                bookmark.setAttribute('class', 'fas fa-bookmark')
                bookmark.setAttribute('id', 'M' + result['results'][m]['id'])

                item.appendChild(info)
                info.appendChild(inner)
                inner.appendChild(bookmark)
                inner.appendChild(infoTitle)
                inner.appendChild(year)
                inner.appendChild(rating)
                inner.appendChild(overview)
                inner.appendChild(genre)
                inner.appendChild(netflixSearch)
                inner.appendChild(compare)

                bookmark.addEventListener('click', (event) => {
                    let movieID = event.target.id
                    let movieImg = document.querySelector('#' + movieID + ' img').src
                    let movieName = document.querySelector('#' + movieID + ' .info .inner h1').textContent
                    let movieYear = document.querySelector('#' + movieID + ' .info .inner span').textContent
                    let movieRating = document.querySelector('#' + movieID + ' input').value

                    if (localStorage.getItem('bookmarks') !== null) {
                        let previousBookmark = localStorage.getItem('bookmarks')
                        var start = previousBookmark.startsWith("[")
                        if (start) {
                            previousBookmark = localStorage.getItem('bookmarks').slice(1, -1)
                        }

                        localStorage.setItem('bookmarks', '[' + JSON.stringify({ id: movieID, img: movieImg, name: movieName, year: movieYear, rating: movieRating }) + ',' + previousBookmark + ']')
                    } else {
                        localStorage.setItem('bookmarks', '[' + JSON.stringify({ id: movieID, img: movieImg, name: movieName, year: movieYear }) + ']')

                    }
                    alert('Added to bookmark list!')
                })

                compare.addEventListener('click', (event) => {
                    compareOverlay.style.display = 'block'
                    let movieID = event.target.id
                    let compareName1 = document.querySelector('#' + movieID + ' .info .inner h1').textContent
                    let compareName2 = name
                    let compareRating1 = document.querySelector('#' + movieID + ' input').value
                    let compareRating2 = movieRating

                    var chart = document.getElementById('chart').getContext('2d');
                    var pieChart = new Chart(chart, {
                        type: 'pie',
                        data: {
                            datasets: [{
                                data: [
                                    compareRating1,
                                    compareRating2
                                ],
                                backgroundColor: [
                                    '#2980b9',
                                    '#16a085',
                                ],
                                borderColor: '#ecf0f1'
                            }],
                            labels: [
                                compareName1,
                                compareName2,
                            ]
                        },
                        options: {
                            responsive: true
                        }
                    });
                })

                compareOverlay.addEventListener('click', () => {
                    compareOverlay.style.display = 'none'
                })

                item.addEventListener('mouseover', () => {
                    info.style.display = 'block'
                })
                item.addEventListener('mouseout', () => {
                    info.style.display = 'none'
                })
            }

            let loadMore = document.querySelector('.load')
            let page = 0
            loadMore.addEventListener('click', () => {
                fetchSimilar(intQuery, name, rating, page += 1)
            })
        })
}

document.querySelector('#newSearch').addEventListener('click', () => {
    overlay.style.display = "none";
    similarBody.innerHTML = ''
    results.innerHTML = ''
    search.value = ''
})

window.addEventListener('click', (event) => {
    if (event.target == overlay || event.target == citiesOverlay) {
        citiesOverlay.style.display = 'none';
        overlay.style.display = 'none';
        similarBody.innerHTML = ''
        results.innerHTML = ''
        search.value = ''
    }
})

let bookmarkList = JSON.parse(localStorage.getItem('bookmarks'))
let bookmarkBody = document.querySelector('.bookmarked .body')
if (bookmarkList !== null) {
    for (let b = 0; b < bookmarkList.length; b++) {
        let bookmarkItem = document.createElement('div')
        bookmarkItem.setAttribute('class', 'item')

        let bookmarkImg = document.createElement('img')
        bookmarkImg.setAttribute('width', '50')
        bookmarkImg.setAttribute('src', bookmarkList[b]['img'])

        let bookmarkInfo = document.createElement('div')
        bookmarkInfo.setAttribute('class', 'info')

        let bookmarkName = document.createElement('p')
        bookmarkName.textContent = bookmarkList[b]['name']

        let bookmarkYear = document.createElement('span')
        bookmarkYear.textContent = bookmarkList[b]['year']

        let bookmarkRating = document.createElement('span')
        if (bookmarkList[b]['rating'] === '0' || bookmarkList[b]['rating'] === undefined) {
            bookmarkRating.innerHTML = '<br/>No rating'
        } else {
            bookmarkRating.innerHTML = '<br/>Rating: ' + bookmarkList[b]['rating']
        }

        bookmarkBody.appendChild(bookmarkItem)
        bookmarkItem.appendChild(bookmarkImg)
        bookmarkItem.appendChild(bookmarkInfo)
        bookmarkInfo.appendChild(bookmarkName)
        bookmarkInfo.appendChild(bookmarkYear)
        bookmarkInfo.appendChild(bookmarkRating)
    }
} else {
    let noBookmarks = document.createElement('p')
    noBookmarks.innerText = 'You have not bookmarked any movies'
    bookmarkBody.appendChild(noBookmarks)
}

let historyList = JSON.parse(sessionStorage.getItem('history'))
let historyBody = document.querySelector('.history .body')
if (historyList !== null) {
    for (let h = 0; h < historyList.length; h++) {
        let historyItem = document.createElement('div')
        historyItem.setAttribute('class', 'item')

        let historyImg = document.createElement('img')
        historyImg.setAttribute('width', '50')
        historyImg.setAttribute('src', historyList[h]['img'])

        let historyInfo = document.createElement('div')
        historyInfo.setAttribute('class', 'info')

        let historyName = document.createElement('p')
        historyName.textContent = historyList[h]['name']

        let historyYear = document.createElement('span')
        historyYear.textContent = historyList[h]['year']

        let historyRating = document.createElement('span')
        if (historyList[h]['rating'] === '0' || historyList[h]['rating'] === undefined) {
            historyRating.innerHTML = '<br/>No rating'
        } else {
            historyRating.innerHTML = '<br/>Rating: ' + historyList[h]['rating']
        }

        historyBody.appendChild(historyItem)
        historyItem.appendChild(historyImg)
        historyItem.appendChild(historyInfo)
        historyInfo.appendChild(historyName)
        historyInfo.appendChild(historyYear)
        historyInfo.appendChild(historyRating)
    }
} else {
    let noHistory = document.createElement('p')
    noHistory.innerText = 'You have no search history.'
    historyBody.appendChild(noHistory)
}


let cities = document.querySelector('.add')
let citiesOverlay = document.querySelector('.cities-overlay')
let citiesModal = document.querySelector('.cities-modal')

cities.addEventListener('click', () => {
    citiesOverlay.style.display = 'block'
    citiesModal.style.display = 'block'
})

fetch('https://avancera.app/cities/')
    .then(response => response.json())
    .then(result => {
        cityList = document.querySelector('.city-list table tbody')
        for (let c = 0; c < result.length; c++) {
            let cityItem = document.createElement('tr')

            let cityName = document.createElement('td')
            cityName.textContent = result[c]['name']

            let cityPopulation = document.createElement('td')
            cityPopulation.textContent = result[c]['population']

            let cityActions = document.createElement('td')

            let cityEdit = document.createElement('span')
            cityEdit.innerHTML = '<i class="far fa-edit"></i>'

            let cityDelete = document.createElement('span')
            cityDelete.innerHTML = '<i class="far fa-trash-alt"></i>'

            cityList.appendChild(cityItem)
            cityItem.appendChild(cityName)
            cityItem.appendChild(cityPopulation)
            cityItem.appendChild(cityActions)
            cityActions.appendChild(cityEdit)
            cityActions.appendChild(cityDelete)

            cityEdit.addEventListener('click', () => {
                cityItem.removeChild(cityName)
                cityItem.removeChild(cityPopulation)
                cityItem.removeChild(cityActions)

                let editItemOne = document.createElement('td')
                let editItemTwo = document.createElement('td')

                let editName = document.createElement('input')
                editName.setAttribute('value', result[c]['name'])

                let editPopulation = document.createElement('input')
                editPopulation.setAttribute('value', result[c]['population'])

                let editSumbit = document.createElement('td')
                editSumbit.innerHTML = '<button id="editCity">Edit</button>'

                cityItem.appendChild(editItemOne)
                cityItem.appendChild(editItemTwo)
                cityItem.appendChild(editSumbit)

                editItemOne.appendChild(editName)
                editItemTwo.appendChild(editPopulation)

                editSumbit.addEventListener('click', () => {
                    editCity(result[c]['id'], editName.value, editPopulation.value)

                    cityItem.removeChild(editItemOne)
                    cityItem.removeChild(editItemTwo)
                    cityItem.removeChild(editSumbit)

                    let editedName = document.createElement('td')
                    editedName.textContent = editName.value

                    let editedPopulation = document.createElement('td')
                    editedPopulation.textContent = editPopulation.value

                    let editedActions = document.createElement('td')

                    let editedEdit = document.createElement('span')
                    editedEdit.innerHTML = '<i class="far fa-edit"></i>'

                    let editedDelete = document.createElement('span')
                    editedDelete.innerHTML = '<i class="far fa-trash-alt"></i>'

                    cityItem.appendChild(editedName)
                    cityItem.appendChild(editedPopulation)

                    cityItem.appendChild(editedActions)

                    editedActions.appendChild(editedEdit)
                    editedActions.appendChild(editedDelete)
                })
            })

            cityDelete.addEventListener('click', () => {
                removeCity(result[c]['id'])
                cityItem.innerHTML = ''
            })
        }
    })

document.querySelector('#addCity').addEventListener('click', () => {
    addCity(document.querySelector('#city').value, document.querySelector('#population').value)
})

function addCity(name, population) {
    fetch('https://avancera.app/cities/', {
        body: '{ "name": "' + name + '", "population": ' + population + '}',
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST'
    })
        .then(response => response.json())
        .then(result => {
            let latest = result.length - 1

            cityList = document.querySelector('.city-list table tbody')
            let cityItem = document.createElement('tr')

            let cityName = document.createElement('td')
            cityName.textContent = result[latest]['name']

            let cityPopulation = document.createElement('td')
            cityPopulation.textContent = result[latest]['population']

            let cityActions = document.createElement('td')

            let cityEdit = document.createElement('span')
            cityEdit.innerHTML = '<i class="far fa-edit"></i>'

            let cityDelete = document.createElement('span')
            cityDelete.innerHTML = '<i class="far fa-trash-alt"></i>'

            cityList.appendChild(cityItem)
            cityItem.appendChild(cityName)
            cityItem.appendChild(cityPopulation)
            cityItem.appendChild(cityActions)
            cityActions.appendChild(cityEdit)
            cityActions.appendChild(cityDelete)

            cityEdit.addEventListener('click', () => {
                cityItem.removeChild(cityName)
                cityItem.removeChild(cityPopulation)
                cityItem.removeChild(cityActions)

                let editItemOne = document.createElement('td')
                let editItemTwo = document.createElement('td')

                let editName = document.createElement('input')
                editName.setAttribute('value', result[latest]['name'])

                let editPopulation = document.createElement('input')
                editPopulation.setAttribute('value', result[latest]['population'])

                let editSumbit = document.createElement('td')
                editSumbit.innerHTML = '<button id="editCity">Edit</button>'

                cityItem.appendChild(editItemOne)
                cityItem.appendChild(editItemTwo)
                cityItem.appendChild(editSumbit)

                editItemOne.appendChild(editName)
                editItemTwo.appendChild(editPopulation)

                editSumbit.addEventListener('click', () => {
                    editCity(result[latest]['id'], editName.value, editPopulation.value)

                    cityItem.removeChild(editItemOne)
                    cityItem.removeChild(editItemTwo)
                    cityItem.removeChild(editSumbit)

                    let editedName = document.createElement('td')
                    editedName.textContent = editName.value

                    let editedPopulation = document.createElement('td')
                    editedPopulation.textContent = editPopulation.value

                    let editedActions = document.createElement('td')

                    let editedEdit = document.createElement('span')
                    editedEdit.innerHTML = '<i class="far fa-edit"></i>'

                    let editedDelete = document.createElement('span')
                    editedDelete.innerHTML = '<i class="far fa-trash-alt"></i>'

                    cityItem.appendChild(editedName)
                    cityItem.appendChild(editedPopulation)

                    cityItem.appendChild(editedActions)

                    editedActions.appendChild(editedEdit)
                    editedActions.appendChild(editedDelete)
                })
            })

            cityDelete.addEventListener('click', () => {
                removeCity(result[latest]['id'])
                cityList.removeChild(cityItem)
            })
        })
}

function editCity(id, name, population) {
    fetch('https://avancera.app/cities/' + id, {
        body: '{ "name": "' + name + '", "population": ' + population + '}',
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'PUT'
    })
}

function removeCity(id) {
    fetch('https://avancera.app/cities/' + id, {
        method: 'DELETE'
    })
}
