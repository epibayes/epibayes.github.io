# COVIDMAPPING
*A tool to put COVID-19 in its spatial and social context*

## REPO CONTENTS
### HTML
- **COVID Disparities: disparities.html** - info page on racial disparities in COVID-19 Fatality and Incidence in MI.
- **embedmap.html** - a smaller module of the main COVID-19 map of case counts, rates, confirmed+propable cases, and confirmed cases to be displayed if anyone chooses to embed the map on their site.
- **index.html** - the landing page which consists of the main COVID-19 map of case counts, rates, confirmed+propable cases, and confirmed cases. Also has a line graph mapping case trends, and a couple of notes on COVID, numbers, and takeaways.
- **MI Symptoms: misymptoms.html** - a map with MI Symptoms data, including a map and chart as well as notes about where the numbers come from and COVID-like symptoms.
    - **NOTE:** \[Last Update: August 29, 2021\]
    - Issues in compiling Symptoms data has resulted in this page being stagnant since August 2021
    - The map styling exists on the [Epibayes Mapbox Studio account](https://api.mapbox.com/styles/v1/epibayes/ckcxh5jqw0v6z1isxnybsc0le.html?title=view&access_token=pk.eyJ1IjoiZXBpYmF5ZXMiLCJhIjoiY2tiaml0b3JpMHBuNzJ1bXk3MzdsbWs1aCJ9.YlxrUIBkuWk-VuYDDeMjBQ&zoomwheel=true&fresh=true#5.98/44.05/-85.557)
- **Your COVID Risk: storymap.html** - a scrollytelling page with a map and scrollable text blocks that explain personal COVID risk in a given area.
    - Map uses Mapbox's [scrollytelling module](https://demos.mapbox.com/scrollytelling/)
- **The Team: team.html** - a page with the current members of the Epibayes Lab. The page includes a short bio for each member as well as a picture. Two former members who still work in the Epidemiology world are also featured.
    - A more thorough look at lab members can be found on the [Epibayes Lab website](https://epibayes.io/)
- **MI COVID Timeline: timeline.html** - a page with the timeline (bar chart and trend line) of COVID-19 case counts in Michigan starting in March of 2020. This page also has some notes about vaccination and more about understanding the timeline.
    - The numbers of cases and deaths from JHU and the number of vaccinations in the US/MI from the CDC are fetched on the front-end.

## MAPBOX & MAPBOX STUDIO
We host our map-related data and styling (map hexes, map styles, storymap styles and data) on [Mapbox](https://www.mapbox.com/). The following files are of importance:
- **storytelling-epibayes** *(mapbox://styles/epibayes/ckcw1imhj0m0v1inyidwgx4hn)*
    - For **storymap.html**
    - The map style, hexagons, and map icons (such as the house icons, grocery store icons, lines-and-arrows, and number labels) exist on the [Epibayes Mapbox Studio account](https://api.mapbox.com/styles/v1/epibayes/ckcw1imhj0m0v1inyidwgx4hn.html?title=view&access_token=pk.eyJ1IjoiZXBpYmF5ZXMiLCJhIjoiY2tiaml0b3JpMHBuNzJ1bXk3MzdsbWs1aCJ9.YlxrUIBkuWk-VuYDDeMjBQ&zoomwheel=true&fresh=true#11.67/42.2711/-83.7371).    
    - Uses the following data sources (uploaded as tilesets into Mapbox)
        - **3hex-miscbusinesses** *(epibayes.ckbscl4095z1l23nqjqm7sefz-57jry)*
        - **3hex-numberlabels** *(epibayes.ckbsc1mmh4ly121qmgf99gj1p-9a8q4)*
        - **3hex-otherstores** *(epibayes.ckbs3o3uy2ra823s4hlnotokm-16qlw)*
        - **3hex-grocery-stores** *(epibayes.ckbs0ubyw0zea20o9n9pc0spz-64p1s)*
        - **3hex-rx-connections** *(epibayes.ckc3l66ti0bo525l6hmrdxa9z-6q4uk)*
        - **3hex-hardware-connections** *(epibayes.ckc3mnq052ide22p08hl4kx0f-7vntb)*
        - **3hex-connections** *(epibayes.ckbs1kovg0b5322tf2zhdx2vi-1dlwy)*
        - **3hex-grocery-concentric1** *(epibayes.ckbs0wwri07nq22o51prithtf-6056r)*
        - **3hex-grocery-concentric2** *(epibayes.ckbs0xw720an723tf6rhfbm77-3grs0)*
        - **3hex-highlighthex** *(epibayes.ckbs2vypo0ab52btfafqy5qbe-9vfk8)*
        - **hexagons_5km_three** *(epibayes.ckbmkccln2wry21qmhvjppyhp-2m87a)*
- **misymptoms** *(mapbox://styles/epibayes/ckcxh5jqw0v6z1isxnybsc0le)*
    - For **misymptoms.html**
    - Adds green and blue colors to the map. Purely a map display style with no data attached.