# COVIDMAPPING
*A tool to put COVID-19 in its spatial and social context*
- - - -
## WORKFLOW
This site doesn't use any special JS frameworks, but you do need to download [Python](https://www.python.org/) to run it.
### Downloading and Running:
- `git clone` this repo and then `cd` into it.
- run `python -m http.server 5000` and open `localhost:5000` on your internet browser
### Pushing Changes:
- **DO NOT PUSH TO MASTER BRANCH DIRECTLY!**
- push changes that ***won't break the site*** to the development branch
    - make sure you're checked out onto the DEVELOPMENT branch: `git checkout development`
- for any potentially breaking changes, create a NEW branch: `git checkout -b <name of new branch>`
    - send pull requests (PRs) to development
- **ONLY** development should ever be PR merged into master. Other branches should **ALWAYS** PR merge into development.
- - - -
## REPO CONTENTS
### HTML
- **COVID Disparities:** `disparities.html` - info page on racial disparities in COVID-19 Fatality and Incidence in MI.
- `embedmap.html` - a smaller module of the main COVID-19 map of case counts, rates, confirmed+propable cases, and confirmed cases to be displayed if anyone chooses to embed the map on their site.
- `index.html` - the landing page which consists of the main COVID-19 map of case counts, rates, confirmed+propable cases, and confirmed cases. Also has a line graph mapping case trends, and a couple of notes on COVID, numbers, and takeaways.
- **MI Symptoms:** `misymptoms.html` - a map with MI Symptoms data, including a map and chart as well as notes about where the numbers come from and COVID-like symptoms.
    - **NOTE:** \[Last Update: August 29, 2021\]
    - Issues in compiling Symptoms data has resulted in this page being stagnant since August 2021
- **Your COVID Risk:** `storymap.html` - a scrollytelling page with a map and scrollable text blocks that explain personal COVID risk in a given area.
    - Map uses Mapbox's [scrollytelling module](https://demos.mapbox.com/scrollytelling/)
- **The Team:** `team.html` - a page with the current members of the Epibayes Lab. The page includes a short bio for each member as well as a picture. Two former members who still work in the Epidemiology world are also featured.
    - A more thorough look at lab members can be found on the [Epibayes Lab website](https://epibayes.io/)
- **MI COVID Timeline:** `timeline.html` - a page with the timeline (bar chart and trend line) of COVID-19 case counts in Michigan starting in March of 2020. This page also has some notes about vaccination and more about understanding the timeline.
    - The numbers of cases and deaths from JHU and the number of vaccinations in the US/MI from the CDC are fetched on the front-end.

### CSS
- `main.css` - all styling is contained in this file
    - (2022 Feb.) Will try to break this out into separate files...

### JAVASCRIPT
- `addhome.js` - adds the landing page (`index.html`) to the navigation menu if the screen is small enough to collapse the navigation bar
- `casechart.js` - creates the case trends graph seen on the landing page (`index.html`) and the MI Symptoms page (`misymptoms.html`)
- `config.js` - used to create the scrollytelling experience for `storymap.html`
- `disparities.js` - creates the pie graphs seen on the disparities page (`disparities.html`)
- `gingers.js` - creates and updates the gingerbread men (the pictogram) on the disparities page (`disparities.html`)
- `init.js` - holds all the initialized variables
    - has URLs for mapbox tilesets used to create the hexagons on the maps
    - has urls for case data csv gists
- `legend.js` - creates and updates the map legends
- `michigan.js` - creates and updates the maps on `index.html` and `misymptoms.html`
- `timeline.js` - creates the timeline bar graph, average line, labels, and tooltips on `timeline.html`
- `timeline-ui.js` - rounds total vaccination and case counts up to a nicer-looking number, and fetches the CDC and JHU case counts and vaccination counts
    - the fetch relies on external data sources (the JHU github csv uploads and a JSON-ified version of CDC data) and needs to be monitored frequently to check for any hiccups in the fetch
- `ui.js` - initializes and updates data for button dropdowns, time scales, radio buttons, embed URL, date ranges as displayed on page, total case counts, etc.

### DATA (CSVs)
There are 2 local CSVs used in this project
- `hex_pop.csv` - population counts for each hexagon on the map
    - Has the following attributes:
        - **index:** associated with each unique hexagon on the map
        - **POP:** the population count for that hexagon
        - **hex:** either 10 or 20 based on the hex size in kilometers
- `timeline.csv` - used to create and place the milestone labels on the timeline, as well as to create the tooltips that show up when hovering over the milestone labels
    - Has the following attributes:
        - **date:** a `m/dd/yy` format date associated with the milestone
        - **y2:** the top `y` position that determines how long the line from the milestone to the bar graph section for that date is. `timeline.js` performs some math on this number (check starting from around line 100 in `timeline.js`)
        - **anchor:** determines if the text comes to the left (end), the center (middle), or to the right (start) of the line
        - **annotation:** a short blurb about the milestone that shows up on the timeline
        - **description:** a longer description of the milestone that shows up in the tooltip

### IMAGES
Around 90% of the images are of team members for the `team.html` page. These images will be named using the team member's first name and be in the `team` folder. The non-team images are as follows:
- Favicon: favicon.png
- Navbar brand: logo_transparent.png
- Original Logo (unused on any pages, there for reference): logo.png
- For Open Graph (on `index.html`, `storymap.html`, and `misymptoms.html`):
    - opengraph.jpg
- For Funding and Sponsorships (on all pages except `embedmap.html` and `storymap.html`) in the `fundsponsor` folder:
    - cdc-logo.png
    - public health logo.png
    - simons-logo-simple.png
- For `storymap.html`, in the `storymap` folder:
    - bluehome.svg
    - greenhome.svg
    - grocery.svg
    - grocery-bluegroup.svg
    - grocery-greengroup.svg
    - hardware.svg
    - home.svg
    - home-infected.svg
    - rx.svg
- For `disparities.html`, in the `disparities` folder:
    - all_incidence.png
    - weekly_incidence_white_black.png
    - weekly_incidence_white_latino.png
    - gingerbread.png
    - gingerbread_2.ai & gingerbread_2.svg (used only as reference)

### DOCUMENTS
We have one document, `Final Version COVID Combined Infographic_Update_2_21.pdf` that was used as basis to create the `disparities.html` page. This document is not presented as a download or as an iframe, and exists merely as reference for now.
- - - -
## MAPBOX & MAPBOX STUDIO
We host our map-related data and styling (map hexes, map styles, storymap styles and data) on [Mapbox](https://www.mapbox.com/). The following style files are of importance:
- **storytelling-epibayes** *(mapbox://styles/epibayes/ckcw1imhj0m0v1inyidwgx4hn)*
    - For `storymap.html`
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
    - For `misymptoms.html`
    - Adds green and blue colors to the map. Purely a map display style with no data attached.
The following tilesets (not styles!) are used to build out the main maps:
- **mi_counties** *(mapbox://epibayes.ckcqn77d00igv2an5hvegcds2-307nw)*
    - used in `michigan.js` to create a map layer with county borders
- **hex_20km_polygons** *(mapbox://epibayes.ckcqmt8ey0paa2bt69m7pyfdn-6k0du)*
    - used in `michigan.js` to create a map layer with hexagons that are 20km big (toggles based on zoom threshold)
- **hex_10km_polugons** *(mapbox://epibayes.ckcqms42v0gv229qk9hakzxbe-70thk)*
    - used in `michigan.js` to create a map layer with hexagons that are 10km big (toggles based on zoom threshold)
    - *doesn't seem to ever be used...*
