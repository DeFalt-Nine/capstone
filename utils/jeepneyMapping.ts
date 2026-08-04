export interface SpotJeepneyInfo {
    routeName: string;
    searchKeyword: string;
    dropOffStop: string;
    tip: string;
}

export const SPOT_TO_JEEPNEY_MAP: Record<string, SpotJeepneyInfo> = {
    'strawberry': {
        routeName: 'Buyagan - La Trinidad',
        searchKeyword: 'Buyagan',
        dropOffStop: 'Km. 5 / Strawberry Farm Junction',
        tip: 'Board a Buyagan or Puguis jeepney at Magsaysay Terminal and ask driver to drop you off at Strawberry Farm junction.'
    },
    'stobosa': {
        routeName: 'Pico - La Trinidad',
        searchKeyword: 'Pico',
        dropOffStop: 'Km. 3 (Colors of Stobosa)',
        tip: 'Any La Trinidad bound jeepney from Magsaysay passes Stobosa at Km. 3. Look for colorful hillside houses!'
    },
    'bell church': {
        routeName: 'Tomay - La Trinidad',
        searchKeyword: 'Tomay',
        dropOffStop: 'Km. 3 Bell Church',
        tip: 'All La Trinidad jeepney routes pass directly in front of Bell Church gate at Km. 3.'
    },
    'kalugong': {
        routeName: 'Tomay - La Trinidad',
        searchKeyword: 'Tomay',
        dropOffStop: 'Km. 6 / Cruz Junction',
        tip: 'Ride a Tomay jeepney to Km. 6 (Cruz junction), then take a short local tricycle or walk up Tawang road.'
    },
    'yangbew': {
        routeName: 'Tomay - La Trinidad',
        searchKeyword: 'Tomay',
        dropOffStop: 'Km. 6 / Cruz Junction',
        tip: 'Take Tomay jeepney to Cruz junction (Km. 6), then ride a local Tawang tricycle to Mt. Yangbew jump-off.'
    },
    'rose': {
        routeName: 'Tomay - La Trinidad',
        searchKeyword: 'Tomay',
        dropOffStop: 'Bahong Junction (Km. 6)',
        tip: 'Take Tomay jeepney to Km. 6 Bahong junction, then take a local Bahong jeepney down to the gardens.'
    },
    'bahong': {
        routeName: 'Tomay - La Trinidad',
        searchKeyword: 'Tomay',
        dropOffStop: 'Bahong Junction (Km. 6)',
        tip: 'Take Tomay jeepney to Km. 6 Bahong junction, then take a local Bahong jeepney down to the gardens.'
    },
    'bsu': {
        routeName: 'Tomay - La Trinidad',
        searchKeyword: 'Tomay',
        dropOffStop: 'Km. 6 (BSU Main Gate)',
        tip: 'Tomay and Camp Dangwa jeepneys drop off right at the main gate of Benguet State University.'
    },
    'university': {
        routeName: 'Tomay - La Trinidad',
        searchKeyword: 'Tomay',
        dropOffStop: 'Km. 6 (BSU Main Gate)',
        tip: 'Tomay and Camp Dangwa jeepneys drop off right at the main gate of Benguet State University.'
    },
    'trading post': {
        routeName: 'Buyagan - La Trinidad',
        searchKeyword: 'Buyagan',
        dropOffStop: 'Km. 5 Vegetable Trading Post',
        tip: 'Alight at Km. 5 market area. Buyagan, Tomay, or Camp Dangwa jeepneys all pass this area.'
    },
    'market': {
        routeName: 'Buyagan - La Trinidad',
        searchKeyword: 'Buyagan',
        dropOffStop: 'Km. 5 Public Market',
        tip: 'Take Buyagan or Tomay jeepney and get off at Km. 5 market.'
    },
    'sports complex': {
        routeName: 'Wangal - La Trinidad',
        searchKeyword: 'Wangal',
        dropOffStop: 'Wangal Sports Complex',
        tip: 'Take the Wangal-bound jeepney directly from Magsaysay Avenue terminal.'
    },
    'capitol': {
        routeName: 'Wangal - La Trinidad',
        searchKeyword: 'Wangal',
        dropOffStop: 'Benguet Provincial Capitol',
        tip: 'Board a Wangal jeepney at Magsaysay terminal to reach the Provincial Capitol.'
    },
    'dangwa': {
        routeName: 'Camp Dangwa - La Trinidad',
        searchKeyword: 'Camp Dangwa',
        dropOffStop: 'Camp Dangwa Gate (PRO-COR)',
        tip: 'Take Camp Dangwa jeepney from Magsaysay Avenue or Legarda Road terminal.'
    },
    'costa': {
        routeName: 'Puguis - La Trinidad',
        searchKeyword: 'Puguis',
        dropOffStop: 'Puguis / Mount Costa Junction',
        tip: 'Take a Puguis jeepney from Magsaysay terminal to Puguis, then take a local trike to Mount Costa.'
    }
};

