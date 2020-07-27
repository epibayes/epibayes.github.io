let config = {
    style: 'mapbox://styles/epibayes/ckcw1imhj0m0v1inyidwgx4hn',
    accessToken: 'pk.eyJ1IjoiZXBpYmF5ZXMiLCJhIjoiY2tiaml0b3JpMHBuNzJ1bXk3MzdsbWs1aCJ9.YlxrUIBkuWk-VuYDDeMjBQ',
    showMarkers: false,
    theme: 'light',
    alignment: 'left',
    title: 'Personal Risk Map',
    subtitle: 'Understanding your COVID Risk: A map and calculations-supported visual story',
    byline: 'Storymap by Stephanie Choi and Alex Cao \n Storyboard by Nina Masters and Paul Delamater \n \nMost disease maps present risk with demarcated residential boundaries: calculating risk within zip codes, towns, cities, or counties - although individuals in reality may not only come into contact with their residential neighbors within whatever such boundary is chosen. A more realistic way to understand risk is to consider where people may interact with each other outside of their immediate neighborhood - such as when visiting a grocery store, hardware store, pharmacy, etc. Even when communities are locked down and movement is restricted (such as under a stay-at-home order), necessary errands such as grocery shopping and picking up prescriptions allow for non-residential contacts, making a more inclusive risk map a necessity.',
    footer: '<a href="#navbar">Jump to top</a> <br><br>Icons by FontAwesome',
    chapters: [
        {
            id: 'one',
            title: '1. Mapping COVID-19 risk',
            image: '',
            description: 'Mapping COVID-19 disease cases and risk is challenging and depends upon the geographical unit chosen to determine who is at risk from their neighbors. <br><br>  In the following examples, we highlight how such maps are typically presented, by calculating the number of cases of COVID-19 in a certain residential area (city, county, or smaller geographic unit like a 10km hexagon, as we present on our site). However, presenting risk in this way assumes that an individual’s exposure to COVID-19 cases happens exclusively within their residential neighborhood. Through the following explainer, we illustrate why this might not be a ‘true’ representation of reality, and introduce a personal COVID-19 risk map for the state of Michigan to address some of the assumptions that come with these geographic maps.',
            location: {
                center: [-86.08, 44.22],
                zoom: 6.75,
                pitch: 30.00,
                bearing: 0.00,
            },
            onChapterEnter: [
                {
                    layer: 'hexagons-5km-three',
                    opacity: 0,
                },
                {
                    layer: '3hex-numberlabels',
                    opacity: 0,
                },
            ],
            onChapterExit: [
            ],
        },
        {
            id: 'two',
            title: '2. Neighborhoods and households',
            image: '',
            description: 'First, let’s present a hypothetical environment 3 hexagonal neighborhoods and 12 <img src="img/home.svg" style="display:inline-block; vertical-align:baseline; margin-left:auto; margin-right:auto; width: 20px;"> households. Let’s say each household has four members, so we have 48 total people in our example.',
            location: {
                center: [-83.78, 42.28],
                zoom: 11.2,
                pitch: 0.00,
                bearing: 0.00,
            },
            onChapterEnter: [
                {
                    layer: 'hexagons-5km-three',
                    opacity: 1,
                },
                {
                    layer: '3hex-numberlabels',
                    opacity: 0,
                },
            ],
            onChapterExit: [
            ],
        },
        {
            id: 'three',
            title: '3. A household becomes infected',
            image: '',
            description: 'Now we have one <img src="img/home-infected.svg" style="display:inline-block; vertical-align:baseline; margin-left:auto; margin-right:auto; width: 20px;"> household with a coronavirus infection. For the purposes of this explanation, we will assume that when a household gets COVID, all members of the household get COVID. So here, we have 4 COVID cases.',
            location: {
                center: [-83.78, 42.28],
                zoom: 11.2,
                pitch: 0.00,
                bearing: 0.00,
            },
            onChapterEnter: [
                {
                    layer: '3hex-highlighthex',
                    opacity: 0,
                },
                {
                    layer: '3hex-numberlabels',
                    opacity: 0,
                },
            ],
            onChapterExit: [
            ]
        },
        {
            id: 'four',
            title: '4. Understanding risk maps',
            image: '',
            description: 'In many disease maps, disease incidence (and thereby, risk) is typically assessed within a geographic unit. Let’s examine the risk of coming into contact with a COVID-19 case in each of the three neighborhoods in this example. Assuming that everyone in each hexagon interacts equally with all other households, but doesn’t come into contact with anyone outside their hexagon, the risk of coming into contact with someone who is infected in Hexagon 1 would be 4/24 = 16.7%, but the risk of contact with a COVID-19 case in the other two hexagons would be 0%.',
            location: {
                center: [-83.777, 42.28],
                zoom: 11.8,
                pitch: 0.00,
                bearing: 0.00,
            },
            onChapterEnter: [
                {
                    layer: '3hex-numberlabels',
                    opacity: 1,
                },
                {
                    layer: '3hex-highlighthex',
                    opacity: .5,
                },
                {
                    layer: '3hex-grocery-concentric1',
                    opacity: 0,
                },   
                {
                    layer: '3hex-grocery-concentric2',
                    opacity: 0,
                },
            ],
            onChapterExit: [                
            ]
        },
        {
            id: 'five',
            title: '5. Essential tasks like grocery shopping expand risk',
            image: '',
            description: 'However, even under social distancing and stay-at-home orders, people are not confined to their homes: they still have leave to do essential tasks - such as getting groceries. Here, we have included the locations of the two grocery stores in this environment. By connecting households to their nearest grocery store <img src="img/grocery.svg" style="display:inline-block; vertical-align:middle; margin-left:auto; margin-right:auto; width: 20px;"> , we can understand an additional way that people mix with individuals outside of their homes - and outside of their immediate neighborhoods. <br><br>We can think of the houses falling into two groups: <ul><li>Closest to grocery store A (blue)<img src="img/grocery-bluegroup.svg" style="display:inline-block; vertical-align:middle; margin-left:auto; margin-right:auto; width: 20px;"></li><li>Closest to grocery store B (green)<img src="img/grocery-greengroup.svg" style="display:inline-block; vertical-align:middle; margin-left:auto; margin-right:auto; width: 20px;"></li></ul>This allows us to construct interaction groups of individuals who are not connected by their neighborhood (hexagon) of residence, but connected by where they shop to get groceries.',
            location: {
                center: [-83.777, 42.28],
                zoom: 11.8,
                pitch: 0.00,
                bearing: 0.00,
            },
            onChapterEnter: [
                {
                    layer: '3hex-numberlabels',
                    opacity: 1,
                },
                {
                    layer: '3hex-highlighthex',
                    opacity: 0,
                },         
                {
                    layer: '3hex-grocery-concentric1',
                    opacity: 1,
                },   
                {
                    layer: '3hex-grocery-concentric2',
                    opacity: 1,
                },
                {
                    layer: '3hex-connections',
                    opacity: 0,
                },  
            ],
            onChapterExit: [
            ]
        },
        {
            id: 'six',
            title: '6. Risk based on nearest grocery stores tells a different story',
            image: '',
            description: 'Coding which homes are closest to each grocery store, we get very different senses of who is "at-risk" from the initial infection in Hexagon 1. We now have 14 additional households that are "at-risk" based on shopping at the same grocery stores as the house with COVID cases.<br><ul><li>Calculating the risk for the ‘green’ group <img src="img/greenhome.svg" style="display:inline-block; vertical-align:middle; margin-left:auto; margin-right:auto; width: 20px;"> who attend the same grocery store as the infected household, we now see that, assuming they all go to the grocery store at the same time, these houses have a 1/9 (or 4/36) chance of coming into contact with someone with COVID-19, while the blue houses <img src="img/bluehome.svg" style="display:inline-block; vertical-align:middle; margin-left:auto; margin-right:auto; width: 20px;"> have a 0% chance of coming into contact with someone with COVID-19. This gives us a lower risk in Hexagon 1, a higher risk in Hexagon 3, and the same calculation in Hexagon 2 as the simple model assuming individuals only come into contact with their neighbors.</li></ul>',
            location: {
                center: [-83.777, 42.28],
                zoom: 11.8,
                pitch: 0.00,
                bearing: 0.00,
            },
            onChapterEnter: [
                {
                    layer: '3hex-numberlabels',
                    opacity: 1,
                },
                {
                    layer: '3hex-connections',
                    opacity: 1,
                },  
                {
                    layer: '3hex-grocery-concentric1',
                    opacity: 0,
                },   
                {
                    layer: '3hex-grocery-concentric2',
                    opacity: 0,
                },
                {
                    layer: '3hex-otherstores',
                    opacity: 0,
                }, 
                {
                    layer: '3hex-rx-connections',
                    opacity: 0,
                },    
                {
                    layer: '3hex-hardware-connections',
                    opacity: 0,
                },      
            ],
            onChapterExit: [
            ]
        },
        {
            id: 'seven',
            title: '7. Other essential businesses add possibilities of exposure',
            image: '',
            description: 'However, grocery stores are not the only essential businesses where individuals from different households might interact. Even during stay-at-home orders, hardware stores <img src="img/hardware.svg" style="display:inline-block; vertical-align:middle; margin-left:auto; margin-right:auto; width: 20px;"> and pharmacies <img src="img/rx.svg" style="display:inline-block; vertical-align:middle; margin-left:auto; margin-right:auto; width: 15px;"> are also places for infected individuals from different neighborhoods to expose each other, complicating the network of interaction.',
            location: {
                center: [-83.777, 42.28],
                zoom: 11.8,
                pitch: 0.00,
                bearing: 0.00,
            },
            onChapterEnter: [
                {
                    layer: '3hex-numberlabels',
                    opacity: 1,
                },
                {
                    layer: '3hex-connections',
                    opacity: 0,
                },  
                {
                    layer: '3hex-otherstores',
                    opacity: 1,
                },     
                {
                    layer: '3hex-rx-connections',
                    opacity: 1,
                },   
                {
                    layer: '3hex-hardware-connections',
                    opacity: 0,
                },      
       
            ],
            onChapterExit: [
            ]
        },
        {
            id: 'eight',
            title: '8. Groups of contact',
            image: '',
            description: 'Each of these categorizations: mapping households to their closest grocery store, pharmacy, and hardware store, and seeing who their new contacts are through these essential establishments gives us a different group of individuals who might contact a case. This simplified illustration was used to map the 8,146 households at the block group level, 4,105 grocery stores, 3,599 home goods stores, and 2,561 pharmacies across the state of Michigan to generate a more realistic personalized ‘risk-map’, where you can scroll through your area and see what your risk of coming into contact with a case is while incorporating essential trips to pharmacies, grocery stores, and hardware stores.',            
            location: {
                center: [-83.777, 42.28],
                zoom: 11.8,
                pitch: 0.00,
                bearing: 0.00,
            },
            onChapterEnter: [
                {
                    layer: '3hex-numberlabels',
                    opacity: 1,
                },
                {
                    layer: '3hex-rx-connections',
                    opacity: 0,
                },
                {
                    layer: '3hex-hardware-connections',
                    opacity: 1,
                },      
                {
                    layer: '3hex-miscbusinesses',
                    opacity: 0,
                },
            ],
            onChapterExit: [
            ]
        },
        {
            id: 'nine',
            title: '9. Remember to be mindful',
            image: '',
            description: 'It’s important to remember that this is a <b><i>best case scenario</i></b> under social-distancing behaviors. As individuals start going back to work, to restaurants, and to bars with the state opening up, your individual risk will depend even less on your local neighbors – so remember to be mindful of your contacts and continue to practice social distancing.',            
            location: {
                center: [-83.777, 42.28],
                zoom: 11.8,
                pitch: 0.00,
                bearing: 0.00,
            },
            onChapterEnter: [
                {
                    layer: '3hex-numberlabels',
                    opacity: 0,
                },
                {
                    layer: '3hex-hardware-connections',
                    opacity: 0,
                },      
                {
                    layer: '3hex-rx-connections',
                    opacity: 0,
                },
                {
                    layer: '3hex-miscbusinesses',
                    opacity: 1,
                },
            ],
            onChapterExit: [
            ]
        }
    ]
};