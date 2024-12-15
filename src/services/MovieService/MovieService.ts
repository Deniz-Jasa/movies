import { getNameFromShow, getSlug } from '@/lib/utils';
import type {
  CategorizedShows,
  KeyWordResponse,
  Show,
  ShowWithGenreAndVideo,
} from '@/types';
import { MediaType } from '@/types';
import { type AxiosResponse } from 'axios';
import BaseService from '../BaseService/BaseService';
import {
  RequestType,
  type ShowRequest,
  type TmdbPagingResponse,
  type TmdbRequest,
} from '@/enums/request-type';
import { Genre } from '@/enums/genre';
import { cache } from 'react';

const requestTypesNeedUpdateMediaType = [
  RequestType.TOP_RATED,
  RequestType.NETFLIX,
  RequestType.POPULAR,
  RequestType.GENRE,
  RequestType.KOREAN,
];
const baseUrl = 'https://api.themoviedb.org/3';

type FavoriteItem = {
  id: number;
  mediaType: 'movie' | 'tv';
};

const FAVOURITES: FavoriteItem[] = [
  { id: 76331, mediaType: 'tv' },      // Succession
  { id: 652, mediaType: 'movie' },     // Troy
  { id: 238, mediaType: 'movie' },    // The Godfather
  { id: 278, mediaType: 'movie' },    // Shawshank Redemption
  { id: 550, mediaType: 'movie' },    // Fight Club
  { id: 680, mediaType: 'movie' },    // Pulp Fiction
  { id: 155, mediaType: 'movie' },    // The Dark Knight
  { id: 13, mediaType: 'movie' },     // Forrest Gump
  { id: 27205, mediaType: 'movie' },  // Inception
  { id: 299536, mediaType: 'movie' }, // Infinity War
  { id: 157336, mediaType: 'movie' }, // Interstellar
  { id: 244786, mediaType: 'movie' }, // Whiplash
];

class MovieService extends BaseService {
  static async findCurrentMovie(id: number, pathname: string): Promise<Show> {
    const data = await Promise.allSettled([
      this.findMovie(id),
      this.findTvSeries(id),
    ]);
    const response = data
      .filter(this.isFulfilled)
      .map(
        (item: PromiseFulfilledResult<AxiosResponse<Show>>) => item.value?.data,
      )
      .filter((item: Show) => {
        return pathname.includes(getSlug(item.id, getNameFromShow(item)));
      });
    if (!response?.length) {
      return Promise.reject('not found');
    }
    return Promise.resolve<Show>(response[0]);
  }

  static findMovie = cache(async (id: number) => {
    return this.axios(baseUrl).get<Show>(`/movie/${id}`);
  });

  static findTvSeries = cache(async (id: number) => {
    return this.axios(baseUrl).get<Show>(`/tv/${id}`);
  });

  static async getKeywords(
    id: number,
    type: 'tv' | 'movie',
  ): Promise<AxiosResponse<KeyWordResponse>> {
    return this.axios(baseUrl).get<KeyWordResponse>(`/${type}/${id}/keywords`);
  }

  static findMovieByIdAndType = cache(async (id: number, type: string) => {
    const params: Record<string, string> = {
      language: 'en-US',
      append_to_response: 'videos',
    };
    const response: AxiosResponse<ShowWithGenreAndVideo> = await this.axios(
      baseUrl,
    ).get<ShowWithGenreAndVideo>(`/${type}/${id}`, { params });
    return Promise.resolve(response.data);
  });

  static urlBuilder(req: TmdbRequest) {
    switch (req.requestType) {
      case RequestType.FAVOURITE:
        return `/movie/${FAVOURITES[0]}?language=en-US`;
      case RequestType.TRENDING:
        return `/trending/${
          req.mediaType
        }/day?language=en-US&with_original_language=en&page=${req.page ?? 1}`;
      case RequestType.TOP_RATED:
        return `/${req.mediaType}/top_rated?page=${
          req.page ?? 1
        }&with_original_language=en&language=en-US`;
      case RequestType.NETFLIX:
        return `/discover/${
          req.mediaType
        }?with_networks=213&with_original_language=en&language=en-US&page=${
          req.page ?? 1
        }`;
      case RequestType.POPULAR:
        return `/${
          req.mediaType
        }/popular?language=en-US&with_original_language=en&page=${
          req.page ?? 1
        }&without_genres=${Genre.TALK},${Genre.NEWS}`;
      case RequestType.GENRE:
        return `/discover/${req.mediaType}?with_genres=${
          req.genre
        }&language=en-US&with_original_language=en&page=${
          req.page ?? 1
        }&without_genres=${Genre.TALK},${Genre.NEWS}`;
      case RequestType.KOREAN:
        return `/discover/${req.mediaType}?with_genres=${
          req.genre
        }&with_original_language=ko&language=en-US&page=${req.page ?? 1}`;
      default:
        throw new Error(
          `request type ${req.requestType} is not implemented yet`,
        );
    }
  }

  static async getFavoriteShows() {
    const promises = FAVOURITES.map(({ id, mediaType }) => 
      mediaType === 'movie' ? this.findMovie(id) : this.findTvSeries(id)
    );
    
    const responses = await Promise.allSettled(promises);
    return responses
      .filter(this.isFulfilled)
      .map(res => {
        const show = res.value.data;
        show.media_type = show.first_air_date ? MediaType.TV : MediaType.MOVIE;
        return show;
      });
  }

  static executeRequest(req: {
    requestType: RequestType;
    mediaType: MediaType;
    page?: number;
  }) {
    if (req.requestType === RequestType.FAVOURITE) {
      return new Promise<AxiosResponse<TmdbPagingResponse>>(async (resolve) => {
        const favoriteShows = await this.getFavoriteShows();
        resolve({
          data: {
            results: favoriteShows,
            page: 1,
            totalPages: 1,
            totalResults: favoriteShows.length
          }
        } as AxiosResponse<TmdbPagingResponse>);
      });
    }
    return this.axios(baseUrl).get<TmdbPagingResponse>(this.urlBuilder(req));
  }

  static getShows = cache(async (requests: ShowRequest[]) => {
    const shows: CategorizedShows[] = [];
    const promises = requests.map((m) => this.executeRequest(m.req));
    const responses = await Promise.allSettled(promises);
    for (let i = 0; i < requests.length; i++) {
      const res = responses[i];
      if (this.isRejected(res)) {
        console.warn(`Failed to fetch shows ${requests[i].title}`, res.reason);
        shows.push({
          title: requests[i].title,
          shows: [],
          visible: requests[i].visible,
        });
      } else if (this.isFulfilled(res)) {
        if (
          requestTypesNeedUpdateMediaType.indexOf(requests[i].req.requestType) >
          -1
        ) {
          res.value.data.results.forEach(
            (f) => (f.media_type = requests[i].req.mediaType),
          );
        }
        shows.push({
          title: requests[i].title,
          shows: res.value.data.results,
          visible: requests[i].visible,
        });
      } else {
        throw new Error('unexpected response');
      }
    }
    return shows;
  });

  static searchMovies = cache(async (query: string, page?: number) => {
    const { data } = await this.axios(baseUrl).get<TmdbPagingResponse>(
      `/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=${
        page ?? 1
      }`,
    );
    console.log(data.results[0]?.media_type);
    data.results.sort((a, b) => {
      return b.popularity - a.popularity;
    });
    return data;
  });
}

export default MovieService;
