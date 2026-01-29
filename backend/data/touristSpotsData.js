
const touristSpots = [
  {
    image: 'https://thetorogichronicles.com/wp-content/uploads/2019/03/20190225_120009-014246090185069711416.jpeg?w=630&h=419',
    alt: 'Lush strawberry fields in La Trinidad with mountains in the background.',
    name: 'La Trinidad Strawberry Farm',
    description: "Famous for its vast strawberry fields where visitors can pick their own strawberries. It's the primary reason La Trinidad is known as the 'Strawberry Capital of the Philippines.' The farm also features vendors selling strawberry-based products like jam, ice cream, and wine.",
    location: 'Km. 5, La Trinidad, Benguet',
    history: "Established in the 1950s, the farm became a major agricultural and tourism hub, showcasing the valley's ideal conditions for growing strawberries and other produce. It is managed by the Benguet State University.",
    gallery: [
      'https://www.wonderingwanderer.com/wp-content/uploads/2013/05/La-Trinidad-Straberry-picking-with-Baby.jpg',
      'https://www.thepoortraveler.net/wp-content/uploads/2013/06/strawberry-farm-la-trinidad.jpg',
      'https://wanderingsoulscamper.wordpress.com/wp-content/uploads/2015/09/img_2070-1.jpg'
    ],
    openingHours: '7:00 AM - 7:00 PM Daily',
    bestTimeToVisit: 'December to February (Peak Season)',
    category: 'Agri-tourism',
    tags: ['Family Friendly', 'Parking Available', 'Entrance Fee', 'Food Stalls'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 5-10 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 5-10 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=La%20Trinidad%20Strawberry%20Farm&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjqaylZ2D2YhSTI6CtxhJadKt8FfYB3Qb3ypnyE5IBmjAKO7k4nMIIRfwQUVhxJdmCZFCRHBfAk7QcKhyphenhyphen3UbVbj3AUUbhfvXlRagaugw2SQVzCENMVe5Yx-7K35vYocDsXbi_ra_uR2ZtMV/s1600/20120224-BAGUIO-D80-0052%255B3%255D.jpg',
    alt: 'Ornate Bell Church temple in La Trinidad with a pagoda.',
    name: 'Bell Church',
    description: 'A beautiful and serene Taoist temple complex with intricate architecture, pagodas, and ponds. It serves as a spiritual center for the local Chinese-Filipino community and is open to visitors seeking tranquility and a glimpse of different cultural practices.',
    location: 'Barangay Balili, La Trinidad, Benguet',
    history: 'Founded in the 1960s by Chinese immigrants, the Bell Church is a testament to the cultural fusion in the Cordilleras, blending Taoist, Buddhist, and Confucian principles. It was established to serve the spiritual needs of the growing Chinese community in the region.',
    gallery: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/f1/a9/aa/bell-church.jpg?w=1200&h=1200&s=1',
      'https://hiketomountains.com/wp-content/uploads/2023/12/Bell-Church-1-1024x621.jpg',
      'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjTC7w2L7gvSsZHlrODPcBgfLg16HEmebGu5Zwfys2BODm8_rO2qTkKGQIWpmBefB87muzeAd3BhjcEFv0EPVG4FFFMkaHqkqmul0WxbUfpt8oSC8miNNsSGFi8doN0gd895uRwvM5cRING/s1600/20120224-BAGUIO-D80-0054%255B3%255D.jpg'
    ],
    openingHours: '8:00 AM - 5:00 PM Daily',
    bestTimeToVisit: 'Year-round, preferably on a sunny day.',
    category: 'Culture',
    tags: ['Religious Site', 'Photography', 'Free Entry', 'Gardens'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 10-15 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 10-15 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Bell%20Church%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://static.where-e.com/Philippines/Cordillera_Administrative_Region/Benguet/Mt-Kalugong-Cultural-Village_438d3c8c14213c0d3d43ed3f08b6f0a3.jpg',
    alt: 'Limestone rock formations atop Mount Kalugong with a view of the valley.',
    name: 'Mount Kalugong Cultural Village',
    description: "A beginner-friendly eco-park offering a short hike to limestone rock formations with panoramic views of the La Trinidad valley. It also features cultural huts, a coffee shop, and spots for picnics, making it a perfect spot for relaxation and light adventure.",
    location: 'Barangay Tawang, La Trinidad, Benguet',
    history: "The name 'Kalugong' means 'hat' in the local dialect, named after a prominent rock formation that resembles a hat. It is considered a sacred place by the Ibaloi people, with the park developed to preserve its natural beauty and cultural significance.",
    gallery: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/4d/9f/37/mt-kalugong.jpg?w=900&h=500&s=1',
      'https://lh5.googleusercontent.com/proxy/03q6nEyXiZMYK8kKH2vvfkmvfHK9Z4LW9IZzkZVkspFZriQHKbci8J1bBQK7N0WoGfn-Y-YLbKK7-S552nHxHUkjHLsaZR3-hQwFMdF5WvAN2kgT-frvcr0',
      'https://loneprowler.com/wp-content/uploads/2015/04/61157-_dsc0531.png'
    ],
    openingHours: '6:00 AM - 6:00 PM Daily',
    bestTimeToVisit: 'Early morning for sunrise or late afternoon for sunset.',
    category: 'Nature',
    tags: ['Hiking', 'Coffee Shop', 'Panoramic View', 'Picnic Spot'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 15-20 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 15-20 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Mt.%20Kalugong%20Cultural%20Village&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/4a/0e/21/valley-of-colors.jpg?w=1200&h=1200&s=1',
    alt: 'Vibrant houses of the Stobosa Hillside Homes Artwork forming a mural.',
    name: 'Colors of Stobosa',
    description: "A massive community art project where hundreds of houses on a hillside are painted to form a giant, colorful mural of sunflowers. It's a stunning sight from the main road and a symbol of community collaboration, resilience, and beautification.",
    location: 'Barangay Balili, La Trinidad, Benguet',
    history: 'Inspired by the favelas of Brazil, this project was initiated by the Tam-awan Village artists and the Department of Tourism. The name "Stobosa" is an acronym for the three sitios (Stonehill, Botiwtiw, and Sadjap) that compose the community.',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/7/7c/Colors_of_Stobosa_La_Trinidad.jpg',
      'https://miro.medium.com/v2/1*_48gOtaJQntV2lIstdA3uQ.jpeg',
      'https://miro.medium.com/v2/1*gQ3y6D-MC4SebemcORA7gQ.jpeg'
    ],
    openingHours: '24/7 (viewable from the road)',
    bestTimeToVisit: 'Daylight hours for best visibility.',
    category: 'Art',
    tags: ['Photography', 'Roadside', 'Free Entry', 'Mural'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 10 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 10 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Colors%20of%20Stobosa&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEikXzOBYevVZGezNJxqYMrpnwh-IuzQDCbMmi8I3RZ8cGyR7B8ClbXj63SF_uG6oe2hy67i1shnnjCMpWBFYmuN1rkg6NDC6sO6GobuPdX3_O6-u9LrqDzh1bNxbZW1cgA3tJaBG4E4AAc/w1200-h630-p-k-no-nu/IMG_0649.jpg',
    alt: 'Grassy summit of Mt. Yangbew with wide scenic views.',
    name: 'Mt. Yangbew',
    description: "Often referred to as the 'Little Pulag' of La Trinidad, Mt. Yangbew offers a relatively easy hike that rewards trekkers with a wide, grassy summit perfect for picnics, kite flying, and horseback riding. The view of the sunrise and the sea of clouds is breathtaking.",
    location: 'Barangay Tawang, La Trinidad, Benguet',
    history: 'Historically known as "Mt. Jumbo", it was used by American forces during World War II. Today, it has been reclaimed by the locals as a premier eco-tourism destination, managed by the Tawang community.',
    gallery: [
      'https://gttp.images.tshiftcdn.com/384076/x/0/view-from-mt-yangbew.jpg',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/4d/a0/ab/jumbo.jpg?w=900&h=500&s=1',
      'https://i0.wp.com/iwentanyways.com/wp-content/uploads/2023/01/IMG_20230115_221355.jpg?fit=2304%2C1728&ssl=1'
    ],
    openingHours: '4:00 AM - 6:00 PM Daily',
    bestTimeToVisit: 'Sunrise (5:00 AM) or late afternoon.',
    category: 'Nature',
    tags: ['Hiking', 'Sea of Clouds', 'Horseback Riding', 'Camping'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 20-25 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 20-25 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Mt.%20Yangbew%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://bsu.edu.ph/wp-content/uploads/WURI_Museum/PSX_20241017_094851-scaled.jpg',
    alt: 'Cultural artifacts displayed inside a museum.',
    name: 'Benguet Museum',
    description: 'A treasure trove of Cordilleran heritage, the Benguet Museum houses a collection of artifacts, traditional clothing, tools, and even mummies that tell the story of the Ibaloi, Kankanaey, and Kalanguya peoples.',
    location: 'Capitol Compound, La Trinidad, Benguet',
    history: 'Established to preserve the rich cultural heritage of the province, the museum serves as an educational center for both locals and tourists to understand the history and traditions of Benguet before modernization.',
    gallery: [
      'https://www.rappler.com/tachyon/2024/06/Benguet-Museum1-scaled.jpg',
      'https://bsu.edu.ph/wp-content/uploads/WURI_Museum/Messenger_creation_305A69BC-A817-4903-90D3-1735E2552959.jpeg',
      'https://lh6.googleusercontent.com/proxy/WLrfMsScsz09iqZiYGa0n6PTLcjxv7oGbUzYDCJSyxWc7fMoDO0amPDJiWMqvKBM8UnHf6KX4rlhGIKATg9rOHh2DoR29COvvFhneA'
    ],
    openingHours: '8:00 AM - 5:00 PM (Mon-Fri)',
    bestTimeToVisit: 'Weekdays',
    category: 'Culture',
    tags: ['History', 'Museum', 'Educational', 'Indoor'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 5 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 5 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Benguet%20Museum%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://gttp.images.tshiftcdn.com/384026/x/0/lily-of-the-valley-organic-farm.jpg',
    alt: 'Organic salad greens and vegetables.',
    name: 'Lily of the Valley Organic Farms',
    description: 'A pioneer in agri-tourism, this farm offers a serene escape where you can learn about organic farming, stay in cozy homestays, and enjoy farm-to-table meals. It promotes health and wellness through sustainable agriculture.',
    location: 'Sitio Ampasit, Puguis, La Trinidad',
    history: 'Started by the late Jefferson Laruan, a passionate advocate for organic farming, the farm has grown into a model for sustainable agriculture in the region, offering training and workshops to aspiring farmers.',
    gallery: [
      'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHjtME_vI-xU5-WpF7U0VKjcdyMNRDopLHq5VkOV9YYdOrj3aHVBHkVMLn1qeGHdvQfCcSsh5lw2pqHpjUUMvKIoAND6WEZPkH08obdNs9RW_w2jr3NGRaO7Ow3ZMzLPFVEIsGuYMd92M/w1200-h630-p-k-no-nu/ASC_0071.JPG',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/a8/78/59/20180818-163902-largejpg.jpg?w=900&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/a8/66/db/the-lily-of-the-valley.jpg?w=1200&h=1200&s=1'
    ],
    openingHours: '8:00 AM - 5:00 PM (By Appointment)',
    bestTimeToVisit: 'Morning for farm tours.',
    category: 'Agri-tourism',
    tags: ['Organic', 'Homestay', 'Glamping', 'Farm-to-Table'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 15 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 15 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Lily%20of%20the%20Valley%20Organic%20Farms&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://media.assettype.com/sunstar/import/uploads/images/2018/03/16/35833.JPG?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true',
    alt: 'Bustling vegetable market with fresh produce.',
    name: 'La Trinidad Vegetable Trading Post',
    description: 'The beating heart of the "Salad Bowl of the Philippines". This is where tons of fresh vegetables from all over Benguet are traded daily. It is a sight to behold for those interested in commerce, local life, and buying wholesale produce.',
    location: 'Km. 5, La Trinidad, Benguet',
    history: 'Established to centralize the distribution of highland vegetables to Manila and other provinces, it is one of the busiest economic zones in the municipality, highlighting the agricultural prowess of the region.',
    gallery: [
      'https://baguioheraldexpressonline.com/wp-content/uploads/2018/09/trading-post.jpg',
      'https://pia.gov.ph/wp-content/uploads/2024/07/LT-vegies3.jpg',
      'https://nolisoli.ph/wp-content/uploads/2020/03/la-trinidad-vegetables-1.jpg'
    ],
    openingHours: '24 Hours Daily',
    bestTimeToVisit: 'Early morning or late afternoon for peak activity.',
    category: 'Shopping',
    tags: ['Market', 'Wholesale', 'Local Life', 'Vegetables'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 5 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 5 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=La%20Trinidad%20Vegetable%20Trading%20Post&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://wanderera.com/wp-content/uploads/2018/09/IMG_5785.jpg', 
    alt: 'Beautiful landscaped gardens at Mount Costa.',
    name: 'Mount Costa',
    description: 'Known as the "Green Living Room of the Cordilleras," this 6-hectare property features 24 beautifully landscaped gardens, including a Mirror Garden, Zen Garden, and Inca Garden. It is a perfect spot for nature lovers and Instagram enthusiasts.',
    location: 'Puguis, La Trinidad, Benguet',
    history: 'Formerly a strawberry farm, it was converted into an eco-tourism destination to showcase different garden styles and sustainable landscaping.',
    gallery: [
      'https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2024/07/01/49815a7bee2068f6cfbf1b2b7052b41d_1000x1000.jpg',
      'https://thatgirlarlene.wordpress.com/wp-content/uploads/2017/02/wp-image-353531668jpg.jpg',
      'https://www.wheninbaguio.com/wp-content/uploads/2017/05/inca-garden-compress.jpg'
    ],
    openingHours: '7:00 AM - 5:00 PM Daily',
    bestTimeToVisit: 'Morning for cooler weather and good lighting.',
    category: 'Nature',
    tags: ['Gardens', 'Photography', 'Family Friendly', 'Relaxation'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 15-20 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 15-20 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Mount%20Costa%20La%20Trinidad&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://1.bp.blogspot.com/EEfMybJ7UcXTf_GcQEjs7PSw2aTyn-swFnvX0TGrXX3oRrrkNzcoLVGZvRTEDEtkjIJvGvOp_HWbLM6XI8HU5H-j9-VF9fMaB5ppEzpwwNYAzCgIvFQq2htWM4mnxm_lMr0WA5oAgt7y3rs7vFoGFQuzg9_va0LD1e6cn0lLKmz3lDUieu0QQ2U4CVVwRZ_W0oMG_zhAMdcH1CzrJ69NPhrD_10TQutic6XfCmybxaK21DgeIemsWV02eaw8TNjNvPWKaP3v3T7sleCKkMrrdDWa_UsHEDi1cAUcsKQhNPKHckAQq2WKcAyfonATTTyMSrcYKMF96HasyksprRxoRmrwXT1K_PsCFHQTUTNjK1TDscAao_jT1RdWG4z0jDAbPMYRSc5Pa1FbVZb3fNU6-hZWVlZXqVoXei80NOT7hdh3HHAgkTZnteInO5d2oDBgpXCc9PPKZuRyr6PRUHQeS7Mu36-0tqJAXTmkVRTDyP5bX-19tbeg6aH4AzafJvMvrL4zG1Vbif0XUqbFS3TmUgqwoGFJtSnzGg5RHHYPygEL_l3zhQFX8wQcnLi8rMPXi6c9V_DhgPJGM4Yc2VJyPAcXFZEp-V1KYK1IXCXrzcgyshb61Y36=w640-h427-rw-no?pageId=115508154582923872602', // Rose/flower field
    alt: 'Vast fields of roses and colorful flowers.',
    name: 'Bahong Rose Gardens',
    description: 'Dubbed the "Rose Capital of the Philippines," Barangay Bahong supplies a majority of the country\'s roses. Visitors can walk through terraces filled with blooming roses, chrysanthemums, and anthuriums.',
    location: 'Bahong, La Trinidad, Benguet',
    history: 'Bahong was one of the first areas in the municipality to adopt large-scale cut-flower production, transforming the economic landscape of the community.',
    gallery: [
      'https://files01.pna.gov.ph/ograph/2020/05/13/bgo-rose-garden-bahong.jpg',
      'https://3.bp.blogspot.com/IElbekWsIzsDYmOOudS52TqTarlLFoKTR83ni_ZahEt2L_fUyWckavvE7Vk82Er3q7aC0R1FpfAX7WveV0N34JL8Mv6WnppFoPvunQxry5C48L5h3tfHbPlLg6464mvg3-WtLhcsA4H--lylRirGcfKzj8Lwzplz__WMK0Qte79H2UU_basqLV61HU4mXR4-druAOpSoL5geWIOYciEoVxV5Rhc1Vo1TjyhXAwA5KimMf9at0zjBhmGbIL2nQ4tTRqPp8o7vxfwM6zypzGO8_knQCyNzEhJBTvz6T0e_rfBnfidxrWesNI3aVQBUtil7-Lq5hCXBArP9r1BM4qN1iZizbLALiZ8GdSruD9NB4iXiFhdAYUk74qP-z9sfVmwT4oc_PvyhKkAEM5M3pKZtGd4LTJDpdXyEvMIjBdV2q9oE9flANTGulgh2bFZ-P0XuamLK8l-Z2U9U9yNOZEzMx-AXmoH2BmuTEqCpUBHnESXx-Vyk7KvXXeMz9WeMqS5CN9LIxGNQcG1yXsTVIFp0fBMJismI6VQ12OkMXT0a8JTLkjzlQuzZ04AryK8i7KnC-RIy7bV-5VhWqDYBhgLMQ-Dp0xd0hU-ev_cpsdKfEH6b8C26toyL=w640-h427-rw-no?pageId=115508154582923872602',
      'https://1.bp.blogspot.com/rbVUfj59m4qgCrFJavviBDr0UZTQ-mfBzaDapi49tXe_iCiUnpjNWlPDXpdOT0lFXfOCQjCOSohyDgywyiqTO3EfJhBcdPNULZk7Mu9WVpamkMw2uTlhTSCHosIqZiulJ-Osw99EyjquzKNvr39R-HVtBo7M6TEbZLfVJFUHyEVzCycQmAC0Ex5LlrRyglBoIpi9Ypf2f0cZgMJI4WGIL4gTD-48hDdU750OTcmDfGWsKKt-JifaKPTyro14r4vAY2UGgj_yhGESD2pnJolf17JnWHNXLPjHExEerUp-2UTxHeShuhi1QsKlOGWbkxY6vM0MAafYTIkhuGBeHTab4hkkqYaiLpbYj_eo0aUOTDyJKnkkvYPfdtq_q2-GGalAUv2JtCu4x8hjRe63Tj_D_oLyuJI4C6NjviQFtT7dgIRitYLCA5TWBxuG3304N5A5D4ftR1JjtcBVa2P2JrbdAy19CYxhfA9lD0mttz2N3iVZYRvz5oXuBFGw3zYC9qDpp8MC7wvV4ZEZ7gj23y22Eizfyr5iMuZ-g7WZ-1SPFY48qfwDmZ1voDaegXZx39bI-YppRuxaIIyHrAUuD8IHzCWZ7QjF_9-VtimEfL1-CJ4JBPIvy26Y=w640-h427-no?pageId=115508154582923872602'
    ],
    openingHours: '6:00 AM - 6:00 PM Daily',
    bestTimeToVisit: 'November to February (Peak Bloom) or Valentine\'s season.',
    category: 'Agri-tourism',
    tags: ['Flowers', 'Roses', 'Scenic View', 'Plant Shopping'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 20 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 20 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Bahong%20Rose%20Garden&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  {
    image: 'https://scontent.fcrk2-3.fna.fbcdn.net/v/t1.6435-9/125237041_3722037017861200_5337815638474356890_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGukKOSar0862t_qrt1jSc3zg9W-q93LzPOD1b6r3cvM4NnFUrladv3Yf_v37a0-spzKyBevU22pgE5MqUr2fZu&_nc_ohc=4Q05qogVBNMQ7kNvwG7P1PB&_nc_oc=AdmkhFtjXgd4tBXf2O_ZG4YsrPkzlFe3lwVO9Zd_CUL9CcBGi3p-v9ks-qEA0aTgkBg&_nc_zt=23&_nc_ht=scontent.fcrk2-3.fna&_nc_gid=fYHuKVddJnakSmqa1J6SCQ&oh=00_Afiye49S8HI2-47xsw4ePFb7M4IhrZu8-f8DuygNLJFFag&oe=694C0652', // Greenery/Nature
    alt: 'Traditional hut amidst pine trees.',
    name: 'Avong nen Romy',
    description: 'A hidden eco-park nestled in Barangay Wangal. It offers a rustic experience with traditional huts, a mini-forest, and a viewpoint. It is a quiet retreat for those wanting to escape the busy trading post area.',
    location: 'Wangal, La Trinidad, Benguet',
    history: 'Developed by a local family to preserve the natural state of the land while sharing the simple Cordilleran lifestyle with visitors.',
    gallery: [
      'https://scontent.fcrk2-2.fna.fbcdn.net/v/t39.30808-6/482210619_8122043997920705_142499704941230982_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHosSTVQd7-eWw1wMTEJd0k0VZCHeck4KbRVkId5yTgpoTnRC7IqWvXo0UCDKENGAG4unc9XLBtjS2YjKmQsUej&_nc_ohc=IkATImBMTP8Q7kNvwEsD-eC&_nc_oc=AdnywL0vFzm7HzTKhCECUSDQUZ_QkLdKEmzA97gmC6IZZopnef8xgFkfBbONdbLgF5A&_nc_zt=23&_nc_ht=scontent.fcrk2-2.fna&_nc_gid=SKaw_CZ_f1oA3yOpB8sGag&oh=00_Afiq-JE9V6AQY2EVVQjA-_rT1hncY5SAipeu41NIfzhxeQ&oe=692A453D',
      'https://scontent.fcrk2-3.fna.fbcdn.net/v/t39.30808-6/468331930_9053374478046711_8661993151500413810_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=33274f&_nc_eui2=AeHCCJ-gF88-ewrw42kZCq1PCFm8ai9rCFUIWbxqL2sIVYcnFoLMvXzfvplYjjyAIMr2SDhEmWzzK5jLJ0ZtzAQZ&_nc_ohc=pb2B0b5gu3wQ7kNvwHQJzR-&_nc_oc=Adl7ALxZyVoZnyrZxMvjxEGKGgKmA1rtUhwfB4xu6RHJQjXgVJfI21yg1-LVZXqHAXE&_nc_zt=23&_nc_ht=scontent.fcrk2-3.fna&_nc_gid=QN4h7_Ml4IXL4crzdGDC-A&oh=00_AfiLyt-D90oYBpW0CxDIPHdZqF93mt71xRTFjl5ZorIwKg&oe=692A6986',
      'https://bukallifecare.org/wp-content/uploads/2017/06/18881954_10155330891992622_381019185455643971_n.jpg'
    ],
    openingHours: '8:00 AM - 5:00 PM Daily',
    bestTimeToVisit: 'Afternoon for a relaxing coffee break.',
    category: 'Culture',
    tags: ['Eco-park', 'Picnic', 'Traditional Huts', 'Nature'],
    nearbyEmergency: [
      {
        type: 'Hospital',
        name: 'Benguet General Hospital',
        distance: 'Approx. 10 min drive'
      },
      {
        type: 'Police',
        name: 'La Trinidad Municipal Police Station',
        distance: 'Approx. 10 min drive'
      }
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Avong%20nen%20Romy&t=&z=15&ie=UTF8&iwloc=&output=embed'
  }
];

module.exports = touristSpots;