export interface RouteDestination {
    spotName: string;
    icon: string;
}

export const JEEPNEY_ROUTE_DESTINATIONS: Record<string, RouteDestination[]> = {
    'Pico - La Trinidad': [
        { spotName: 'Colors of Stobosa', icon: 'fas fa-palette' },
        { spotName: 'Bell Church', icon: 'fas fa-place-of-worship' },
        { spotName: 'Pico Strawberry Fields', icon: 'fas fa-leaf' }
    ],
    'Tomay - La Trinidad': [
        { spotName: 'Bell Church', icon: 'fas fa-place-of-worship' },
        { spotName: 'Colors of Stobosa', icon: 'fas fa-palette' },
        { spotName: 'Benguet State University', icon: 'fas fa-university' },
        { spotName: 'Mt. Kalugong', icon: 'fas fa-mountain' },
        { spotName: 'Mt. Yangbew', icon: 'fas fa-mountain' },
        { spotName: 'Bahong Rose Gardens', icon: 'fas fa-seedling' }
    ],
    'Buyagan - La Trinidad': [
        { spotName: 'Strawberry Farm', icon: 'fas fa-leaf' },
        { spotName: 'Bell Church', icon: 'fas fa-place-of-worship' },
        { spotName: 'Colors of Stobosa', icon: 'fas fa-palette' },
        { spotName: 'Vegetable Trading Post', icon: 'fas fa-shopping-basket' }
    ],
    'Puguis - La Trinidad': [
        { spotName: 'Strawberry Farm', icon: 'fas fa-leaf' },
        { spotName: 'Mount Costa', icon: 'fas fa-tree' },
        { spotName: 'Bell Church', icon: 'fas fa-place-of-worship' }
    ],
    'Wangal - La Trinidad': [
        { spotName: 'Benguet Provincial Capitol', icon: 'fas fa-building' },
        { spotName: 'Benguet Sports Complex', icon: 'fas fa-running' },
        { spotName: 'Bell Church', icon: 'fas fa-place-of-worship' },
        { spotName: 'Colors of Stobosa', icon: 'fas fa-palette' }
    ],
    'Camp Dangwa - La Trinidad': [
        { spotName: 'Camp Dangwa (PRO-COR)', icon: 'fas fa-shield-alt' },
        { spotName: 'Benguet State University', icon: 'fas fa-university' },
        { spotName: 'Bell Church', icon: 'fas fa-place-of-worship' },
        { spotName: 'Colors of Stobosa', icon: 'fas fa-palette' }
    ]
};

export const getJeepneyInfoForSpot = (spotName: string): SpotJeepneyInfo => {
    if (!spotName) {
        return {
            routeName: 'Buyagan - La Trinidad',
            searchKeyword: 'Buyagan',
            dropOffStop: 'Km. 5 / La Trinidad Center',
            tip: 'Board any La Trinidad jeepney from Magsaysay Terminal in Baguio.'
        };
    }

    const lower = spotName.toLowerCase();
    
    for (const key of Object.keys(SPOT_TO_JEEPNEY_MAP)) {
        if (lower.includes(key)) {
            return SPOT_TO_JEEPNEY_MAP[key];
        }
    }

    return {
        routeName: 'Buyagan - La Trinidad',
        searchKeyword: 'Buyagan',
        dropOffStop: 'Km. 5 / La Trinidad Main Highway',
        tip: 'Board a Buyagan or Tomay jeepney from Magsaysay Terminal, Baguio City.'
    };
};
