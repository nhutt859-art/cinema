import axiosClient from './axiosClient'

const movieApi = {
  getMovies: (params) => axiosClient.get('/movies', { params }),
  getNowShowing: (params) => axiosClient.get('/movies/now-showing', { params }),
  getComingSoon: (params) => axiosClient.get('/movies/coming-soon', { params }),
  getMovieDetail: (id) => axiosClient.get(`/movies/${id}`),
  searchMovies: (keyword, params) => axiosClient.get('/movies/search', { params: { keyword, ...params } }),
  getGenres: () => axiosClient.get('/genres'),
  filterByGenres: (genreIds, params) => axiosClient.get('/movies/filter', { params: { genreIds: genreIds.join(','), ...params } }),
}

export default movieApi
