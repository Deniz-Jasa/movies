import React from 'react';
import SiteHeader from '@/components/main/site-header';
import { siteConfig } from '@/configs/site';
import { RequestType, type ShowRequest } from '@/enums/request-type';
import MovieService from '@/services/MovieService';
import { MediaType, type Show } from '@/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import Image from 'next/image';

export const revalidate = 3600;

export default async function NewAndPopularPage() {
    const h1 = `${siteConfig.name} New And Popular`;
    const requests: ShowRequest[] = [
        {
            title: 'Netflix',
            req: { requestType: RequestType.NETFLIX, mediaType: MediaType.TV },
            visible: false,
        },
        {
            title: 'Trending TV Shows',
            req: { requestType: RequestType.TRENDING, mediaType: MediaType.TV },
            visible: true,
        },
        {
            title: 'Trending Movies',
            req: { requestType: RequestType.TRENDING, mediaType: MediaType.MOVIE },
            visible: true,
        },
        {
            title: 'Top Rated TV Shows',
            req: { requestType: RequestType.TOP_RATED, mediaType: MediaType.TV },
            visible: true,
        },
        {
            title: 'Top Rated Movies',
            req: { requestType: RequestType.TOP_RATED, mediaType: MediaType.MOVIE },
            visible: true,
        },
    ];
    const allShows = await MovieService.getShows(requests);

    return (
        <>
            <SiteHeader />
            <h1 className="hidden">{h1}</h1>

            <div className="absolute inset-0 z-0 h-screen w-full">
                <Image
                    src={`https://s3.amazonaws.com/venuesnow.com/wp-content/uploads/2024/03/01074636/SBGettyImages-1086947398.jpg`}
                    alt='background'
                    className="-z-40 h-full w-full object-cover"
                    fill
                    priority
                />
                <div className="absolute bottom-0 left-0 right-0 top-0">
                    <div className="absolute bottom-[50%] left-[7%] top-0 z-10 flex w-[36%] flex-col justify-end space-y-2">
                        <h1 className="text-[6vw] sm:text-[4vw] md:text-[3vw] lg:text-[3vw] font-bold">
                            Coming Soon
                        </h1>

                        <div className="flex space-x-2 text-[2.8vw] font-semibold md:text-[1.3vw] lg:text-[1.3vw] xl:text-[0.9vw]">
                            <p className="text-green-600">
                                Releasing
                            </p>
                            <p>Winter 2025</p>
                        </div>

                        <p className="text-[1.7vw] sm:line-clamp-3 lg:text-[1.3vw] xl:text-[0.9vw]">
                            This page will contain all live sports, from soccer to NBA, NHL, NFL, and more, bringing you real-time action from around the world.
                        </p>
                    </div>
                    <div className="opacity-71 absolute inset-0 right-[26.09%] z-[8] bg-gradient-to-r from-secondary to-85%"></div>
                    <div className="absolute bottom-[-1px] left-0 right-0 z-[8] h-[14.7vw] bg-gradient-to-b from-background/0 from-30% via-background/30 via-50% to-background to-80%"></div>
                </div>
            </div>


        </>
    );
}
